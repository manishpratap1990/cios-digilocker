'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import CiosHeader from '@/app/_components/CiosHeader'
import {
  SITE_NAME,
  INSTITUTE_NAME_EN,
} from '@/lib/constants'

interface Subject {
  id: string
  subjectName: string
  theoryMarks?: number | null
  practicalMarks?: number | null
  minMarks: number
  maxMarks: number
  obtainedMarks: number
}

interface Result {
  resultId: string
  totalObtained: number
  totalMax: number
  percentage: number
  status: string
  grade: string
  division: string
  issueDate: string | Date
}

interface Student {
  id: string
  serialNo?: number | null
  name: string
  guardianName?: string | null
  rollNumber: string
  regNumber?: string | null
  class: string
  academicYear: string
  stream?: string | null
  centreName?: string | null
  gender?: string | null
  dateOfBirth?: string | null
  subjects: Subject[]
  result: Result
}

interface Props {
  student: Student
}

export default function ResultDisplay({ student }: Props) {
  const { result, subjects } = student
  const [qrCode, setQrCode] = useState<string>('')
  const [printing, setPrinting] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const isRevoked = result.status === 'REVOKED'
  const isPassed = result.status === 'PASS'
  const issueDate = new Date(result.issueDate).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  // Check if any subject has practical marks to display the column
  const hasPracticals = subjects.some(s => (s.practicalMarks && s.practicalMarks > 0) || (s.theoryMarks && s.theoryMarks > 0))

  useEffect(() => {
    fetch(`/api/qr?resultId=${result.resultId}`)
      .then((r) => r.json())
      .then((d) => setQrCode(d.dataUrl))
      .catch(() => {})
  }, [result.resultId])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    setPrinting(true)
    try {
      const res = await fetch(`/api/pdf/${student.rollNumber}`)
      if (!res.ok) throw new Error('PDF generation failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `CIOS-Result-${student.rollNumber}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Failed to generate PDF. Please use the Print button.')
    } finally {
      setPrinting(false)
    }
  }

  const statusClass = isRevoked ? 'result-revoked' : isPassed ? 'result-pass' : 'result-fail'

  return (
    <>
      <div style={{ minHeight: '100vh', background: '#e2e8f0', padding: '1.5rem 1rem' }} ref={printRef}>
        <div style={{ maxWidth: '920px', margin: '0 auto' }}>
          {/* Action buttons bar */}
          <div className="no-print" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href="/" className="btn-secondary btn-sm" style={{ background: '#ffffff' }}>
              ← Search Another Result
            </Link>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button id="download-pdf-btn" onClick={handleDownloadPDF} className="btn-primary btn-sm" disabled={printing}>
                {printing ? '⏳ Generating PDF...' : '⬇ Download PDF'}
              </button>
              <button id="print-btn" onClick={handlePrint} className="btn-secondary btn-sm" style={{ background: '#ffffff' }}>
                🖨 Print Marksheet
              </button>
            </div>
          </div>

          {/* Marksheet Card Container */}
          <div
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              background: '#ffffff',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              border: '2px solid #cbd5e1',
            }}
          >
            {/* ── Official CIOS Header Banner ── */}
            <CiosHeader showSiteBadge={true} />

            {/* Sub-header Title */}
            <div
              style={{
                background: '#1e3a5f',
                color: '#ffffff',
                textAlign: 'center',
                padding: '0.65rem 1rem',
                fontSize: '1.05rem',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <span>STATEMENT OF MARKS / MARKSHEET</span>
              <span style={{ opacity: 0.85, fontSize: '0.9rem' }}>({student.academicYear})</span>
            </div>

            {/* Revoked banner */}
            {isRevoked && (
              <div style={{ background: '#fef2f2', borderBottom: '2px solid #ef4444', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#991b1b', fontWeight: 700, fontSize: '0.9rem' }}>
                ⚠️ NOTICE: This mark sheet has been REVOKED by the board authority and is NOT valid.
              </div>
            )}

            <div style={{ padding: '1.75rem 2rem' }}>
              {/* Student Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem', marginBottom: '1.75rem' }}>
                {[
                  ...(student.serialNo ? [{ label: 'Serial Number (S.No.)', value: `#${student.serialNo}` }] : []),
                  { label: 'Student Name', value: student.name },
                  { label: "Father's / Guardian's Name", value: student.guardianName || '—' },
                  { label: 'Roll Number', value: student.rollNumber },
                  { label: 'Registration Number', value: student.regNumber || '—' },
                  { label: 'Class', value: `Class ${student.class}th` },
                  { label: 'Academic Session', value: student.academicYear },
                  { label: 'Centre Name', value: student.centreName || '—' },
                  ...(student.stream ? [{ label: 'Stream', value: student.stream }] : []),
                  ...(student.dateOfBirth ? [{ label: 'Date of Birth', value: student.dateOfBirth }] : []),
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: '0.7rem 0.875rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0', borderLeft: '3.5px solid #1d4ed8' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>{label}</div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.925rem' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Marks Table */}
              <div style={{ marginBottom: '1.75rem' }}>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#1e3a5f', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Subject-wise Marks Details
                </h3>
                <div className="table-container" style={{ border: '1px solid #cbd5e1' }}>
                  <table>
                    <thead>
                      <tr style={{ background: '#1e3a5f', color: '#ffffff' }}>
                        <th style={{ width: '45px', textAlign: 'center', padding: '0.75rem 0.5rem' }}>S.No.</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Subject Name</th>
                        <th style={{ textAlign: 'center', padding: '0.75rem 0.75rem', width: '95px' }}>Max. Marks</th>
                        <th style={{ textAlign: 'center', padding: '0.75rem 0.75rem', width: '95px' }}>Min. Marks</th>
                        {hasPracticals && (
                          <>
                            <th style={{ textAlign: 'center', padding: '0.75rem 0.75rem', width: '100px' }}>Theory</th>
                            <th style={{ textAlign: 'center', padding: '0.75rem 0.75rem', width: '100px' }}>Practical</th>
                          </>
                        )}
                        <th style={{ textAlign: 'center', padding: '0.75rem 0.75rem', width: '110px' }}>Total Obtained</th>
                        <th style={{ textAlign: 'center', padding: '0.75rem 0.75rem', width: '90px' }}>Remark</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((subj, idx) => {
                        const passed = subj.obtainedMarks >= subj.minMarks
                        return (
                          <tr key={subj.id || idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b', padding: '0.75rem 0.5rem' }}>
                              {idx + 1}
                            </td>
                            <td style={{ fontWeight: 600, color: '#1e293b', padding: '0.75rem 1rem' }}>
                              {subj.subjectName}
                            </td>
                            <td style={{ textAlign: 'center', color: '#64748b', padding: '0.75rem 0.75rem' }}>
                              {subj.maxMarks}
                            </td>
                            <td style={{ textAlign: 'center', color: '#64748b', padding: '0.75rem 0.75rem' }}>
                              {subj.minMarks}
                            </td>
                            {hasPracticals && (
                              <>
                                <td style={{ textAlign: 'center', color: '#334155', padding: '0.75rem 0.75rem' }}>
                                  {subj.theoryMarks ?? '—'}
                                </td>
                                <td style={{ textAlign: 'center', color: '#334155', padding: '0.75rem 0.75rem' }}>
                                  {subj.practicalMarks ?? '—'}
                                </td>
                              </>
                            )}
                            <td style={{ textAlign: 'center', fontWeight: 800, fontSize: '1.05rem', color: passed ? '#047857' : '#dc2626', padding: '0.75rem 0.75rem' }}>
                              {subj.obtainedMarks}
                            </td>
                            <td style={{ textAlign: 'center', padding: '0.75rem 0.75rem' }}>
                              <span className={`badge ${passed ? 'badge-success' : 'badge-danger'}`}>
                                {passed ? 'Pass' : 'Fail'}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.75rem' }}>
                {[
                  { label: 'Total Marks', value: `${result.totalObtained}` },
                  { label: 'Max. Marks', value: `${result.totalMax}` },
                  { label: 'Percentage', value: `${result.percentage.toFixed(2)}%` },
                  { label: 'Grade', value: result.grade },
                  { label: 'Division', value: result.division },
                ].map(({ label, value }) => (
                  <div key={label} style={{ textAlign: 'center', padding: '0.85rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.25rem' }}>{label}</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#1e3a5f' }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Final Result Status Badge */}
              <div style={{ textAlign: 'center', marginBottom: '1.75rem', padding: '1rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                <div style={{ marginBottom: '0.4rem', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Final Result Status</div>
                <span className={statusClass} style={{ fontSize: '1.25rem', padding: '0.5rem 2.25rem' }}>
                  {result.status}
                </span>
              </div>

              {/* Footer with Verification QR Code & Result ID */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem', paddingTop: '1.25rem', borderTop: '2px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.35rem' }}>
                    <strong>Date of Issue:</strong> {issueDate}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#475569', marginBottom: '0.35rem' }}>
                    <strong>Digital Result ID:</strong> <code style={{ background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.75rem', fontWeight: 700, color: '#0f172a' }}>{result.resultId}</code>
                  </div>
                  {/* Green e-Verified Stamp Badge */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.625rem',
                      padding: '0.45rem 0.85rem',
                      background: '#ecfdf5',
                      border: '2px dashed #059669',
                      borderRadius: '0.5rem',
                      marginTop: '0.5rem',
                      boxShadow: '0 2px 6px rgba(5,150,105,0.1)',
                    }}
                  >
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#059669',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      flexShrink: 0,
                    }}>
                      ✓
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#047857', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                        e-Verified by {SITE_NAME}
                      </div>
                      {student.centreName && (
                        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#065f46', marginTop: '0.05rem' }}>
                          Centre: {student.centreName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  {qrCode ? (
                    <>
                      <img src={qrCode} alt="Verification QR Code" style={{ width: '95px', height: '95px', display: 'block', margin: '0 auto 0.25rem', border: '1px solid #cbd5e1', padding: '3px', borderRadius: '4px' }} />
                      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569' }}>Scan QR to Verify</div>
                    </>
                  ) : (
                    <div style={{ width: '95px', height: '95px', background: '#f1f5f9', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', color: '#94a3b8' }}>Loading QR...</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.75rem', marginTop: '1.25rem' }}>
            Official mark sheet issued by {INSTITUTE_NAME_EN}.
          </p>
        </div>
      </div>

      <style>{`
        @media print {
          body { margin: 0; padding: 0; background: #fff !important; }
          .no-print { display: none !important; }
          .card { box-shadow: none !important; border: 1px solid #000 !important; }
        }
      `}</style>
    </>
  )
}
