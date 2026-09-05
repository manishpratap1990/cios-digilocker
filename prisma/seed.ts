import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding CIOS Digilocker database with serial numbers & practical marks...')

  // 1. Admin account
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: { password: hashedPassword },
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  })
  console.log(`✅ Admin verified: username=admin, password=admin123`)

  // 2. Demo students with Serial No, Theory, Practical, Min & Max marks
  const sampleStudents = [
    {
      serialNo: 1,
      name: 'Rahul Kumar',
      guardianName: 'Ram Kumar',
      dateOfBirth: '15/03/2008',
      gender: 'Male',
      rollNumber: '1001',
      regNumber: 'CIOS/2024/1001',
      class: '10',
      academicYear: '2024-25',
      stream: null,
      centreName: 'CIOS Regional Centre, Delhi',
      subjects: [
        { subjectName: 'Hindi', theoryMarks: 76, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 76 },
        { subjectName: 'English', theoryMarks: 72, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 72 },
        { subjectName: 'Mathematics', theoryMarks: 85, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 85 },
        { subjectName: 'Science', theoryMarks: 58, practicalMarks: 22, minMarks: 33, maxMarks: 100, obtainedMarks: 80 },
        { subjectName: 'Social Science', theoryMarks: 74, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 74 },
        { subjectName: 'Drawing', theoryMarks: 65, practicalMarks: 23, minMarks: 33, maxMarks: 100, obtainedMarks: 88 },
      ],
    },
    {
      serialNo: 2,
      name: 'Priya Sharma',
      guardianName: 'Suresh Sharma',
      dateOfBirth: '22/07/2007',
      gender: 'Female',
      rollNumber: '1002',
      regNumber: 'CIOS/2024/1002',
      class: '12',
      academicYear: '2024-25',
      stream: 'Science',
      centreName: 'CIOS Study Centre, Lucknow',
      subjects: [
        { subjectName: 'Hindi', theoryMarks: 82, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 82 },
        { subjectName: 'English', theoryMarks: 86, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 86 },
        { subjectName: 'Physics', theoryMarks: 63, practicalMarks: 28, minMarks: 33, maxMarks: 100, obtainedMarks: 91 },
        { subjectName: 'Chemistry', theoryMarks: 60, practicalMarks: 28, minMarks: 33, maxMarks: 100, obtainedMarks: 88 },
        { subjectName: 'Biology', theoryMarks: 65, practicalMarks: 29, minMarks: 33, maxMarks: 100, obtainedMarks: 94 },
        { subjectName: 'Mathematics', theoryMarks: 89, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 89 },
      ],
    },
    {
      serialNo: 3,
      name: 'Amit Singh',
      guardianName: 'Vijay Singh',
      dateOfBirth: '05/11/2009',
      gender: 'Male',
      rollNumber: '1003',
      regNumber: 'CIOS/2024/1003',
      class: '8',
      academicYear: '2024-25',
      stream: null,
      centreName: 'CIOS Regional Centre, Patna',
      subjects: [
        { subjectName: 'Hindi', theoryMarks: 58, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 58 },
        { subjectName: 'English', theoryMarks: 54, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 54 },
        { subjectName: 'Maths', theoryMarks: 63, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 63 },
        { subjectName: 'Science', theoryMarks: 45, practicalMarks: 15, minMarks: 33, maxMarks: 100, obtainedMarks: 60 },
        { subjectName: 'SST', theoryMarks: 56, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 56 },
        { subjectName: 'Drawing', theoryMarks: 50, practicalMarks: 22, minMarks: 33, maxMarks: 100, obtainedMarks: 72 },
      ],
    },
    {
      serialNo: 4,
      name: 'Rohan Gupta',
      guardianName: 'Manoj Gupta',
      dateOfBirth: '14/09/2006',
      gender: 'Male',
      rollNumber: '1004',
      regNumber: 'CIOS/2024/1004',
      class: '12',
      academicYear: '2024-25',
      stream: 'Commerce',
      centreName: 'CIOS Study Centre, Kanpur',
      subjects: [
        { subjectName: 'Hindi', theoryMarks: 70, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 70 },
        { subjectName: 'English', theoryMarks: 78, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 78 },
        { subjectName: 'Accountancy', theoryMarks: 64, practicalMarks: 20, minMarks: 33, maxMarks: 100, obtainedMarks: 84 },
        { subjectName: 'Business Studies', theoryMarks: 62, practicalMarks: 20, minMarks: 33, maxMarks: 100, obtainedMarks: 82 },
        { subjectName: 'Banking', theoryMarks: 75, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 75 },
        { subjectName: 'Economics', theoryMarks: 61, practicalMarks: 18, minMarks: 33, maxMarks: 100, obtainedMarks: 79 },
      ],
    },
    {
      serialNo: 5,
      name: 'Ananya Mishra',
      guardianName: 'Rajesh Mishra',
      dateOfBirth: '30/01/2007',
      gender: 'Female',
      rollNumber: '1005',
      regNumber: 'CIOS/2024/1005',
      class: '12',
      academicYear: '2024-25',
      stream: 'Arts',
      centreName: 'CIOS Study Centre, Varanasi',
      subjects: [
        { subjectName: 'Hindi', theoryMarks: 84, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 84 },
        { subjectName: 'English', theoryMarks: 80, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 80 },
        { subjectName: 'History', theoryMarks: 88, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 88 },
        { subjectName: 'Sociology', theoryMarks: 85, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 85 },
        { subjectName: 'Geography', theoryMarks: 58, practicalMarks: 24, minMarks: 33, maxMarks: 100, obtainedMarks: 82 },
        { subjectName: 'Civics', theoryMarks: 86, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 86 },
      ],
    },
    {
      serialNo: 6,
      name: 'Neha Chaurasia',
      guardianName: 'Dinesh Chaurasia',
      dateOfBirth: '12/11/2008',
      gender: 'Female',
      rollNumber: '1006',
      regNumber: 'CIOS/2024/1006',
      class: '10',
      academicYear: '2024-25',
      stream: null,
      centreName: 'CIOS Regional Centre, Gorakhpur',
      subjects: [
        { subjectName: 'Hindi', theoryMarks: 85, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 85 },
        { subjectName: 'English', theoryMarks: 88, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 88 },
        { subjectName: 'Home Science', theoryMarks: 68, practicalMarks: 25, minMarks: 33, maxMarks: 100, obtainedMarks: 93 },
        { subjectName: 'Science', theoryMarks: 62, practicalMarks: 26, minMarks: 33, maxMarks: 100, obtainedMarks: 88 },
        { subjectName: 'Social Science', theoryMarks: 84, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 84 },
        { subjectName: 'Drawing', theoryMarks: 65, practicalMarks: 26, minMarks: 33, maxMarks: 100, obtainedMarks: 91 },
      ],
    },
    {
      serialNo: 7,
      name: 'Vikash Maurya',
      guardianName: 'Santosh Maurya',
      dateOfBirth: '18/12/2008',
      gender: 'Male',
      rollNumber: '1007',
      regNumber: 'CIOS/2024/1007',
      class: '10',
      academicYear: '2024-25',
      stream: null,
      centreName: 'CIOS Regional Centre, Prayagraj',
      subjects: [
        { subjectName: 'Hindi', theoryMarks: 92, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 92 },
        { subjectName: 'English', theoryMarks: 90, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 90 },
        { subjectName: 'Mathematics', theoryMarks: 98, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 98 },
        { subjectName: 'Science', theoryMarks: 68, practicalMarks: 26, minMarks: 33, maxMarks: 100, obtainedMarks: 94 },
        { subjectName: 'Social Science', theoryMarks: 91, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 91 },
        { subjectName: 'Drawing', theoryMarks: 68, practicalMarks: 27, minMarks: 33, maxMarks: 100, obtainedMarks: 95 },
      ],
    },
    {
      serialNo: 8,
      name: 'Sunita Yadav',
      guardianName: 'Dharmendra Yadav',
      dateOfBirth: '11/04/2006',
      gender: 'Female',
      rollNumber: '2001',
      regNumber: 'CIOS/2023/2001',
      class: '12',
      academicYear: '2023-24',
      stream: 'Science',
      centreName: 'CIOS Study Centre, Agra',
      subjects: [
        { subjectName: 'Hindi', theoryMarks: 68, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 68 },
        { subjectName: 'English', theoryMarks: 72, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 72 },
        { subjectName: 'Physics', theoryMarks: 45, practicalMarks: 20, minMarks: 33, maxMarks: 100, obtainedMarks: 65 },
        { subjectName: 'Chemistry', theoryMarks: 48, practicalMarks: 22, minMarks: 33, maxMarks: 100, obtainedMarks: 70 },
        { subjectName: 'Biology', theoryMarks: 50, practicalMarks: 24, minMarks: 33, maxMarks: 100, obtainedMarks: 74 },
        { subjectName: 'Mathematics', theoryMarks: 62, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 62 },
      ],
    },
    {
      serialNo: 9,
      name: 'Deepanshu Verma',
      guardianName: 'Kailash Verma',
      dateOfBirth: '25/06/2008',
      gender: 'Male',
      rollNumber: '2002',
      regNumber: 'CIOS/2023/2002',
      class: '10',
      academicYear: '2023-24',
      stream: null,
      centreName: 'CIOS Study Centre, Meerut',
      subjects: [
        { subjectName: 'Hindi', theoryMarks: 48, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 48 },
        { subjectName: 'English', theoryMarks: 42, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 42 },
        { subjectName: 'Mathematics', theoryMarks: 24, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 24 }, // failed (<33)
        { subjectName: 'Science', theoryMarks: 18, practicalMarks: 10, minMarks: 33, maxMarks: 100, obtainedMarks: 28 }, // failed (<33)
        { subjectName: 'Social Science', theoryMarks: 50, practicalMarks: 0, minMarks: 33, maxMarks: 100, obtainedMarks: 50 },
        { subjectName: 'Drawing', theoryMarks: 45, practicalMarks: 20, minMarks: 33, maxMarks: 100, obtainedMarks: 65 },
      ],
    },
  ]

  function getGrade(p: number, passed: boolean): { grade: string; division: string } {
    if (!passed) return { grade: 'F', division: 'Fail' }
    if (p >= 90) return { grade: 'A+', division: 'Honours / Distinction' }
    if (p >= 80) return { grade: 'A', division: 'First Division' }
    if (p >= 60) return { grade: 'B', division: 'First Division' }
    if (p >= 45) return { grade: 'C', division: 'Second Division' }
    if (p >= 33) return { grade: 'D', division: 'Third Division' }
    return { grade: 'F', division: 'Fail' }
  }

  for (const studentData of sampleStudents) {
    const totalObtained = studentData.subjects.reduce((s, sub) => s + sub.obtainedMarks, 0)
    const totalMax = studentData.subjects.reduce((s, sub) => s + sub.maxMarks, 0)
    const percentage = (totalObtained / totalMax) * 100
    const passed = studentData.subjects.every(sub => sub.obtainedMarks >= sub.minMarks)
    const { grade, division } = getGrade(percentage, passed)

    // Delete existing
    await prisma.student.deleteMany({
      where: { rollNumber: studentData.rollNumber },
    })

    await prisma.student.create({
      data: {
        serialNo: studentData.serialNo,
        name: studentData.name,
        guardianName: studentData.guardianName,
        dateOfBirth: studentData.dateOfBirth,
        gender: studentData.gender,
        rollNumber: studentData.rollNumber,
        regNumber: studentData.regNumber,
        class: studentData.class,
        academicYear: studentData.academicYear,
        stream: studentData.stream,
        centreName: studentData.centreName,
        subjects: {
          create: studentData.subjects,
        },
        result: {
          create: {
            totalObtained,
            totalMax,
            percentage,
            status: passed ? 'PASS' : 'FAIL',
            grade,
            division,
          },
        },
      },
    })
    console.log(`✅ Seeded S.No #${studentData.serialNo}: ${studentData.name} (Roll: ${studentData.rollNumber}) [Class ${studentData.class}th - ${passed ? 'PASS' : 'FAIL'}]`)
  }

  console.log('\n✅ CIOS Digilocker database updated with S.No & Practical marks!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
