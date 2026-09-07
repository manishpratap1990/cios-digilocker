import { parseExcel, groupByRollNumber, validateImportData, generateTemplate, generateCsvTemplate, type StudentImportData } from '@/lib/excel'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// POST /api/import - parse and preview
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action') // 'preview' | 'confirm'

  try {
    if (action === 'preview') {
      await requireAdmin()
      const formData = await request.formData()
      const file = formData.get('file') as File
      if (!file) return Response.json({ error: 'No file provided' }, { status: 400 })
      if (file.size > MAX_FILE_SIZE) return Response.json({ error: 'File too large. Max 10MB allowed.' }, { status: 413 })

      const buffer = Buffer.from(await file.arrayBuffer())
      const rows = parseExcel(buffer)
      const grouped = groupByRollNumber(rows)
      const errors = validateImportData(grouped)

      return Response.json({ students: grouped, errors, totalRows: rows.length, totalStudents: grouped.length })
    }

    if (action === 'confirm') {
      await requireAdmin()
      const body = await request.json() as { students: StudentImportData[] }
      const { students } = body

      const errors: string[] = []
      let imported = 0
      let skipped = 0

      for (const student of students) {
        try {
          const existing = await prisma.student.findUnique({ where: { rollNumber: student.rollNumber } })
          if (existing) {
            skipped++
            errors.push(`Roll ${student.rollNumber} already exists — skipped`)
            continue
          }

          await prisma.student.create({
            data: {
              serialNo: student.serialNo ? Number(student.serialNo) : null,
              name: student.name,
              guardianName: student.guardianName,
              dateOfBirth: student.dateOfBirth,
              gender: student.gender,
              rollNumber: student.rollNumber,
              regNumber: student.regNumber,
              class: student.class,
              academicYear: student.academicYear,
              stream: student.stream,
              centreName: student.centreName,
              subjects: {
                create: student.subjects.map((s) => ({
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
                  totalObtained: student.result.totalObtained,
                  totalMax: student.result.totalMax,
                  percentage: student.result.percentage,
                  status: student.result.status,
                  grade: student.result.grade,
                  division: student.result.division,
                },
              },
            },
          })
          imported++
        } catch (err) {
          errors.push(`Roll ${student.rollNumber}: Import failed`)
          console.error(err)
        }
      }

      return Response.json({ imported, skipped, errors })
    }

    return Response.json({ error: 'Invalid action. Use ?action=preview or ?action=confirm' }, { status: 400 })
  } catch (error) {
    console.error('Import error:', error)
    return Response.json({ error: 'Import failed: ' + (error as Error).message }, { status: 500 })
  }
}

// GET /api/import?action=template | template-csv - download templates
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (action === 'template-csv' || action === 'csv') {
    const csvContent = generateCsvTemplate()
    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="CIOS-Result-Import-Template.csv"',
      },
    })
  }

  if (action === 'template' || action === 'template-xlsx' || action === 'xlsx') {
    const buffer = generateTemplate()
    return new Response(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="CIOS-Result-Import-Template.xlsx"',
      },
    })
  }

  return Response.json({ error: 'Unknown action' }, { status: 400 })
}
