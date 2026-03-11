import numpy as np
from dataclasses import dataclass, field
from enum import Enum
from typing import List, Optional, Dict


class PostureType(Enum):
    SQUAT = "squat"
    DESK = "desk"


class Severity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


@dataclass
class Keypoint:
    name: str
    x: float
    y: float
    confidence: float


@dataclass
class PostureIssue:
    type: str
    severity: Severity
    description: str
    angle: Optional[float] = None


# Maps MediaPipe PoseLandmark names → analyzer keypoint names
# MediaPipe uses e.g. "LEFT_KNEE"; we normalize to "left_knee" already,
# but some landmarks need aliasing to match what the analyzer expects.
MEDIAPIPE_TO_ANALYZER: Dict[str, str] = {
    "nose": "nose",
    "left_shoulder": "left_shoulder",
    "right_shoulder": "right_shoulder",
    "left_elbow": "left_elbow",
    "right_elbow": "right_elbow",
    "left_wrist": "left_wrist",
    "right_wrist": "right_wrist",
    "left_hip": "left_hip",
    "right_hip": "right_hip",
    "left_knee": "left_knee",
    "right_knee": "right_knee",
    "left_ankle": "left_ankle",
    "right_ankle": "right_ankle",
    "left_heel": "left_heel",
    "right_heel": "right_heel",
    "left_foot_index": "left_foot_index",
    "right_foot_index": "right_foot_index",
}


