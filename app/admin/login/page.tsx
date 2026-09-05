'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CiosLogo from '@/app/_components/CiosLogo'
import { SITE_NAME, INSTITUTE_NAME_EN, INSTITUTE_NAME_HI } from '@/lib/constants'

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed')
      } else {
        router.push('/admin/dashboard')
        router.refresh()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', background: 'linear-gradient(160deg, #0f2340 0%, #1e3a5f 40%, #1d4ed8 100%)' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ display: 'inline-block', background: 'white', borderRadius: '50%', padding: '4px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)', marginBottom: '0.75rem' }}>
            <CiosLogo size={85} />
          </div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.375rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>
            {SITE_NAME} Admin Panel
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 500, maxWidth: '360px', margin: '0 auto' }}>
            {INSTITUTE_NAME_EN}
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: '1.25rem', padding: '2.25rem 2rem', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="username" className="form-label" style={{ fontWeight: 600 }}>Username</label>
              <input
                id="username"
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter admin username"
                autoComplete="username"
                autoFocus
              />
            </div>
            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="password" className="form-label" style={{ fontWeight: 600 }}>Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center', fontWeight: 500 }}>
                {error}
              </div>
            )}

            <button id="admin-login-btn" type="submit" className="btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, #1d4ed8, #1e3a5f)' }} disabled={loading}>
              {loading ? 'Authenticating...' : '🔐 Login to Admin Panel'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #f1f5f9' }}>
            <Link href="/" style={{ color: '#64748b', fontSize: '0.8125rem', textDecoration: 'none', fontWeight: 500 }}>
              ← Back to CIOS Result Search
            </Link>
          </div>
        </div>

        <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.1)', borderRadius: '0.75rem', backdropFilter: 'blur(10px)' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', textAlign: 'center' }}>
            Default credentials — <strong>admin</strong> / <strong>admin123</strong>
          </p>
        </div>
      </div>
    </main>
  )
}
