import * as XLSX from 'xlsx'
import { calculateResult } from './constants'

export interface ExcelRow {
  serialNo?: number
  name: string
  guardianName?: string
  dateOfBirth?: string
  gender?: string
  rollNumber: string
  regNumber?: string
  class: string
  academicYear: string
  stream?: string
  centreName?: string
  subjectName: string
  theoryMarks?: number
  practicalMarks?: number
  minMarks: number
  maxMarks: number
  obtainedMarks: number
}

export interface StudentImportData {
  serialNo?: number
  name: string
  guardianName?: string
  dateOfBirth?: string
  gender?: string
  rollNumber: string
  regNumber?: string
  class: string
  academicYear: string
  stream?: string
  centreName?: string
  subjects: {
    subjectName: string
    theoryMarks?: number
    practicalMarks?: number
    minMarks: number
    maxMarks: number
    obtainedMarks: number
  }[]
  result: {
    totalObtained: number
    totalMax: number
    percentage: number
    status: string
    grade: string
    division: string
  }
}

export interface ValidationError {
  row: number
  rollNumber: string
  field: string
  message: string
}

export function parseExcel(buffer: Buffer): ExcelRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' })

  return rows.map((row) => {
    const rawSrNo = row['Serial No'] || row['Serial Number'] || row['Sr No'] || row['S.No.'] || row['S.No'] || row['Student ID']
    const serialNo = rawSrNo ? Number(rawSrNo) : undefined

    const minMarks = Number(row['Minimum Marks'] || row['Min Marks'] || row['Min. Marks'] || 33)
    const maxMarks = Number(row['Maximum Marks'] || row['Max Marks'] || row['Max. Marks'] || 100)

    const rawTheory = row['Theory Marks'] !== '' && row['Theory Marks'] !== undefined ? Number(row['Theory Marks']) : undefined
    const rawPractical = row['Practical Marks'] !== '' && row['Practical Marks'] !== undefined ? Number(row['Practical Marks']) : (row['Practicals Marks'] !== '' && row['Practicals Marks'] !== undefined ? Number(row['Practicals Marks']) : undefined)

    let obtainedMarks = Number(row['Obtained Marks'] || row['Marks Obtained'] || row['Total Obtained'] || 0)
    if (rawTheory !== undefined || rawPractical !== undefined) {
      obtainedMarks = (rawTheory || 0) + (rawPractical || 0)
    }

    return {
      serialNo: isNaN(Number(serialNo)) ? undefined : serialNo,
      name: String(row['Student Name'] || row['Name'] || '').trim(),
      guardianName: String(row['Father/Mother/Guardian Name'] || row['Guardian Name'] || row['Father Name'] || '').trim() || undefined,
      dateOfBirth: String(row['Date of Birth'] || row['DOB'] || '').trim() || undefined,
      gender: String(row['Gender'] || '').trim() || undefined,
      rollNumber: String(row['Roll Number'] || row['Roll No'] || row['RollNo'] || '').trim(),
      regNumber: String(row['Registration Number'] || row['Reg No'] || row['Reg Number'] || '').trim() || undefined,
      class: String(row['Class'] || '').trim(),
      academicYear: String(row['Academic Year'] || row['Session'] || '').trim(),
      stream: String(row['Stream'] || '').trim() || undefined,
      centreName: String(row['Centre Name'] || row['Center Name'] || row['Exam Centre'] || row['Exam Center'] || row['Study Centre'] || '').trim() || undefined,
      subjectName: String(row['Subject'] || row['Subject Name'] || '').trim(),
      theoryMarks: rawTheory,
      practicalMarks: rawPractical,
      minMarks: isNaN(minMarks) ? 33 : minMarks,
      maxMarks: isNaN(maxMarks) ? 100 : maxMarks,
      obtainedMarks: isNaN(obtainedMarks) ? 0 : obtainedMarks,
    }
  })
}

