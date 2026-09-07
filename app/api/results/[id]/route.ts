import { prisma } from '@/lib/prisma'
import { calculateResult } from '@/lib/constants'
import { requireAdmin } from '@/lib/auth'

type Params = { id: string }

// GET /api/results/[id]
export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> }
) {
  const { id } = await params
  try {
    await requireAdmin()
    const student = await prisma.student.findUnique({
      where: { id },
      include: { subjects: true, result: true },
    })
    if (!student) return Response.json({ error: 'Not found' }, { status: 404 })
    return Response.json({ student })
  } catch (e: unknown) {
    if ((e as Error).message === 'Unauthorized') return Response.json({ error: 'Unauthorized' }, { status: 401 })
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/results/[id] - edit student + recalculate result
export async function PUT(
  request: Request,
  { params }: { params: Promise<Params> }
) {
  const { id } = await params
  try {
    await requireAdmin()
    const body = await request.json()
    const { serialNo, name, guardianName, dateOfBirth, gender, rollNumber, regNumber, cls, academicYear, stream, centreName, subjects } = body

    // Delete old subjects and recreate
    await prisma.subject.deleteMany({ where: { studentId: id } })

    const resultData = calculateResult(subjects)

    const updated = await prisma.student.update({
      where: { id },
      data: {
        serialNo: serialNo ? Number(serialNo) : null,
        name,
        guardianName,
        dateOfBirth,
        gender,
        rollNumber,
        regNumber,
        class: cls,
        academicYear,
        stream,
        centreName,
        subjects: {
          create: subjects.map((s: { subjectName: string; theoryMarks?: number; practicalMarks?: number; minMarks: number; maxMarks: number; obtainedMarks: number }) => ({
            subjectName: s.subjectName,
            theoryMarks: s.theoryMarks !== undefined ? Number(s.theoryMarks) : 0,
            practicalMarks: s.practicalMarks !== undefined ? Number(s.practicalMarks) : 0,
            minMarks: Number(s.minMarks),
            maxMarks: Number(s.maxMarks),
            obtainedMarks: Number(s.obtainedMarks),
          })),
        },
        result: {
          upsert: {
            create: {
              totalObtained: resultData.totalObtained,
              totalMax: resultData.totalMax,
              percentage: resultData.percentage,
              status: resultData.status,
              grade: resultData.grade,
              division: resultData.division,
            },
            update: {
              totalObtained: resultData.totalObtained,
              totalMax: resultData.totalMax,
              percentage: resultData.percentage,
              status: resultData.status,
              grade: resultData.grade,
              division: resultData.division,
            },
          },
        },
      },
      include: { subjects: true, result: true },
    })

    return Response.json({ student: updated })
  } catch (error) {
    console.error('PUT error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/results/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<Params> }
) {
  const { id } = await params
  try {
    await requireAdmin()
    await prisma.student.delete({ where: { id } })
    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
