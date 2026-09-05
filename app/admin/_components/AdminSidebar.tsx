'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import CiosLogo from '@/app/_components/CiosLogo'
import { SITE_NAME } from '@/lib/constants'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/students', label: 'All Students', icon: '👥' },
  { href: '/admin/import', label: 'Import Excel', icon: '📥' },
  { href: '/admin/result/new', label: 'Add Result', icon: '➕' },
]

export default function AdminSidebar({ username }: { username: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside style={{
      width: '250px', minWidth: '250px', background: 'linear-gradient(180deg, #0f2340 0%, #1e3a5f 100%)',
      color: 'white', display: 'flex', flexDirection: 'column', padding: '1.5rem 0',
      boxShadow: '4px 0 20px rgba(0,0,0,0.15)',
    }}>
      {/* Logo */}
      <div style={{ padding: '0 1.25rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '2px' }}>
            <CiosLogo size={42} />
          </div>
          <div>
            <div style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2, color: 'white' }}>{SITE_NAME}</div>
            <div style={{ fontSize: '0.72rem', color: '#93c5fd', fontWeight: 500 }}>Admin Portal</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '1rem 0.75rem', flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase().replace(/ /g, '-')}`}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', borderRadius: '0.625rem',
                marginBottom: '0.25rem', textDecoration: 'none',
                background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                color: isActive ? 'white' : 'rgba(255,255,255,0.7)',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.9rem',
                transition: 'all 0.15s',
                borderLeft: isActive ? '3px solid #f59e0b' : '3px solid transparent',
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ marginBottom: '0.875rem' }}>
          <div style={{ fontSize: '0.72rem', opacity: 0.6, marginBottom: '0.2rem' }}>Logged in as</div>
          <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>👤 {username}</div>
        </div>
        <button
          id="logout-btn"
          onClick={handleLogout}
          style={{ width: '100%', padding: '0.625rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.85)', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.15s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(220,38,38,0.3)'; e.currentTarget.style.borderColor = 'rgba(220,38,38,0.5)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
        >
          🚪 Logout
        </button>
      </div>
    </aside>
  )
}
