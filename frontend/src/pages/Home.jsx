import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const features = [
  { icon: '🎯', title: 'ATS Score Analysis', desc: 'Get a precise ATS compatibility score using our weighted AI formula combining semantic, keyword, and layout analysis.' },
  { icon: '🧠', title: 'Semantic Matching', desc: 'SBERT-powered deep semantic similarity matching between your resume and job descriptions.' },
  { icon: '🔍', title: 'Skill Gap Detection', desc: 'Instantly identify missing skills required by the job and get targeted recommendations.' },
  { icon: '📊', title: 'Visual Dashboard', desc: 'Interactive charts and score breakdowns give you a clear picture of your resume strength.' },
  { icon: '✍️', title: 'AI Suggestions', desc: 'Actionable improvement suggestions to optimize your resume for each job application.' },
  { icon: '⚡', title: 'Instant Results', desc: 'Get comprehensive analysis in seconds, not hours. Upload, analyze, improve.' },
]

const steps = [
  { num: '01', title: 'Upload Resume', desc: 'Upload your PDF resume to our secure platform.' },
  { num: '02', title: 'Add Job Description', desc: 'Paste the job description you are targeting.' },
  { num: '03', title: 'AI Analysis', desc: 'Our AI engine analyzes semantic match, keywords, and layout.' },
  { num: '04', title: 'Get Results', desc: 'Receive your ATS score, skill gaps, and improvement tips.' },
]

export default function Home() {
  const { user } = useAuth()

  return (
    <div>
      {/* Hero */}
      <section style={{ padding: '6rem 1.5rem 4rem', textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
        <div style={{
          display: 'inline-block',
          background: 'rgba(108,99,255,0.15)',
          border: '1px solid rgba(108,99,255,0.3)',
          borderRadius: 999,
          color: '#a5b4fc',
          fontSize: '0.82rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          padding: '0.4rem 1.2rem',
          marginBottom: '1.5rem',
          textTransform: 'uppercase',
        }}>
          AI-Powered Resume Intelligence
        </div>
        <h1 style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem' }}>
          Optimize Your Resume with AI<br />
          <span className="gradient-text">& Beat ATS Systems</span>
        </h1>
        <p style={{ color: '#94A3B8', fontSize: '1.15rem', lineHeight: 1.7, marginBottom: '2.5rem', maxWidth: 600, margin: '0 auto 2.5rem' }}>
          Advanced AI-powered resume analysis using semantic matching, ATS scoring, and skill gap detection. Get shortlisted faster.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to={user ? '/upload' : '/register'}>
            <button className="btn-primary" style={{ fontSize: '1.05rem', padding: '0.9rem 2.5rem' }}>
              {user ? 'Analyze Resume' : 'Get Started Free'}
            </button>
          </Link>
          <Link to={user ? '/dashboard' : '/login'}>
            <button className="btn-secondary" style={{ fontSize: '1.05rem', padding: '0.9rem 2.5rem' }}>
              {user ? 'View Dashboard' : 'Sign In'}
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginTop: '4rem', flexWrap: 'wrap' }}>
          {[['75%', 'Resumes rejected by ATS'], ['3x', 'More interview chances'], ['< 10s', 'Analysis time']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#6C63FF', fontFamily: 'Poppins, sans-serif' }}>{val}</div>
              <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '0.25rem' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Everything You Need to Land the Job
        </h2>
        <p style={{ textAlign: 'center', color: '#64748B', marginBottom: '3rem' }}>
          Multi-granularity AI analysis powered by SBERT, TF-IDF, and NLP
        </p>
        <div className="grid-3">
          {features.map(f => (
            <div key={f.title} className="glass" style={{ padding: '1.75rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ color: '#64748B', fontSize: '0.9rem', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '4rem 1.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem' }}>How It Works</h2>
        <p style={{ textAlign: 'center', color: '#64748B', marginBottom: '3rem' }}>Four simple steps to a better resume</p>
        <div className="grid-4">
          {steps.map(s => (
            <div key={s.num} style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(108,99,255,0.2), rgba(0,212,255,0.2))',
                border: '1px solid rgba(108,99,255,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
                fontSize: '1.1rem', fontWeight: 700, color: '#6C63FF', fontFamily: 'Poppins, sans-serif'
              }}>{s.num}</div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{s.title}</h3>
              <p style={{ color: '#64748B', fontSize: '0.88rem', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '4rem 1.5rem 6rem', textAlign: 'center' }}>
        <div className="glass" style={{ maxWidth: 600, margin: '0 auto', padding: '3rem 2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem' }}>
            Ready to Beat the ATS?
          </h2>
          <p style={{ color: '#64748B', marginBottom: '2rem' }}>
            Join thousands of job seekers who improved their resume with ResumeIQ AI.
          </p>
          <Link to={user ? '/upload' : '/register'}>
            <button className="btn-primary" style={{ fontSize: '1.05rem', padding: '0.9rem 2.5rem' }}>
              {user ? 'Analyze My Resume' : 'Start for Free'}
            </button>
          </Link>
        </div>
      </section>
    </div>
  )
}
