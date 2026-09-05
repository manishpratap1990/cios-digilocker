import { prisma } from '@/lib/prisma'

type Params = { resultId: string }

// GET /api/verify/[resultId]
export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> }
) {
  const { resultId } = await params
  try {
    const result = await prisma.result.findUnique({
      where: { resultId },
      include: { student: true },
    })

    if (!result) {
      return Response.json({ error: 'Result not found' }, { status: 404 })
    }

    return Response.json({
      valid: result.status !== 'REVOKED',
      status: result.status,
      studentName: result.student.name,
      rollNumber: result.student.rollNumber,
      class: result.student.class,
      academicYear: result.student.academicYear,
      stream: result.student.stream,
      percentage: result.percentage,
      grade: result.grade,
      issueDate: result.issueDate,
      revokedAt: result.revokedAt,
    })
  } catch (error) {
    console.error('Verify error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
