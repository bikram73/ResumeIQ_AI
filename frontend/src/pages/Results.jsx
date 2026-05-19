import React, { useEffect, useState } from 'react'
import { useParams, useLocation, Link } from 'react-router-dom'
import { getResults, getSuggestions } from '../api'
import ScoreCard from '../components/ScoreCard'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

export default function Results() {
  const { id } = useParams()
  const location = useLocation()
  const [result, setResult] = useState(location.state?.result || null)
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(!result)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!result) {
      getResults(id)
        .then(data => setResult(data))
        .catch(() => setError('Could not load results.'))
        .finally(() => setLoading(false))
    }
    getSuggestions(id)
      .then(data => setSuggestions(data.suggestions || []))
      .catch(() => setSuggestions([]))
  }, [id])

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem', color: '#64748B' }}>Loading results...</div>
  if (error) return <div style={{ textAlign: 'center', padding: '5rem' }}><div className="alert alert-error">{error}</div></div>
  if (!result) return null

  const atsScore = result.ats_score || 0
  const semanticPct = Math.round((result.semantic_score || 0) * 100)
  const keywordPct = Math.round((result.keyword_match || 0) * 100)
  const layoutPct = Math.round((result.layout_score || 0) * 100)

  const atsColor = atsScore >= 70 ? '#10B981' : atsScore >= 50 ? '#F59E0B' : '#EF4444'
  const atsLabel = atsScore >= 70 ? 'Strong' : atsScore >= 50 ? 'Moderate' : 'Needs Work'

  const radarData = [
    { subject: result.jd_provided === false ? 'Quality' : 'ATS Score', value: atsScore },
    { subject: result.jd_provided === false ? 'Content' : 'Semantic', value: semanticPct },
    { subject: 'Keywords', value: keywordPct },
    { subject: 'Layout', value: layoutPct },
  ]

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Analysis Results</h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Resume ID: {id}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/upload"><button className="btn-secondary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>Analyze Another</button></Link>
            <Link to="/dashboard"><button className="btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.9rem' }}>Dashboard</button></Link>
          </div>
        </div>

        {/* ATS Score Hero */}
        <div className="glass" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '1.5rem', background: `linear-gradient(135deg, rgba(${atsScore >= 70 ? '16,185,129' : atsScore >= 50 ? '245,158,11' : '239,68,68'},0.08), rgba(108,99,255,0.08))` }}>
          <div style={{ fontSize: '5rem', fontWeight: 800, color: atsColor, fontFamily: 'Poppins, sans-serif', lineHeight: 1 }}>
            {atsScore.toFixed(1)}%
          </div>
          <div style={{ fontSize: '1.1rem', color: atsColor, fontWeight: 600, marginTop: '0.5rem' }}>
            ATS Score — {atsLabel}
          </div>
          <p style={{ color: '#64748B', marginTop: '0.75rem', fontSize: '0.9rem' }}>
            {result.jd_provided === false
              ? 'Resume quality score based on skill density, action verbs, content richness, and layout. Add a JD for full ATS analysis.'
              : atsScore >= 70
              ? 'Your resume is well-optimized for ATS systems. Great job!'
              : atsScore >= 50
              ? 'Your resume passes basic ATS checks but has room for improvement.'
              : 'Your resume needs significant optimization to pass ATS filters.'}
          </p>
        </div>

        {/* No-JD notice */}
        {result.jd_provided === false && (
          <div style={{
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 12,
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>⚠️</span>
            <div>
              <div style={{ color: '#F59E0B', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                Resume Quality Mode — No Job Description Provided
              </div>
              <div style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.6 }}>
                Scores reflect your resume's standalone quality (skill density, action verbs, content richness, layout).
                For full ATS analysis with semantic matching and skill gap detection,{' '}
                <a href="/upload" style={{ color: '#F59E0B', fontWeight: 600 }}>re-analyze with a job description</a>.
              </div>
            </div>
          </div>
        )}

        {/* Score cards */}
        <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
          <ScoreCard label={result.jd_provided === false ? "Resume Quality" : "Semantic Match"} value={semanticPct} color="#6C63FF" />
          <ScoreCard label={result.jd_provided === false ? "Content Score" : "Keyword Match"} value={keywordPct} color="#8B5CF6" />
          <ScoreCard label="Layout Score" value={layoutPct} color="#00D4FF" />
        </div>

        {/* Radar + Skills */}
        <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
          <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: '#CBD5E1' }}>Score Radar</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 12 }} />
                <Radar dataKey="value" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: '#CBD5E1' }}>
              Skills Found ({result.extracted_skills?.length || 0})
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {result.extracted_skills?.length > 0
                ? result.extracted_skills.map(s => <span key={s} className="skill-tag">{s}</span>)
                : <span style={{ color: '#64748B', fontSize: '0.9rem' }}>No common skills detected.</span>}
            </div>
          </div>
        </div>

        {/* Skill Gap */}
        {result.missing_skills !== undefined && (
          <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#CBD5E1' }}>
              Skill Gap Analysis
            </h3>
            <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Skills required by the job description that are missing from your resume.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {result.missing_skills?.length > 0
                ? result.missing_skills.map(s => <span key={s} className="skill-tag missing">{s}</span>)
                : <span className="alert alert-success" style={{ fontSize: '0.9rem' }}>No skill gaps detected — your resume covers all required skills!</span>}
            </div>
          </div>
        )}

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#CBD5E1' }}>
              💡 AI Improvement Suggestions
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {suggestions.map((s, i) => (
                <li key={i} style={{
                  display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                  padding: '0.85rem 1rem',
                  background: 'rgba(108,99,255,0.06)',
                  borderRadius: 10,
                  border: '1px solid rgba(108,99,255,0.15)',
                }}>
                  <span style={{ color: '#6C63FF', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: '#CBD5E1', fontSize: '0.9rem', lineHeight: 1.6 }}>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Score formula */}
        <div className="glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#CBD5E1' }}>Scoring Formula</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', fontSize: '0.9rem', color: '#64748B' }}>
            <span style={{ color: '#6C63FF', fontWeight: 600 }}>ATS Score</span>
            <span>=</span>
            <span><span style={{ color: '#6C63FF' }}>50%</span> × Semantic</span>
            <span>+</span>
            <span><span style={{ color: '#8B5CF6' }}>30%</span> × Keywords</span>
            <span>+</span>
            <span><span style={{ color: '#00D4FF' }}>20%</span> × Layout</span>
          </div>
        </div>
      </div>
    </div>
  )
}
