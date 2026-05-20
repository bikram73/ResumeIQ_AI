<div align="center">

<img src="https://img.shields.io/badge/ResumeIQ-AI%20Resume%20Analyzer-6C63FF?style=for-the-badge&logo=artificial-intelligence&logoColor=white" alt="ResumeIQ AI" />

# 🧠 ResumeIQ AI
### Smart ATS & AI Resume Analyzer Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org/)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4-F7931E?style=flat-square&logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

> **Multi-Granularity Multi-Modal AI Resume Analyzer** — Analyze, optimize, and improve resumes using a dedicated ML models package, NLP, Semantic Similarity, TF-IDF, ATS Scoring, and Job Role Recommendations.

[🚀 Live Demo](#) · [📖 Docs](#-api-endpoints) · [🤖 ML Models](#-ml-models-package) · [🐛 Report Bug](#)

---

![ResumeIQ Dashboard Preview](https://img.shields.io/badge/UI-Dark%20Glassmorphism%20Dashboard-0F172A?style=for-the-badge&logo=vercel&logoColor=white)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🤖 ML Models Package](#-ml-models-package)
- [⚙️ Installation](#️-installation)
- [🚀 Running the Project](#-running-the-project)
- [🔌 API Endpoints](#-api-endpoints)
- [🧠 AI Scoring Logic](#-ai-scoring-logic)
- [🎨 UI Design System](#-ui-design-system)
- [🗺️ Roadmap](#️-roadmap)
- [🤝 Contributing](#-contributing)

---

## ✨ Features

### 🎯 Core Analysis
| Feature | Description |
|---|---|
| 📊 **ATS Score** | Weighted formula: `0.5×Semantic + 0.3×Keywords + 0.2×Layout` with full sub-score breakdown |
| 🧠 **Semantic Matching** | Bigram TF-IDF cosine similarity (SBERT switchable via env var) |
| 🔍 **Keyword Analysis** | TF-IDF cosine (60%) + skill overlap (40%) against job description |
| 📐 **Layout Scoring** | Section coverage + file size + word count + bullet formatting |
| 🕳️ **Skill Gap Detection** | Identifies JD skills missing from resume with learning resource links |
| 💡 **AI Suggestions** | Prioritized, actionable improvement tips for both JD and quality modes |
| 🎯 **Job Role Recommendations** | Matches detected skills against 14 role profiles with match % |
| 📂 **Skills by Category** | Skills grouped into languages, frameworks, databases, cloud/devops, tools, practices |
| 🔄 **Resume Quality Mode** | Standalone scoring when no JD provided (skill density + action verbs + quantification) |
| 📄 **Multi-layer PDF Extraction** | pdfplumber → PyMuPDF → pytesseract OCR fallback chain |

### 🖥️ Application Pages
| Page | Route | Description |
|---|---|---|
| 🏠 **Landing** | `/` | Hero, features, how-it-works, CTA |
| 🔐 **Login** | `/login` | JWT-based authentication |
| 📝 **Register** | `/register` | Account creation |
| 📊 **Dashboard** | `/dashboard` | Score history, radar chart, bar chart |
| 📤 **Upload & Analyze** | `/upload` | Drag-and-drop PDF upload + JD input (3-step) |
| 📈 **Results** | `/results/:id` | Full analysis: scores, skills by category, skill gap, suggestions, role recommendations |
| 👤 **Profile** | `/profile` | User account info |

### 🔒 Security
- ✅ JWT Authentication (30-min expiry)
- ✅ Bcrypt password hashing
- ✅ Protected routes (frontend + backend)
- ✅ File type & size validation (PDF only, max 10MB)
- ✅ Per-user data isolation
- ✅ 401 auto-redirect on expired tokens

---

## 🛠️ Tech Stack

### 🎨 Frontend
| Technology | Version | Purpose |
|---|---|---|
| ⚛️ React | 18.2 | UI framework |
| 🔀 React Router DOM | 6.22 | Client-side routing |
| 📊 Recharts | 2.10 | Radar & bar charts |
| 🎬 Framer Motion | 11.0 | Animations |
| 🌐 Axios | 1.4 | HTTP client with JWT interceptor |
| ⚡ Vite | 5.0 | Build tool & dev server |

### ⚙️ Backend
| Technology | Version | Purpose |
|---|---|---|
| 🐍 Python | 3.10+ | Runtime |
| 🚀 FastAPI | 0.111 | REST API framework |
| 🦄 Uvicorn | 0.29 | ASGI server (`-B` flag, no bytecode cache) |
| 🗄️ SQLAlchemy | 2.0 | ORM |
| 🔐 python-jose | 3.3 | JWT tokens |
| 🔑 passlib[bcrypt] | 1.7 | Password hashing |

### 🤖 ML Models Package (`ml-models/`)
| Technology | Purpose |
|---|---|
| 📄 pdfplumber | Primary PDF text extraction |
| 📄 PyMuPDF (fitz) | Fallback PDF extraction |
| 👁️ pytesseract | OCR fallback for scanned PDFs |
| 🔢 scikit-learn TF-IDF | Bigram keyword & semantic similarity |
| 🤗 sentence-transformers | SBERT all-MiniLM-L6-v2 (optional, switchable) |
| 📐 NumPy | Vector math |
| 🗃️ SQLite | Local development database |

---

## 📁 Project Structure

```
ResumeIQ_AI/
│
├── 📄 README.md
├── 📄 .gitignore
├── ▶️  run-backend.ps1              # python -B -m uvicorn (no bytecode cache)
├── ▶️  run-frontend.ps1
│
├── 🎨 frontend/
│   ├── 📄 index.html
│   ├── 📄 vite.config.js
│   ├── 📄 package.json
│   └── src/
│       ├── 📄 main.jsx             # BrowserRouter + AuthProvider
│       ├── 📄 App.jsx              # Routes + Protected wrapper
│       ├── 📄 AuthContext.jsx      # JWT auth state
│       ├── 📄 api.js               # Axios client (JWT + 401 interceptor)
│       ├── 📄 styles.css           # CSS variables + utility classes
│       ├── components/
│       │   ├── 📄 Navbar.jsx
│       │   ├── 📄 Blobs.jsx
│       │   └── 📄 ScoreCard.jsx
│       └── pages/
│           ├── 📄 Home.jsx
│           ├── 📄 Login.jsx
│           ├── 📄 Register.jsx
│           ├── 📄 Dashboard.jsx    # Radar + bar charts + resume history
│           ├── 📄 Upload.jsx       # 3-step: upload → JD → analyze
│           ├── 📄 Results.jsx      # Scores + skills by category + roles + suggestions
│           └── 📄 Profile.jsx
│
├── ⚙️  backend/
│   ├── 📄 requirements.txt
│   ├── 📄 .env.example
│   ├── 📄 resumeiq.db              # SQLite (auto-created)
│   ├── uploads/                    # UUID-prefixed PDFs
│   └── app/
│       ├── 📄 main.py              # FastAPI app + CORS
│       ├── 📄 database.py          # SQLAlchemy engine
│       ├── 📄 models.py            # User, Resume, Analysis ORM models
│       ├── 📄 auth.py              # register / login / me
│       ├── 📄 resume.py            # upload / analyze / results / resumes / suggestions / roles
│       └── ai/
│           └── 📄 pipeline.py      # Delegates to ml-models; inline fallback if import fails
│
├── 🤖 ml-models/                   # Standalone ML package (imported by pipeline.py)
│   ├── 📄 __init__.py
│   ├── 📄 README.md
│   ├── embeddings/
│   │   └── 📄 semantic.py          # tfidf_similarity, sbert_similarity, keyword_overlap
│   ├── parsers/
│   │   └── 📄 extractor.py         # extract_text, parse_resume, extract_skills_by_category
│   ├── scoring/
│   │   └── 📄 ats_scorer.py        # compute_ats_score, score_layout, score_keywords, score_quality
│   └── recommendation/
│       └── 📄 engine.py            # generate_suggestions, recommend_roles, skill_gap_report
│
└── 📚 docs/
    └── 📄 synopsis.md
```

---

## 🤖 ML Models Package

The `ml-models/` directory is a standalone Python package with four modules. The backend `pipeline.py` adds it to `sys.path` at runtime and falls back to inline implementations if the import fails.

### `parsers.extractor`
- **3-layer PDF extraction**: pdfplumber → PyMuPDF → pytesseract OCR
- **100+ skill taxonomy** across 6 categories
- **Section detection**: summary, experience, education, skills, projects, certifications
- **Contact extraction**: email, phone, LinkedIn, GitHub, website

### `embeddings.semantic`
- `tfidf_similarity` — bigram TF-IDF cosine (default, fast)
- `sbert_similarity` — SBERT all-MiniLM-L6-v2 (set `RESUMEIQ_SEMANTIC_MODE=sbert`)
- `keyword_overlap` — fraction of JD keywords present in resume

### `scoring.ats_scorer`
- `score_layout` — section coverage (40%) + file size (30%) + word count (20%) + bullet formatting (10%)
- `score_keywords` — TF-IDF cosine (60%) + skill overlap (40%)
- `score_quality` — skill density (35%) + action verbs (25%) + content richness (25%) + quantification (15%)
- `compute_ats_score` — assembles full ATS score with `score_breakdown` dict

### `recommendation.engine`
- `generate_suggestions` — prioritized tips, different logic for JD mode vs quality mode
- `recommend_roles` — matches skills against 14 role profiles (Software Engineer, Data Scientist, DevOps, ML Engineer, etc.)
- `skill_gap_report` — missing skills with direct learning resource URLs

### Skill Taxonomy (100+ skills)

| Category | Examples |
|---|---|
| languages | python, javascript, typescript, java, go, rust, sql, html, css |
| frameworks | react, fastapi, django, tensorflow, pytorch, scikit-learn, pandas, langchain |
| databases | postgresql, mongodb, redis, elasticsearch, dynamodb, firebase |
| cloud_devops | aws, azure, gcp, docker, kubernetes, terraform, ci/cd, github actions |
| tools | git, graphql, kafka, airflow, tableau, power bi, figma, jupyter |
| practices | machine learning, deep learning, nlp, agile, microservices, mlops, devops |

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
cd backend

# Create virtual environment (recommended)
python -m venv .venv

# Activate
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

**`requirements.txt`:**
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
python-multipart==0.0.9
pydantic==2.7.1
sqlalchemy==2.0.30
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
pdfplumber==0.11.0
pymupdf==1.24.0
scikit-learn==1.4.2
numpy==1.26.4
sentence-transformers==2.7.0   # optional — SBERT mode
```

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

---

## 🚀 Running the Project

### Option A — PowerShell Scripts (Windows)

```powershell
# Terminal 1
.\run-backend.ps1

# Terminal 2
.\run-frontend.ps1
```

### Option B — Manual

```bash
# Terminal 1 — from /backend
python -B -m uvicorn app.main:app --port 8000

# Terminal 2 — from /frontend
npm run dev
```

> **Important:** Use `python -B` to prevent stale `.pyc` bytecode from being loaded. The run scripts already include this flag.

### 🌐 Access the App

| Service | URL |
|---|---|
| 🎨 Frontend | http://localhost:5173 (or 5174) |
| ⚙️ Backend API | http://localhost:8000 |
| 📖 Swagger Docs | http://localhost:8000/docs |
| 📖 ReDoc | http://localhost:8000/redoc |

### 🔧 Environment Variables

Copy `backend/.env.example` to `backend/.env`:

```env
# Database — defaults to SQLite, use PostgreSQL URL for production
DATABASE_URL=sqlite:///./resumeiq.db

# JWT secret — change in production!
SECRET_KEY=your-super-secret-key-here

# Semantic engine: "tfidf" (fast, default) or "sbert" (accurate, needs ~90MB RAM)
RESUMEIQ_SEMANTIC_MODE=tfidf
```

---

## 🔌 API Endpoints

### 🔐 Authentication — `/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Create account | ❌ |
| `POST` | `/auth/login` | Login, returns JWT | ❌ |
| `GET` | `/auth/me` | Current user profile | ✅ |

### 📄 Resume

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/upload-resume` | Upload PDF | ✅ |
| `POST` | `/analyze` | Run full ML analysis | ✅ |
| `GET` | `/results/{id}` | Stored analysis results | ✅ |
| `GET` | `/resumes` | Resume history | ✅ |
| `GET` | `/suggestions/{id}` | AI improvement suggestions | ✅ |
| `GET` | `/roles/{id}` | Job role recommendations | ✅ |

### 📦 Analyze Response (full)

```json
POST /analyze  →  {
  "ats_score": 72.4,
  "semantic_score": 0.68,
  "keyword_match": 0.71,
  "layout_score": 0.80,
  "jd_provided": true,
  "extracted_skills": ["python", "fastapi", "docker"],
  "skills_by_category": {
    "languages": ["python"],
    "frameworks": ["fastapi"],
    "cloud_devops": ["docker"]
  },
  "missing_skills": ["kubernetes", "terraform"],
  "matched_skills": ["python", "fastapi", "docker"],
  "score_breakdown": {
    "semantic": 0.68,
    "keyword": { "tfidf_cosine": 0.65, "skill_overlap": 0.80 },
    "layout": { "section_coverage": 1.0, "word_count_score": 0.95 }
  },
  "suggestions": ["Add missing skills: kubernetes, terraform..."],
  "role_recommendations": [
    { "role": "Backend Developer", "match_percent": 85.0, "matched_skills": [...] }
  ],
  "skill_gap_report": {
    "gaps_with_resources": [
      { "skill": "kubernetes", "resource": "https://kubernetes.io/docs/tutorials/", "priority": "medium" }
    ]
  },
  "contact_info": { "email": "user@example.com", "github": "github.com/user" },
  "word_count": 412
}
```

---

## 🧠 AI Scoring Logic

### ATS Score Formula

```
ATS Score = (0.50 × Semantic) + (0.30 × Keywords) + (0.20 × Layout)
```

### With Job Description

| Component | Sub-components | Weight |
|---|---|---|
| **Semantic** | TF-IDF bigram cosine similarity (or SBERT) | 50% |
| **Keywords** | TF-IDF cosine (60%) + skill overlap (40%) | 30% |
| **Layout** | Section coverage (40%) + file size (30%) + word count (20%) + formatting (10%) | 20% |

### Without Job Description (Quality Mode)

| Component | Method | Weight |
|---|---|---|
| **Skill Density** | recognized skills / 15 | 35% |
| **Action Verbs** | strong verb count / 10 | 25% |
| **Content Richness** | unique word ratio / 0.65 | 25% |
| **Quantification** | numbers/metrics count / 5 | 15% |

### PDF Extraction Chain

```
pdfplumber  →  PyMuPDF (fitz)  →  pytesseract OCR
   (text PDFs)    (complex layouts)    (scanned/image PDFs)
```

---

## 🎨 UI Design System

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--primary` | `#6C63FF` | Buttons, accents, links |
| `--secondary` | `#8B5CF6` | Gradients, skill tags |
| `--accent` | `#00D4FF` | Layout score, highlights |
| `--bg` | `#0F172A` | Page background |
| `--card` | `rgba(255,255,255,0.06)` | Glassmorphism cards |
| `--success` | `#10B981` | High scores (≥70%) |
| `--warning` | `#F59E0B` | Medium scores (50–70%) |
| `--danger` | `#EF4444` | Low scores (<50%) |

### Design Features
- 🪟 **Glassmorphism** cards — `backdrop-filter: blur(12px)`
- 🌈 **Animated gradient blobs** in background
- 💜 **Neon glow buttons** with hover box-shadow
- 📱 **Fully responsive** — desktop, tablet, mobile
- 🌙 **Dark theme** throughout

---

## 🗺️ Roadmap

- [x] 🔐 JWT Authentication (register / login / profile)
- [x] 📤 PDF Resume Upload with drag-and-drop
- [x] 🧠 TF-IDF Semantic & Keyword Analysis
- [x] 📊 ATS Score with multi-granularity breakdown
- [x] 🕳️ Skill Gap Detection with learning resources
- [x] 💡 AI Improvement Suggestions (JD + quality modes)
- [x] 📈 Dashboard with Radar & Bar charts
- [x] 📋 Resume history per user
- [x] 🔄 Resume Quality Mode (no-JD standalone scoring)
- [x] 🤖 ML Models package (parsers / embeddings / scoring / recommendation)
- [x] 🎯 Job Role Recommendations (14 role profiles)
- [x] 📂 Skills by Category (6 categories, 100+ skills)
- [x] 📄 Multi-layer PDF extraction (pdfplumber → PyMuPDF → OCR)
- [x] 🔌 `/roles` endpoint for role recommendations
- [ ] 🤗 SBERT deep semantic matching (`RESUMEIQ_SEMANTIC_MODE=sbert`)
- [ ] 📝 Resume Builder with live editing
- [ ] 🗣️ AI Cover Letter Generator
- [ ] 🔗 LinkedIn Profile Optimizer
- [ ] 🐳 Docker Compose deployment
- [ ] 🐘 PostgreSQL production database

---

## 🤝 Contributing

```bash
git checkout -b feature/AmazingFeature
git commit -m 'Add AmazingFeature'
git push origin feature/AmazingFeature
# Open a Pull Request
```

---

## 📄 License

MIT License. See `LICENSE` for details.

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
