'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CiosHeader from './_components/CiosHeader'
import CiosLogo from './_components/CiosLogo'
import { SITE_NAME, INSTITUTE_NAME_EN } from '@/lib/constants'

export default function HomePage() {
  const router = useRouter()
  const [rollNumber, setRollNumber] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const rn = rollNumber.trim()
    if (!rn) {
      setError('Please enter your roll number.')
      return
    }
    setError('')
    setLoading(true)
    router.push(`/result/${encodeURIComponent(rn)}`)
  }

  const handleQuickTest = (rn: string) => {
    setRollNumber(rn)
    setError('')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f1f5f9' }}>
      {/* ── Official CIOS Header Banner ── */}
      <CiosHeader showSiteBadge={true} />

      {/* ── Main Content Area ── */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 1rem',
          background: 'radial-gradient(ellipse at top, #e2e8f0 0%, #f1f5f9 100%)',
        }}
      >
        <div style={{ width: '100%', maxWidth: '480px' }}>
          {/* Result Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '1.25rem',
              padding: '2.25rem 2rem',
              boxShadow: '0 20px 45px -10px rgba(15, 23, 42, 0.12), 0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Header Icon and Title inside Card */}
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{ display: 'inline-block', marginBottom: '0.75rem' }}>
                <CiosLogo size={75} />
              </div>
              <h2
                style={{
                  fontSize: '1.375rem',
                  fontWeight: 800,
                  color: '#1e3a5f',
                  marginBottom: '0.25rem',
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Check Your Result
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                Enter your Roll Number to view and download your mark sheet
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  htmlFor="rollNumber"
                  style={{
                    display: 'block',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: '#334155',
                    marginBottom: '0.5rem',
                  }}
                >
                  Roll Number
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="rollNumber"
                    type="text"
                    className="form-input"
                    placeholder="e.g. 1001"
                    value={rollNumber}
                    onChange={(e) => {
                      setRollNumber(e.target.value)
                      setError('')
                    }}
                    style={{
                      fontSize: '1.125rem',
                      textAlign: 'center',
                      letterSpacing: '0.08em',
                      padding: '0.875rem 1rem',
                      fontWeight: 600,
                      borderColor: error ? '#ef4444' : '#cbd5e1',
                    }}
                    autoFocus
                    autoComplete="off"
                  />
                </div>
                {error && (
                  <p style={{ color: '#dc2626', fontSize: '0.8125rem', marginTop: '0.5rem', textAlign: 'center', fontWeight: 500 }}>
                    {error}
                  </p>
                )}
              </div>

              <button
                id="view-result-btn"
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{
                  width: '100%',
                  fontSize: '1.05rem',
                  padding: '0.9rem',
                  background: 'linear-gradient(135deg, #1e40af 0%, #1e3a5f 100%)',
                  boxShadow: '0 4px 14px rgba(30, 58, 95, 0.3)',
                }}
              >
                {loading ? (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Searching Result...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    View Result
                  </>
                )}
              </button>
            </form>

            {/* Admin Panel Link */}
            <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              <Link
                href="/admin/login"
                style={{ color: '#64748b', fontSize: '0.8125rem', textDecoration: 'none', fontWeight: 500 }}
              >
                🔐 Admin Panel Login
              </Link>
            </div>
          </div>

          {/* Footer Info */}
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.75rem', marginTop: '1.5rem' }}>
            © {new Date().getFullYear()} {INSTITUTE_NAME_EN}.<br />
            Powered by {SITE_NAME}
          </p>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
