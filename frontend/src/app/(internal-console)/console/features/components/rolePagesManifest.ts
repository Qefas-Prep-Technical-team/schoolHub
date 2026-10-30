export interface RolePageManifestItem {
  featureKey: string;
  label: string;
  href: string;
  section: string;
  description: string;
}

// TEACHER DASHBOARD PAGES
export const TEACHER_PAGES_MANIFEST: RolePageManifestItem[] = [
  { featureKey: "dashboard", label: "Dashboard", href: "/dashboard/teacher", section: "Primary", description: "Teacher home portal with attendance stats, recent activity, and timetable" },
  { featureKey: "students", label: "Students", href: "/dashboard/teacher/students", section: "Primary", description: "List of students enrolled across assigned classes and cohorts" },
  { featureKey: "parents", label: "Parents", href: "/dashboard/teacher/parents", section: "Primary", description: "Parent directory with contact info and linkage status for enrolled students" },
  { featureKey: "classes", label: "My Classes", href: "/dashboard/teacher/my-classes", section: "Primary", description: "Assigned class arms, subjects, and classroom roster controls" },

  { featureKey: "subjects", label: "Subjects", href: "/dashboard/teacher/subjects", section: "Academic", description: "Assigned syllabus subjects, topics, and lesson plan outlines" },
  { featureKey: "assignments", label: "Assignments", href: "/dashboard/teacher/assignments", section: "Academic", description: "Homework creation, student submissions, and grading ledger" },
  { featureKey: "grades", label: "Grades", href: "/dashboard/teacher/grades", section: "Academic", description: "Continuous assessment scores, exam grades, and gradebook management" },
  { featureKey: "offlineGrades", label: "Offline Grades", href: "/dashboard/teacher/offline-grades", section: "Academic", description: "Offline score entry and bulk CSV spreadsheet synchronization" },
  { featureKey: "records", label: "Final Result", href: "/dashboard/teacher/records", section: "Academic", description: "Termly report cards, cumulative rankings, and remarks" },
  { featureKey: "exams", label: "Exams & Quizzes", href: "/dashboard/teacher/exams&quizzes", section: "Academic", description: "Online exam builder, multiple-choice questions, and timed quizzes" },
  { featureKey: "timetable", label: "Timetable", href: "/dashboard/teacher/timetable", section: "Academic", description: "Weekly teaching schedule, classroom allocations, and period hours" },
  { featureKey: "reports", label: "Performance Reports", href: "/dashboard/teacher/reports", section: "Academic", description: "Class-wide academic performance trends and grade distributions" },

  { featureKey: "linking", label: "Linking Hub", href: "/dashboard/teacher/linking", section: "Ecosystem", description: "Parent linking validation, invitations, and school association" },
  { featureKey: "aiTools", label: "AI Tools", href: "/dashboard/teacher/ai-tools", section: "Ecosystem", description: "AI question generator, essay marking assistant, and lesson planners" },
  { featureKey: "resources", label: "Resources", href: "/dashboard/teacher/resources", section: "Ecosystem", description: "Curriculum textbooks, media files, and supplementary teaching material" },
  { featureKey: "documents", label: "Documents", href: "/dashboard/teacher/documents", section: "Ecosystem", description: "Uploaded school files, templates, and syllabus documents" },

  { featureKey: "messages", label: "Messages", href: "/dashboard/teacher/messages", section: "Communication", description: "Direct messaging with parents, colleagues, and school administrators" },
  { featureKey: "notifications", label: "Notifications", href: "/dashboard/teacher/notifications", section: "Communication", description: "Institutional notices, submission alerts, and urgent reminders" },

  { featureKey: "profile", label: "My Profile", href: "/dashboard/teacher/profile", section: "Account", description: "Personal biographical information, qualifications, and credentials" },
  { featureKey: "billing", label: "Subscription", href: "/dashboard/teacher/billing", section: "Account", description: "Teacher personal portal plan and premium features tier" },
  { featureKey: "settings", label: "System Settings", href: "/dashboard/teacher/settings", section: "Account", description: "Password, multi-factor authentication, and notifications preferences" },
  { featureKey: "support", label: "Help & Support", href: "/dashboard/teacher/support", section: "Account", description: "Help center, tutorials, and support ticket submissions" },
];

