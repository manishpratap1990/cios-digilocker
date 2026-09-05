import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import EditResultClient from './EditResultClient'

interface Props {
  params: Promise<{ id: string }>
}

export const metadata = { title: 'Edit Result | Admin Panel' }

export default async function EditResultPage({ params }: Props) {
  const { id } = await params

  const student = await prisma.student.findUnique({
    where: { id },
    include: { subjects: true },
  })

  if (!student) notFound()

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: '1.5rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '0.25rem' }}>Edit Result</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Editing result for {student.name} (Roll: {student.rollNumber})</p>
      </div>
      <EditResultClient student={student as Parameters<typeof EditResultClient>[0]['student']} />
    </div>
  )
}