export function groupByRollNumber(rows: ExcelRow[]): StudentImportData[] {
  const map = new Map<string, StudentImportData>()

  for (const row of rows) {
    if (!row.rollNumber) continue

    if (!map.has(row.rollNumber)) {
      map.set(row.rollNumber, {
        serialNo: row.serialNo,
        name: row.name,
        guardianName: row.guardianName,
        dateOfBirth: row.dateOfBirth,
        gender: row.gender,
        rollNumber: row.rollNumber,
        regNumber: row.regNumber,
        class: row.class,
        academicYear: row.academicYear,
        stream: row.stream,
        centreName: row.centreName,
        subjects: [],
        result: { totalObtained: 0, totalMax: 0, percentage: 0, status: 'FAIL', grade: 'F', division: 'Fail' },
      })
    }

    const student = map.get(row.rollNumber)!
    if (row.serialNo && !student.serialNo) {
      student.serialNo = row.serialNo
    }

    if (row.subjectName) {
      student.subjects.push({
        subjectName: row.subjectName,
        theoryMarks: row.theoryMarks,
        practicalMarks: row.practicalMarks,
        minMarks: row.minMarks,
        maxMarks: row.maxMarks,
        obtainedMarks: row.obtainedMarks,
      })
    }
  }

  // Calculate results
  for (const [, student] of map) {
    student.result = calculateResult(student.subjects)
  }

  return Array.from(map.values())
}

export function validateImportData(data: StudentImportData[]): ValidationError[] {
  const errors: ValidationError[] = []
  const rollNumbers = new Set<string>()

  data.forEach((student, idx) => {
    const row = idx + 2 // 1 for header, 1 for 1-indexed

    if (!student.name) {
      errors.push({ row, rollNumber: student.rollNumber, field: 'name', message: 'Student name is required' })
    }
    if (!student.rollNumber) {
      errors.push({ row, rollNumber: '-', field: 'rollNumber', message: 'Roll number is required' })
    }
    if (!student.class) {
      errors.push({ row, rollNumber: student.rollNumber, field: 'class', message: 'Class is required' })
    }
    if (!['8', '10', '12'].includes(student.class)) {
      errors.push({ row, rollNumber: student.rollNumber, field: 'class', message: `Invalid class "${student.class}". Must be 8, 10, or 12` })
    }
    if (!student.academicYear) {
      errors.push({ row, rollNumber: student.rollNumber, field: 'academicYear', message: 'Academic year is required' })
    }
    if (student.class === '12' && !student.stream) {
      errors.push({ row, rollNumber: student.rollNumber, field: 'stream', message: 'Stream is required for Class 12 (Science, Arts, or Commerce)' })
    }
    if (student.subjects.length === 0) {
      errors.push({ row, rollNumber: student.rollNumber, field: 'subjects', message: 'At least one subject is required' })
    }
    student.subjects.forEach((subj, si) => {
      if (subj.obtainedMarks > subj.maxMarks) {
        errors.push({ row, rollNumber: student.rollNumber, field: `subject[${si}].obtainedMarks`, message: `Obtained marks (${subj.obtainedMarks}) exceeds maximum marks (${subj.maxMarks}) for ${subj.subjectName}` })
      }
      if (subj.obtainedMarks < 0) {
        errors.push({ row, rollNumber: student.rollNumber, field: `subject[${si}].obtainedMarks`, message: `Obtained marks cannot be negative for ${subj.subjectName}` })
      }
    })

    if (rollNumbers.has(student.rollNumber)) {
      errors.push({ row, rollNumber: student.rollNumber, field: 'rollNumber', message: `Duplicate roll number: ${student.rollNumber}` })
    }
    rollNumbers.add(student.rollNumber)
  })

  return errors
}

