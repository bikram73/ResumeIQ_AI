# ResumeIQ ML Models

Standalone Python package providing all AI/ML logic for ResumeIQ.
Imported by `backend/app/ai/pipeline.py` at runtime.

## Structure

```
ml-models/
├── __init__.py
├── embeddings/
│   ├── __init__.py
│   └── semantic.py          # TF-IDF & SBERT similarity
├── parsers/
│   ├── __init__.py
│   └── extractor.py         # PDF extraction, skill/section detection
├── scoring/
│   ├── __init__.py
│   └── ats_scorer.py        # ATS score with multi-granularity breakdown
└── recommendation/
    ├── __init__.py
    └── engine.py            # Suggestions, role recommendations, skill gap
```

## Modules

### `parsers.extractor`
- `extract_text(path)` — PDF text via pdfplumber → PyMuPDF → OCR fallback
- `parse_resume(path)` — Full structured parse: text, skills, sections, contact info
- `extract_skills(text)` — Match against 100+ skill taxonomy
- `extract_skills_by_category(text)` — Skills grouped: languages, frameworks, databases, cloud_devops, tools, practices
- `detect_sections(text)` — Detect: summary, experience, education, skills, projects, certifications
- `extract_contact_info(text)` — Email, phone, LinkedIn, GitHub, website

### `embeddings.semantic`
- `compute_similarity(a, b, mode)` — Auto-selects TF-IDF or SBERT based on `RESUMEIQ_SEMANTIC_MODE`
- `tfidf_similarity(a, b)` — Bigram TF-IDF cosine similarity (fast, no GPU)
- `sbert_similarity(a, b)` — SBERT all-MiniLM-L6-v2 (accurate, ~90MB)
- `keyword_overlap(resume, jd)` — Fraction of JD keywords present in resume

### `scoring.ats_scorer`
- `compute_ats_score(path, text, jd, skills, sections)` — Full ATS score
  - Formula: `ATS = 0.50×semantic + 0.30×keyword + 0.20×layout`
  - Returns detailed `score_breakdown` with sub-scores
- `score_layout(path, text, sections)` — Section coverage + file size + word count + formatting
- `score_keywords(resume, jd, skills)` — TF-IDF cosine + skill overlap
- `score_quality(text, skills)` — Standalone quality: skill density + action verbs + richness + quantification

### `recommendation.engine`
- `generate_suggestions(...)` — Prioritized improvement tips (JD mode + quality mode)
- `recommend_roles(skills, top_n)` — Match skills against 14 job role profiles
- `skill_gap_report(skills, missing, role)` — Gaps with learning resource links

## Skill Taxonomy (100+ skills)

| Category | Examples |
|---|---|
| languages | python, javascript, typescript, java, go, rust, sql, html, css |
| frameworks | react, fastapi, django, tensorflow, pytorch, scikit-learn, pandas |
| databases | postgresql, mongodb, redis, elasticsearch, dynamodb |
| cloud_devops | aws, azure, gcp, docker, kubernetes, terraform, ci/cd |
| tools | git, graphql, kafka, airflow, tableau, power bi, figma |
| practices | machine learning, deep learning, nlp, agile, microservices, mlops |

## Environment Variables

| Variable | Values | Default | Effect |
|---|---|---|---|
| `RESUMEIQ_SEMANTIC_MODE` | `tfidf` / `sbert` | `tfidf` | Switch semantic engine |

## Usage

```python
import sys
sys.path.insert(0, 'ml-models')

from parsers.extractor import parse_resume
from scoring.ats_scorer import compute_ats_score
from recommendation.engine import generate_suggestions, recommend_roles

parsed = parse_resume("resume.pdf")
result = compute_ats_score(
    resume_path="resume.pdf",
    resume_text=parsed["text"],
    jd_text="Looking for a Python developer...",
    resume_skills=parsed["skills"],
    sections_found=parsed["sections_found"],
)
suggestions = generate_suggestions(
    ats_score=result["ats_score"],
    semantic_score=result["semantic_score"],
    keyword_score=result["keyword_match"],
    layout_score=result["layout_score"],
    missing_skills=result["missing_skills"],
    found_skills=parsed["skills"],
    has_jd=True,
    score_breakdown=result["score_breakdown"],
)
roles = recommend_roles(parsed["skills"], top_n=5)
```
