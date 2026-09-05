import { prisma } from '@/lib/prisma'

// GET /api/results?rollNumber=1001
// GET /api/results?search=name&page=1&limit=20 (admin)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const rollNumber = searchParams.get('rollNumber')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '20')
  const skip = (page - 1) * limit

  try {
    if (rollNumber) {
      // Student lookup - single result
      const student = await prisma.student.findUnique({
        where: { rollNumber },
        include: {
          subjects: true,
          result: true,
        },
      })

      if (!student) {
        return Response.json({ error: 'No result found for this roll number.' }, { status: 404 })
      }

      return Response.json({ student })
    }

    // Admin - list all with optional search
    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { rollNumber: { contains: search } },
            { regNumber: { contains: search } },
            { centreName: { contains: search } },
          ],
        }
      : {}

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        include: { result: true },
        orderBy: [{ serialNo: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.student.count({ where }),
    ])

    return Response.json({ students, total, page, limit, pages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Results GET error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/results - Add result manually (admin)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      serialNo, name, guardianName, dateOfBirth, gender,
      rollNumber, regNumber, cls, academicYear, stream, centreName,
      subjects,
    } = body

    if (!name || !rollNumber || !cls || !academicYear || !subjects?.length) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check duplicate
    const existing = await prisma.student.findUnique({ where: { rollNumber } })
    if (existing) {
      return Response.json({ error: `Roll number ${rollNumber} already exists` }, { status: 409 })
    }

    const { calculateResult } = await import('@/lib/constants')
    const resultData = calculateResult(subjects)

    const student = await prisma.student.create({
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
          create: {
            totalObtained: resultData.totalObtained,
            totalMax: resultData.totalMax,
            percentage: resultData.percentage,
            status: resultData.status,
            grade: resultData.grade,
            division: resultData.division,
          },
        },
      },
      include: { subjects: true, result: true },
    })

    return Response.json({ student }, { status: 201 })
  } catch (error) {
    console.error('Results POST error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
