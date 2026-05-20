import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadResume, analyze } from '../api'

const JD_EXAMPLES = [
  {
    label: '💻 Full Stack Developer',
    color: '#6C63FF',
    text: `We are looking for a Full Stack Developer to join our engineering team.

Responsibilities:
- Build and maintain web applications using React, Node.js, and TypeScript
- Design and implement RESTful APIs and GraphQL endpoints
- Work with PostgreSQL and MongoDB databases
- Deploy and manage applications on AWS using Docker and Kubernetes
- Implement CI/CD pipelines using GitHub Actions
- Write unit and integration tests using Jest and Pytest
- Collaborate in an Agile/Scrum environment

Required Skills:
- JavaScript, TypeScript, React, Node.js, Express
- HTML, CSS, REST API, GraphQL
- PostgreSQL, MongoDB, Redis
- Docker, Kubernetes, AWS, CI/CD, Git, Linux
- Python, FastAPI or Django
- Agile, Scrum`,
  },
  {
    label: '📊 Data Analyst / Data Scientist',
    color: '#10B981',
    text: `We are hiring a Data Analyst / Data Scientist to work on business intelligence and ML projects.

Responsibilities:
- Analyze large datasets using Python, SQL, and Pandas
- Build machine learning models using scikit-learn, XGBoost, and TensorFlow
- Create interactive dashboards and reports using Power BI and Tableau
- Perform EDA, feature engineering, and statistical analysis
- Build data pipelines using Airflow and Spark
- Present insights to stakeholders using Matplotlib, Seaborn, and Plotly
- Work with Jupyter Notebooks for experimentation

Required Skills:
- Python, SQL, Pandas, NumPy, Matplotlib, Seaborn, Plotly
- Machine Learning, Deep Learning, scikit-learn, XGBoost, TensorFlow, PyTorch
- Power BI, Tableau, Excel
- Jupyter, Git, REST API
- Spark, Airflow (nice to have)
- Data Analysis, Statistics, Feature Engineering`,
  },
  {
    label: '☁️ DevOps / Cloud Engineer',
    color: '#F59E0B',
    text: `We are looking for a DevOps / Cloud Engineer to manage our infrastructure and deployment pipelines.

Responsibilities:
- Design and maintain CI/CD pipelines using Jenkins and GitHub Actions
- Manage containerized workloads with Docker and Kubernetes
- Provision and manage cloud infrastructure on AWS and Azure using Terraform
- Monitor systems using Prometheus, Grafana, and Datadog
- Automate infrastructure tasks using Python and Bash scripts
- Ensure system reliability, security, and scalability

Required Skills:
- Docker, Kubernetes, Terraform, Ansible
- AWS, Azure, GCP
- CI/CD, Jenkins, GitHub Actions, GitLab CI
- Linux, Bash, Python
- Prometheus, Grafana, Datadog
- Git, Microservices, Agile`,
  },
  {
    label: '🤖 ML / AI Engineer',
    color: '#8B5CF6',
    text: `We are seeking an ML Engineer to build and deploy machine learning systems at scale.

Responsibilities:
- Design, train, and deploy ML models using TensorFlow and PyTorch
- Build NLP pipelines using Hugging Face Transformers and spaCy
- Implement MLOps practices: model versioning, monitoring, and retraining
- Build data pipelines using Apache Spark and Airflow
- Deploy models as REST APIs using FastAPI and Docker
- Work with large datasets stored in PostgreSQL and MongoDB

Required Skills:
- Python, TensorFlow, PyTorch, scikit-learn, XGBoost
- NLP, Deep Learning, Machine Learning, Computer Vision
- Pandas, NumPy, Matplotlib, Jupyter
- FastAPI, REST API, Docker, Kubernetes
- MLOps, Airflow, Spark
- SQL, PostgreSQL, MongoDB, Git, AWS`,
  },
  {
    label: '⚛️ Frontend Developer',
    color: '#00D4FF',
    text: `We are hiring a Frontend Developer to build modern, responsive web interfaces.

Responsibilities:
- Build responsive UIs using React, TypeScript, and Next.js
- Implement state management using Redux or Zustand
- Write unit and integration tests using Jest and React Testing Library
- Optimize web performance and Core Web Vitals
- Collaborate with designers using Figma
- Integrate REST APIs and GraphQL endpoints

Required Skills:
- JavaScript, TypeScript, React, Next.js, HTML, CSS
- Redux, REST API, GraphQL
- Jest, Git, Agile, Scrum
- Figma, Tailwind CSS
- Node.js (nice to have)`,
  },
]

