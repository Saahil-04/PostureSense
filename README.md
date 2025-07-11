# 🧘‍♂️ PostureSense

**PostureSense** is a full-stack AI-powered posture analysis web app that detects improper posture using either video uploads or real-time webcam input. Built using **React + Tailwind + ShadCN** on the frontend and **FastAPI + MediaPipe** on the backend.

> 🚀 [Live App](https://posture-sense-blond.vercel.app/) • 🔧 [Backend API](https://posturesense-backend.onrender.com)

---

## 📸 Features

- 🎥 **Video Upload & Analysis**
  - Analyze squat or desk posture using uploaded video files
  - Get posture scores, issue breakdowns, and improvement suggestions

- 📷 **Webcam Live Detection**
  - Detect real-time posture from your webcam
  - Frame-by-frame analysis with automatic feedback

- 🧠 **AI-Powered Analysis**
  - Uses MediaPipe to detect body landmarks
  - Rule-based logic to calculate scores and posture problems

- ✨ **Modern UI**
  - Built with React + Tailwind CSS + ShadCN UI
  - Responsive, animated with Framer Motion

---

## 🛠️ Tech Stack

| Frontend        | Backend         | AI / CV Engine  |
|-----------------|-----------------|-----------------|
| React + Vite    | FastAPI         | MediaPipe       |
| Tailwind CSS    | Pydantic        | OpenCV          |
| ShadCN UI       | Uvicorn         | Custom Rules    |
| Framer Motion   | CORS Middleware | PIL / NumPy     |

---

## 🧪 Sample Output Format (From Backend)

```json
{
  "posture_type": "desk",
  "score": 90,
  "issues": [
    {
      "type": "slouching",
      "description": "Slouching posture detected",
      "severity": "MEDIUM",
      "angle": null
    }
  ],
  "recommendations": [
    "Use a lumbar support cushion",
    "Strengthen your core",
    "Take regular breaks to reset posture"
  ]
}
```

---

## 🚀 Deployment

- Frontend deployed with [Vercel](https://vercel.com)
- Backend deployed with [Render](https://render.com)

> 💡 See `.env.example` and Dockerfile for deployment details.

---

## 📁 Folder Structure

```
PostureSense/
├── frontend/         # React app with Tailwind & ShadCN
│   ├── src/
│   ├── public/
│   └── .env
├── backend/          # FastAPI app
│   ├── posture_core/ # Posture analysis logic
│   └── main.py
├── requirements.txt
└── README.md
```

---

## 🔧 Getting Started (Local)

1. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

---

## 📢 Credits

- Built with ❤️ by [Saahil Vishwakarma](https://github.com/Saahil-04)
- Powered by [MediaPipe](https://google.github.io/mediapipe/) and [FastAPI](https://fastapi.tiangolo.com)

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

## 🌐 Links

- 🔗 Frontend: [https://posture-sense-blond.vercel.app/](https://posture-sense-blond.vercel.app/)
- 🔗 Backend: [https://posturesense-backend.onrender.com](https://posturesense-backend.onrender.com)

```
