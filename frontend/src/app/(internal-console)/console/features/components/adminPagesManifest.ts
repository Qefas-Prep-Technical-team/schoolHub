export const ADMIN_PAGES_MANIFEST = [
  // CORE MANAGEMENT
  { featureKey: "overview", label: "Overview", href: "/dashboard/admin", section: "core", description: "Main institutional analytics, stats, and real-time operations overview" },
  { featureKey: "schoolProfile", label: "School Profile", href: "/dashboard/admin/school-profile", section: "core", description: "School branding, contact info, motto, and institutional details" },
  { featureKey: "team", label: "Team Management", href: "/dashboard/admin/team", section: "core", description: "Admin sub-roles, permissions, and staff invitation controls" },
  { featureKey: "teachers", label: "Teachers Directory", href: "/dashboard/admin/teachers", section: "core", description: "Teacher roster, department assignments, and profile records" },
  { featureKey: "students", label: "Students Directory", href: "/dashboard/admin/students", section: "core", description: "Enrolled students, admission tracking, and parent link status" },
  { featureKey: "invitations", label: "Invitations Hub", href: "/dashboard/admin/invitations", section: "core", description: "Pending, accepted, and revoked staff and student invitations" },
  { featureKey: "classes", label: "Classes & Timetable", href: "/dashboard/admin/classes", section: "core", description: "Class cohorts, stream sections, schedules, and lesson periods" },
  { featureKey: "linkingHub", label: "Linking Hub", href: "/dashboard/admin/linking", section: "core", description: "Parent-to-child and student-to-school cryptographic link requests" },
  { featureKey: "sessions", label: "Session Management", href: "/dashboard/admin/sessions", section: "core", description: "Academic calendar sessions, terms, and promotion cycles" },
  { featureKey: "subdomain", label: "Sub Domain & Portal", href: "/dashboard/admin/subdomain", section: "core", description: "Custom school landing page, subdomain preview, and branding" },
  { featureKey: "inquiries", label: "Public Inquiries", href: "/dashboard/admin/inquiries", section: "core", description: "Contact submissions from the public school landing portal" },
  { featureKey: "records", label: "Final Result Records", href: "/dashboard/admin/records", section: "core", description: "Archived end-of-term results, transcripts, and certification" },

  // ACADEMICS
  { featureKey: "grades", label: "Grades Assessment", href: "/dashboard/admin/grades", section: "academics", description: "Student score tracking, grading matrix, and gradebook audit" },
  { featureKey: "offlineGrades", label: "Offline Grades", href: "/dashboard/admin/offline-grades", section: "academics", description: "Bulk CSV gradebook imports and offline score reconciliation" },
  { featureKey: "transcript", label: "Academic Transcripts", href: "/dashboard/admin/transcript", section: "academics", description: "Institutional transcripts, GPA calculations, and student records" },
  { featureKey: "exams", label: "Exam Setup", href: "/dashboard/admin/exams", section: "academics", description: "Creation of online/offline assessments, exam papers, and schedules" },
  { featureKey: "assignments", label: "Homework & Assignments", href: "/dashboard/admin/assignments", section: "academics", description: "Teacher homework submissions, deadlines, and grade records" },
  { featureKey: "subjects", label: "Subject Curriculum", href: "/dashboard/admin/subjects", section: "academics", description: "Institutional syllabus subjects, codes, and credit allocations" },
  { featureKey: "departments", label: "Departments", href: "/dashboard/admin/departments", section: "academics", description: "Academic faculty departments and subject grouping" },
  { featureKey: "attendance", label: "Attendance Tracking", href: "/dashboard/admin/attendance", section: "academics", description: "Daily student and staff check-ins, logs, and absence reports" },
  { featureKey: "library", label: "Library Catalog", href: "/dashboard/admin/library", section: "academics", description: "E-books, digital resource lending, and textbook tracking" },

  // ADMINISTRATION & FINANCE
  { featureKey: "finance", label: "Financial Accounts", href: "/dashboard/admin/finance", section: "administration", description: "Fee structures, tuition invoicing, and school treasury accounts" },
  { featureKey: "payments", label: "Fee Collections", href: "/dashboard/admin/payments", section: "administration", description: "Tuition collection portals, bank accounts, and settlement accounts" },
  { featureKey: "transactionHistory", label: "Transaction History", href: "/dashboard/admin/transactions", section: "administration", description: "Real-time payment logs, receipts, and audit reconciliation" },
  { featureKey: "reports", label: "Reports & Analytics", href: "/dashboard/admin/reports", section: "administration", description: "Comprehensive institutional performance and enrollment analytics" },

  // COMMUNICATION & ADVANCED
  { featureKey: "communication", label: "Internal Chat", href: "/dashboard/admin/chat", section: "communication", description: "Real-time institutional announcements and staff messaging" },
  { featureKey: "gallery", label: "Gallery & Media", href: "/dashboard/admin/gallery", section: "communication", description: "School event photos, videos, and campus media showcase" },
  { featureKey: "aiTools", label: "Artificial Intelligence", href: "/dashboard/admin/ai-tools", section: "advanced", description: "AI question generator, essay evaluator, and analytics insights" },
  { featureKey: "simulations", label: "Science Simulations", href: "/dashboard/admin/simulations", section: "advanced", description: "Interactive 3D STEM lab simulations and virtual practicals" },

  // SETTINGS & BILLING
  { featureKey: "settings", label: "School Settings", href: "/dashboard/admin/settings", section: "settings", description: "Institutional policies, timezone, grading scale, and security" },
  { featureKey: "billing", label: "Platform Subscription", href: "/dashboard/admin/billing", section: "settings", description: "Qefas Hub institutional plan, quota upgrades, and invoices" },
  { featureKey: "support", label: "Help & Support", href: "/dashboard/admin/support", section: "settings", description: "Knowledge base, priority ticketing, and customer support chat" },
] as const;

export type AdminPageFeatureKey = typeof ADMIN_PAGES_MANIFEST[number]["featureKey"];
