import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getResults, getSuggestions, getRoleRecommendations } from '../api'
import ScoreCard from '../components/ScoreCard'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

export default function Results() {
  const { id } = useParams()
  const [result, setResult] = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getResults(id)
      .then(data => setResult(data))
      .catch(() => setError('Could not load results.'))
      .finally(() => setLoading(false))

    getSuggestions(id)
      .then(data => setSuggestions(data.suggestions || []))
      .catch(() => setSuggestions([]))

    getRoleRecommendations(id)
      .then(data => setRoles(data.role_recommendations || []))
      .catch(() => setRoles([]))
  }, [id])

  if (loading) return <div style={{ textAlign: 'center', padding: '5rem', color: '#64748B' }}>Loading results...</div>
  if (error) return <div style={{ textAlign: 'center', padding: '5rem' }}><div className="alert alert-error">{error}</div></div>
  if (!result) return null

  const atsScore = result.ats_score || 0
  const semanticPct = Math.round((result.semantic_score || 0) * 100)
  const keywordPct = Math.round((result.keyword_match || 0) * 100)
  const layoutPct = Math.round((result.layout_score || 0) * 100)
  const noJD = result.jd_provided === false

  const atsColor = atsScore >= 70 ? '#10B981' : atsScore >= 50 ? '#F59E0B' : '#EF4444'
  const atsLabel = atsScore >= 70 ? 'Strong' : atsScore >= 50 ? 'Moderate' : 'Needs Work'

  const radarData = [
    { subject: noJD ? 'Quality' : 'ATS Score', value: atsScore },
    { subject: noJD ? 'Content' : 'Semantic', value: semanticPct },
    { subject: 'Keywords', value: keywordPct },
    { subject: 'Layout', value: layoutPct },
  ]

  // Skills by category (from ml-models) or flat list fallback
  const skillsByCategory = result.skills_by_category || {}
  const hasCategoryData = Object.keys(skillsByCategory).length > 0

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
        <div className="glass" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '5rem', fontWeight: 800, color: atsColor, fontFamily: 'Poppins, sans-serif', lineHeight: 1 }}>
            {atsScore.toFixed(1)}%
          </div>
          <div style={{ fontSize: '1.1rem', color: atsColor, fontWeight: 600, marginTop: '0.5rem' }}>
            ATS Score — {atsLabel}
          </div>
          <p style={{ color: '#64748B', marginTop: '0.75rem', fontSize: '0.9rem' }}>
            {noJD
              ? 'Resume quality score based on skill density, action verbs, content richness, and layout.'
              : atsScore >= 70 ? 'Your resume is well-optimized for ATS systems.'
              : atsScore >= 50 ? 'Your resume passes basic ATS checks but has room for improvement.'
              : 'Your resume needs significant optimization to pass ATS filters.'}
          </p>
        </div>

        {/* No-JD notice */}
        {noJD && (
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>⚠️</span>
            <div>
              <div style={{ color: '#F59E0B', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>Resume Quality Mode — No Job Description Provided</div>
              <div style={{ color: '#94A3B8', fontSize: '0.85rem', lineHeight: 1.6 }}>
                For full ATS analysis with semantic matching and skill gap detection,{' '}
                <a href="/upload" style={{ color: '#F59E0B', fontWeight: 600 }}>re-analyze with a job description</a>.
              </div>
            </div>
          </div>
        )}

        {/* Score cards */}
        <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
          <ScoreCard label={noJD ? 'Resume Quality' : 'Semantic Match'} value={semanticPct} color="#6C63FF" />
          <ScoreCard label={noJD ? 'Content Score' : 'Keyword Match'} value={keywordPct} color="#8B5CF6" />
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
            {hasCategoryData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: 200, overflowY: 'auto' }}>
                {Object.entries(skillsByCategory).map(([cat, skills]) => (
                  <div key={cat}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>{cat.replace('_', ' ')}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {skills.map(s => <span key={s} className="skill-tag">{s}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {result.extracted_skills?.length > 0
                  ? result.extracted_skills.map(s => <span key={s} className="skill-tag">{s}</span>)
                  : <span style={{ color: '#64748B', fontSize: '0.9rem' }}>No common skills detected.</span>}
              </div>
            )}
          </div>
        </div>

        {/* Skill Gap */}
        <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#CBD5E1' }}>Skill Gap Analysis</h3>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {noJD ? 'Provide a job description to see which required skills are missing from your resume.'
                   : 'Skills required by the job description that are missing from your resume.'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {result.missing_skills?.length > 0
              ? result.missing_skills.map(s => <span key={s} className="skill-tag missing">{s}</span>)
              : <span className="alert alert-success" style={{ fontSize: '0.9rem' }}>
                  {noJD ? 'Add a job description to detect skill gaps.' : 'No skill gaps detected — your resume covers all required skills!'}
                </span>}
          </div>
        </div>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#CBD5E1' }}>💡 AI Improvement Suggestions</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {suggestions.map((s, i) => (
                <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.85rem 1rem', background: 'rgba(108,99,255,0.06)', borderRadius: 10, border: '1px solid rgba(108,99,255,0.15)' }}>
                  <span style={{ color: '#6C63FF', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                  <span style={{ color: '#CBD5E1', fontSize: '0.9rem', lineHeight: 1.6 }}>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Role Recommendations */}
        {roles.length > 0 && (
          <div className="glass" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#CBD5E1' }}>🎯 Recommended Job Roles</h3>
            <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '1.25rem' }}>Based on your detected skills</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {roles.map((role, i) => (
                <div key={role.role} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#6C63FF,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{role.role}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                      {role.matched_skills.slice(0, 5).map(s => <span key={s} className="skill-tag" style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>{s}</span>)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: role.match_percent >= 70 ? '#10B981' : role.match_percent >= 40 ? '#F59E0B' : '#EF4444' }}>
                      {role.match_percent}%
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>match</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scoring Formula */}
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
