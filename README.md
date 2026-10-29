# AI Software Engineering Assistant

<p align="center">
  <img src="./docs/screenshots/ai-assistant-dashboard.svg" alt="AI Software Engineering Assistant dashboard" width="1200" />
</p>

<p align="center">
  <a href="http://localhost:5173" target="_blank">
    <img src="https://img.shields.io/badge/Live%20Demo-Open%20App-10b981?style=for-the-badge&logo=rocket" alt="Live Demo" />
  </a>
  <a href="http://localhost:8000/docs" target="_blank">
    <img src="https://img.shields.io/badge/API%20Docs-Open-2563eb?style=for-the-badge&logo=fastapi" alt="API Docs" />
  </a>
</p>

A modern AI-powered software engineering workspace built with React + Vite on the frontend and FastAPI on the backend. It helps developers analyze, debug, review, generate, document, and understand code inside a polished dashboard experience.

## ✨ Highlights

- AI-assisted debugging and code analysis workflow
- Project upload and indexing with searchable code intelligence
- Authenticated dashboard with protected routes and history
- Support for explain, review, refactor, tests, documentation, and chat tools
- 3D project intelligence visualization and code metrics
- FastAPI backend with SQLite persistence and JWT auth

## 🖼️ Screenshot

<p align="center">
  <img src="./docs/screenshots/ai-assistant-dashboard.svg" alt="AI assistant interface preview" width="1000" />
</p>

## 🚀 Live app

The app is configured to run locally with:

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Swagger docs: http://localhost:8000/docs

## 🧩 Tech stack

- Frontend: React, Vite, React Router, Tailwind-inspired styling, Framer Motion
- 3D UI: React Three Fiber, Drei
- IDE experience: Monaco Editor
- Backend: FastAPI, SQLite, JWT auth
- AI tools: deterministic local analysis with optional OpenAI-compatible provider support

## 🛠️ Getting started

### 1) Install frontend dependencies

```bash
npm install
```

### 2) Start the frontend

```bash
npm run dev -- --host 0.0.0.0
```

Open: http://localhost:5173

### 3) Start the backend

```powershell
py -m venv backend\.venv
backend\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
Copy-Item backend\.env.example backend\.env
uvicorn app.main:app --app-dir backend --reload --port 8000
```

> Make sure `JWT_SECRET` is set in `backend/.env` before using authentication.

## 🔐 Configuration

Set the following in `backend/.env` for optional AI-backed features:

```env
JWT_SECRET=your-long-random-value
LLM_API_KEY=your-key
LLM_MODEL=gpt-4o-mini
LLM_BASE_URL=https://api.openai.com/v1
```

Without `LLM_API_KEY`, the app still works with local deterministic analysis and templates.

## 📁 Project structure

```text
ai-swe-assistant/
├── backend/
│   ├── app/
│   ├── data/
│   ├── tests/
│   ├── .env
│   └── requirements.txt
├── src/
├── public/
├── docs/
│   └── screenshots/
├── package.json
├── index.html
├── README.md
├── RUN_ME.md
└── vite.config.js
```

## 🧪 Run tests

```powershell
Set-Location backend
python -m unittest discover -s tests -v
```

## 🚀 Push to GitHub

If your GitHub repository is ready, run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## 📌 Notes

- The app supports code review, explanations, debugging, test generation, refactoring, docs generation, and project chat.
- Project indexing stores supported text files and uses keyword-based retrieval.
- Emails for password reset are not configured by default unless you add a mail provider.

## ❤️ Purpose

This project is built to act like a smart engineering workspace that helps developers move faster from idea to delivery while keeping a clean developer experience.
