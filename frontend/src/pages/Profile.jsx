import React from 'react'
import { useAuth } from '../AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Profile() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: 600 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '2rem' }}>Profile</h1>

        <div className="glass" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'linear-gradient(135deg, #6C63FF, #00D4FF)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', fontWeight: 700, color: '#fff', fontFamily: 'Poppins, sans-serif',
              flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{user?.name}</h2>
              <p style={{ color: '#64748B', fontSize: '0.9rem' }}>{user?.email}</p>
            </div>
          </div>

          <hr className="divider" />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <InfoRow label="Full Name" value={user?.name} />
            <InfoRow label="Email" value={user?.email} />
            <InfoRow label="Member Since" value={user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'} />
          </div>
        </div>

        <div className="glass" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#CBD5E1' }}>Account Actions</h3>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10,
              color: '#fca5a5',
              padding: '0.75rem 1.5rem',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
      <span style={{ color: '#64748B', fontSize: '0.9rem' }}>{label}</span>
      <span style={{ color: '#CBD5E1', fontSize: '0.9rem', fontWeight: 500 }}>{value || '—'}</span>
    </div>
  )
}
