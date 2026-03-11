import io
import tempfile
from typing import List, Optional

import cv2
import numpy as np
import mediapipe as mp
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from pydantic import BaseModel

from posture_core import Keypoint, PostureAnalyzer, PostureType, MEDIAPIPE_TO_ANALYZER

# ---------------------------------------------------------------------------
# Response schema
# ---------------------------------------------------------------------------

class IssueOut(BaseModel):
    type: str
    description: str
    severity: str          # "LOW" | "MEDIUM" | "HIGH"
    angle: Optional[float] = None


class AnalyzeResponse(BaseModel):
    posture_type: str      # "squat" | "desk"
    score: int
    issues: List[IssueOut]
    recommendations: List[str]


# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(title="Posture Analyzer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# MediaPipe pose detector (module-level singleton)
# ---------------------------------------------------------------------------

_mp_pose = mp.solutions.pose
_pose_detector = _mp_pose.Pose(
    static_image_mode=True,
    model_complexity=2,          # Use the most accurate model
    enable_segmentation=False,
    min_detection_confidence=0.5,
)

# ---------------------------------------------------------------------------
# Keypoint extraction
# ---------------------------------------------------------------------------

def extract_keypoints(image_rgb: np.ndarray) -> List[Keypoint]:
    """
    Run MediaPipe Pose on an RGB image and return a list of Keypoints
    whose names match the keys expected by PostureAnalyzer.
    """
    results = _pose_detector.process(image_rgb)
    if not results.pose_landmarks:
        return []

    h, w = image_rgb.shape[:2]
    landmarks = results.pose_landmarks.landmark
    keypoints: List[Keypoint] = []

    for lm_enum in _mp_pose.PoseLandmark:
        raw_name = lm_enum.name.lower()            # e.g. "left_knee"
        analyzer_name = MEDIAPIPE_TO_ANALYZER.get(raw_name, raw_name)
        landmark = landmarks[lm_enum.value]
        keypoints.append(Keypoint(
            name=analyzer_name,
            x=landmark.x * w,
            y=landmark.y * h,
            confidence=landmark.visibility,        # 0–1
        ))

    return keypoints


# ---------------------------------------------------------------------------
# Frame extraction helpers
# ---------------------------------------------------------------------------

def _load_image(file_bytes: bytes) -> Optional[np.ndarray]:
    """Try to decode bytes as an image. Returns RGB ndarray or None."""
    try:
        img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        return np.array(img)
    except Exception:
        return None


def _load_video_frame(file_bytes: bytes) -> Optional[np.ndarray]:
    """
    Write bytes to a temp file, sample three candidate frames
    (25 %, 50 %, 75 % through the video), and return the one where
    MediaPipe detects the most landmarks (best pose visibility).
    Returns an RGB ndarray or None.
    """
    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as tmp:
        tmp.write(file_bytes)
        tmp_path = tmp.name

    cap = cv2.VideoCapture(tmp_path)
    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total < 1:
        cap.release()
        return None

    best_frame: Optional[np.ndarray] = None
    best_score = -1.0

    for frac in (0.25, 0.50, 0.75):
        frame_idx = int(total * frac)
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if not ret:
            continue
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        # Score = sum of visibility values for detected landmarks
        kps = extract_keypoints(frame_rgb)
        score = sum(k.confidence for k in kps)
        if score > best_score:
            best_score = score
            best_frame = frame_rgb

    cap.release()
    return best_frame


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------

VALID_POSTURE_TYPES = {"squat", "desk"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_posture(
    file: UploadFile = File(...),
    posture_type: str = Form(...),
):
    # Validate posture_type
    posture_type = posture_type.strip().lower()
    if posture_type not in VALID_POSTURE_TYPES:
        raise HTTPException(
            status_code=422,
            detail=f"posture_type must be one of {sorted(VALID_POSTURE_TYPES)}, "
                   f"got '{posture_type}'."
        )

    file_bytes = await file.read()

    # --- Decode file (image or video) ---
    image_rgb = _load_image(file_bytes)
    if image_rgb is None:
        image_rgb = _load_video_frame(file_bytes)

    if image_rgb is None:
        raise HTTPException(
            status_code=422,
            detail="Could not decode the uploaded file as an image or video."
        )

    # --- Extract keypoints ---
    keypoints = extract_keypoints(image_rgb)
    if not keypoints:
        return AnalyzeResponse(
            posture_type=posture_type,
            score=0,
            issues=[],
            recommendations=[
                "No human pose detected in the image. "
                "Ensure the full body (or at least the upper body) is visible "
                "and well-lit, then try again."
            ],
        )

    # --- Analyse ---
    analyzer = PostureAnalyzer()

    if posture_type == "squat":
        issues = analyzer.analyze_squat_form(keypoints)
        posture_enum = PostureType.SQUAT
    else:
        issues = analyzer.analyze_desk_posture(keypoints)
        posture_enum = PostureType.DESK

    score = analyzer.calculate_posture_score(issues)
    recommendations = analyzer.generate_recommendations(issues, posture_enum)

    return AnalyzeResponse(
        posture_type=posture_type,
        score=score,
        issues=[
            IssueOut(
                type=issue.type,
                description=issue.description,
                severity=issue.severity.name,   # "LOW" | "MEDIUM" | "HIGH"
                angle=issue.angle,
            )
            for issue in issues
        ],
        recommendations=recommendations,
    )