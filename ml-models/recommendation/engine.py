"""
Recommendation Engine

Provides:
  - generate_suggestions : actionable resume improvement tips
  - recommend_roles      : job role recommendations based on detected skills
  - skill_gap_report     : detailed skill gap with learning resources
"""
from __future__ import annotations
from typing import Dict, Any, List


# ── Job role → required skills mapping ───────────────────────────────────────

ROLE_SKILL_MAP: Dict[str, List[str]] = {
    "Software Engineer": [
        "python", "java", "javascript", "git", "sql", "rest api",
        "docker", "linux", "agile", "data structures",
    ],
    "Frontend Developer": [
        "javascript", "react", "html", "css", "typescript",
        "git", "rest api", "figma",
    ],
    "Backend Developer": [
        "python", "java", "node.js", "sql", "postgresql", "mongodb",
        "docker", "rest api", "git", "linux",
    ],
    "Full Stack Developer": [
        "javascript", "react", "node.js", "python", "sql",
        "docker", "git", "rest api", "html", "css",
    ],
    "Data Scientist": [
        "python", "machine learning", "pandas", "numpy", "scikit-learn",
        "sql", "tensorflow", "pytorch", "data analysis", "jupyter",
    ],
    "Data Analyst": [
        "python", "sql", "excel", "tableau", "power bi",
        "pandas", "data analysis", "numpy",
    ],
    "Data Engineer": [
        "python", "sql", "spark", "hadoop", "airflow",
        "docker", "aws", "postgresql", "kafka",
    ],
    "ML Engineer": [
        "python", "machine learning", "tensorflow", "pytorch", "mlops",
        "docker", "kubernetes", "aws", "scikit-learn", "deep learning",
    ],
    "DevOps Engineer": [
        "docker", "kubernetes", "ci/cd", "linux", "aws",
        "terraform", "ansible", "jenkins", "git", "python",
    ],
    "Cloud Engineer": [
        "aws", "azure", "gcp", "docker", "kubernetes",
        "terraform", "linux", "python", "ci/cd",
    ],
    "Mobile Developer": [
        "swift", "kotlin", "react", "javascript", "git",
        "rest api", "typescript",
    ],
    "UI/UX Designer": [
        "figma", "html", "css", "javascript", "react",
    ],
    "Cybersecurity Engineer": [
        "linux", "python", "git", "aws", "docker",
    ],
    "QA Engineer": [
        "selenium", "pytest", "junit", "python", "javascript",
        "git", "agile", "rest api",
    ],
}

# Learning resources per skill
LEARNING_RESOURCES: Dict[str, str] = {
    "python":           "https://docs.python.org/3/tutorial/",
    "javascript":       "https://javascript.info/",
    "react":            "https://react.dev/learn",
    "typescript":       "https://www.typescriptlang.org/docs/",
    "docker":           "https://docs.docker.com/get-started/",
    "kubernetes":       "https://kubernetes.io/docs/tutorials/",
    "aws":              "https://aws.amazon.com/training/",
    "sql":              "https://www.w3schools.com/sql/",
    "machine learning": "https://www.coursera.org/learn/machine-learning",
    "tensorflow":       "https://www.tensorflow.org/tutorials",
    "pytorch":          "https://pytorch.org/tutorials/",
    "git":              "https://git-scm.com/book/en/v2",
    "linux":            "https://linuxjourney.com/",
    "django":           "https://docs.djangoproject.com/en/stable/intro/tutorial01/",
    "fastapi":          "https://fastapi.tiangolo.com/tutorial/",
    "node.js":          "https://nodejs.org/en/learn/getting-started/introduction-to-nodejs",
    "postgresql":       "https://www.postgresql.org/docs/current/tutorial.html",
    "mongodb":          "https://www.mongodb.com/docs/manual/tutorial/",
    "pandas":           "https://pandas.pydata.org/docs/getting_started/",
    "numpy":            "https://numpy.org/doc/stable/user/quickstart.html",
    "spark":            "https://spark.apache.org/docs/latest/quick-start.html",
    "ci/cd":            "https://docs.github.com/en/actions/learn-github-actions",
    "terraform":        "https://developer.hashicorp.com/terraform/tutorials",
    "graphql":          "https://graphql.org/learn/",
    "rest api":         "https://restfulapi.net/",
    "agile":            "https://www.atlassian.com/agile",
    "scrum":            "https://www.scrum.org/resources/what-scrum-module",
    "deep learning":    "https://www.deeplearning.ai/",
    "nlp":              "https://huggingface.co/learn/nlp-course/",
    "data analysis":    "https://www.kaggle.com/learn/pandas",
    "tableau":          "https://www.tableau.com/learn/training",
    "power bi":         "https://learn.microsoft.com/en-us/power-bi/",
    "excel":            "https://support.microsoft.com/en-us/excel",
    "figma":            "https://help.figma.com/hc/en-us/categories/360002051613",
    "selenium":         "https://www.selenium.dev/documentation/",
    "pytest":           "https://docs.pytest.org/en/stable/",
    "flask":            "https://flask.palletsprojects.com/en/stable/tutorial/",
    "vue.js":           "https://vuejs.org/guide/introduction.html",
    "angular":          "https://angular.dev/tutorials",
    "spring boot":      "https://spring.io/guides",
    "redis":            "https://redis.io/docs/getting-started/",
    "kafka":            "https://kafka.apache.org/quickstart",
    "airflow":          "https://airflow.apache.org/docs/apache-airflow/stable/tutorial/",
}


