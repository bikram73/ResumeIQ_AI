import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getResumeHistory } from '../api'
import { useAuth } from '../AuthContext'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import ScoreCard from '../components/ScoreCard'

export default function Dashboard() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getResumeHistory()
      .then(data => setHistory(data))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [])

  const latest = history[0] || null

  const radarData = latest ? [
    { subject: 'ATS Score', value: latest.ats_score || 0 },
    { subject: 'Semantic', value: (latest.semantic_score || 0) * 100 },
    { subject: 'Keywords', value: (latest.keyword_match || 0) * 100 },
    { subject: 'Layout', value: (latest.layout_score || 0) * 100 },
  ] : []

  const barData = history.slice(0, 6).reverse().map((r, i) => ({
    name: `Resume ${i + 1}`,
    score: r.ats_score || 0,
  }))

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: '#64748B', fontSize: '0.9rem' }}>Here's your resume performance overview</p>
          </div>
          <Link to="/upload">
            <button className="btn-primary" style={{ padding: '0.75rem 1.75rem' }}>+ Analyze New Resume</button>
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#64748B' }}>Loading your data...</div>
        ) : history.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Score cards */}
            <div className="grid-4" style={{ marginBottom: '2rem' }}>
              <ScoreCard label="ATS Score" value={latest?.ats_score?.toFixed(1) || 0} color="#6C63FF" />
              <ScoreCard label="Semantic Match" value={Math.round((latest?.semantic_score || 0) * 100)} color="#00D4FF" />
              <ScoreCard label="Keyword Match" value={Math.round((latest?.keyword_match || 0) * 100)} color="#8B5CF6" />
              <ScoreCard label="Layout Score" value={Math.round((latest?.layout_score || 0) * 100)} color="#10B981" />
            </div>

            {/* Charts */}
            <div className="grid-2" style={{ marginBottom: '2rem' }}>
              {/* Radar */}
              <div className="glass" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: '#CBD5E1' }}>Score Breakdown</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 12 }} />
                    <Radar dataKey="value" stroke="#6C63FF" fill="#6C63FF" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Bar chart */}
              <div className="glass" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: '#CBD5E1' }}>ATS Score History</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData}>
                    <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }}
                      cursor={{ fill: 'rgba(108,99,255,0.1)' }}
                    />
                    <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                      {barData.map((entry, index) => (
                        <Cell key={index} fill={entry.score >= 70 ? '#10B981' : entry.score >= 50 ? '#F59E0B' : '#EF4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Resume history table */}
            <div className="glass" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: '#CBD5E1' }}>Resume History</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {['#', 'Uploaded', 'ATS Score', 'Semantic', 'Action'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#64748B', fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((r, i) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>{i + 1}</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#CBD5E1' }}>
                          {new Date(r.uploaded_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{
                            color: r.ats_score >= 70 ? '#10B981' : r.ats_score >= 50 ? '#F59E0B' : '#EF4444',
                            fontWeight: 700
                          }}>
                            {r.ats_score?.toFixed(1) || '—'}%
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#CBD5E1' }}>
                          {r.semantic_score ? Math.round(r.semantic_score * 100) + '%' : '—'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <Link to={`/results/${r.id}`} style={{ color: '#6C63FF', fontWeight: 600, fontSize: '0.85rem' }}>
                            View Results →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '5rem 2rem' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>No resumes analyzed yet</h2>
      <p style={{ color: '#64748B', marginBottom: '2rem' }}>Upload your first resume to get your ATS score and AI insights.</p>
      <Link to="/upload">
        <button className="btn-primary" style={{ padding: '0.9rem 2.5rem' }}>Analyze Your First Resume</button>
      </Link>
    </div>
  )
}
