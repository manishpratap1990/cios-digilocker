import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminDashboard() {
  const [totalStudents, totalPassed, totalFailed, totalRevoked, recentStudents] = await Promise.all([
    prisma.student.count(),
    prisma.result.count({ where: { status: 'PASS' } }),
    prisma.result.count({ where: { status: 'FAIL' } }),
    prisma.result.count({ where: { status: 'REVOKED' } }),
    prisma.student.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { result: true },
    }),
  ])

  const stats = [
    { label: 'Total Students', value: totalStudents, icon: '👥', color: '#2563eb', bg: '#dbeafe' },
    { label: 'Passed', value: totalPassed, icon: '✅', color: '#059669', bg: '#d1fae5' },
    { label: 'Failed', value: totalFailed, icon: '❌', color: '#dc2626', bg: '#fee2e2' },
    { label: 'Revoked', value: totalRevoked, icon: '🚫', color: '#d97706', bg: '#fef3c7' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.625rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '0.25rem' }}>Dashboard</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Overview of all results in the portal</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {stats.map(({ label, value, icon, color, bg }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color, fontFamily: 'Poppins, sans-serif', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b', fontWeight: 500, marginTop: '0.25rem' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { href: '/admin/import', label: 'Import Excel / CSV', desc: 'Upload result data from Excel', icon: '📥', color: '#2563eb' },
          { href: '/admin/result/new', label: 'Add Result Manually', desc: 'Add a single student result', icon: '➕', color: '#059669' },
          { href: '/admin/students', label: 'View All Students', desc: 'Search and manage results', icon: '👥', color: '#d97706' },
        ].map(({ href, label, desc, icon, color }) => (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div className="card hover:-translate-y-1 hover:shadow-lg transition-all duration-150" style={{ cursor: 'pointer', borderLeft: `4px solid ${color}` }}>
              <div style={{ fontSize: '1.75rem', marginBottom: '0.75rem' }}>{icon}</div>
              <div style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '0.25rem' }}>{label}</div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent results */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#1e3a5f' }}>Recent Results</h2>
          <Link href="/admin/students" style={{ fontSize: '0.8125rem', color: '#2563eb', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
        </div>
        {recentStudents.length === 0 ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
            <p>No results yet. <Link href="/admin/import" style={{ color: '#2563eb' }}>Import your first batch</Link></p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'linear-gradient(135deg, #1e3a5f, #0f2340)', color: 'white' }}>
                {['Name', 'Roll No.', 'Class', 'Year', 'Status'].map((h) => (
                  <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentStudents.map((s) => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>
                    <Link href={`/admin/result/${s.id}/edit`} style={{ color: '#1e3a5f', textDecoration: 'none' }}>{s.name}</Link>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b', fontFamily: 'monospace' }}>{s.rollNumber}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>Class {s.class}</td>
                  <td style={{ padding: '0.75rem 1rem', color: '#64748b' }}>{s.academicYear}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className={`badge ${s.result?.status === 'PASS' ? 'badge-success' : s.result?.status === 'REVOKED' ? 'badge-warning' : 'badge-danger'}`}>
                      {s.result?.status || '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
