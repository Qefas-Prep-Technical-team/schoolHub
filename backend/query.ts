import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const student = await prisma.student.findFirst({
        where: { studentCode: 'stu-ola-751037' }
    });
    if (!student) {
        console.log('student not found');
        return;
    }
    const grades = await prisma.grade.findMany({
        where: { studentId: student.id },
        include: {
            exam: true,
            subjectPaper: true,
            examAttempt: true,
            subjectExamAttempt: true
        }
    });
    // Just find the assignment named test 4
    console.log("ALL GRADES: ", grades.map(g => ({
       id: g.id,
       category: g.category,
       assessmentType: g.assessmentType,
       subject: g.subject,
       remarks: g.remarks,
       examTitle: g?.exam?.title,
       paperTitle: g?.subjectPaper?.title
    })));
}

main().catch(console.error).finally(() => prisma.$disconnect());
