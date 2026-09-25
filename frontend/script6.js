const fs = require('fs');
const file = 'c:\\\\Users\\\\HP\\\\Documents\\\\GitHub\\\\Qefas Project\\\\schoolHub\\\\frontend\\\\src\\\\app\\\\dashboard\\\\admin\\\\records\\\\new\\\\page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldEffect = `        return {
          id: student.id,
          name: student.name,
          code: student.studentCode || "-",
          profileImage: student.profileImage || null,
          assignment: mark?.assignmentScore ?? "",
          quiz: mark?.quizScore ?? "",
          ca: mark?.caScore ?? "",
          exam: mark?.examScore ?? "",
          scoreSources: mark?.scoreSources || {},
          politeness: "0",
          punctuality: "0",
          handwriting: "0",
          teacherRemark: "",
          principalRemark: ""
        };`;

const newEffect = `        const scoreSources = mark?.scoreSources || {};
        
        let politeness = "0";
        let punctuality = "0";
        let handwriting = "0";
        let teacherRemark = "";
        let principalRemark = "";

        if (scoreSources.behavior) {
          politeness = scoreSources.behavior.politeness || "0";
          punctuality = scoreSources.behavior.punctuality || "0";
          handwriting = scoreSources.behavior.handwriting || "0";
          teacherRemark = scoreSources.behavior.teacherRemark || "";
          principalRemark = scoreSources.behavior.principalRemark || "";
        }

        return {
          id: student.id,
          name: student.name,
          code: student.studentCode || "-",
          profileImage: student.profileImage || null,
          assignment: mark?.assignmentScore ?? "",
          quiz: mark?.quizScore ?? "",
          ca: mark?.caScore ?? "",
          exam: mark?.examScore ?? "",
          scoreSources: mark?.scoreSources || {},
          politeness,
          punctuality,
          handwriting,
          teacherRemark,
          principalRemark
        };`;

const oldSave = `      scores: students.map(s => ({
        studentId: s.id,
        assignmentScore: parseScore(s.assignment),
        quizScore: parseScore(s.quiz),
        caScore: parseScore(s.ca),
        examScore: parseScore(s.exam),
      }))`;

const newSave = `      scores: students.map(s => ({
        studentId: s.id,
        assignmentScore: parseScore(s.assignment),
        quizScore: parseScore(s.quiz),
        caScore: parseScore(s.ca),
        examScore: parseScore(s.exam),
        scoreSources: {
          ...s.scoreSources,
          behavior: {
            politeness: s.politeness,
            punctuality: s.punctuality,
            handwriting: s.handwriting,
            teacherRemark: s.teacherRemark,
            principalRemark: s.principalRemark
          }
        }
      }))`;

if (code.includes('politeness: "0",\n          punctuality: "0"')) {
    code = code.replace(oldEffect, newEffect);
    code = code.replace(oldSave, newSave);
    fs.writeFileSync(file, code);
    console.log("Updated admin/records/new/page.tsx");
} else {
    console.log("Code signature not found");
}
