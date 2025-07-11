from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Literal
import numpy as np
import cv2
import io
from PIL import Image
import mediapipe as mp
import tempfile
from posture_core import PostureAnalyzer, Keypoint, PostureType

# Define response schema
class IssueOut(BaseModel):
    type: str
    description: str
    severity: Literal["LOW", "MEDIUM", "HIGH"]
    angle: float | None = None

class AnalyzeResponse(BaseModel):
    posture_type: Literal["squat", "desk"]
    score: int
    issues: List[IssueOut]
    recommendations: List[str]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MediaPipe setup
mp_pose = mp.solutions.pose
pose_detector = mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.5)

def extract_keypoints_from_image(image_np) -> List[Keypoint]:
    image_bgr = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
    results = pose_detector.process(image_bgr)

    if not results.pose_landmarks:
        return []

    landmarks = results.pose_landmarks.landmark
    keypoints = []
    for lm in mp_pose.PoseLandmark:
        landmark = landmarks[lm.value]
        keypoints.append(Keypoint(
            name=lm.name.lower(),
            x=landmark.x * image_np.shape[1],
            y=landmark.y * image_np.shape[0],
            confidence=landmark.visibility
        ))
    return keypoints

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_posture(file: UploadFile = File(...), posture_type: str = Form(...)):
    file_bytes = await file.read()

    # Try to open as image first
    try:
        image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        image_np = np.array(image)
    except Exception:
        # If not an image, assume it's a video
        with tempfile.NamedTemporaryFile(suffix=".mp4") as tmp:
            tmp.write(file_bytes)
            tmp.flush()

            cap = cv2.VideoCapture(tmp.name)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            middle_frame = total_frames // 2

            cap.set(cv2.CAP_PROP_POS_FRAMES, middle_frame)
            ret, frame = cap.read()

            if not ret:
                return {
                    "posture_type": posture_type,
                    "score": 0,
                    "issues": [],
                    "recommendations": ["Failed to read video frame."]
                }

            image_np = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            cap.release()

    keypoints = extract_keypoints_from_image(image_np)
    if not keypoints:
        return {
            "posture_type": posture_type,
            "score": 0,
            "issues": [],
            "recommendations": ["No human pose detected. Please try again."]
        }

    analyzer = PostureAnalyzer()
    if posture_type == "squat":
        issues = analyzer.analyze_squat_form(keypoints)
        posture_enum = PostureType.SQUAT
    else:
        issues = analyzer.analyze_desk_posture(keypoints)
        posture_enum = PostureType.DESK

    score = analyzer.calculate_posture_score(issues)
    recommendations = analyzer.generate_recommendations(issues, posture_enum)

    return {
        "posture_type": posture_type,
        "score": score,
        "issues": [
            {
                "type": issue.type,
                "description": issue.description,
                "severity": issue.severity.name,
                "angle": issue.angle
            }
            for issue in issues
        ],
        "recommendations": recommendations
    }