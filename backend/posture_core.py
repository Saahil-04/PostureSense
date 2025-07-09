import numpy as np
from dataclasses import dataclass
from enum import Enum
from typing import List, Optional

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

class PostureAnalyzer:
    def __init__(self):
        self.squat_rules = {
            'knee_over_toe_threshold': 10,
            'back_angle_min': 150,
            'hip_knee_alignment': 15
        }

        self.desk_rules = {
            'neck_forward_threshold': 30,
            'shoulder_alignment': 20,
            'back_straightness': 160
        }

    def calculate_angle(self, p1: Keypoint, p2: Keypoint, p3: Keypoint) -> float:
        v1 = np.array([p1.x - p2.x, p1.y - p2.y])
        v2 = np.array([p3.x - p2.x, p3.y - p2.y])
        cos_angle = np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2))
        cos_angle = np.clip(cos_angle, -1.0, 1.0)
        angle = np.arccos(cos_angle)
        return np.degrees(angle)

    def analyze_squat_form(self, keypoints: List[Keypoint]) -> List[PostureIssue]:
        issues = []
        kp = {k.name: k for k in keypoints}

        try:
            lk, la = kp.get('left_knee'), kp.get('left_ankle')
            rk, ra = kp.get('right_knee'), kp.get('right_ankle')

            if lk and la and lk.x > la.x + self.squat_rules['knee_over_toe_threshold']:
                issues.append(PostureIssue("knee_over_toe", Severity.HIGH, "Left knee extends beyond toe"))
            if rk and ra and rk.x > ra.x + self.squat_rules['knee_over_toe_threshold']:
                issues.append(PostureIssue("knee_over_toe", Severity.HIGH, "Right knee extends beyond toe"))

            ls, lh, lk = kp.get('left_shoulder'), kp.get('left_hip'), kp.get('left_knee')
            if ls and lh and lk:
                angle = self.calculate_angle(ls, lh, lk)
                if angle < self.squat_rules['back_angle_min']:
                    sev = Severity.HIGH if angle < 130 else Severity.MEDIUM
                    issues.append(PostureIssue("back_angle", sev, f"Back angle too acute: {angle:.1f}°", angle))
        except Exception as e:
            print("Error in squat analysis:", e)

        return issues

    def analyze_desk_posture(self, keypoints: List[Keypoint]) -> List[PostureIssue]:
        issues = []
        kp = {k.name: k for k in keypoints}

        try:
            nose, ls, rs = kp.get('nose'), kp.get('left_shoulder'), kp.get('right_shoulder')
            if nose and ls and rs:
                center_x = (ls.x + rs.x) / 2
                distance = abs(nose.x - center_x)
                if distance > self.desk_rules['neck_forward_threshold']:
                    sev = Severity.HIGH if distance > 50 else Severity.MEDIUM
                    issues.append(PostureIssue("neck_forward", sev, f"Forward head posture: {distance:.1f}px"))

            if ls and rs:
                diff = abs(ls.y - rs.y)
                if diff > self.desk_rules['shoulder_alignment']:
                    issues.append(PostureIssue("shoulder_misalignment", Severity.MEDIUM, f"Uneven shoulders: {diff:.1f}px"))

            lh = kp.get('left_hip')
            if ls and lh:
                slouch_angle = abs(ls.x - lh.x)
                if slouch_angle > 30:
                    issues.append(PostureIssue("slouching", Severity.MEDIUM, "Slouching posture detected"))
        except Exception as e:
            print("Error in desk analysis:", e)

        return issues

    def calculate_posture_score(self, issues: List[PostureIssue]) -> int:
        score = 100
        for issue in issues:
            if issue.severity == Severity.HIGH:
                score -= 15
            elif issue.severity == Severity.MEDIUM:
                score -= 10
            else:
                score -= 5
        return max(0, score)

    def generate_recommendations(self, issues: List[PostureIssue], posture_type: PostureType) -> List[str]:
        tips = []
        types = [i.type for i in issues]

        if posture_type == PostureType.SQUAT:
            if "knee_over_toe" in types:
                tips.append("Keep knees behind toes during squats")
                tips.append("Practice wall squats")
            if "back_angle" in types:
                tips.append("Maintain a neutral spine")
                tips.append("Engage core muscles")

        if posture_type == PostureType.DESK:
            if "neck_forward" in types:
                tips.append("Raise monitor to eye level")
                tips.append("Practice chin tucks")
            if "slouching" in types:
                tips.append("Use a lumbar support cushion")
                tips.append("Strengthen your core")
            if "shoulder_misalignment" in types:
                tips.append("Check desk ergonomics")

        if not tips:
            tips.append("Great posture! Keep it up")
        else:
            tips.append("Take regular breaks to reset posture")

        return tips
