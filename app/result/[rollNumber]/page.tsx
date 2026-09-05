import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ResultDisplay from './ResultDisplay'

interface Props {
  params: Promise<{ rollNumber: string }>
}

export async function generateMetadata({ params }: Props) {
  const { rollNumber } = await params
  return {
    title: `Result — Roll No. ${rollNumber} | Government Inter College`,
  }
}

export default async function ResultPage({ params }: Props) {
  const { rollNumber } = await params

  const student = await prisma.student.findUnique({
    where: { rollNumber: decodeURIComponent(rollNumber) },
    include: {
      subjects: true,
      result: true,
    },
  })

  if (!student || !student.result) {
    notFound()
  }

  return <ResultDisplay student={student as Parameters<typeof ResultDisplay>[0]['student']} />
}
