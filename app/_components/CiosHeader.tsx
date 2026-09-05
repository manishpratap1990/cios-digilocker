import CiosLogo from './CiosLogo'
import {
  INSTITUTE_NAME_HI,
  INSTITUTE_NAME_EN,
  GAZETTE_BLUE_1,
  GAZETTE_BLUE_2,
  GAZETTE_GOVT_REGT,
  GAZETTE_RED_TITLE,
  GAZETTE_RED_LINE_1,
  GAZETTE_RED_LINE_2,
  INSTITUTE_DOMAIN,
  INSTITUTE_ADDRESS,
  SITE_NAME,
} from '@/lib/constants'

interface CiosHeaderProps {
  showSiteBadge?: boolean
  compact?: boolean
  className?: string
}

export default function CiosHeader({ showSiteBadge = true, compact = false, className = '' }: CiosHeaderProps) {
  return (
    <header
      className={`bg-white border-b-2 border-slate-200 text-slate-800 ${className}`}
      style={{
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        background: '#ffffff',
      }}
    >
      {/* ── Top Gazette Header Bar ── */}
      <div
        style={{
          borderBottom: '1.5px solid #cbd5e1',
          padding: '0.5rem 1rem',
          fontSize: '0.75rem',
          background: '#fafafa',
          textAlign: 'center',
          lineHeight: 1.45,
          position: 'relative',
        }}
      >
        {/* Corner info bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.35rem', fontSize: '0.75rem', fontWeight: 700, color: '#1b365d' }}>
          <div>{GAZETTE_GOVT_REGT}</div>
          <div>
            <a href={`https://${INSTITUTE_DOMAIN}`} target="_blank" rel="noreferrer" style={{ color: '#1b365d', textDecoration: 'none' }}>
              {INSTITUTE_DOMAIN}
            </a>
          </div>
        </div>

        {/* Centered Stacked Lines */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          {/* Line 1: भारत सरकार */}
          <div style={{ fontWeight: 800, color: '#1b365d', fontSize: '0.95rem', letterSpacing: '0.02em', marginBottom: '0.1rem' }}>
            {GAZETTE_BLUE_1}
          </div>

          {/* Line 2: मान्यता परिपत्र संख्या-F.No.64-04/14-VE(pt) */}
          <div style={{ fontWeight: 800, color: '#1b365d', fontSize: '0.85rem', marginBottom: '0.2rem' }}>
            {GAZETTE_BLUE_2}
          </div>

          {/* Line 3: [सरकारी गज़ट उत्तर प्रदेश] */}
          <div style={{ fontWeight: 800, color: '#c22229', fontSize: '0.9rem', marginBottom: '0.1rem', letterSpacing: '0.02em' }}>
            {GAZETTE_RED_TITLE}
          </div>

          {/* Line 4: (खण्ड 68 इलाहाबाद...) */}
          <div style={{ color: '#c22229', fontSize: '0.73rem', fontWeight: 600, marginTop: '0.05rem' }}>
            {GAZETTE_RED_LINE_1}
          </div>

          {/* Line 5: (पेज सं० 621 उत्तर प्रदेश गज़ट...) */}
          <div style={{ color: '#c22229', fontSize: '0.73rem', fontWeight: 600 }}>
            {GAZETTE_RED_LINE_2}
          </div>
        </div>
      </div>

      {/* ── Main Institution Title Banner ── */}
      <div
        style={{
          padding: compact ? '0.75rem 1rem' : '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1.25rem',
          flexWrap: 'nowrap',
        }}
      >
        {/* Logo */}
        <div style={{ flexShrink: 0 }}>
          <CiosLogo size={compact ? 80 : 105} />
        </div>

        {/* Text Area */}
        <div style={{ textAlign: 'center', flex: 1 }}>
          {/* Hindi Name */}
          <h1
            style={{
              fontFamily: "'Poppins', 'Segoe UI', 'Noto Sans Devanagari', sans-serif",
              fontSize: compact ? '1.2rem' : 'clamp(1.1rem, 2.3vw, 1.7rem)',
              fontWeight: 800,
              color: '#d11a2a',
              lineHeight: 1.2,
              marginBottom: '0.25rem',
              letterSpacing: '0.01em',
              textShadow: '0 1px 1px rgba(0,0,0,0.05)',
            }}
          >
            {INSTITUTE_NAME_HI}
          </h1>

          {/* English Name */}
          <h2
            style={{
              fontFamily: "'Poppins', 'Segoe UI', sans-serif",
              fontSize: compact ? '0.95rem' : 'clamp(0.85rem, 1.8vw, 1.25rem)',
              fontWeight: 800,
              color: '#1d4ed8',
              letterSpacing: '0.04em',
              lineHeight: 1.25,
              textTransform: 'uppercase',
              marginBottom: '0.35rem',
            }}
          >
            {INSTITUTE_NAME_EN}
          </h2>

          {/* Address Line */}
          <p
            style={{
              fontSize: compact ? '0.72rem' : '0.8rem',
              color: '#475569',
              fontWeight: 500,
              lineHeight: 1.3,
            }}
          >
            {INSTITUTE_ADDRESS}
          </p>

          {/* Site Badge */}
          {showSiteBadge && (
            <div style={{ marginTop: '0.35rem' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'linear-gradient(135deg, #1e3a5f, #2563eb)',
                  color: '#ffffff',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.65rem',
                  borderRadius: '9999px',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
                }}
              >
                🔒 {SITE_NAME}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
