import sqlite3, sys, os
sys.path.insert(0, '.')
from app.ai.pipeline import analyze_resume

c = sqlite3.connect('resumeiq.db')
resumes = c.execute('SELECT id, resume_url FROM resumes').fetchall()
for rid, path in resumes:
    if os.path.exists(path):
        result = analyze_resume(path, '')
        c.execute(
            'UPDATE resumes SET ats_score=?, semantic_score=?, keyword_match=?, layout_score=? WHERE id=?',
            (result['ats_score'], result['semantic_score'], result['keyword_match'], result['layout_score'], rid)
        )
        c.execute('UPDATE analyses SET jd_provided=0, suggestions=? WHERE resume_id=?',
                  (str(result.get('missing_skills', [])), rid))
        print(f"Resume {rid}: ATS={result['ats_score']}%")
    else:
        print(f"Resume {rid}: FILE NOT FOUND - {path}")
c.commit()
c.close()
print('Done.')
