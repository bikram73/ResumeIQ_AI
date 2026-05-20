import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getResumeHistory, deleteResume } from '../api'
import { useAuth } from '../AuthContext'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import ScoreCard from '../components/ScoreCard'

export default function Dashboard() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resumeToDeleteId, setResumeToDeleteId] = useState(null);

  useEffect(() => {
    getResumeHistory()
      .then(data => {
        console.log("Resume History Data:", data); // Log the received data
        setHistory(data);
      })
      .catch(error => {
        console.error("Error fetching resume history:", error); // Log any errors
        setHistory([]);
      })
      .finally(() => setLoading(false));
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

  const handleDelete = (resumeId) => {
    setResumeToDeleteId(resumeId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (resumeToDeleteId) {
      try {
        await deleteResume(resumeToDeleteId);
        setHistory(history.filter(r => r.id !== resumeToDeleteId));
        setShowDeleteModal(false);
        setResumeToDeleteId(null);
      } catch (error) {
        console.error('Error deleting resume:', error);
        alert('Failed to delete resume. Please try again.');
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setResumeToDeleteId(null);
  };

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
                      {['#', 'Job Title', 'Uploaded', 'ATS Score', 'Semantic', 'Action', 'Delete'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', color: '#64748B', fontWeight: 500 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((r, i) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '0.85rem 1rem', color: '#64748B' }}>{i + 1}</td>
                        <td style={{ padding: '0.85rem 1rem', color: '#CBD5E1' }}>{r.job_title || 'N/A'}</td>
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
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <button
                            onClick={() => handleDelete(r.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#EF4444',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
        
        {showDeleteModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: '#1E293B', padding: '2rem', borderRadius: '8px', textAlign: 'center',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', maxWidth: '400px', width: '90%', border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: '#CBD5E1' }}>Confirm Deletion</h3>
              <p style={{ color: '#94A3B8', marginBottom: '1.5rem' }}>Are you sure you want to delete this resume? This action cannot be undone.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button
                  onClick={cancelDelete}
                  style={{
                    padding: '0.75rem 1.5rem', borderRadius: '6px', border: '1px solid #64748B', backgroundColor: 'transparent',
                    color: '#CBD5E1', cursor: 'pointer', fontSize: '1rem', fontWeight: 500,
                    transition: 'all 0.2s ease-in-out',
                  }}
                  onMouseEnter={e => e.target.style.backgroundColor = '#334155'}
                  onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  style={{
                    padding: '0.75rem 1.5rem', borderRadius: '6px', border: 'none', backgroundColor: '#EF4444',
                    color: '#FFFFFF', cursor: 'pointer', fontSize: '1rem', fontWeight: 500,
                    transition: 'all 0.2s ease-in-out',
                  }}
                  onMouseEnter={e => e.target.style.backgroundColor = '#DC2626'}
                  onMouseLeave={e => e.target.style.backgroundColor = '#EF4444'}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
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
