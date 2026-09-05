import ResultForm from '@/app/admin/_components/ResultForm'

export const metadata = { title: 'Add Result | Admin Panel' }

export default function NewResultPage() {
  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '0.25rem' }}>Add New Result</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Manually enter student marks and result data</p>
      </div>
      <ResultForm mode="create" />
    </div>
  )
}
