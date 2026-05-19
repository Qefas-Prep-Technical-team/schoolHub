const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("=== Checking Database Entries ===");
  
  // 1. Get all schools
  const schools = await prisma.school.findMany();
  console.log(`Total Schools: ${schools.length}`);
  schools.forEach(s => {
    console.log(`School: ${s.name} | ID: ${s.id} | tenantId: ${s.tenantId} | schoolCode: ${s.schoolCode}`);
  });

  if (schools.length === 0) {
    console.log("No schools in database.");
    return;
  }

  const schoolId = schools[0].id;
  console.log(`\nUsing School ID: ${schoolId} for queries\n`);

  // 2. Teachers count
  const teachersCount = await prisma.teacher.count();
  console.log(`Total Teachers in system: ${teachersCount}`);
  
  const schoolTeachers = await prisma.teacher.findMany({
    where: {
      OR: [
        { primarySchoolId: schoolId },
        { activeSchoolId: schoolId }
      ]
    }
  });
  console.log(`Teachers linked to school: ${schoolTeachers.length}`);
  schoolTeachers.forEach(t => {
    console.log(` - Teacher: ${t.name} | ID: ${t.id} | Email: ${t.email}`);
  });

  // 3. Students count
  const studentsCount = await prisma.student.count();
  console.log(`Total Students in system: ${studentsCount}`);
  
  const schoolStudents = await prisma.student.findMany({
    where: { schoolId }
  });
  console.log(`Students linked to school: ${schoolStudents.length}`);
  schoolStudents.forEach(st => {
    console.log(` - Student: ${st.name} | ID: ${st.id} | Code: ${st.studentCode}`);
  });

  // 4. Subjects
  const subjectsCount = await prisma.subject.count();
  console.log(`Total Subjects in system: ${subjectsCount}`);
  
  const schoolSubjects = await prisma.subject.findMany({
    where: { schoolId }
  });
  console.log(`Subjects linked to school: ${schoolSubjects.length}`);
  schoolSubjects.forEach(sub => {
    console.log(` - Subject: ${sub.name} | ID: ${sub.id}`);
  });

  // 5. Departments
  const departmentsCount = await prisma.department.count();
  console.log(`Total Departments in system: ${departmentsCount}`);
  
  const schoolDepartments = await prisma.department.findMany({
    where: { schoolId }
  });
  console.log(`Departments linked to school: ${schoolDepartments.length}`);
  schoolDepartments.forEach(d => {
    console.log(` - Department: ${d.name} | ID: ${d.id}`);
  });

  // 6. RelationshipLinks
  const relationshipLinks = await prisma.relationshipLink.findMany();
  console.log(`\nTotal RelationshipLinks in system: ${relationshipLinks.length}`);
  relationshipLinks.forEach(rl => {
    console.log(` - Link: ${rl.linkType} | status: ${rl.status} | schoolId: ${rl.schoolId} | teacherId: ${rl.teacherId} | studentId: ${rl.studentId}`);
  });
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