export function generateTemplate(): Uint8Array {
  const headers = [
    'Serial No', 'Student Name', 'Father/Mother/Guardian Name', 'Date of Birth',
    'Gender', 'Roll Number', 'Registration Number', 'Class', 'Academic Year',
    'Stream', 'Centre Name', 'Subject', 'Theory Marks', 'Practical Marks', 'Minimum Marks', 'Maximum Marks', 'Obtained Marks'
  ]

  const sampleData = [
    // Class 10th sample
    [1, 'Rahul Kumar', 'Ram Kumar', '2008-03-15', 'Male', '1001', 'CIOS/2024/1001', '10', '2024-25', '', 'CIOS Regional Centre, Delhi', 'Hindi', 76, 0, 33, 100, 76],
    [1, 'Rahul Kumar', 'Ram Kumar', '2008-03-15', 'Male', '1001', 'CIOS/2024/1001', '10', '2024-25', '', 'CIOS Regional Centre, Delhi', 'English', 72, 0, 33, 100, 72],
    [1, 'Rahul Kumar', 'Ram Kumar', '2008-03-15', 'Male', '1001', 'CIOS/2024/1001', '10', '2024-25', '', 'CIOS Regional Centre, Delhi', 'Mathematics', 85, 0, 33, 100, 85],
    [1, 'Rahul Kumar', 'Ram Kumar', '2008-03-15', 'Male', '1001', 'CIOS/2024/1001', '10', '2024-25', '', 'CIOS Regional Centre, Delhi', 'Science', 58, 22, 33, 100, 80],
    [1, 'Rahul Kumar', 'Ram Kumar', '2008-03-15', 'Male', '1001', 'CIOS/2024/1001', '10', '2024-25', '', 'CIOS Regional Centre, Delhi', 'Social Science', 74, 0, 33, 100, 74],
    [1, 'Rahul Kumar', 'Ram Kumar', '2008-03-15', 'Male', '1001', 'CIOS/2024/1001', '10', '2024-25', '', 'CIOS Regional Centre, Delhi', 'Drawing', 65, 23, 33, 100, 88],

    // Class 12th Science sample
    [2, 'Priya Sharma', 'Suresh Sharma', '2007-07-22', 'Female', '1002', 'CIOS/2024/1002', '12', '2024-25', 'Science', 'CIOS Study Centre, Lucknow', 'Hindi', 82, 0, 33, 100, 82],
    [2, 'Priya Sharma', 'Suresh Sharma', '2007-07-22', 'Female', '1002', 'CIOS/2024/1002', '12', '2024-25', 'Science', 'CIOS Study Centre, Lucknow', 'English', 86, 0, 33, 100, 86],
    [2, 'Priya Sharma', 'Suresh Sharma', '2007-07-22', 'Female', '1002', 'CIOS/2024/1002', '12', '2024-25', 'Science', 'CIOS Study Centre, Lucknow', 'Physics', 63, 28, 33, 100, 91],
    [2, 'Priya Sharma', 'Suresh Sharma', '2007-07-22', 'Female', '1002', 'CIOS/2024/1002', '12', '2024-25', 'Science', 'CIOS Study Centre, Lucknow', 'Chemistry', 60, 28, 33, 100, 88],
    [2, 'Priya Sharma', 'Suresh Sharma', '2007-07-22', 'Female', '1002', 'CIOS/2024/1002', '12', '2024-25', 'Science', 'CIOS Study Centre, Lucknow', 'Biology', 65, 29, 33, 100, 94],
    [2, 'Priya Sharma', 'Suresh Sharma', '2007-07-22', 'Female', '1002', 'CIOS/2024/1002', '12', '2024-25', 'Science', 'CIOS Study Centre, Lucknow', 'Mathematics', 89, 0, 33, 100, 89],

    // Class 12th Arts sample
    [3, 'Ananya Mishra', 'Rajesh Mishra', '2007-01-30', 'Female', '1005', 'CIOS/2024/1005', '12', '2024-25', 'Arts', 'CIOS Study Centre, Varanasi', 'Hindi', 84, 0, 33, 100, 84],
    [3, 'Ananya Mishra', 'Rajesh Mishra', '2007-01-30', 'Female', '1005', 'CIOS/2024/1005', '12', '2024-25', 'Arts', 'CIOS Study Centre, Varanasi', 'English', 80, 0, 33, 100, 80],
    [3, 'Ananya Mishra', 'Rajesh Mishra', '2007-01-30', 'Female', '1005', 'CIOS/2024/1005', '12', '2024-25', 'Arts', 'CIOS Study Centre, Varanasi', 'History', 88, 0, 33, 100, 88],
    [3, 'Ananya Mishra', 'Rajesh Mishra', '2007-01-30', 'Female', '1005', 'CIOS/2024/1005', '12', '2024-25', 'Arts', 'CIOS Study Centre, Varanasi', 'Sociology', 85, 0, 33, 100, 85],
    [3, 'Ananya Mishra', 'Rajesh Mishra', '2007-01-30', 'Female', '1005', 'CIOS/2024/1005', '12', '2024-25', 'Arts', 'CIOS Study Centre, Varanasi', 'Geography', 58, 24, 33, 100, 82],
    [3, 'Ananya Mishra', 'Rajesh Mishra', '2007-01-30', 'Female', '1005', 'CIOS/2024/1005', '12', '2024-25', 'Arts', 'CIOS Study Centre, Varanasi', 'Civics', 86, 0, 33, 100, 86],
  ]

  const wb = XLSX.utils.book_new()
  const wsData = [headers, ...sampleData]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Column widths
  ws['!cols'] = headers.map((h) => ({ wch: Math.max(h.length + 4, 14) }))

  XLSX.utils.book_append_sheet(wb, ws, 'Results')
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  return new Uint8Array(buf)
}

