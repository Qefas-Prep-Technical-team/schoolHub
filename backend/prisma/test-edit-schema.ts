import fs from 'fs';
let schema = fs.readFileSync('schema.prisma', 'utf8');

const teacherAttendanceModel = `
model TeacherAttendance {
  id        String   @id @default(uuid())
  teacherId String
  schoolId  String
  date      DateTime
  status    String
  note      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  teacher   Teacher  @relation(fields: [teacherId], references: [id], onDelete: Cascade)
  school    School   @relation(fields: [schoolId], references: [id], onDelete: Cascade)

  @@unique([teacherId, date])
  @@map("teacher_attendance")
}
`;

if (!schema.includes('model TeacherAttendance')) {
  schema += teacherAttendanceModel;
  
  // Add relation to Teacher
  schema = schema.replace(
    /model Teacher \{[\s\S]*?\n\}/m,
    match => {
      return match.replace(/\n\}/, '\n  teacherAttendances TeacherAttendance[]\n}');
    }
  );

  // Add relation to School
  schema = schema.replace(
    /model School \{[\s\S]*?\n\}/m,
    match => {
      return match.replace(/\n\}/, '\n  teacherAttendances TeacherAttendance[]\n}');
    }
  );
  
  fs.writeFileSync('schema.prisma', schema);
  console.log("Schema updated!");
} else {
  console.log("TeacherAttendance already exists");
}
