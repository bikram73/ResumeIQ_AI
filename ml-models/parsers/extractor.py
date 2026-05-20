"""
Resume text extraction and structured parsing.

Extraction pipeline:
  1. pdfplumber  — best for text-layer PDFs
  2. PyMuPDF     — fallback for complex layouts
  3. pytesseract — OCR fallback for scanned/image PDFs

Parsing:
  - Section detection (Experience, Education, Skills, Projects, etc.)
  - Named entity extraction (name, email, phone, links)
  - Skill extraction against a curated taxonomy
"""
from __future__ import annotations
import re
from typing import Dict, List, Optional


# ── Skill taxonomy ────────────────────────────────────────────────────────────

SKILLS_DB: Dict[str, List[str]] = {
    "languages": [
        "python", "java", "javascript", "typescript", "c++", "c#", "c",
        "go", "rust", "kotlin", "swift", "ruby", "php", "scala", "r",
        "matlab", "perl", "bash", "shell", "sql", "html", "css",
    ],
    "frameworks": [
        "react", "angular", "vue.js", "next.js", "nuxt.js", "svelte",
        "node.js", "express", "fastapi", "django", "flask", "spring boot",
        "laravel", "rails", "asp.net", ".net", "tensorflow", "pytorch",
        "keras", "scikit-learn", "xgboost", "lightgbm", "hugging face",
        "langchain", "pandas", "numpy", "matplotlib", "seaborn", "plotly",
        "opencv", "nltk", "spacy",
    ],
    "databases": [
        "postgresql", "mysql", "sqlite", "mongodb", "redis", "elasticsearch",
        "cassandra", "dynamodb", "firebase", "supabase", "neo4j", "oracle",
        "sql server", "mariadb",
    ],
    "cloud_devops": [
        "aws", "azure", "gcp", "docker", "kubernetes", "terraform",
        "ansible", "jenkins", "github actions", "gitlab ci", "ci/cd",
        "linux", "nginx", "apache", "vercel", "netlify", "heroku",
        "cloudflare", "prometheus", "grafana", "datadog",
    ],
    "tools": [
        "git", "github", "gitlab", "jira", "confluence", "figma", "postman",
        "swagger", "graphql", "rest api", "grpc", "kafka", "rabbitmq",
        "celery", "airflow", "spark", "hadoop", "tableau", "power bi",
        "excel", "jupyter", "vscode", "intellij",
    ],
    "practices": [
        "agile", "scrum", "kanban", "tdd", "bdd", "microservices",
        "machine learning", "deep learning", "nlp", "computer vision",
        "data analysis", "data engineering", "mlops", "devops",
        "system design", "oop", "functional programming",
    ],
}

# Flat set for fast lookup
ALL_SKILLS: set = {s for skills in SKILLS_DB.values() for s in skills}

SECTION_PATTERNS: Dict[str, List[str]] = {
    "summary":        ["summary", "profile", "objective", "about me", "overview", "introduction"],
    "experience":     ["experience", "work history", "employment", "work experience", "professional experience", "career"],
    "education":      ["education", "academic", "qualification", "degree", "university", "college", "schooling"],
    "skills":         ["skills", "technical skills", "core competencies", "technologies", "tech stack", "expertise"],
    "projects":       ["projects", "portfolio", "personal projects", "open source", "work samples"],
    "certifications": ["certifications", "certificates", "credentials", "licenses", "awards", "achievements"],
    "languages":      ["languages", "spoken languages"],
    "interests":      ["interests", "hobbies", "activities"],
}

CONTACT_PATTERNS = {
    "email":   r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}",
    "phone":   r"[\+]?[\d\s\-\(\)]{7,15}",
    "linkedin": r"linkedin\.com/in/[\w\-]+",
    "github":  r"github\.com/[\w\-]+",
    "website": r"https?://[\w\.\-/]+",
}


# ── Text extraction ───────────────────────────────────────────────────────────

def extract_text(path: str) -> str:
    """Extract raw text from a PDF using multiple fallback strategies."""
    text = _extract_pdfplumber(path)
    if text:
        return text
    text = _extract_pymupdf(path)
    if text:
        return text
    text = _extract_ocr(path)
    return text


