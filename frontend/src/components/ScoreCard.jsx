import React from 'react'

export default function ScoreCard({ label, value, color, suffix = '%', size = 'md' }) {
  const isLarge = size === 'lg'
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid rgba(255,255,255,0.08)`,
      borderTop: `3px solid ${color}`,
      borderRadius: 14,
      padding: isLarge ? '2rem 1.5rem' : '1.5rem 1rem',
      textAlign: 'center',
    }}>
      <div style={{
        fontSize: isLarge ? '3rem' : '2.2rem',
        fontWeight: 800,
        color,
        fontFamily: 'Poppins, sans-serif',
        lineHeight: 1,
        marginBottom: '0.5rem',
      }}>
        {value}{suffix}
      </div>
      <div style={{ fontSize: '0.82rem', color: '#94A3B8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
    </div>
  )
}
