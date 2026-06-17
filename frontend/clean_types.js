const fs = require('fs');

const removeType = (file, regex) => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(regex, '');
        fs.writeFileSync(file, content);
        console.log(`Cleaned ${file}`);
    } catch (e) {
        console.log(`Failed to process ${file}: ${e.message}`);
    }
}

removeType('src/app/dashboard/teacher/documents/components/types.ts', /export type DocumentType = .*?;\n?/s);
removeType('src/app/dashboard/teacher/exams&quizzes/components/ExamsTable.tsx', /export interface Exam {[\s\S]*?}\n?/);
removeType('src/app/dashboard/teacher/grades/grade-edit/components/types.ts', /export interface GradeFormData {[\s\S]*?}\n?/);
removeType('src/app/dashboard/teacher/my-classes/[classId]/components/student/components/types.ts', /export interface ClassInfo {[\s\S]*?}\n?/);
removeType('src/app/dashboard/teacher/my-classes/components/type.ts', /export interface ClassStats {[\s\S]*?}\n?/);
removeType('src/lib/api/hooks/useParentDashboard.ts', /export interface DashboardChild {[\s\S]*?}\n?/);
removeType('src/lib/types/user.types.ts', /export interface AdminUser {[\s\S]*?}\n?/);
removeType('src/lib/types/user.types.ts', /export interface TeacherUser {[\s\S]*?}\n?/);
removeType('src/lib/types/user.types.ts', /export interface ParentUser {[\s\S]*?}\n?/);
removeType('src/utils/AuthModalStore.ts', /export type AuthView = .*?;\n?/s);