# ── Suggestion generator ──────────────────────────────────────────────────────

def generate_suggestions(
    ats_score: float,
    semantic_score: float,
    keyword_score: float,
    layout_score: float,
    missing_skills: List[str],
    found_skills: List[str],
    has_jd: bool,
    score_breakdown: Dict[str, Any] = None,
) -> List[str]:
    """
    Generate prioritized, actionable improvement suggestions.
    Returns a list of suggestion strings ordered by impact.
    """
    suggestions: List[str] = []
    breakdown = score_breakdown or {}

    if not has_jd:
        suggestions.append(
            "No job description was provided. Scores reflect standalone resume quality. "
            "Paste a target job description and re-analyze for full ATS matching, "
            "keyword gap detection, and role-specific suggestions."
        )
        if semantic_score < 0.5:
            suggestions.append(
                "Resume quality score is below 50%. Strengthen it by: adding more technical skills, "
                "using strong action verbs (Developed, Built, Optimized, Led, Delivered), "
                "and quantifying achievements with numbers."
            )
        if len(found_skills) < 8:
            suggestions.append(
                f"Only {len(found_skills)} technical skills detected. Add a dedicated Skills section "
                "listing all relevant technologies, tools, frameworks, and languages you know."
            )
        layout_detail = breakdown.get("layout", {})
        if layout_score < 0.6:
            suggestions.append(
                "Improve resume structure. Ensure clearly labeled sections: "
                "Summary, Experience, Education, Skills, Projects, Certifications."
            )
        quality_detail = breakdown.get("quality", {})
        if quality_detail.get("action_verbs", 1.0) < 0.5:
            suggestions.append(
                "Use strong action verbs at the start of each bullet: "
                "Developed, Architected, Optimized, Led, Delivered, Reduced, Increased, Automated, Engineered."
            )
        if quality_detail.get("quantification", 1.0) < 0.3:
            suggestions.append(
                "Quantify achievements with metrics — e.g., 'Improved API response time by 40%', "
                "'Built a system serving 10,000+ users', 'Reduced deployment time by 60%'."
            )
        return suggestions

    # JD mode — ordered by impact
    if ats_score < 40:
        suggestions.append(
            f"ATS score is {ats_score:.0f}% — significantly below the 70% threshold most ATS systems use. "
            "Tailor your resume specifically to this job description by mirroring its exact language and keywords."
        )
    elif ats_score < 70:
        suggestions.append(
            f"ATS score is {ats_score:.0f}%. You're close to the 70% threshold. "
            "Focus on the missing skills and keyword gaps below to push past it."
        )

    if semantic_score < 0.35:
        suggestions.append(
            "Semantic similarity is low — your resume content doesn't closely match the job's context. "
            "Rewrite your professional summary and experience bullets using the job description's "
            "terminology, responsibilities, and domain language."
        )

    kw_detail = breakdown.get("keyword", {})
    if keyword_score < 0.35:
        suggestions.append(
            "Keyword match is low. Extract the most important technical and soft skill keywords "
            "from the job description and incorporate them naturally throughout your resume."
        )
    elif kw_detail.get("skill_overlap", 1.0) < 0.5 and kw_detail.get("tfidf_cosine", 1.0) > 0.4:
        suggestions.append(
            "Your writing style matches the JD well, but specific skill keywords are missing. "
            "Add the missing skills listed below to your Skills section."
        )

    if missing_skills:
        top = missing_skills[:6]
        suggestions.append(
            f"Add these {len(missing_skills)} missing skills to your resume "
            f"(showing top {len(top)}): {', '.join(top)}. "
            "Even brief mentions in project descriptions or a skills section count for ATS."
        )

    layout_detail = breakdown.get("layout", {})
    missing_sections = layout_detail.get("sections_missing", [])
    if missing_sections:
        suggestions.append(
            f"Your resume is missing these key sections: {', '.join(s.title() for s in missing_sections)}. "
            "ATS systems expect clearly labeled sections to parse your resume correctly."
        )

    if layout_score < 0.6:
        suggestions.append(
            "Layout score is low. Use a clean single-column format. "
            "Avoid tables, text boxes, headers/footers, and graphics — ATS parsers often skip them."
        )

    if len(found_skills) < 5:
        suggestions.append(
            "Very few technical skills detected. Add a dedicated Skills section with all "
            "relevant technologies, tools, frameworks, and languages."
        )

    if not suggestions:
        suggestions.append(
            "Your resume is well-optimized for this role! "
            "Consider quantifying more achievements and adding any remaining missing skills."
        )

    suggestions.append(
        "Use strong action verbs at the start of every bullet: "
        "Developed, Architected, Optimized, Led, Delivered, Reduced, Increased, Automated."
    )

    return suggestions


