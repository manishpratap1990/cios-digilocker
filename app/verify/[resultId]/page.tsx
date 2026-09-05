import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import CiosLogo from '@/app/_components/CiosLogo'
import {
  SITE_NAME,
  INSTITUTE_NAME_EN,
  INSTITUTE_NAME_HI,
} from '@/lib/constants'

interface Props {
  params: Promise<{ resultId: string }>
}

export async function generateMetadata({ params }: Props) {
  const { resultId } = await params
  return {
    title: `Verify Result ${resultId.slice(0, 8)} | ${SITE_NAME}`,
  }
}

export default async function VerifyPage({ params }: Props) {
  const { resultId } = await params

  let data = null
  let error = null

  try {
    const result = await prisma.result.findUnique({
      where: { resultId },
      include: { student: true },
    })
    if (!result) {
      error = 'No verified result found for this ID.'
    } else {
      data = result
    }
  } catch {
    error = 'Verification failed. Please try again.'
  }

  const isValid = data && data.status !== 'REVOKED'
  const issueDate = data ? new Date(data.issueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : null

  return (
    <main style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem',
      background: isValid ? 'linear-gradient(160deg, #064e3b 0%, #059669 100%)' :
        error ? 'linear-gradient(160deg, #1e293b 0%, #334155 100%)' :
        'linear-gradient(160deg, #7f1d1d 0%, #dc2626 100%)',
    }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        {/* CIOS Header in Verification view */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
            <CiosLogo size={75} />
          </div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.05rem', fontWeight: 800, color: 'white', marginBottom: '0.2rem' }}>
            {INSTITUTE_NAME_EN}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', fontWeight: 600 }}>
            {SITE_NAME} — Digital Verification System
          </p>
        </div>

        <div style={{ background: 'white', borderRadius: '1.25rem', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
          {/* Status banner */}
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            background: error ? '#f3f4f6' : isValid ? '#d1fae5' : '#fee2e2',
            borderBottom: '1px solid',
            borderColor: error ? '#e5e7eb' : isValid ? '#a7f3d0' : '#fecaca',
          }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>
              {error ? '❓' : isValid ? '✅' : '🚫'}
            </div>
            <div style={{
              fontSize: '1.375rem', fontWeight: 800,
              color: error ? '#374151' : isValid ? '#065f46' : '#991b1b',
              fontFamily: 'Poppins, sans-serif',
              letterSpacing: '-0.01em',
            }}>
              {error ? 'RECORD NOT FOUND' : isValid ? 'GENUINE & VERIFIED RESULT' : 'RESULT REVOKED'}
            </div>
            {!error && (
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.375rem', fontWeight: 500 }}>
                {isValid ? 'This digital marksheet is authentic and issued by the board.' : 'This result has been revoked by the institution.'}
              </p>
            )}
          </div>

          {/* Result details */}
          {data && (
            <div style={{ padding: '1.75rem 2rem' }}>
              {[
                { label: 'Student Name', value: data.student.name },
                { label: 'Roll Number', value: data.student.rollNumber },
                { label: 'Class', value: `Class ${data.student.class}th` },
                ...(data.student.stream ? [{ label: 'Stream', value: data.student.stream }] : []),
                { label: 'Centre Name', value: data.student.centreName || '—' },
                { label: 'Academic Session', value: data.student.academicYear },
                { label: 'Result Status', value: data.status },
                ...(isValid ? [
                  { label: 'Percentage', value: `${data.percentage.toFixed(2)}%` },
                  { label: 'Grade / Division', value: `${data.grade} (${data.division})` },
                ] : []),
                { label: 'Date of Issue', value: issueDate || '—' },
                ...(data.revokedAt ? [{ label: 'Revoked On', value: new Date(data.revokedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) }] : []),
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.75rem', marginBottom: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{value}</span>
                </div>
              ))}

              <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#64748b', wordBreak: 'break-all' }}>
                <strong>Digital Verification ID:</strong> {data.resultId}
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: '1.75rem 2rem', textAlign: 'center' }}>
              <p style={{ color: '#64748b', fontSize: '0.9375rem' }}>{error}</p>
            </div>
          )}

          <div style={{ padding: '1rem 2rem 1.75rem', textAlign: 'center', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            {data && (
              <Link href={`/result/${data.student.rollNumber}`} className="btn-secondary btn-sm">
                View Full Marksheet
              </Link>
            )}
            <Link href="/" className="btn-primary btn-sm">
              Search Result →
            </Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', marginTop: '1.25rem' }}>
          Official Verification Portal • {SITE_NAME}
        </p>
      </div>
    </main>
  )
}
