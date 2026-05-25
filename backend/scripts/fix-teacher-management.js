const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/modules/admin/teacher-management.controller.ts');
let content = fs.readFileSync(file, 'utf8');

// 1. isPrimary to isLead
content = content.replace(
  'isPrimary: true,',
  'isLead: true,'
);

// 2. Remove status: "ACTIVE" from teacherSubject.create
content = content.replace(
`      if (subjectId) {
        await prisma.teacherSubject.create({
          data: {
            teacherId: teacher.id,
            subjectId,
            schoolId: school.id,
            status: "ACTIVE",
          }
        });
      }`,
`      if (subjectId) {
        await prisma.teacherSubject.create({
          data: {
            teacherId: teacher.id,
            subjectId,
            schoolId: school.id,
          }
        });
      }`
);

// 3. Hide password if email
content = content.replace(
`        data: { 
          teacherId: teacher.id, 
          teacherCode: teacher.teacherCode,
          email: loginEmail,
          password: tempPassword
        }`,
`        data: { 
          teacherId: teacher.id, 
          teacherCode: teacher.teacherCode,
          email: loginEmail,
          password: email ? undefined : tempPassword
        }`
);

fs.writeFileSync(file, content, 'utf8');
console.log("Fixes applied successfully.");
