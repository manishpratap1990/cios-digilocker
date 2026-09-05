'use client'

import { useState, useRef } from 'react'
import type { StudentImportData, ValidationError } from '@/lib/excel'

type ImportStep = 'upload' | 'preview' | 'confirm' | 'done'

export default function ImportPage() {
  const [step, setStep] = useState<ImportStep>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [students, setStudents] = useState<StudentImportData[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) {
      setFile(f)
      setError('')
    }
  }

  const handlePreview = async () => {
    if (!file) { setError('Please select an Excel or CSV file first.'); return }
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/import?action=preview', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Preview failed')
      setStudents(data.students)
      setValidationErrors(data.errors || [])
      setStep('preview')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmImport = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/import?action=confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Import failed')
      setImportResult(data)
      setStep('done')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStep('upload')
    setFile(null)
    setStudents([])
    setValidationErrors([])
    setImportResult(null)
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div>
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '0.25rem' }}>Import Student Results</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Upload CSV or Excel sheet to bulk import student results with marks</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <a
            href="/CIOS-Result-Import-Template.csv"
            download="CIOS-Result-Import-Template.csv"
            className="btn-primary btn-sm"
            id="download-csv-template-btn"
            style={{ background: '#059669', boxShadow: 'none', textDecoration: 'none' }}
          >
            📄 Download CSV Template
          </a>
          <a
            href="/CIOS-Result-Import-Template.xlsx"
            download="CIOS-Result-Import-Template.xlsx"
            className="btn-secondary btn-sm"
            id="download-template-btn"
            style={{ textDecoration: 'none' }}
          >
            📊 Download Excel Template
          </a>
        </div>
      </div>

      {/* Progress steps */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', overflowX: 'auto' }}>
          {(['upload', 'preview', 'confirm', 'done'] as ImportStep[]).map((s, idx) => {
            const labels = ['1. Upload File', '2. Preview Data', '3. Confirm Import', '4. Complete']
            const isActive = step === s
            const isDone = ['upload', 'preview', 'confirm', 'done'].indexOf(step) > idx
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: idx < 3 ? 1 : undefined }}>
                <div style={{
                  padding: '0.5rem 1rem', borderRadius: '9999px', fontSize: '0.8125rem', fontWeight: 600, whiteSpace: 'nowrap',
                  background: isActive ? '#1e3a5f' : isDone ? '#d1fae5' : '#f1f5f9',
                  color: isActive ? 'white' : isDone ? '#065f46' : '#94a3b8',
                }}>
                  {labels[idx]}
                </div>
                {idx < 3 && <div style={{ flex: 1, height: '2px', background: isDone ? '#059669' : '#e2e8f0', minWidth: '20px' }} />}
              </div>
            )
          })}
        </div>
      </div>

      {/* Step: Upload */}
      {step === 'upload' && (
        <div className="card">
          <h2 style={{ fontWeight: 700, color: '#1e3a5f', marginBottom: '0.5rem' }}>Upload CSV or Excel File</h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Supported formats: <strong>.csv</strong> (Comma Separated Values) and <strong>.xlsx / .xls</strong> (Microsoft Excel).
          </p>

          <div
            style={{
              border: '2px dashed', borderColor: file ? '#059669' : '#cbd5e1',
              borderRadius: '1rem', padding: '2.5rem', textAlign: 'center',
              background: file ? '#f0fdf4' : '#f8fafc',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const f = e.dataTransfer.files[0]
              if (f) setFile(f)
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{file ? '✅' : '📁'}</div>
            <div style={{ fontWeight: 600, color: file ? '#059669' : '#64748b', marginBottom: '0.25rem' }}>
              {file ? file.name : 'Click or drag & drop your CSV or Excel file here'}
            </div>
            {file && (
              <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{(file.size / 1024).toFixed(1)} KB</div>
            )}
            <input
              ref={fileInputRef}
              id="import-file-input"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#dc2626', marginTop: '1rem', fontSize: '0.875rem' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button id="preview-btn" onClick={handlePreview} className="btn-primary" disabled={!file || loading}>
              {loading ? '⏳ Processing File...' : '▶ Preview & Validate Data'}
            </button>
          </div>
        </div>
      )}

      {/* Step: Preview */}
      {step === 'preview' && (
        <div>
          {validationErrors.length > 0 && (
            <div className="card" style={{ marginBottom: '1.25rem', borderLeft: '4px solid #dc2626' }}>
              <h3 style={{ color: '#dc2626', fontWeight: 700, marginBottom: '0.75rem' }}>⚠️ {validationErrors.length} Validation Warning(s)</h3>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {validationErrors.map((err, i) => (
                  <div key={i} style={{ padding: '0.375rem 0', borderBottom: '1px solid #fee2e2', fontSize: '0.8125rem', color: '#dc2626' }}>
                    Row {err.row} | Roll {err.rollNumber} | {err.field}: {err.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.25rem' }}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontWeight: 700, color: '#1e3a5f' }}>Preview — {students.length} Student Record(s)</h2>
            </div>
            <div className="table-container" style={{ borderRadius: 0, border: 'none', maxHeight: '500px', overflowY: 'auto' }}>
              <table>
                <thead style={{ position: 'sticky', top: 0 }}>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>S.No.</th>
                    <th>Name</th>
                    <th>Roll No.</th>
                    <th>Class</th>
                    <th>Year</th>
                    <th>Stream</th>
                    <th>Centre Name</th>
                    <th style={{ textAlign: 'center' }}>Subjects</th>
                    <th style={{ textAlign: 'center' }}>Total Marks</th>
                    <th style={{ textAlign: 'center' }}>Percentage</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => (
                    <tr key={i}>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{s.serialNo ?? (i + 1)}</td>
                      <td style={{ fontWeight: 600, color: '#1e293b' }}>{s.name}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#1d4ed8' }}>{s.rollNumber}</td>
                      <td>Class {s.class}th</td>
                      <td>{s.academicYear}</td>
                      <td>{s.stream || '—'}</td>
                      <td style={{ fontSize: '0.85rem', color: '#475569' }}>{s.centreName || '—'}</td>
                      <td style={{ textAlign: 'center' }}>{s.subjects.length}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{s.result.totalObtained}/{s.result.totalMax}</td>
                      <td style={{ textAlign: 'center', fontWeight: 700 }}>{s.result.percentage.toFixed(1)}%</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${s.result.status === 'PASS' ? 'badge-success' : 'badge-danger'}`}>
                          {s.result.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#dc2626', marginBottom: '1rem', fontSize: '0.875rem' }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
            <button onClick={reset} className="btn-secondary">← Re-upload</button>
            <button id="confirm-import-btn" onClick={handleConfirmImport} className="btn-primary" disabled={loading || students.length === 0}>
              {loading ? '⏳ Importing Data...' : `✅ Confirm & Import (${students.length} Students)`}
            </button>
          </div>
        </div>
      )}

      {/* Step: Done */}
      {step === 'done' && importResult && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
          <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '0.75rem' }}>Import Completed!</h2>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669' }}>{importResult.imported}</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Imported Successfully</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#d97706' }}>{importResult.skipped}</div>
              <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Skipped (Existing Roll No)</div>
            </div>
          </div>

          {importResult.errors.length > 0 && (
            <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '0.625rem', padding: '0.875rem', textAlign: 'left', marginBottom: '1.5rem' }}>
              <div style={{ fontWeight: 600, color: '#92400e', marginBottom: '0.5rem' }}>Notes:</div>
              {importResult.errors.map((e, i) => (
                <div key={i} style={{ fontSize: '0.8125rem', color: '#92400e' }}>{e}</div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={reset} className="btn-secondary">Import Another File</button>
            <a href="/admin/students" className="btn-primary" style={{ display: 'inline-flex' }}>View All Students →</a>
          </div>
        </div>
      )}
    </div>
  )
}
