import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(15,23,42,0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      padding: '0 1.5rem',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #6C63FF, #00D4FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 800, color: '#fff', fontFamily: 'Poppins, sans-serif'
          }}>R</div>
          <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: '1.1rem' }}>
            Resume<span style={{ color: '#6C63FF' }}>IQ</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {user ? (
            <>
              <NavLink to="/dashboard" active={isActive('/dashboard')}>Dashboard</NavLink>
              <NavLink to="/upload" active={isActive('/upload')}>Analyze</NavLink>
              <NavLink to="/profile" active={isActive('/profile')}>Profile</NavLink>
              <button onClick={handleLogout} className="btn-secondary" style={{ marginLeft: '0.5rem', padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/" active={isActive('/')}>Home</NavLink>
              <Link to="/login">
                <button className="btn-secondary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>Login</button>
              </Link>
              <Link to="/register">
                <button className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', marginLeft: '0.5rem' }}>Get Started</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function NavLink({ to, active, children }) {
  return (
    <Link to={to} style={{
      color: active ? '#6C63FF' : '#CBD5E1',
      fontWeight: active ? 600 : 400,
      fontSize: '0.95rem',
      padding: '0.5rem 0.85rem',
      borderRadius: 8,
      background: active ? 'rgba(108,99,255,0.1)' : 'transparent',
      transition: 'all 0.2s',
    }}>
      {children}
    </Link>
  )
}
