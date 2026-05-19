<div align="center">

<img src="https://img.shields.io/badge/ResumeIQ-AI%20Resume%20Analyzer-6C63FF?style=for-the-badge&logo=artificial-intelligence&logoColor=white" alt="ResumeIQ AI" />

# 🧠 ResumeIQ AI
### Smart ATS & AI Resume Analyzer Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> **Multi-Granularity Multi-Modal AI Resume Analyzer** — Analyze, optimize, and improve resumes using NLP, Semantic Similarity, TF-IDF, and ATS Compatibility Scoring.

[🚀 Live Demo](#) · [📖 Docs](#api-endpoints) · [🐛 Report Bug](#) · [✨ Request Feature](#)

---

![ResumeIQ Dashboard Preview](https://img.shields.io/badge/UI-Dark%20Glassmorphism%20Dashboard-0F172A?style=for-the-badge&logo=vercel&logoColor=white)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [⚙️ Installation](#️-installation)
- [🚀 Running the Project](#-running-the-project)
- [🔌 API Endpoints](#-api-endpoints)
- [🧠 AI Scoring Logic](#-ai-scoring-logic)
- [🎨 UI Design System](#-ui-design-system)
- [📸 Screenshots](#-screenshots)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)

---

## ✨ Features

### 🎯 Core Analysis
| Feature | Description |
|---|---|
| 📊 **ATS Score** | Weighted AI formula: `0.5×Semantic + 0.3×Keywords + 0.2×Layout` |
| 🧠 **Semantic Matching** | TF-IDF cosine similarity (SBERT-ready) between resume and JD |
| 🔍 **Keyword Analysis** | TF-IDF overlap detection against job description |
| 📐 **Layout Scoring** | Section detection, file size, and word count heuristics |
| 🕳️ **Skill Gap Detection** | Identifies skills in JD missing from resume |
| 💡 **AI Suggestions** | Actionable improvement tips based on score breakdown |

### 🖥️ Application Pages
| Page | Route | Description |
|---|---|---|
| 🏠 **Landing** | `/` | Hero, features, how-it-works, CTA |
| 🔐 **Login** | `/login` | JWT-based authentication |
| 📝 **Register** | `/register` | Account creation |
| 📊 **Dashboard** | `/dashboard` | Score history, radar chart, bar chart |
| 📤 **Upload & Analyze** | `/upload` | Drag-and-drop PDF upload + JD input |
| 📈 **Results** | `/results/:id` | Full analysis breakdown |
| 👤 **Profile** | `/profile` | User account info |

### 🔒 Security
- ✅ JWT Authentication (30-min expiry)
- ✅ Bcrypt password hashing
- ✅ Protected routes (frontend + backend)
- ✅ File type & size validation (PDF only, max 10MB)
- ✅ Per-user data isolation

---

## 🛠️ Tech Stack

### 🎨 Frontend
| Technology | Version | Purpose |
|---|---|---|
| ⚛️ React | 18.2 | UI framework |
| 🔀 React Router DOM | 6.22 | Client-side routing |
| 📊 Recharts | 2.10 | Radar & bar charts |
| 🎬 Framer Motion | 11.0 | Animations |
| 🌐 Axios | 1.4 | HTTP client |
| ⚡ Vite | 5.0 | Build tool & dev server |

### ⚙️ Backend
| Technology | Version | Purpose |
|---|---|---|
| 🐍 Python | 3.10+ | Runtime |
| 🚀 FastAPI | 0.111 | REST API framework |
| 🦄 Uvicorn | 0.29 | ASGI server |
| 🗄️ SQLAlchemy | 2.0 | ORM |
| 🔐 python-jose | 3.3 | JWT tokens |
| 🔑 passlib[bcrypt] | 1.7 | Password hashing |
| 📄 pdfplumber | 0.11 | PDF text extraction |

### 🤖 AI / ML
| Technology | Purpose |
|---|---|
| 🔢 scikit-learn (TF-IDF) | Keyword & semantic similarity |
| 🤗 sentence-transformers | SBERT semantic embeddings (optional) |
| 📐 NumPy | Vector math |
| 🗃️ SQLite | Local development database |

---

## 📁 Project Structure

```
ResumeIQ_AI/
│
├── 📄 README.md                    # This file
├── 📄 .gitignore
├── ▶️  run-backend.ps1              # Backend start script (Windows)
├── ▶️  run-frontend.ps1             # Frontend start script (Windows)
│
├── 🎨 frontend/                    # React + Vite application
│   ├── 📄 index.html               # HTML entry point (Google Fonts)
│   ├── 📄 vite.config.js           # Vite + React plugin config
│   ├── 📄 package.json             # Node dependencies
│   │
│   └── src/
│       ├── 📄 main.jsx             # App entry — BrowserRouter + AuthProvider
│       ├── 📄 App.jsx              # Route definitions + Protected wrapper
│       ├── 📄 AuthContext.jsx      # Global auth state (JWT + user profile)
│       ├── 📄 api.js               # Axios API client (auto-attaches JWT)
│       ├── 📄 styles.css           # Global CSS variables + utility classes
│       │
│       ├── components/
│       │   ├── 📄 Navbar.jsx       # Sticky nav with auth-aware links
│       │   ├── 📄 Blobs.jsx        # Animated background gradient blobs
│       │   └── 📄 ScoreCard.jsx    # Reusable score display card
│       │
│       └── pages/
│           ├── 📄 Home.jsx         # Landing page (hero, features, steps, CTA)
│           ├── 📄 Login.jsx        # Sign-in form
│           ├── 📄 Register.jsx     # Sign-up form
│           ├── 📄 Dashboard.jsx    # Analytics dashboard (charts + history)
│           ├── 📄 Upload.jsx       # Resume upload + JD input (3-step flow)
│           ├── 📄 Results.jsx      # Full analysis results page
│           └── 📄 Profile.jsx      # User profile & account actions
│
├── ⚙️  backend/                    # FastAPI Python application
│   ├── 📄 requirements.txt         # Python dependencies (pinned)
│   ├── 📄 resumeiq.db              # SQLite database (auto-created)
│   │
│   ├── uploads/                    # Uploaded PDF files (UUID-prefixed)
│   │
│   └── app/
│       ├── 📄 __init__.py
│       ├── 📄 main.py              # FastAPI app, CORS, router registration
│       ├── 📄 database.py          # SQLAlchemy engine + session + Base
│       ├── 📄 models.py            # ORM models: User, Resume, Analysis
│       ├── 📄 auth.py              # JWT auth, register/login/me endpoints
│       ├── 📄 resume.py            # Upload, analyze, results, history endpoints
│       │
│       └── ai/
│           └── 📄 pipeline.py      # Core AI engine:
│                                   #   • PDF text extraction (pdfplumber)
│                                   #   • Skill extraction (regex + COMMON_SKILLS)
│                                   #   • TF-IDF keyword match
│                                   #   • SBERT semantic similarity (optional)
│                                   #   • Layout scoring (sections + size + words)
│                                   #   • Resume quality scoring (no-JD mode)
│                                   #   • ATS score formula
│                                   #   • AI suggestion generation
│
├── 🤖 ml-models/                   # ML model assets (future expansion)
│   └── 📄 README.md
│
└── 📚 docs/
    └── 📄 synopsis.md              # Project synopsis
```

---

## ⚙️ Installation

### Prerequisites

| Requirement | Version |
|---|---|
| 🐍 Python | 3.10 or higher |
| 📦 Node.js | 18 or higher |
| 📦 npm | 9 or higher |

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/ResumeIQ-AI.git
cd ResumeIQ-AI
```

### 2️⃣ Backend Setup

```bash
# Navigate to backend
cd backend

# Create a virtual environment (recommended)
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**`requirements.txt` includes:**
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
python-multipart==0.0.9
pydantic==2.7.1
sqlalchemy==2.0.30
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pdfplumber==0.11.0
scikit-learn==1.4.2
numpy==1.26.4
sentence-transformers==2.7.0   # optional — for SBERT mode
```

### 3️⃣ Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install Node dependencies
npm install
```

---

## 🚀 Running the Project

### Option A — PowerShell Scripts (Windows)

```powershell
# Terminal 1 — Start backend
.\run-backend.ps1

# Terminal 2 — Start frontend
.\run-frontend.ps1
```

### Option B — Manual

```bash
# Terminal 1 — Backend (from /backend directory)
python -m uvicorn app.main:app --reload --port 8000

# Terminal 2 — Frontend (from /frontend directory)
npm run dev
```

### 🌐 Access the App

| Service | URL |
|---|---|
| 🎨 Frontend | http://localhost:5173 (or 5174) |
| ⚙️ Backend API | http://localhost:8000 |
| 📖 Swagger Docs | http://localhost:8000/docs |
| 📖 ReDoc | http://localhost:8000/redoc |

### 🔧 Environment Variables (Optional)

Create a `.env` file in `/backend` to override defaults:

```env
# Database (defaults to SQLite)
DATABASE_URL=sqlite:///./resumeiq.db

# JWT secret key (change in production!)
SECRET_KEY=your-super-secret-key-here

# AI mode: "fast" (TF-IDF) or "sbert" (sentence-transformers)
RESUMEIQ_SEMANTIC_MODE=fast
```

---

## 🔌 API Endpoints

### 🔐 Authentication — `/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Create new account | ❌ |
| `POST` | `/auth/login` | Login, returns JWT | ❌ |
| `GET` | `/auth/me` | Get current user profile | ✅ |

### 📄 Resume — `/`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/upload-resume` | Upload PDF resume | ✅ |
| `POST` | `/analyze` | Run AI analysis | ✅ |
| `GET` | `/results/{id}` | Get stored results | ✅ |
| `GET` | `/resumes` | Get resume history | ✅ |
| `GET` | `/suggestions/{id}` | Get AI suggestions | ✅ |

### 📦 Request / Response Examples

**Register**
```json
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
→ { "access_token": "eyJ...", "token_type": "bearer" }
```

**Analyze Resume**
```
POST /analyze
Form data:
  analysis_id: "3"
  job_description: "We are looking for a Python developer..."

→ {
    "ats_score": 72.4,
    "semantic_score": 0.68,
    "keyword_match": 0.71,
    "layout_score": 0.80,
    "extracted_skills": ["python", "flask", "sql", ...],
    "missing_skills": ["docker", "kubernetes"],
    "jd_provided": true
  }
```

---

## 🧠 AI Scoring Logic

### ATS Score Formula

```
ATS Score = (0.5 × Semantic) + (0.3 × Keywords) + (0.2 × Layout)
```

### 📊 With Job Description (Full Mode)

| Component | Method | Weight |
|---|---|---|
| **Semantic Score** | TF-IDF cosine similarity (or SBERT) between resume and JD | 50% |
| **Keyword Match** | TF-IDF overlap of resume vs JD vocabulary | 30% |
| **Layout Score** | Section detection + file size + word count heuristics | 20% |

### 📋 Without Job Description (Quality Mode)

When no JD is provided, the system scores the resume on its own merits:

| Component | Method | Weight |
|---|---|---|
| **Skill Density** | # of recognized skills / 15 (capped at 1.0) | 40% |
| **Action Verbs** | Count of strong verbs (developed, built, led...) / 8 | 30% |
| **Content Richness** | Unique word ratio / 0.65 | 30% |

### 🗂️ Layout Score Breakdown

| Factor | Weight | Criteria |
|---|---|---|
| Section Detection | 40% | Presence of: Experience, Education, Skills, Projects, Certifications, Summary |
| File Size | 40% | Optimal: 10KB–300KB |
| Word Count | 20% | Optimal: 300–1500 words |

### 🤖 Skill Detection

The engine scans for **50+ recognized skills** including:

```
Python, Java, JavaScript, React, Node.js, SQL, AWS, Docker, Kubernetes,
Machine Learning, FastAPI, TypeScript, NLP, Deep Learning, MongoDB,
PostgreSQL, Git, TensorFlow, PyTorch, Django, Flask, Pandas, NumPy,
Redis, GraphQL, REST API, Microservices, CI/CD, Azure, GCP, and more...
```

---

## 🎨 UI Design System

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--primary` | `#6C63FF` | Buttons, accents, links |
| `--secondary` | `#8B5CF6` | Gradients, tags |
| `--accent` | `#00D4FF` | Highlights, layout score |
| `--bg` | `#0F172A` | Page background |
| `--card` | `rgba(255,255,255,0.06)` | Glass cards |
| `--success` | `#10B981` | High scores, success states |
| `--warning` | `#F59E0B` | Medium scores, warnings |
| `--danger` | `#EF4444` | Low scores, errors |

### Typography

| Role | Font | Weight |
|---|---|---|
| Headings | Poppins | 600–800 |
| Body | Inter | 300–600 |

### Design Features
- 🪟 **Glassmorphism** cards with `backdrop-filter: blur(12px)`
- 🌈 **Animated gradient blobs** in background
- 💜 **Neon glow buttons** with box-shadow on hover
- 📱 **Fully responsive** — desktop, tablet, mobile
- 🌙 **Dark theme** throughout

---

## 🗺️ Roadmap

- [x] 🔐 JWT Authentication (register / login / profile)
- [x] 📤 PDF Resume Upload with drag-and-drop
- [x] 🧠 TF-IDF Semantic & Keyword Analysis
- [x] 📊 ATS Score with weighted formula
- [x] 🕳️ Skill Gap Detection
- [x] 💡 AI Improvement Suggestions
- [x] 📈 Dashboard with Radar & Bar charts
- [x] 📋 Resume history per user
- [x] 🔄 Resume Quality Mode (no-JD analysis)
- [ ] 🤗 SBERT deep semantic matching (set `RESUMEIQ_SEMANTIC_MODE=sbert`)
- [ ] 📝 Resume Builder with live editing
- [ ] 💼 Job Recommendation Engine
- [ ] 🗣️ AI Cover Letter Generator
- [ ] 🔗 LinkedIn Profile Optimizer
- [ ] 🐳 Docker Compose deployment
- [ ] 🐘 PostgreSQL production database

---

## 🤝 Contributing

Contributions are welcome!

```bash
# 1. Fork the repo
# 2. Create your feature branch
git checkout -b feature/AmazingFeature

# 3. Commit your changes
git commit -m 'Add AmazingFeature'

# 4. Push to the branch
git push origin feature/AmazingFeature

# 5. Open a Pull Request
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Author

Built with ❤️ as a Final Year AI/ML Major Project.

> **ResumeIQ AI** — *Optimize Your Resume with AI & Beat ATS Systems*

[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=flat-square&logo=github)](https://github.com/yourusername)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/yourusername)

---

<div align="center">

⭐ **Star this repo if you found it helpful!** ⭐

</div>