// STUDENT DASHBOARD PAGES
export const STUDENT_PAGES_MANIFEST: RolePageManifestItem[] = [
  { featureKey: "dashboard", label: "Dashboard", href: "/dashboard/student", section: "Learning", description: "Student overview with upcoming exams, GPA summary, and assignments" },
  { featureKey: "classes", label: "Classes", href: "/dashboard/student/my-classes", section: "Learning", description: "Enrolled class subjects, assigned teachers, and lesson topics" },
  { featureKey: "assignments", label: "Assignments", href: "/dashboard/student/assignments", section: "Learning", description: "Assigned homework, due dates, project instructions, and submissions" },
  { featureKey: "results", label: "Grades & Results", href: "/dashboard/student/grades", section: "Learning", description: "Assessment marks, continuous evaluation scores, and term report cards" },
  { featureKey: "offlineGrades", label: "Offline Grades", href: "/dashboard/student/offline-grades", section: "Learning", description: "Archived paper exam scores and verified offline marks" },
  { featureKey: "transcript", label: "Transcript", href: "/dashboard/student/transcript", section: "Learning", description: "Official academic cumulative transcript and institutional records" },
  { featureKey: "exams", label: "Exams & Quizzes", href: "/dashboard/student/exams&quizzes", section: "Learning", description: "Online computer-based tests, timed exams, and practice quizzes" },
  { featureKey: "attendance", label: "Attendance", href: "/dashboard/student/attendance", section: "Learning", description: "Personal attendance ledger, check-in history, and absence tracking" },
  { featureKey: "documents", label: "Documents", href: "/dashboard/student/documents", section: "Learning", description: "Curriculum guides, school notices, and downloadable certificates" },

  { featureKey: "linking", label: "Linking Hub", href: "/dashboard/student/linking", section: "Communication", description: "Connection status with parents and institutional school association" },
  { featureKey: "notifications", label: "Notifications", href: "/dashboard/student/notifications", section: "Communication", description: "Exam schedules, grade publication alerts, and deadline notices" },

  { featureKey: "profile", label: "Profile", href: "/dashboard/student/profile", section: "Account", description: "Student identity profile, photo, enrollment code, and student card" },
  { featureKey: "billing", label: "Subscription", href: "/dashboard/student/billing", section: "Account", description: "Student study access tier, quota limits, and AI tokens" },
  { featureKey: "settings", label: "Settings", href: "/dashboard/student/settings", section: "Account", description: "Security settings, active devices, and display preferences" },
  { featureKey: "support", label: "Support", href: "/dashboard/student/support", section: "Account", description: "Student help guide and customer support assistance" },
];

// PARENT DASHBOARD PAGES
export const PARENT_PAGES_MANIFEST: RolePageManifestItem[] = [
  { featureKey: "dashboard", label: "Dashboard", href: "/dashboard/parent", section: "Children's Progress", description: "Aggregated overview of linked children, school announcements, and fees" },
  { featureKey: "children", label: "My Children", href: "/dashboard/parent/my-children", section: "Children's Progress", description: "Linked children profiles, class cohorts, and linked status" },
  { featureKey: "classes", label: "Class", href: "/dashboard/parent/class", section: "Children's Progress", description: "Children's teachers, class schedule, and curriculum subjects" },
  { featureKey: "assignments", label: "Assignments", href: "/dashboard/parent/assignments", section: "Children's Progress", description: "Homework status, submission deadlines, and teacher comments" },
  { featureKey: "results", label: "Exams & Results", href: "/dashboard/parent/exams&results", section: "Children's Progress", description: "Termly report cards, exam scores, and academic evaluations" },
  { featureKey: "offlineGrades", label: "Offline Results", href: "/dashboard/parent/offline-grades", section: "Children's Progress", description: "Manual paper exam reconciliations and verified scores" },
  { featureKey: "performance", label: "Performance", href: "/dashboard/parent/performance", section: "Children's Progress", description: "Multi-term progress charts, strengths, and area-of-focus insights" },
  { featureKey: "attendance", label: "Attendance", href: "/dashboard/parent/attendance", section: "Children's Progress", description: "Real-time daily attendance tracking and absence notifications" },

  { featureKey: "billing", label: "Subscription & Fees", href: "/dashboard/parent/billing", section: "Financial", description: "Parent portal plan, school tuition payments, and receipts" },
  { featureKey: "resources", label: "Resources", href: "/dashboard/parent/resources", section: "Financial", description: "Educational parenting guides, school documents, and handbooks" },
  { featureKey: "aiInsights", label: "AI Insights", href: "/dashboard/parent/ai-insights", section: "Advanced", description: "AI learning summaries, progress alerts, and personalized tutoring tips" },

  { featureKey: "profile", label: "Profile", href: "/dashboard/parent/profile", section: "Account", description: "Parent biographical contact details and verification credentials" },
  { featureKey: "settings", label: "Settings", href: "/dashboard/parent/settings", section: "Account", description: "Account security, active device sessions, and notifications" },
  { featureKey: "support", label: "Support", href: "/dashboard/parent/support", section: "Account", description: "Help desk, inquiry tickets, and parent assistance" },
];
