# PostureSense – Real-Time AI Posture Analysis Web App

Live Demo: https://posture-sense-blond.vercel.app  
Portfolio: https://saahil-portfolio.vercel.app  

---

## Overview

PostureSense is a full-stack AI-powered web application that analyzes user posture in real time using webcam or video input and provides actionable feedback.

The system uses computer vision to detect posture issues and returns posture scores, identified problems, and recommendations through a REST API.

This project demonstrates full-stack architecture, real-time processing, and frontend-backend integration.

---

## Key Features

- Real-time posture analysis using webcam input
- Video upload posture analysis
- AI-based posture detection using MediaPipe
- REST API backend built with FastAPI
- Posture scoring and issue detection system
- Modern responsive frontend built with React and TailwindCSS
- Full-stack deployment (Frontend on Vercel, Backend deployed)

---

## Tech Stack

Frontend:
- React
- TypeScript
- TailwindCSS

Backend:
- FastAPI
- Python

Computer Vision:
- MediaPipe

Deployment:
- Vercel (Frontend)
- Backend deployed via cloud service

---

## System Architecture

The application follows a full-stack client-server architecture:

1. React frontend captures webcam input or video upload
2. Media is sent to FastAPI backend via REST API
3. Backend processes posture using MediaPipe pose detection
4. Backend calculates posture score and identifies issues
5. Results are returned as structured JSON response
6. Frontend displays posture feedback and analysis to user

This architecture demonstrates real-time frontend-backend communication and scalable API design.

---

## API Response Example

```json
{
  "posture_type": "desk",
  "score": 87,
  "issues": [
    {
      "type": "Neck Bend",
      "severity": "MEDIUM"
    }
  ],
  "recommendations": [
    "Keep your back straight",
    "Align your neck properly"
  ]
}
```

---

## Challenges Solved

- Handling real-time webcam input in browser
- Integrating computer vision with web applications
- Designing scalable REST APIs
- Managing frontend-backend communication efficiently
- Deploying full-stack applications

---

## What This Project Demonstrates

This project demonstrates my ability to:

- Build full-stack applications using React and FastAPI
- Design and implement REST APIs
- Integrate AI/computer vision into web applications
- Deploy production-ready applications
- Design scalable frontend-backend architectures

---

## Repository Structure

```
PostureSense/
│
├── frontend/     # React frontend
├── backend/      # FastAPI backend
└── README.md
```

---

## Live Demo

https://posture-sense-blond.vercel.app

---

## Author

Saahil Vishwakarma  
Portfolio: https://saahil-portfolio.vercel.app  
GitHub: https://github.com/Saahil-04  
LinkedIn: https://www.linkedin.com/in/saahil-vishwakarma-7a5943288/
