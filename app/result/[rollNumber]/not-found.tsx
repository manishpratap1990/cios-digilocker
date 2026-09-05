import Link from 'next/link'

export default function ResultNotFound() {
  return (
    <main style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '2rem',
      background: 'linear-gradient(160deg, #0f2340 0%, #1e3a5f 100%)',
    }}>
      <div style={{
        background: 'white', borderRadius: '1.25rem', padding: '3rem 2.5rem',
        textAlign: 'center', maxWidth: '420px', width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🔍</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '0.75rem' }}>
          Result Not Found
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9375rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
          No result found for this roll number. Please check the roll number and try again.
        </p>
        <Link href="/" className="btn-primary" style={{ display: 'inline-flex' }}>
          ← Go Back
        </Link>
      </div>
    </main>
  )
}