export function generateCsvTemplate(): string {
  const headers = [
    'Serial No', 'Student Name', 'Father/Mother/Guardian Name', 'Date of Birth',
    'Gender', 'Roll Number', 'Registration Number', 'Class', 'Academic Year',
    'Stream', 'Centre Name', 'Subject', 'Theory Marks', 'Practical Marks', 'Minimum Marks', 'Maximum Marks', 'Obtained Marks'
  ]

  const sampleRows = [
    '1,Rahul Kumar,Ram Kumar,2008-03-15,Male,1001,CIOS/2024/1001,10,2024-25,,CIOS Regional Centre Delhi,Hindi,76,0,33,100,76',
    '1,Rahul Kumar,Ram Kumar,2008-03-15,Male,1001,CIOS/2024/1001,10,2024-25,,CIOS Regional Centre Delhi,English,72,0,33,100,72',
    '1,Rahul Kumar,Ram Kumar,2008-03-15,Male,1001,CIOS/2024/1001,10,2024-25,,CIOS Regional Centre Delhi,Mathematics,85,0,33,100,85',
    '1,Rahul Kumar,Ram Kumar,2008-03-15,Male,1001,CIOS/2024/1001,10,2024-25,,CIOS Regional Centre Delhi,Science,58,22,33,100,80',
    '1,Rahul Kumar,Ram Kumar,2008-03-15,Male,1001,CIOS/2024/1001,10,2024-25,,CIOS Regional Centre Delhi,Social Science,74,0,33,100,74',
    '1,Rahul Kumar,Ram Kumar,2008-03-15,Male,1001,CIOS/2024/1001,10,2024-25,,CIOS Regional Centre Delhi,Drawing,65,23,33,100,88',
    '2,Priya Sharma,Suresh Sharma,2007-07-22,Female,1002,CIOS/2024/1002,12,2024-25,Science,CIOS Study Centre Lucknow,Hindi,82,0,33,100,82',
    '2,Priya Sharma,Suresh Sharma,2007-07-22,Female,1002,CIOS/2024/1002,12,2024-25,Science,CIOS Study Centre Lucknow,English,86,0,33,100,86',
    '2,Priya Sharma,Suresh Sharma,2007-07-22,Female,1002,CIOS/2024/1002,12,2024-25,Science,CIOS Study Centre Lucknow,Physics,63,28,33,100,91',
    '2,Priya Sharma,Suresh Sharma,2007-07-22,Female,1002,CIOS/2024/1002,12,2024-25,Science,CIOS Study Centre Lucknow,Chemistry,60,28,33,100,88',
    '2,Priya Sharma,Suresh Sharma,2007-07-22,Female,1002,CIOS/2024/1002,12,2024-25,Science,CIOS Study Centre Lucknow,Biology,65,29,33,100,94',
    '2,Priya Sharma,Suresh Sharma,2007-07-22,Female,1002,CIOS/2024/1002,12,2024-25,Science,CIOS Study Centre Lucknow,Mathematics,89,0,33,100,89',
  ]

  return [headers.join(','), ...sampleRows].join('\n')
}