def _extract_pdfplumber(path: str) -> str:
    try:
        import pdfplumber
        pages = []
        with pdfplumber.open(path) as pdf:
            for page in pdf.pages:
                t = page.extract_text()
                if t:
                    pages.append(t)
        return "\n".join(pages).strip()
    except Exception:
        return ""


def _extract_pymupdf(path: str) -> str:
    try:
        import fitz
        doc = fitz.open(path)
        pages = [page.get_text() for page in doc]
        doc.close()
        return "\n".join(p for p in pages if p).strip()
    except Exception:
        return ""


def _extract_ocr(path: str) -> str:
    """OCR fallback using pytesseract for scanned PDFs."""
    try:
        import fitz
        import pytesseract
        from PIL import Image
        import io
        doc = fitz.open(path)
        pages = []
        for page in doc:
            pix = page.get_pixmap(dpi=200)
            img = Image.open(io.BytesIO(pix.tobytes("png")))
            pages.append(pytesseract.image_to_string(img))
        doc.close()
        return "\n".join(pages).strip()
    except Exception:
        return ""


# ── Skill extraction ──────────────────────────────────────────────────────────

def extract_skills(text: str) -> List[str]:
    """Extract recognized skills from resume text."""
    text_lower = text.lower()
    found = set()
    for skill in ALL_SKILLS:
        pattern = r'\b' + re.escape(skill) + r'\b'
        if re.search(pattern, text_lower):
            found.add(skill)
    return sorted(found)


def extract_skills_by_category(text: str) -> Dict[str, List[str]]:
    """Extract skills grouped by category."""
    text_lower = text.lower()
    result: Dict[str, List[str]] = {}
    for category, skills in SKILLS_DB.items():
        found = []
        for skill in skills:
            if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                found.append(skill)
        if found:
            result[category] = sorted(found)
    return result


# ── Section detection ─────────────────────────────────────────────────────────

def detect_sections(text: str) -> Dict[str, bool]:
    """Detect which resume sections are present."""
    text_lower = text.lower()
    found: Dict[str, bool] = {}
    for section, keywords in SECTION_PATTERNS.items():
        found[section] = any(kw in text_lower for kw in keywords)
    return found


def extract_sections(text: str) -> Dict[str, str]:
    """
    Split resume text into sections by detecting section headers.
    Returns a dict of section_name -> section_content.
    """
    lines = text.split("\n")
    sections: Dict[str, str] = {"header": ""}
    current = "header"
    buffer: List[str] = []

    for line in lines:
        line_lower = line.strip().lower()
        matched_section = None
        for section, keywords in SECTION_PATTERNS.items():
            if any(line_lower == kw or line_lower.startswith(kw) for kw in keywords):
                matched_section = section
                break
        if matched_section:
            sections[current] = "\n".join(buffer).strip()
            current = matched_section
            buffer = []
        else:
            buffer.append(line)

    sections[current] = "\n".join(buffer).strip()
    return {k: v for k, v in sections.items() if v}


# ── Contact extraction ────────────────────────────────────────────────────────

def extract_contact_info(text: str) -> Dict[str, Optional[str]]:
    """Extract contact details from resume text."""
    info: Dict[str, Optional[str]] = {}
    for field, pattern in CONTACT_PATTERNS.items():
        match = re.search(pattern, text, re.IGNORECASE)
        info[field] = match.group(0) if match else None
    return info


# ── Full parse ────────────────────────────────────────────────────────────────

def parse_resume(path: str) -> Dict:
    """
    Full resume parse. Returns structured data:
    {
        text, word_count, sections_found, sections_content,
        skills, skills_by_category, contact_info
    }
    """
    text = extract_text(path)
    return {
        "text": text,
        "word_count": len(text.split()),
        "char_count": len(text),
        "sections_found": detect_sections(text),
        "sections_content": extract_sections(text),
        "skills": extract_skills(text),
        "skills_by_category": extract_skills_by_category(text),
        "contact_info": extract_contact_info(text),
    }
