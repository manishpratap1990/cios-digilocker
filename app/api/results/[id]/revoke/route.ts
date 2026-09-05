import { prisma } from '@/lib/prisma'

type Params = { id: string }

// POST /api/results/[id]/revoke
export async function POST(
  _req: Request,
  { params }: { params: Promise<Params> }
) {
  const { id } = await params
  try {
    const result = await prisma.result.findUnique({ where: { studentId: id } })
    if (!result) return Response.json({ error: 'Result not found' }, { status: 404 })

    const newStatus = result.status === 'REVOKED'
      ? (result.percentage >= 33 ? 'PASS' : 'FAIL')
      : 'REVOKED'

    const updated = await prisma.result.update({
      where: { studentId: id },
      data: {
        status: newStatus,
        revokedAt: newStatus === 'REVOKED' ? new Date() : null,
      },
    })
    return Response.json({ result: updated })
  } catch (error) {
    console.error('Revoke error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
