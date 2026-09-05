'use client'

import ResultForm from '@/app/admin/_components/ResultForm'

interface Subject {
  subjectName: string
  minMarks: number
  maxMarks: number
  obtainedMarks: number
}

interface Student {
  id: string
  name: string
  guardianName?: string | null
  dateOfBirth?: string | null
  gender?: string | null
  rollNumber: string
  regNumber?: string | null
  class: string
  academicYear: string
  stream?: string | null
  subjects: Subject[]
}

export default function EditResultClient({ student }: { student: Student }) {
  return (
    <ResultForm
      mode="edit"
      initialData={{
        id: student.id,
        name: student.name,
        guardianName: student.guardianName || '',
        dateOfBirth: student.dateOfBirth || '',
        gender: student.gender || '',
        rollNumber: student.rollNumber,
        regNumber: student.regNumber || '',
        cls: student.class,
        academicYear: student.academicYear,
        stream: student.stream || '',
        subjects: student.subjects.map((s) => ({
          subjectName: s.subjectName,
          minMarks: s.minMarks,
          maxMarks: s.maxMarks,
          obtainedMarks: s.obtainedMarks,
        })),
      }}
    />
  )
}
