'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Student {
  id: string
  serialNo?: number | null
  name: string
  rollNumber: string
  regNumber?: string | null
  class: string
  academicYear: string
  stream?: string | null
  createdAt: string
  result?: { status: string; percentage: number; grade: string } | null
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [revokingId, setRevokingId] = useState<string | null>(null)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '15' })
      if (search) params.set('search', search)
      const res = await fetch(`/api/results?${params}`)
      const data = await res.json()
      setStudents(data.students || [])
      setTotal(data.total || 0)
      setTotalPages(data.pages || 1)
    } catch {
      setStudents([])
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    const t = setTimeout(fetchStudents, 300)
    return () => clearTimeout(t)
  }, [fetchStudents])

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete result for "${name}"? This cannot be undone.`)) return
    setDeletingId(id)
    try {
      await fetch(`/api/results/${id}`, { method: 'DELETE' })
      fetchStudents()
    } finally {
      setDeletingId(null)
    }
  }

  const handleRevoke = async (id: string, currentStatus: string) => {
    const action = currentStatus === 'REVOKED' ? 'restore' : 'revoke'
    if (!confirm(`Are you sure you want to ${action} this result?`)) return
    setRevokingId(id)
    try {
      await fetch(`/api/results/${id}/revoke`, { method: 'POST' })
      fetchStudents()
    } finally {
      setRevokingId(null)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '0.25rem' }}>
            All Students & Results
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{total} total student records</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link href="/admin/result/new" className="btn-primary btn-sm">➕ Add Result</Link>
          <Link href="/admin/import" className="btn-secondary btn-sm">📥 Import Excel</Link>
        </div>
      </div>

      {/* Search */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
        <input
          id="search-students"
          type="text"
          className="form-input"
          placeholder="🔍 Search by student name, roll number, or registration number..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⏳</div>
            Loading records...
          </div>
        ) : students.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📭</div>
            <p>No students found{search ? ` for "${search}"` : ''}.</p>
          </div>
        ) : (
          <div className="table-container" style={{ borderRadius: 0, border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: '60px', textAlign: 'center' }}>S.No.</th>
                  <th>Student Name</th>
                  <th>Roll Number</th>
                  <th>Class / Stream</th>
                  <th>Academic Year</th>
                  <th>Grade / %</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, index) => (
                  <tr key={s.id}>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>
                      {s.serialNo ?? ((page - 1) * 15 + index + 1)}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#1e293b' }}>{s.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{s.regNumber || ''}</div>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700, color: '#1d4ed8' }}>{s.rollNumber}</td>
                    <td>
                      Class {s.class}th
                      {s.stream && <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>({s.stream})</span>}
                    </td>
                    <td style={{ color: '#64748b', fontWeight: 500 }}>{s.academicYear}</td>
                    <td style={{ fontWeight: 700, color: '#1e3a5f' }}>{s.result?.grade || '—'} ({s.result?.percentage?.toFixed(1)}%)</td>
                    <td>
                      <span className={`badge ${s.result?.status === 'PASS' ? 'badge-success' : s.result?.status === 'REVOKED' ? 'badge-warning' : 'badge-danger'}`}>
                        {s.result?.status || '—'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <a href={`/result/${s.rollNumber}`} target="_blank" rel="noopener" className="btn-secondary btn-sm" style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }} title="View Public Marksheet">👁</a>
                        <Link href={`/admin/result/${s.id}/edit`} className="btn-secondary btn-sm" style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }} title="Edit Result">✏️</Link>
                        <button
                          onClick={() => handleRevoke(s.id, s.result?.status || '')}
                          disabled={revokingId === s.id}
                          className="btn-sm"
                          style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem', border: '1.5px solid #d97706', background: 'transparent', color: '#d97706', borderRadius: '0.375rem', cursor: 'pointer' }}
                          title={s.result?.status === 'REVOKED' ? 'Restore Result' : 'Revoke Result'}
                        >
                          {revokingId === s.id ? '⏳' : s.result?.status === 'REVOKED' ? '↩' : '🚫'}
                        </button>
                        <a href={`/api/pdf/${s.rollNumber}`} target="_blank" className="btn-sm" style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem', border: '1.5px solid #059669', background: 'transparent', color: '#059669', borderRadius: '0.375rem', textDecoration: 'none' }} title="Download Official PDF">📄</a>
                        <button
                          onClick={() => handleDelete(s.id, s.name)}
                          disabled={deletingId === s.id}
                          className="btn-danger btn-sm"
                          style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                          title="Delete Record"
                        >
                          {deletingId === s.id ? '⏳' : '🗑'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary btn-sm">← Prev</button>
            <span style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: '#64748b' }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-secondary btn-sm">Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}
