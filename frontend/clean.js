const fs = require('fs');

const files = [
    'src/app/dashboard/admin/assignments/components/AssignmentsSkeleton.tsx',
    'src/app/dashboard/admin/students/[studentId]/components/TranscriptPDF.tsx',
    'src/app/dashboard/teacher/assignments/components/AssignmentsSkeleton.tsx',
    'src/app/dashboard/teacher/exams&quizzes/components/ExamsSkeleton.tsx',
    'src/app/dashboard/teacher/my-classes/components/ClassesSkeleton.tsx',
    'src/app/dashboard/teacher/students/[studentId]/components/TranscriptPDF.tsx'
];

files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        // Remove `export default ComponentName;`
        content = content.replace(/^export default\s+\w+;\s*$/gm, '');
        fs.writeFileSync(file, content);
        console.log(`Cleaned ${file}`);
    } catch (e) {
        console.log(`Failed to process ${file}: ${e.message}`);
    }
});
