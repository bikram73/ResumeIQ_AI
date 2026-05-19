import React, { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { uploadResume, analyze } from '../api'

export default function Upload() {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [analysisId, setAnalysisId] = useState(null)
  const [jd, setJd] = useState('')
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [uploadDone, setUploadDone] = useState(false)
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
      const res = await analyze(analysisId, jd)
      navigate(`/results/${res.analysis_id}`)
    } catch (err) {
      setError(err?.response?.data?.error || 'Analysis failed.')
    } finally {
      setAnalyzing(false)
    }
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

          {/* Drop zone */}
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
            <button
              className="btn-primary"
              onClick={handleUpload}
              disabled={!file || uploading}
              style={{ width: '100%', padding: '0.9rem' }}
            >
              {uploading ? 'Uploading...' : 'Upload Resume'}
            </button>
          ) : (
            <div className="alert alert-success">Resume uploaded successfully. Proceed to analysis below.</div>
          )}
        </div>

        {/* Step 2: Job Description */}
        <div className="glass" style={{ padding: '1.75rem', marginBottom: '1.5rem', opacity: uploadDone ? 1 : 0.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <StepBadge num={2} />
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Job Description <span style={{ color: '#64748B', fontWeight: 400, fontSize: '0.9rem' }}>(optional but recommended)</span></h2>
            </div>
          </div>
          <textarea
            rows={7}
            value={jd}
            onChange={e => setJd(e.target.value)}
            disabled={!uploadDone}
            placeholder="Paste the job description here to get semantic matching, keyword analysis, and skill gap detection..."
            style={{ resize: 'vertical', marginBottom: '1rem' }}
          />
        </div>

        {/* Step 3: Analyze */}
        <div className="glass" style={{ padding: '1.75rem', opacity: uploadDone ? 1 : 0.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <StepBadge num={3} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Run AI Analysis</h2>
          </div>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
            Our AI will compute your ATS score, semantic match, keyword overlap, and identify skill gaps.
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
