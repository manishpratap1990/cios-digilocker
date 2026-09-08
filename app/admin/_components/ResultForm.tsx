'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CLASSES, ACADEMIC_YEARS, STREAMS, getSubjects } from '@/lib/constants'

interface Subject {
  subjectName: string
  theoryMarks?: number
  practicalMarks?: number
  minMarks: number
  maxMarks: number
  obtainedMarks: number
}

interface FormData {
  serialNo?: number | string
  name: string
  guardianName: string
  dateOfBirth: string
  gender: string
  rollNumber: string
  regNumber: string
  class?: string
  cls: string
  academicYear: string
  stream: string
  centreName: string
  subjects: Subject[]
}

interface Props {
  initialData?: Partial<FormData> & { id?: string; class?: string; cls?: string }
  mode: 'create' | 'edit'
}

export default function ResultForm({ initialData, mode }: Props) {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({
    serialNo: initialData?.serialNo ?? '',
    name: initialData?.name || '',
    guardianName: initialData?.guardianName || '',
    dateOfBirth: initialData?.dateOfBirth || '',
    gender: initialData?.gender || '',
    rollNumber: initialData?.rollNumber || '',
    regNumber: initialData?.regNumber || '',
    class: initialData?.class || initialData?.cls || '10',
    cls: initialData?.cls || initialData?.class || '10',
    academicYear: initialData?.academicYear || '2024-25',
    stream: initialData?.stream || '',
    centreName: initialData?.centreName || '',
    subjects: initialData?.subjects || [],
  })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const subjectList = getSubjects(form.cls, form.cls === '12' ? form.stream : undefined)

  // When class/stream changes, rebuild default subjects on create
  useEffect(() => {
    if (mode === 'create') {
      const newSubjects = subjectList.map((name) => ({
        subjectName: name,
        theoryMarks: 0,
        practicalMarks: 0,
        minMarks: 33,
        maxMarks: 100,
        obtainedMarks: 0,
      }))
      setForm((f) => ({ ...f, subjects: newSubjects }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.cls, form.stream])

  const updateSubject = (idx: number, field: keyof Subject, value: string | number) => {
    setForm((f) => {
      const updated = f.subjects.map((s, i) => {
        if (i !== idx) return s
        const numVal = typeof value === 'string' && field !== 'subjectName' ? Number(value) : (value as number)
        const newSubj = { ...s, [field]: numVal }

        // If theory or practical marks changed, auto-update total obtained marks
        if (field === 'theoryMarks' || field === 'practicalMarks') {
          const th = field === 'theoryMarks' ? numVal : (s.theoryMarks || 0)
          const pr = field === 'practicalMarks' ? numVal : (s.practicalMarks || 0)
          newSubj.obtainedMarks = (Number(th) || 0) + (Number(pr) || 0)
        }

        return newSubj
      })
      return { ...f, subjects: updated }
    })
  }

  const addSubjectRow = () => {
    setForm((f) => ({
      ...f,
      subjects: [
        ...f.subjects,
        {
          subjectName: '',
          theoryMarks: 0,
          practicalMarks: 0,
          minMarks: 33,
          maxMarks: 100,
          obtainedMarks: 0,
        },
      ],
    }))
  }

  const removeSubjectRow = (idx: number) => {
    setForm((f) => ({
      ...f,
      subjects: f.subjects.filter((_, i) => i !== idx),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const url = mode === 'edit' ? `/api/results/${initialData?.id}` : '/api/results'
      const method = mode === 'edit' ? 'PUT' : 'POST'
      const payload = {
        ...form,
        serialNo: form.serialNo ? Number(form.serialNo) : null,
      }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Save failed')
      } else {
        router.push('/admin/students')
        router.refresh()
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const fieldStyle = { marginBottom: '1rem' }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.625rem', padding: '0.875rem 1rem', color: '#dc2626', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Student Info */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h2 style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>Student Information</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={fieldStyle}>
            <label className="form-label">Serial Number (S.No.)</label>
            <input
              type="number"
              className="form-input"
              value={form.serialNo}
              onChange={(e) => setForm((f) => ({ ...f, serialNo: e.target.value }))}
              placeholder="e.g. 1"
            />
          </div>
          <div style={fieldStyle}>
            <label className="form-label">Student Name *</label>
            <input className="form-input" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Full name" />
          </div>
          <div style={fieldStyle}>
            <label className="form-label">Father / Guardian Name</label>
            <input className="form-input" value={form.guardianName} onChange={(e) => setForm((f) => ({ ...f, guardianName: e.target.value }))} placeholder="Father/Mother/Guardian" />
          </div>
          <div style={fieldStyle}>
            <label className="form-label">Roll Number *</label>
            <input className="form-input" required value={form.rollNumber} onChange={(e) => setForm((f) => ({ ...f, rollNumber: e.target.value }))} placeholder="e.g. 1001" />
          </div>
          <div style={fieldStyle}>
            <label className="form-label">Registration Number</label>
            <input className="form-input" value={form.regNumber} onChange={(e) => setForm((f) => ({ ...f, regNumber: e.target.value }))} placeholder="e.g. CIOS/2024/1001" />
          </div>
          <div style={fieldStyle}>
            <label className="form-label">Centre Name / Study Centre</label>
            <input className="form-input" value={form.centreName} onChange={(e) => setForm((f) => ({ ...f, centreName: e.target.value }))} placeholder="e.g. CIOS Regional Centre, Delhi" />
          </div>
          <div style={fieldStyle}>
            <label className="form-label">Date of Birth</label>
            <input type="date" className="form-input" value={form.dateOfBirth} onChange={(e) => setForm((f) => ({ ...f, dateOfBirth: e.target.value }))} />
          </div>
          <div style={fieldStyle}>
            <label className="form-label">Gender</label>
            <select className="form-input" value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div style={fieldStyle}>
            <label className="form-label">Class *</label>
            <select className="form-input" required value={form.cls} onChange={(e) => setForm((f) => ({ ...f, cls: e.target.value, stream: '' }))}>
              {CLASSES.map((c) => <option key={c} value={c}>Class {c}th</option>)}
            </select>
          </div>
          <div style={fieldStyle}>
            <label className="form-label">Academic Year (2012–2027) *</label>
            <select className="form-input" required value={form.academicYear} onChange={(e) => setForm((f) => ({ ...f, academicYear: e.target.value }))}>
              {ACADEMIC_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {form.cls === '12' && (
            <div style={fieldStyle}>
              <label className="form-label">Stream *</label>
              <select className="form-input" required value={form.stream} onChange={(e) => setForm((f) => ({ ...f, stream: e.target.value }))}>
                <option value="">Select Stream</option>
                {STREAMS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Marks Section */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ fontWeight: 700, color: '#1e3a5f' }}>Subject-wise Marks (Theory + Practical)</h2>
          <button type="button" onClick={addSubjectRow} className="btn-secondary btn-sm">
            ➕ Add Subject
          </button>
        </div>

        {form.subjects.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', padding: '1rem' }}>
            {form.cls === '12' && !form.stream ? 'Please select a stream (Science, Arts, Commerce) to load subjects.' : 'No subjects added. Click "Add Subject" above.'}
          </p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '45px', textAlign: 'center' }}>S.No.</th>
                  <th>Subject Name</th>
                  <th style={{ textAlign: 'center', width: '110px' }}>Theory Marks</th>
                  <th style={{ textAlign: 'center', width: '110px' }}>Practical Marks</th>
                  <th style={{ textAlign: 'center', width: '100px' }}>Min. Marks</th>
                  <th style={{ textAlign: 'center', width: '100px' }}>Max. Marks</th>
                  <th style={{ textAlign: 'center', width: '120px' }}>Total Obtained</th>
                  <th style={{ textAlign: 'center', width: '60px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {form.subjects.map((subj, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>
                      {idx + 1}
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        style={{ padding: '0.45rem 0.65rem' }}
                        value={subj.subjectName}
                        onChange={(e) => updateSubject(idx, 'subjectName', e.target.value)}
                        placeholder="Subject name"
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        style={{ textAlign: 'center', padding: '0.45rem' }}
                        value={subj.theoryMarks ?? ''}
                        onChange={(e) => updateSubject(idx, 'theoryMarks', e.target.value)}
                        min={0}
                        max={subj.maxMarks}
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        style={{ textAlign: 'center', padding: '0.45rem' }}
                        value={subj.practicalMarks ?? ''}
                        onChange={(e) => updateSubject(idx, 'practicalMarks', e.target.value)}
                        min={0}
                        max={subj.maxMarks}
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        style={{ textAlign: 'center', padding: '0.45rem' }}
                        value={subj.minMarks}
                        onChange={(e) => updateSubject(idx, 'minMarks', e.target.value)}
                        min={0}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        style={{ textAlign: 'center', padding: '0.45rem' }}
                        value={subj.maxMarks}
                        onChange={(e) => updateSubject(idx, 'maxMarks', e.target.value)}
                        min={1}
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        style={{ textAlign: 'center', padding: '0.45rem', fontWeight: 800, color: '#1e3a5f', background: '#f8fafc' }}
                        value={subj.obtainedMarks}
                        onChange={(e) => updateSubject(idx, 'obtainedMarks', e.target.value)}
                        min={0}
                        max={subj.maxMarks}
                        required
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => removeSubjectRow(idx)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem' }}
                        title="Delete Subject"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
        <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        <button id="save-result-btn" type="submit" className="btn-primary" disabled={saving}>
          {saving ? '⏳ Saving...' : mode === 'edit' ? '💾 Update Result' : '✅ Create Result'}
        </button>
      </div>
    </form>
  )
}