class PostureAnalyzer:
    def __init__(self):
        self.squat_rules = {
            # How far (in normalized x) the knee may extend past the toe
            "knee_over_toe_threshold": 0.05,
            # Minimum acceptable hip angle (shoulder-hip-knee)
            "hip_angle_min": 50,
            # Maximum acceptable hip angle (not too upright mid-squat)
            "hip_angle_max": 160,
            # Back angle (shoulder-hip-knee) below which we flag
            "back_angle_min": 150,
        }

        self.desk_rules = {
            # Forward head: nose ahead of mid-shoulder by this fraction of image width
            "neck_forward_threshold": 0.05,
            # Shoulder height difference (fraction of image height)
            "shoulder_tilt_threshold": 0.03,
            # Slouch: horizontal offset shoulder vs hip (fraction of image width)
            "slouch_threshold": 0.06,
            # Ear-shoulder-hip angle below which we flag forward neck tilt
            "neck_angle_threshold": 150,
        }

    # ------------------------------------------------------------------
    # Geometry helpers
    # ------------------------------------------------------------------

    def _vec(self, a: Keypoint, b: Keypoint) -> np.ndarray:
        return np.array([a.x - b.x, a.y - b.y])

    def calculate_angle(self, p1: Keypoint, p2: Keypoint, p3: Keypoint) -> float:
        """Angle at p2 formed by the rays p2→p1 and p2→p3 (degrees)."""
        v1 = self._vec(p1, p2)
        v2 = self._vec(p3, p2)
        norm_product = np.linalg.norm(v1) * np.linalg.norm(v2)
        if norm_product < 1e-6:
            return 0.0
        cos_angle = np.clip(np.dot(v1, v2) / norm_product, -1.0, 1.0)
        return float(np.degrees(np.arccos(cos_angle)))

    def _confident(self, kp: Optional[Keypoint], threshold: float = 0.4) -> bool:
        """Return True only if the keypoint exists and has sufficient confidence."""
        return kp is not None and kp.confidence >= threshold

    # ------------------------------------------------------------------
    # Squat analysis
    # ------------------------------------------------------------------

    def analyze_squat_form(self, keypoints: List[Keypoint]) -> List[PostureIssue]:
        issues: List[PostureIssue] = []
        kp: Dict[str, Keypoint] = {k.name: k for k in keypoints}

        img_w = max((k.x for k in keypoints), default=1.0) or 1.0
        img_h = max((k.y for k in keypoints), default=1.0) or 1.0

        # --- Knee-over-toe check (use foot_index as the toe reference) ---
        for side in ("left", "right"):
            knee = kp.get(f"{side}_knee")
            toe = kp.get(f"{side}_foot_index") or kp.get(f"{side}_ankle")
            if self._confident(knee) and self._confident(toe):
                # In a front-facing squat, knee x should not exceed toe x by much
                overshoot = (knee.x - toe.x) / img_w
                if overshoot > self.squat_rules["knee_over_toe_threshold"]:
                    sev = Severity.HIGH if overshoot > 0.12 else Severity.MEDIUM
                    issues.append(PostureIssue(
                        "knee_over_toe", sev,
                        f"{side.capitalize()} knee extends beyond toe "
                        f"({overshoot * 100:.1f}% of frame width)"
                    ))

        # --- Back / torso angle: shoulder → hip → knee ---
        for side in ("left", "right"):
            shoulder = kp.get(f"{side}_shoulder")
            hip = kp.get(f"{side}_hip")
            knee = kp.get(f"{side}_knee")
            if self._confident(shoulder) and self._confident(hip) and self._confident(knee):
                angle = self.calculate_angle(shoulder, hip, knee)
                if angle < self.squat_rules["back_angle_min"]:
                    sev = Severity.HIGH if angle < 120 else Severity.MEDIUM
                    issues.append(PostureIssue(
                        "back_angle", sev,
                        f"{side.capitalize()} back angle too acute: {angle:.1f}°",
                        angle=angle
                    ))
                break  # Only report once (prefer left, fall through to right)

        # --- Hip depth: hip should drop below knee level in a deep squat ---
        left_hip = kp.get("left_hip")
        left_knee = kp.get("left_knee")
        if self._confident(left_hip) and self._confident(left_knee):
            # In image coords y increases downward, so hip.y > knee.y means hips are lower
            depth_ratio = (left_hip.y - left_knee.y) / img_h
            if depth_ratio < -0.05:
                issues.append(PostureIssue(
                    "squat_depth", Severity.LOW,
                    "Hips are above knee level — squat depth may be insufficient"
                ))

        # --- Knee cave (valgus): knees closer together than ankles ---
        l_knee, r_knee = kp.get("left_knee"), kp.get("right_knee")
        l_ankle, r_ankle = kp.get("left_ankle"), kp.get("right_ankle")
        if (self._confident(l_knee) and self._confident(r_knee)
                and self._confident(l_ankle) and self._confident(r_ankle)):
            knee_width = abs(l_knee.x - r_knee.x)
            ankle_width = abs(l_ankle.x - r_ankle.x)
            if ankle_width > 1e-3 and knee_width / ankle_width < 0.75:
                issues.append(PostureIssue(
                    "knee_valgus", Severity.HIGH,
                    "Knee cave detected — knees collapsing inward"
                ))

        return issues

    # ------------------------------------------------------------------
    # Desk posture analysis
    # ------------------------------------------------------------------

    def analyze_desk_posture(self, keypoints: List[Keypoint]) -> List[PostureIssue]:
        issues: List[PostureIssue] = []
        kp: Dict[str, Keypoint] = {k.name: k for k in keypoints}

        img_w = max((k.x for k in keypoints), default=1.0) or 1.0
        img_h = max((k.y for k in keypoints), default=1.0) or 1.0

        nose = kp.get("nose")
        l_shoulder = kp.get("left_shoulder")
        r_shoulder = kp.get("right_shoulder")
        l_hip = kp.get("left_hip")
        r_hip = kp.get("right_hip")
        l_ear = kp.get("left_ear")
        r_ear = kp.get("right_ear")

        # Compute mid-shoulder reference
        if self._confident(l_shoulder) and self._confident(r_shoulder):
            mid_shoulder_x = (l_shoulder.x + r_shoulder.x) / 2
            mid_shoulder_y = (l_shoulder.y + r_shoulder.y) / 2
        else:
            mid_shoulder_x = mid_shoulder_y = None

        # --- Forward head posture (nose vs mid-shoulder) ---
        if self._confident(nose) and mid_shoulder_x is not None:
            forward_offset = (nose.x - mid_shoulder_x) / img_w
            if abs(forward_offset) > self.desk_rules["neck_forward_threshold"]:
                sev = Severity.HIGH if abs(forward_offset) > 0.10 else Severity.MEDIUM
                issues.append(PostureIssue(
                    "neck_forward", sev,
                    f"Forward head posture detected "
                    f"({abs(forward_offset) * 100:.1f}% of frame width)"
                ))

        # --- Ear-shoulder-hip neck angle (side view) ---
        for ear, shoulder, hip in [
            (l_ear, l_shoulder, l_hip),
            (r_ear, r_shoulder, r_hip),
        ]:
            if self._confident(ear) and self._confident(shoulder) and self._confident(hip):
                angle = self.calculate_angle(ear, shoulder, hip)
                if angle < self.desk_rules["neck_angle_threshold"]:
                    sev = Severity.HIGH if angle < 120 else Severity.MEDIUM
                    issues.append(PostureIssue(
                        "neck_tilt", sev,
                        f"Neck tilt detected: ear-shoulder-hip angle {angle:.1f}°",
                        angle=angle
                    ))
                break  # Report once

        # --- Shoulder tilt ---
        if self._confident(l_shoulder) and self._confident(r_shoulder):
            tilt = abs(l_shoulder.y - r_shoulder.y) / img_h
            if tilt > self.desk_rules["shoulder_tilt_threshold"]:
                sev = Severity.HIGH if tilt > 0.07 else Severity.MEDIUM
                issues.append(PostureIssue(
                    "shoulder_misalignment", sev,
                    f"Uneven shoulders detected ({tilt * 100:.1f}% of frame height)"
                ))

        # --- Slouching: measure shoulder-hip horizontal offset as angle ---
        for shoulder, hip in [(l_shoulder, l_hip), (r_shoulder, r_hip)]:
            if self._confident(shoulder) and self._confident(hip):
                h_offset = abs(shoulder.x - hip.x) / img_w
                if h_offset > self.desk_rules["slouch_threshold"]:
                    sev = Severity.HIGH if h_offset > 0.12 else Severity.MEDIUM
                    issues.append(PostureIssue(
                        "slouching", sev,
                        f"Slouching posture detected "
                        f"(shoulder-hip horizontal offset {h_offset * 100:.1f}%)"
                    ))
                break  # Report once

        return issues

    # ------------------------------------------------------------------
    # Scoring & recommendations
    # ------------------------------------------------------------------

    def calculate_posture_score(self, issues: List[PostureIssue]) -> int:
        deductions = {Severity.HIGH: 20, Severity.MEDIUM: 10, Severity.LOW: 5}
        score = 100
        for issue in issues:
            score -= deductions.get(issue.severity, 5)
        return max(0, score)

    def generate_recommendations(
        self, issues: List[PostureIssue], posture_type: PostureType
    ) -> List[str]:
        tips: List[str] = []
        issue_types = {i.type for i in issues}

        if posture_type == PostureType.SQUAT:
            if "knee_over_toe" in issue_types:
                tips.append("Push your knees out in line with your toes, not past them.")
                tips.append("Try box squats or wall squats to build awareness of knee tracking.")
            if "back_angle" in issue_types:
                tips.append("Maintain a neutral spine — avoid excessive forward lean.")
                tips.append("Strengthen hip flexors and thoracic mobility to keep your chest up.")
            if "squat_depth" in issue_types:
                tips.append("Work on ankle and hip mobility to achieve full squat depth.")
            if "knee_valgus" in issue_types:
                tips.append("Focus on pushing knees outward during the descent (cue: 'spread the floor').")
                tips.append("Strengthen glute medius with lateral band walks.")

        elif posture_type == PostureType.DESK:
            if "neck_forward" in issue_types or "neck_tilt" in issue_types:
                tips.append("Raise your monitor so the top third is at eye level.")
                tips.append("Practice chin tucks: gently retract your head back 10× every hour.")
            if "slouching" in issue_types:
                tips.append("Use a lumbar support cushion or roll to maintain your lower back curve.")
                tips.append("Engage your core lightly while seated — imagine a string pulling your head up.")
            if "shoulder_misalignment" in issue_types:
                tips.append("Adjust your chair and armrests so both shoulders sit level.")
                tips.append("Check that your keyboard and mouse are centred to your body.")

        if not tips:
            tips.append("Great posture! Keep it up.")
        else:
            tips.append("Take a 2-minute movement break every 30–45 minutes to reset your posture.")

        return tips