export default function Upload() {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [analysisId, setAnalysisId] = useState(null)
  const [jd, setJd] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [uploadDone, setUploadDone] = useState(false)
  const [showExamples, setShowExamples] = useState(false)
  const fileRef = useRef()
  const navigate = useNavigate()

  const handleFile = (f) => {
    if (!f) return
    if (f.type !== 'application/pdf') return setError('Only PDF files are supported.')
    if (f.size > 10 * 1024 * 1024) return setError('File size must be under 10MB.')
    setError('')
    setFile(f)
    setUploadDone(false)
    setAnalysisId(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleUpload = async () => {
    setError('')
    setUploading(true)
    try {
      const res = await uploadResume(file)
      setAnalysisId(res.analysis_id)
      setUploadDone(true)
    } catch (err) {
      setError(err?.response?.data?.detail || 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleAnalyze = async () => {
    setError('')
    setAnalyzing(true)
    try {
      const res = await analyze(analysisId, jd, jobTitle)
      navigate(`/results/${res.analysis_id}`)
    } catch (err) {
      setError(err?.response?.data?.error || 'Analysis failed.')
    } finally {
      setAnalyzing(false)
    }
  }

  const useExample = (text, label) => {
    setJd(text)
    // Auto-fill job title from example label (strip emoji)
    setJobTitle(label.replace(/^[^\w]+/, '').trim())
    setShowExamples(false)
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 720 }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Analyze Resume</h1>
          <p style={{ color: '#64748B' }}>Upload your resume and optionally add a job description for targeted analysis.</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

        {/* Step 1: Upload */}
        <div className="glass" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <StepBadge num={1} done={uploadDone} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Upload Resume (PDF)</h2>
          </div>

          <div
            onClick={() => fileRef.current.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragging ? '#6C63FF' : file ? '#10B981' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: 12,
              padding: '2.5rem 1.5rem',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragging ? 'rgba(108,99,255,0.05)' : 'transparent',
              transition: 'all 0.2s',
              marginBottom: '1rem',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{file ? '✅' : '📄'}</div>
            {file ? (
              <>
                <p style={{ color: '#10B981', fontWeight: 600 }}>{file.name}</p>
                <p style={{ color: '#64748B', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  {(file.size / 1024).toFixed(1)} KB — Click to change
                </p>
              </>
            ) : (
              <>
                <p style={{ fontWeight: 500, marginBottom: '0.25rem' }}>Drag & drop your PDF here</p>
                <p style={{ color: '#64748B', fontSize: '0.85rem' }}>or click to browse — Max 10MB</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="application/pdf" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />

          {!uploadDone ? (
            <button className="btn-primary" onClick={handleUpload} disabled={!file || uploading} style={{ width: '100%', padding: '0.9rem' }}>
              {uploading ? 'Uploading...' : 'Upload Resume'}
            </button>
          ) : (
            <div className="alert alert-success">Resume uploaded successfully. Proceed to analysis below.</div>
          )}
        </div>

        {/* Step 2: Job Description */}
        <div className="glass" style={{ padding: '1.75rem', marginBottom: '1.5rem', opacity: uploadDone ? 1 : 0.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <StepBadge num={2} />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                Job Description{' '}
                <span style={{ color: '#64748B', fontWeight: 400, fontSize: '0.9rem' }}>(optional but recommended)</span>
              </h2>
            </div>
            {/* Example JD button */}
            <button
              onClick={() => setShowExamples(v => !v)}
              disabled={!uploadDone}
              style={{
                background: 'rgba(108,99,255,0.12)',
                border: '1px solid rgba(108,99,255,0.35)',
                borderRadius: 8,
                color: '#a5b4fc',
                cursor: uploadDone ? 'pointer' : 'not-allowed',
                fontSize: '0.82rem',
                fontWeight: 600,
                padding: '0.4rem 0.9rem',
                transition: 'all 0.2s',
              }}
            >
              {showExamples ? '✕ Close' : '💡 Use an Example JD'}
            </button>
          </div>

          {/* Example JD picker */}
          {showExamples && uploadDone && (
            <div style={{
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              marginBottom: '1rem',
              overflow: 'hidden',
            }}>
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem', color: '#64748B', fontWeight: 500 }}>
                Select a role to auto-fill the job description:
              </div>
              {JD_EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  onClick={() => useExample(ex.text, ex.label)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    color: '#CBD5E1',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: ex.color, flexShrink: 0,
                  }} />
                  <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{ex.label}</span>
                  <span style={{ color: '#475569', fontSize: '0.8rem', marginLeft: 'auto' }}>Click to use →</span>
                </button>
              ))}
            </div>
          )}

          {/* Job title input */}
          <div style={{ marginBottom: '0.85rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94A3B8', marginBottom: '0.4rem', fontWeight: 500 }}>
              Role / Job Title <span style={{ color: '#475569' }}>(optional — shown in history)</span>
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={e => setJobTitle(e.target.value)}
              disabled={!uploadDone}
              placeholder="e.g. Data Scientist, Full Stack Developer..."
              style={{ marginBottom: 0 }}
            />
          </div>

          <textarea
            rows={8}
            value={jd}
            onChange={e => setJd(e.target.value)}
            disabled={!uploadDone}
            placeholder="Paste the job description here — or click 'Use an Example JD' above to auto-fill a sample for your target role."
            style={{ resize: 'vertical', marginBottom: '0.5rem' }}
          />
          {jd && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#475569' }}>{jd.length} characters</span>
              <button
                onClick={() => setJd('')}
                style={{ background: 'none', border: 'none', color: '#475569', fontSize: '0.8rem', cursor: 'pointer', padding: '0.25rem 0.5rem' }}
              >
                Clear ✕
              </button>
            </div>
          )}
        </div>

        {/* Step 3: Analyze */}
        <div className="glass" style={{ padding: '1.75rem', opacity: uploadDone ? 1 : 0.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <StepBadge num={3} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Run AI Analysis</h2>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Our AI will compute your ATS score, semantic match, keyword overlap, and identify skill gaps.
            {!jd && <span style={{ color: '#F59E0B' }}> No JD? We'll score your resume quality instead.</span>}
          </p>
          <button
            className="btn-success"
            onClick={handleAnalyze}
            disabled={!uploadDone || analyzing}
            style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}
          >
            {analyzing ? '🔍 Analyzing with AI...' : '🚀 Analyze Resume'}
          </button>
        </div>
      </div>
    </div>
  )
}

function StepBadge({ num, done }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
      background: done ? '#10B981' : 'linear-gradient(135deg, #6C63FF, #8B5CF6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '0.85rem', fontWeight: 700, color: '#fff',
    }}>
      {done ? '✓' : num}
    </div>
  )
}
