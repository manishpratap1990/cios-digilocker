export const CLASSES = ['8', '10', '12']

export const ACADEMIC_YEARS = [
  '2012-13', '2013-14', '2014-15', '2015-16', '2016-17',
  '2017-18', '2018-19', '2019-20', '2020-21', '2021-22',
  '2022-23', '2023-24', '2024-25', '2025-26', '2026-27',
  '2027-28',
]

export const STREAMS = ['Science', 'Arts', 'Commerce']

export const SUBJECTS: Record<string, string[]> = {
  '8': ['Hindi', 'English', 'Maths', 'Science', 'SST', 'Drawing'],
  '10': ['Hindi', 'English', 'Maths', 'Home Science', 'Science', 'SST', 'Drawing'],
  '12-Science': ['Hindi', 'English', 'Physics', 'Chemistry', 'Maths', 'Biology'],
  '12-Arts': ['Hindi', 'English', 'History', 'Sociology', 'Geography', 'Political Science', 'Civics'],
  '12-Commerce': ['Hindi', 'English', 'Accountancy', 'Business Studies', 'Banking', 'Economics'],
}

// Default standard subjects for creation
export const DEFAULT_SUBJECTS: Record<string, string[]> = {
  '8': ['Hindi', 'English', 'Maths', 'Science', 'SST', 'Drawing'],
  '10': ['Hindi', 'English', 'Maths', 'Science', 'SST', 'Drawing'],
  '10-HomeScience': ['Hindi', 'English', 'Home Science', 'Science', 'SST', 'Drawing'],
  '12-Science': ['Hindi', 'English', 'Physics', 'Chemistry', 'Maths', 'Biology'],
  '12-Arts': ['Hindi', 'English', 'History', 'Sociology', 'Geography', 'Political Science', 'Civics'],
  '12-Commerce': ['Hindi', 'English', 'Accountancy', 'Business Studies', 'Banking', 'Economics'],
}

export function getSubjects(cls: string, stream?: string | null): string[] {
  if (cls === '12' && stream) {
    return SUBJECTS[`12-${stream}`] || []
  }
  return SUBJECTS[cls] || []
}

export function calculateGrade(percentage: number): { grade: string; division: string } {
  if (percentage >= 90) return { grade: 'A+', division: 'Honours / Distinction' }
  if (percentage >= 80) return { grade: 'A', division: 'First Division' }
  if (percentage >= 60) return { grade: 'B', division: 'First Division' }
  if (percentage >= 45) return { grade: 'C', division: 'Second Division' }
  if (percentage >= 33) return { grade: 'D', division: 'Third Division' }
  return { grade: 'F', division: 'Fail' }
}

export function calculateResult(subjects: {
  minMarks: number
  maxMarks: number
  obtainedMarks?: number
  theoryMarks?: number | null
  practicalMarks?: number | null
}[]) {
  const totalObtained = subjects.reduce((sum, s) => {
    const ob = s.obtainedMarks !== undefined && s.obtainedMarks !== null
      ? s.obtainedMarks
      : ((s.theoryMarks || 0) + (s.practicalMarks || 0))
    return sum + ob
  }, 0)

  const totalMax = subjects.reduce((sum, s) => sum + s.maxMarks, 0)
  const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0
  const passed = subjects.every((s) => {
    const ob = s.obtainedMarks !== undefined && s.obtainedMarks !== null
      ? s.obtainedMarks
      : ((s.theoryMarks || 0) + (s.practicalMarks || 0))
    return ob >= s.minMarks
  })
  const status = passed ? 'PASS' : 'FAIL'
  const { grade, division } = calculateGrade(percentage)
  return { totalObtained, totalMax, percentage, status, grade, division }
}

// Institution Details & Branding
export const SITE_NAME = 'CIOS Digilocker'
export const COLLEGE_NAME = 'Central Institute of Open Schooling, Uttar Pradesh, Lucknow'
export const INSTITUTE_NAME_HI = 'केंद्रीय मुक्त विद्यालयी शिक्षा संस्थान, उत्तर प्रदेश, लखनऊ'
export const INSTITUTE_NAME_EN = 'CENTRAL INSTITUTE OF OPEN SCHOOLING, UTTAR PRADESH, LUCKNOW'

export const GAZETTE_BLUE_1 = 'भारत सरकार'
export const GAZETTE_BLUE_2 = 'मान्यता परिपत्र संख्या-F.No.64-04/14-VE(pt)'
export const GAZETTE_GOVT_REGT = 'Govt. Regt. No.404(India)'
export const GAZETTE_RED_TITLE = '[सरकारी गज़ट उत्तर प्रदेश]'
export const GAZETTE_RED_LINE_1 = '(खण्ड 68 इलाहाबाद, शनिवार 8 फरवरी 2014 ई० (माघ 19, 1935 शक सम्वत्) संख्या-6)'
export const GAZETTE_RED_LINE_2 = '(पेज सं० 621 उत्तर प्रदेश गज़ट, 8 फरवरी 2014 ई० (माघ 19, 1935 शक सम्वत्) भाग 1-क)'

export const DOMAIN = process.env.NEXT_PUBLIC_BASE_URL || 'https://digilocker.ciosupresult.org'
export const INSTITUTE_DOMAIN = 'www.ciosup.org'
export const INSTITUTE_ADDRESS = 'कार्यालय एवं सूचनार्थ भवन 105/224 फुलबाग, हुसैनगंज, पुराना किला लखनऊ, उ०प्र०'
export const COLLEGE_TAGLINE = 'CIOS Digilocker Digital Result Portal'