# ── Role recommender ──────────────────────────────────────────────────────────

def recommend_roles(found_skills: List[str], top_n: int = 5) -> List[Dict[str, Any]]:
    """
    Recommend job roles based on detected skills.
    Returns top_n roles sorted by match percentage.
    """
    skill_set = set(s.lower() for s in found_skills)
    scores: List[Dict[str, Any]] = []

    for role, required in ROLE_SKILL_MAP.items():
        required_set = set(required)
        matched = skill_set & required_set
        missing = required_set - skill_set
        match_pct = round(len(matched) / len(required_set) * 100, 1)
        scores.append({
            "role": role,
            "match_percent": match_pct,
            "matched_skills": sorted(matched),
            "missing_skills": sorted(missing),
            "total_required": len(required_set),
        })

    scores.sort(key=lambda x: x["match_percent"], reverse=True)
    return scores[:top_n]


# ── Skill gap report ──────────────────────────────────────────────────────────

def skill_gap_report(
    found_skills: List[str],
    missing_skills: List[str],
    target_role: str = None,
) -> Dict[str, Any]:
    """
    Detailed skill gap analysis with learning resource links.
    """
    # If target role given, use its required skills
    if target_role and target_role in ROLE_SKILL_MAP:
        role_required = set(ROLE_SKILL_MAP[target_role])
        skill_set = set(s.lower() for s in found_skills)
        role_missing = sorted(role_required - skill_set)
        role_matched = sorted(role_required & skill_set)
        coverage = round(len(role_matched) / len(role_required) * 100, 1)
    else:
        role_missing = missing_skills
        role_matched = found_skills
        coverage = None

    # Attach learning resources
    gaps_with_resources = []
    for skill in role_missing:
        gaps_with_resources.append({
            "skill": skill,
            "resource": LEARNING_RESOURCES.get(skill, f"https://www.google.com/search?q=learn+{skill.replace(' ', '+')}"),
            "priority": "high" if skill in ["python", "sql", "git", "javascript", "docker"] else "medium",
        })

    # Sort: high priority first
    gaps_with_resources.sort(key=lambda x: 0 if x["priority"] == "high" else 1)

    return {
        "target_role": target_role,
        "coverage_percent": coverage,
        "matched_skills": role_matched,
        "missing_skills": role_missing,
        "gaps_with_resources": gaps_with_resources,
        "total_gaps": len(role_missing),
    }
