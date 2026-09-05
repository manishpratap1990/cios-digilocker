import { prisma } from '@/lib/prisma'
import {
  INSTITUTE_NAME_EN,
  INSTITUTE_DOMAIN,
  GAZETTE_BLUE_1,
  GAZETTE_BLUE_2,
  GAZETTE_GOVT_REGT,
  GAZETTE_RED_TITLE,
  GAZETTE_RED_LINE_1,
  GAZETTE_RED_LINE_2,
  INSTITUTE_ADDRESS,
  SITE_NAME,
} from '@/lib/constants'

type Params = { rollNumber: string }

export async function GET(
  _req: Request,
  { params }: { params: Promise<Params> }
) {
  const { rollNumber } = await params

  try {
    const student = await prisma.student.findUnique({
      where: { rollNumber: decodeURIComponent(rollNumber) },
      include: { subjects: true, result: true },
    })

    if (!student || !student.result) {
      return Response.json({ error: 'Result not found' }, { status: 404 })
    }

    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    const result = student.result

    // ─── Top Gazette Bar ────────────────────────────────────────
    doc.setFillColor(250, 250, 250)
    doc.rect(0, 0, 210, 12, 'F')
    doc.setDrawColor(203, 213, 225)
    doc.line(0, 12, 210, 12)

    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(27, 54, 93) // Dark blue
    doc.text(`${GAZETTE_BLUE_1}  |  ${GAZETTE_BLUE_2}`, 10, 4.5)
    doc.text(`${GAZETTE_GOVT_REGT}  |  ${INSTITUTE_DOMAIN}`, 200, 4.5, { align: 'right' })

    doc.setFontSize(6.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(194, 34, 41) // Red
    doc.text(`${GAZETTE_RED_TITLE} ${GAZETTE_RED_LINE_1}`, 105, 8.5, { align: 'center' })

    // ─── Main Header Banner ─────────────────────────────────────
    doc.setFillColor(255, 255, 255)
    doc.rect(0, 10, 210, 35, 'F')

    // Embed Official Logo Image
    try {
      const fs = await import('fs')
      const path = await import('path')
      const logoPath = path.join(process.cwd(), 'public', 'logo.png')
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath)
        const logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`
        doc.addImage(logoBase64, 'PNG', 12, 12, 22, 22)
      }
    } catch {
      // fallback if file not readable
    }

    // English Institution Name
    doc.setTextColor(29, 78, 216)
    doc.setFontSize(12.5)
    doc.setFont('helvetica', 'bold')
    doc.text(INSTITUTE_NAME_EN, 115, 20, { align: 'center' })

    // Address
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(71, 85, 105)
    doc.text(INSTITUTE_ADDRESS, 115, 27, { align: 'center' })

    // Sub-banner with Site Name
    doc.setFillColor(30, 58, 95)
    doc.rect(0, 36, 210, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9.5)
    doc.setFont('helvetica', 'bold')
    doc.text(`STATEMENT OF MARKS — ${student.academicYear} (${SITE_NAME})`, 105, 42.5, { align: 'center' })

    // ─── Student Info Box ───────────────────────────────────────
    doc.setTextColor(30, 41, 59)
    doc.setFontSize(9)

    const infoY = 53
    const infoData: [string, string, string, string][] = [
      ['Student Name', student.name, 'Roll Number', student.rollNumber],
      ['Guardian Name', student.guardianName || '—', 'Registration No.', student.regNumber || '—'],
      ['Class', `Class ${student.class}th`, 'Academic Session', student.academicYear],
      ['Centre Name', student.centreName || '—', 'Stream', student.stream || 'General'],
    ]
    if (student.serialNo) {
      infoData.push([
        'Serial Number', `#${student.serialNo}`, '', '',
      ])
    }

    infoData.forEach((row, i) => {
      const y = infoY + i * 6.5
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(100, 116, 139)
      doc.text(row[0] + ':', 15, y)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(15, 23, 42)
      doc.text(row[1], 50, y)

      if (row[2]) {
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(100, 116, 139)
        doc.text(row[2] + ':', 115, y)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(15, 23, 42)
        doc.text(row[3], 155, y)
      }
    })

    const tableStartY = infoY + infoData.length * 6.5 + 4

    const hasPracticals = student.subjects.some(s => (s.practicalMarks && s.practicalMarks > 0) || (s.theoryMarks && s.theoryMarks > 0))

    const headRow = hasPracticals
      ? [['S.N.', 'Subject Name', 'Max. Marks', 'Min. Marks', 'Theory', 'Practical', 'Obtained', 'Status']]
      : [['S.N.', 'Subject Name', 'Max. Marks', 'Min. Marks', 'Obtained Marks', 'Status']]

    const bodyRows = student.subjects.map((s, idx) => {
      const passed = s.obtainedMarks >= s.minMarks
      if (hasPracticals) {
        return [
          String(idx + 1),
          s.subjectName,
          String(s.maxMarks),
          String(s.minMarks),
          String(s.theoryMarks ?? '—'),
          String(s.practicalMarks ?? '—'),
          String(s.obtainedMarks),
          passed ? 'PASS' : 'FAIL',
        ]
      }
      return [
        String(idx + 1),
        s.subjectName,
        String(s.maxMarks),
        String(s.minMarks),
        String(s.obtainedMarks),
        passed ? 'PASS' : 'FAIL',
      ]
    })

    // ─── Marks Table ──────────────────────────────────────────
    autoTable(doc, {
      startY: tableStartY,
      head: headRow,
      body: bodyRows,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [30, 58, 95] as [number, number, number], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { cellWidth: hasPracticals ? 55 : 75 },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center', fontStyle: 'bold' },
        6: { halign: 'center' },
        7: { halign: 'center' },
      },
      alternateRowStyles: { fillColor: [248, 250, 252] as [number, number, number] },
    })

    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7

    // ─── Summary ──────────────────────────────────────────────
    doc.setFillColor(248, 250, 252)
    doc.roundedRect(15, finalY, 180, 26, 2, 2, 'F')
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(15, finalY, 180, 26, 2, 2, 'D')

    const summaryItems: [string, string][] = [
      ['Total Marks', String(result.totalObtained)],
      ['Maximum', String(result.totalMax)],
      ['Percentage', `${result.percentage.toFixed(2)}%`],
      ['Grade', result.grade],
      ['Division', result.division],
    ]

    summaryItems.forEach(([label, value], i) => {
      const x = 20 + i * 36
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(100, 116, 139)
      doc.setFontSize(7)
      doc.text(label.toUpperCase(), x, finalY + 7)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(30, 58, 95)
      doc.setFontSize(11)
      doc.text(value, x, finalY + 17)
    })

    // Result status badge
    const statusY = finalY + 31
    const isPassed = result.status === 'PASS'
    doc.setFillColor(isPassed ? 5 : 220, isPassed ? 150 : 38, isPassed ? 105 : 38)
    doc.roundedRect(75, statusY, 60, 10, 2, 2, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10.5)
    doc.setFont('helvetica', 'bold')
    doc.text(result.status, 105, statusY + 7, { align: 'center' })

    // ─── Footer ───────────────────────────────────────────────
    const footerY = statusY + 16
    doc.setTextColor(100, 116, 139)
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    const issueDateStr = new Date(result.issueDate).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric',
    })
    doc.text(`Date of Issue: ${issueDateStr}`, 15, footerY)
    doc.text(`Unique Digital ID: ${result.resultId}`, 15, footerY + 4.5)
    doc.text('This is a verified computer-generated mark sheet issued by CIOS Digilocker.', 105, footerY + 9, { align: 'center' })

    // Bottom strip
    doc.setFillColor(30, 58, 95)
    doc.rect(0, 287, 210, 10, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(7.5)
    doc.text(`${SITE_NAME} — ${INSTITUTE_NAME_EN}`, 105, 293.5, { align: 'center' })

    const pdfArrayBuffer = doc.output('arraybuffer')

    return new Response(pdfArrayBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CIOS-Result-${student.rollNumber}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF error:', error)
    return Response.json({ error: 'PDF generation failed: ' + (error as Error).message }, { status: 500 })
  }
}
