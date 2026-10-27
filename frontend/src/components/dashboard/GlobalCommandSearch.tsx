"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Sparkles,
  ArrowRight,
  CornerDownLeft,
  X,
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  CalendarDays,
  Award,
  BookOpenCheck,
  ClipboardList,
  CheckSquare,
  LibraryBig,
  CreditCard,
  WalletCards,
  BarChart3,
  MessageSquare,
  Landmark,
  Globe,
  BrainCircuit,
  Workflow,
  Settings,
  School,
  User,
  QrCode,
  FileSpreadsheet,
  Folder,
  BookOpen,
  FileCheck2,
  Share2,
  Brain,
  FileText,
  Bell,
  LifeBuoy,
  Zap,
  PlusCircle,
  Shield,
  CalendarClock,
  MessageCircle,
  Link2,
  BookMarked,
  LucideIcon,
  ChevronRight,
  MailPlus,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type SearchRole = "admin" | "teacher" | "student" | "parent";

export interface SearchItem {
  id: string;
  title: string;
  category: "Quick Actions" | "Core Navigation" | "Academics & Records" | "Administration" | "Communication" | "Tools & Settings";
  description?: string;
  href?: string;
  action?: () => void;
  icon: LucideIcon;
  keywords: string[];
  featureKey?: string;
  badge?: string;
  isQuickAction?: boolean;
}

interface GlobalCommandSearchProps {
  role: SearchRole;
  primaryColor?: string;
  featureFlags?: Record<string, boolean>;
  onOpenQR?: () => void;
  className?: string;
}

// Role theme accent styles
const ROLE_THEMES: Record<
  SearchRole,
  {
    ringFocus: string;
    textAccent: string;
    bgAccentLight: string;
    badgeBg: string;
    badgeText: string;
    borderAccent: string;
    placeholder: string;
  }
> = {
  admin: {
    ringFocus: "focus:ring-blue-500/20 focus:border-blue-500/40",
    textAccent: "text-blue-600 dark:text-blue-400",
    bgAccentLight: "bg-blue-50 hover:bg-blue-100/70 dark:bg-blue-900/20 dark:hover:bg-blue-900/30",
    badgeBg: "bg-blue-100 dark:bg-blue-950/80 border-blue-200 dark:border-blue-800",
    badgeText: "text-blue-700 dark:text-blue-300",
    borderAccent: "border-blue-500",
    placeholder: "Search anything (students, records, billing, transcripts, actions)...",
  },
  teacher: {
    ringFocus: "focus:ring-emerald-500/20 focus:border-emerald-500/40",
    textAccent: "text-emerald-600 dark:text-emerald-400",
    bgAccentLight: "bg-emerald-50 hover:bg-emerald-100/70 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30",
    badgeBg: "bg-emerald-100 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    borderAccent: "border-emerald-500",
    placeholder: "Search classes, grade entry, assignments, students, attendance...",
  },
  student: {
    ringFocus: "focus:ring-pink-500/20 focus:border-pink-500/40",
    textAccent: "text-pink-600 dark:text-pink-400",
    bgAccentLight: "bg-pink-50 hover:bg-pink-100/70 dark:bg-pink-900/20 dark:hover:bg-pink-900/30",
    badgeBg: "bg-pink-100 dark:bg-pink-950/80 border-pink-200 dark:border-pink-800",
    badgeText: "text-pink-700 dark:text-pink-300",
    borderAccent: "border-pink-500",
    placeholder: "Search grades, transcript, assignments, timetable, study assistant...",
  },
  parent: {
    ringFocus: "focus:ring-orange-500/20 focus:border-orange-500/40",
    textAccent: "text-orange-600 dark:text-orange-400",
    bgAccentLight: "bg-orange-50 hover:bg-orange-100/70 dark:bg-orange-900/20 dark:hover:bg-orange-900/30",
    badgeBg: "bg-orange-100 dark:bg-orange-950/80 border-orange-200 dark:border-orange-800",
    badgeText: "text-orange-700 dark:text-orange-300",
    borderAccent: "border-orange-500",
    placeholder: "Search child progress, terminal report, fees, attendance, remarks...",
  },
};

export const GlobalCommandSearch: React.FC<GlobalCommandSearchProps> = ({
  role,
  featureFlags = {},
  onOpenQR,
  className,
}) => {
  const router = useRouter();
  const theme = ROLE_THEMES[role];

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Generate searchable database based on role
  const searchItems: SearchItem[] = useMemo(() => {
    switch (role) {
      case "admin":
        return [
          // ⚡ QUICK ACTIONS
          {
            id: "act-add-student",
            title: "Add New Student",
            category: "Quick Actions",
            description: "Enroll a new learner into the school database",
            href: "/dashboard/admin/students",
            icon: PlusCircle,
            keywords: ["add", "enroll", "admit", "new student", "registration", "intake"],
            badge: "Action",
            isQuickAction: true,
          },
          {
            id: "act-add-teacher",
            title: "Add New Teacher / Staff",
            category: "Quick Actions",
            description: "Invite or register a new instructor into the faculty roster",
            href: "/dashboard/admin/teachers",
            icon: Users,
            keywords: ["add teacher", "hire", "new faculty", "staff", "instructor", "invite"],
            badge: "Action",
            isQuickAction: true,
          },
          {
            id: "act-create-class",
            title: "Create Class / Section",
            category: "Quick Actions",
            description: "Set up a new grade level, stream, or classroom",
            href: "/dashboard/admin/classes",
            icon: School,
            keywords: ["new class", "grade", "create room", "division", "stream"],
            badge: "Action",
            isQuickAction: true,
          },
          {
            id: "act-view-transcript",
            title: "Generate Student Transcript",
            category: "Quick Actions",
            description: "Search and preview cumulative multi-term official student transcripts",
            href: "/dashboard/admin/transcript",
            icon: GraduationCap,
            keywords: ["transcript", "cumulative", "history", "gpa", "official records", "print"],
            badge: "Records",
            isQuickAction: true,
          },
          {
            id: "act-approve-results",
            title: "Approve & Publish Final Results",
            category: "Quick Actions",
            description: "Certify and lock terminal examination score sheets for students and parents",
            href: "/dashboard/admin/records",
            icon: Folder,
            keywords: ["approve", "publish", "results", "certified", "lock", "signature", "terminal report"],
            badge: "Approval",
            isQuickAction: true,
          },
          {
            id: "act-offline-grades",
            title: "Offline Grades Bulk Spreadsheet",
            category: "Quick Actions",
            description: "Input and sync assessment marks via fast spreadsheet table",
            href: "/dashboard/admin/offline-grades",
            icon: FileSpreadsheet,
            keywords: ["offline", "excel", "sheet", "spreadsheet", "batch marks", "scores"],
            badge: "Marks",
            isQuickAction: true,
          },
          ...(onOpenQR
            ? [
                {
                  id: "act-open-qr",
                  title: "Show My Admin QR Credential",
                  category: "Quick Actions" as const,
                  description: "Display quick scan identity QR code for verification",
                  action: onOpenQR,
                  icon: QrCode,
                  keywords: ["qr", "scan", "code", "badge", "id card", "verify"],
                  badge: "Security",
                  isQuickAction: true,
                },
              ]
            : []),
          {
            id: "act-admin-profile",
            title: "Admin Profile & School Tenures",
            category: "Quick Actions",
            description: "View your full administrative identity and all school governance affiliations",
            href: "/dashboard/admin/profile",
            icon: Shield,
            keywords: ["admin profile", "identity", "tenures", "other schools", "credentials", "account"],
            badge: "Account",
            isQuickAction: true,
          },

          // 🧭 CORE NAVIGATION
          {
            id: "nav-overview",
            title: "Executive Dashboard",
            category: "Core Navigation",
            description: "Institutional KPI metrics, student attendance pulse, and financial summaries",
            href: "/dashboard/admin",
            icon: LayoutDashboard,
            featureKey: "overview",
            keywords: ["home", "stats", "kpi", "summary", "overview", "analytics", "pulse"],
          },
          {
            id: "nav-school-profile",
            title: "School Profile & Branding",
            category: "Core Navigation",
            description: "School name, motto, logo, official crest, and campus contact details",
            href: "/dashboard/admin/school-profile",
            icon: Building2,
            featureKey: "schoolProfile",
            keywords: ["branding", "crest", "motto", "address", "campus", "configuration"],
          },
          {
            id: "nav-team",
            title: "Administrative Team & Roles",
            category: "Core Navigation",
            description: "Manage administrators, sub-admins, permissions, and security roles",
            href: "/dashboard/admin/team",
            icon: Shield,
            featureKey: "team",
            keywords: ["team", "principals", "owners", "roles", "privileges", "permissions", "staff"],
          },
          {
            id: "nav-teachers",
            title: "Teacher Roster & Faculty Directory",
            category: "Core Navigation",
            description: "View teacher profiles, assigned subjects, contact info, and status",
            href: "/dashboard/admin/teachers",
            icon: Users,
            featureKey: "teachers",
            keywords: ["teachers", "faculty", "instructors", "tutors", "educators", "staff"],
          },
          {
            id: "nav-students",
            title: "Student Admissions & Directory",
            category: "Core Navigation",
            description: "Manage enrolled learners, admissions numbers, class lists, and guardians",
            href: "/dashboard/admin/students",
            icon: GraduationCap,
            featureKey: "students",
            keywords: ["students", "learners", "pupils", "admissions", "roster", "enrollment"],
          },
          {
            id: "nav-invitations",
            title: "Invitations & Onboarding",
            category: "Core Navigation",
            description: "Send and track portal invitations for teachers, parents, and students",
            href: "/dashboard/admin/invitations",
            icon: MailPlus,
            featureKey: "invitations",
            keywords: ["invites", "join", "onboarding", "email invites", "activation codes"],
          },
          {
            id: "nav-classes",
            title: "Classes, Sections & Timetable",
            category: "Core Navigation",
            description: "Classrooms, assigned class teachers, weekly schedules, and periods",
            href: "/dashboard/admin/classes",
            icon: CalendarDays,
            featureKey: "classes",
            keywords: ["classes", "sections", "schedule", "timetable", "periods", "streams"],
          },
          {
            id: "nav-linking",
            title: "Linking Hub & Family Mapping",
            category: "Core Navigation",
            description: "Link parents to children, connect teachers to classes and subjects",
            href: "/dashboard/admin/linking",
            icon: BrainCircuit,
            featureKey: "linkingHub",
            keywords: ["linking", "parents", "guardians", "connect", "family", "bind"],
          },
          {
            id: "nav-sessions",
            title: "Academic Sessions & Term Setup",
            category: "Core Navigation",
            description: "Configure academic years, active terms, start/end dates, and holidays",
            href: "/dashboard/admin/sessions",
            icon: CalendarClock,
            featureKey: "sessions",
            keywords: ["session", "term", "semester", "academic year", "dates", "calendar"],
          },
          {
            id: "nav-subdomain",
            title: "School Portal Subdomain & Landing",
            category: "Core Navigation",
            description: "Public school portal URL, website showcase, and admissions portal",
            href: "/dashboard/admin/subdomain",
            icon: Globe,
            featureKey: "subdomain",
            keywords: ["website", "subdomain", "portal", "url", "admissions page"],
          },
          {
            id: "nav-inquiries",
            title: "Inquiries & Prospective Leads",
            category: "Core Navigation",
            description: "Prospective student inquiries, contact form messages, and parent questions",
            href: "/dashboard/admin/inquiries",
            icon: MessageSquare,
            featureKey: "subdomain",
            keywords: ["inquiries", "leads", "contact", "prospects", "questions", "messages"],
          },

          // 📊 ACADEMICS & RECORDS
          {
            id: "nav-records",
            title: "Final Results & Certification",
            category: "Academics & Records",
            description: "Official terminal broadsheets, report card approvals, and print certification",
            href: "/dashboard/admin/records",
            icon: Folder,
            featureKey: "records",
            keywords: ["results", "report card", "terminal", "marks", "scores", "approval", "broadsheet"],
          },
          {
            id: "nav-transcript",
            title: "Student Transcripts",
            category: "Academics & Records",
            description: "Official cumulative multi-term academic record and GPA certificates",
            href: "/dashboard/admin/transcript",
            icon: GraduationCap,
            featureKey: "transcript",
            keywords: ["transcripts", "cumulative", "gpa", "cgpa", "graduation", "records"],
          },
          {
            id: "nav-grades",
            title: "Grades & Continuous Assessment",
            category: "Academics & Records",
            description: "Test scores, midterm assessments, exams grading, and grade scales",
            href: "/dashboard/admin/grades",
            icon: Award,
            featureKey: "grades",
            keywords: ["grades", "ca", "continuous assessment", "marks", "scores", "grading scale"],
          },
          {
            id: "nav-exams",
            title: "Exams & Quizzes Setup",
            category: "Academics & Records",
            description: "Schedule school-wide exams, CBT tests, and quiz configurations",
            href: "/dashboard/admin/exams",
            icon: BookOpenCheck,
            featureKey: "exams",
            keywords: ["exams", "quizzes", "cbt", "tests", "midterms", "finals"],
          },
          {
            id: "nav-assignments",
            title: "Assignments & Homework Tracking",
            category: "Academics & Records",
            description: "Monitor teacher assignments, student submissions, and deadlines",
            href: "/dashboard/admin/assignments",
            icon: ClipboardList,
            featureKey: "assignments",
            keywords: ["homework", "assignments", "tasks", "submissions", "projects"],
          },
          {
            id: "nav-subjects",
            title: "Subjects & Curriculum",
            category: "Academics & Records",
            description: "Course catalog, core & elective subjects, syllabi, and credit units",
            href: "/dashboard/admin/subjects",
            icon: BookOpen,
            featureKey: "subjects",
            keywords: ["subjects", "courses", "curriculum", "syllabus", "units"],
          },
          {
            id: "nav-departments",
            title: "Academic Departments",
            category: "Academics & Records",
            description: "Faculties (Science, Arts, Commercial), HODs, and department resources",
            href: "/dashboard/admin/departments",
            icon: Building2,
            featureKey: "departments",
            keywords: ["departments", "faculties", "hod", "divisions", "sections"],
          },
          {
            id: "nav-attendance",
            title: "Attendance & Punctuality",
            category: "Academics & Records",
            description: "Track daily roll-call, teacher sign-ins, and student absence rates",
            href: "/dashboard/admin/attendance",
            icon: CheckSquare,
            featureKey: "attendance",
            keywords: ["attendance", "present", "absent", "roll call", "punctuality", "register"],
          },
          {
            id: "nav-library",
            title: "Library Catalog & Textbooks",
            category: "Academics & Records",
            description: "Manage book repository, loaned copies, returns, and digital reading",
            href: "/dashboard/admin/library",
            icon: LibraryBig,
            featureKey: "library",
            keywords: ["library", "books", "reading", "ebooks", "borrow", "catalog"],
          },

          // 💳 ADMINISTRATION & FINANCE
          {
            id: "nav-finance",
            title: "Finance & Fee Structuring",
            category: "Administration",
            description: "Tuition structures, fee heads, discounts, and payment policies",
            href: "/dashboard/admin/finance",
            icon: CreditCard,
            featureKey: "finance",
            keywords: ["finance", "fees", "tuition", "money", "billing", "budget", "invoices"],
          },
          {
            id: "nav-payments",
            title: "Payments & Collections",
            category: "Administration",
            description: "Track incoming parent tuition fees, bank transfers, and receipts",
            href: "/dashboard/admin/payments",
            icon: WalletCards,
            featureKey: "payments",
            keywords: ["payments", "receipts", "collected", "tuition", "bank", "pay"],
          },
          {
            id: "nav-transactions",
            title: "Transaction History & Ledger",
            category: "Administration",
            description: "Complete financial audit trail, settlement history, and refunds",
            href: "/dashboard/admin/transactions",
            icon: CreditCard,
            featureKey: "transactionHistory",
            keywords: ["transactions", "ledger", "audit", "history", "settlements"],
          },
          {
            id: "nav-reports",
            title: "Institutional Reports & Analytics",
            category: "Administration",
            description: "Academic performance charts, attendance summaries, and demographic data",
            href: "/dashboard/admin/reports",
            icon: BarChart3,
            featureKey: "reports",
            keywords: ["reports", "analytics", "charts", "trends", "demographics", "stats"],
          },

          // 💬 COMMUNICATION & MEDIA
          {
            id: "nav-chat",
            title: "Chat & School Communication",
            category: "Communication",
            description: "Broadcast announcements, direct messaging with teachers and staff",
            href: "/dashboard/admin/chat",
            icon: MessageSquare,
            featureKey: "communication",
            keywords: ["chat", "messages", "announcements", "broadcast", "sms", "email"],
          },
          {
            id: "nav-gallery",
            title: "Gallery & School Media",
            category: "Communication",
            description: "School event albums, student achievements, and media showcase",
            href: "/dashboard/admin/gallery",
            icon: Landmark,
            featureKey: "gallery",
            keywords: ["gallery", "photos", "pictures", "events", "media", "album"],
          },

          // ⚙️ TOOLS & SETTINGS
          {
            id: "nav-ai-tools",
            title: "AI Tools & Academic Generators",
            category: "Tools & Settings",
            description: "AI-assisted exam question generator, grading aids, and curriculum tools",
            href: "/dashboard/admin/ai-tools",
            icon: BrainCircuit,
            featureKey: "aiTools",
            keywords: ["ai", "artificial intelligence", "generator", "smart tools", "bot"],
          },
          {
            id: "nav-simulations",
            title: "Interactive Simulations & STEM Lab",
            category: "Tools & Settings",
            description: "Interactive learning simulations and digital experiments",
            href: "/dashboard/admin/simulations",
            icon: Workflow,
            featureKey: "simulations",
            keywords: ["simulations", "stem", "lab", "experiments", "interactive"],
          },
          {
            id: "nav-billing",
            title: "SchoolHub Subscription & Plan",
            category: "Tools & Settings",
            description: "Manage portal subscription, active tier, student licenses, and billing",
            href: "/dashboard/admin/billing",
            icon: CreditCard,
            featureKey: "billing",
            keywords: ["subscription", "plan", "pricing", "licenses", "renew", "invoice"],
          },
          {
            id: "nav-settings",
            title: "System Settings",
            category: "Tools & Settings",
            description: "Platform preferences, time zone, security, and institutional options",
            href: "/dashboard/admin/settings",
            icon: Settings,
            featureKey: "settings",
            keywords: ["settings", "preferences", "system", "security", "configure"],
          },
          {
            id: "nav-support",
            title: "Help & Technical Support",
            category: "Tools & Settings",
            description: "Knowledge base, support tickets, contact technical assistance",
            href: "/dashboard/admin/support",
            icon: LifeBuoy,
            featureKey: "support",
            keywords: ["help", "support", "ticket", "assistance", "guide", "docs"],
          },
        ];

      case "teacher":
        return [
          // ⚡ QUICK ACTIONS (TEACHER)
          {
            id: "act-grade-entry",
            title: "Enter Assessment Marks",
            category: "Quick Actions",
            description: "Input student CA marks and test results for your classes",
            href: "/dashboard/teacher/grades",
            icon: Award,
            keywords: ["grades", "marks", "enter marks", "score", "assessment", "record"],
            badge: "Grading",
            isQuickAction: true,
          },
          {
            id: "act-offline-grades",
            title: "Offline Spreadsheet Marks",
            category: "Quick Actions",
            description: "Fast tabular marks entry with instant auto-save and CSV export",
            href: "/dashboard/teacher/offline-grades",
            icon: FileSpreadsheet,
            keywords: ["offline", "excel", "spreadsheet", "batch marks", "scores", "marks"],
            badge: "Fast Entry",
            isQuickAction: true,
          },
          {
            id: "act-final-results",
            title: "Submit Final Results for Approval",
            category: "Quick Actions",
            description: "Compile and submit official termly broadsheets for admin certification",
            href: "/dashboard/teacher/records",
            icon: FileCheck2,
            keywords: ["records", "final results", "submit for approval", "terminal", "report card"],
            badge: "Certified",
            isQuickAction: true,
          },
          {
            id: "act-create-assignment",
            title: "Create New Assignment",
            category: "Quick Actions",
            description: "Post homework or coursework with instructions and deadlines",
            href: "/dashboard/teacher/assignments",
            icon: PlusCircle,
            keywords: ["new assignment", "homework", "task", "post work", "create assignment"],
            badge: "Coursework",
            isQuickAction: true,
          },
          {
            id: "act-create-quiz",
            title: "Create Quiz / Online Exam",
            category: "Quick Actions",
            description: "Build interactive CBT quizzes and continuous assessment tests",
            href: "/dashboard/teacher/exams&quizzes",
            icon: BookOpenCheck,
            keywords: ["quiz", "exam", "test", "cbt", "create test", "questions"],
            badge: "Testing",
            isQuickAction: true,
          },
          {
            id: "act-view-timetable",
            title: "View My Teaching Timetable",
            category: "Quick Actions",
            description: "Check your assigned weekly periods, classrooms, and subject hours",
            href: "/dashboard/teacher/timetable",
            icon: CalendarClock,
            keywords: ["timetable", "schedule", "routine", "periods", "class time", "today"],
            badge: "Schedule",
            isQuickAction: true,
          },
          ...(onOpenQR
            ? [
                {
                  id: "act-teacher-qr",
                  title: "Show My Teacher QR Credential",
                  category: "Quick Actions" as const,
                  description: "Display your official educator identity QR card",
                  action: onOpenQR,
                  icon: QrCode,
                  keywords: ["qr", "scan", "id", "badge", "credential", "verify"],
                  badge: "ID Card",
                  isQuickAction: true,
                },
              ]
            : []),

          // 🧭 CORE NAVIGATION & ACADEMICS
          {
            id: "nav-t-dash",
            title: "Teacher Dashboard",
            category: "Core Navigation",
            description: "Class summary, pending submissions, today's schedule, and updates",
            href: "/dashboard/teacher",
            icon: LayoutDashboard,
            featureKey: "dashboard",
            keywords: ["home", "dashboard", "summary", "overview", "teacher hub"],
          },
          {
            id: "nav-t-students",
            title: "My Students Roster",
            category: "Core Navigation",
            description: "Roster of all learners in your assigned classes with contact details",
            href: "/dashboard/teacher/students",
            icon: Users,
            featureKey: "students",
            keywords: ["students", "pupils", "roster", "learners", "directory", "roll call"],
          },
          {
            id: "nav-t-parents",
            title: "Parents Directory",
            category: "Core Navigation",
            description: "Parent contact cards, phone numbers, and direct family links",
            href: "/dashboard/teacher/parents",
            icon: User,
            featureKey: "parents",
            keywords: ["parents", "guardians", "contacts", "mothers", "fathers", "family"],
          },
          {
            id: "nav-t-classes",
            title: "My Classes & Sections",
            category: "Core Navigation",
            description: "Overview of your assigned classes, class sizes, and subject allocations",
            href: "/dashboard/teacher/my-classes",
            icon: BookOpenCheck,
            featureKey: "classes",
            keywords: ["classes", "sections", "grade levels", "streams", "classroom"],
          },
          {
            id: "nav-t-subjects",
            title: "Subjects Taught",
            category: "Academics & Records",
            description: "Your assigned teaching subjects, syllabi, and curriculum topics",
            href: "/dashboard/teacher/subjects",
            icon: BookOpen,
            featureKey: "subjects",
            keywords: ["subjects", "curriculum", "courses", "syllabus", "topics"],
          },
          {
            id: "nav-t-assignments",
            title: "Assignments & Homework Manager",
            category: "Academics & Records",
            description: "Track student submissions, review coursework, and grade homework",
            href: "/dashboard/teacher/assignments",
            icon: ClipboardList,
            featureKey: "assignments",
            keywords: ["assignments", "homework", "tasks", "submissions", "deadline"],
          },
          {
            id: "nav-t-grades",
            title: "Grades & Continuous Assessment",
            category: "Academics & Records",
            description: "Input student CA scores, midterm marks, and final exam grades",
            href: "/dashboard/teacher/grades",
            icon: Award,
            featureKey: "grades",
            keywords: ["grades", "marks", "scores", "ca", "grading", "assessment"],
          },
          {
            id: "nav-t-records",
            title: "Final Results Broadsheet",
            category: "Academics & Records",
            description: "Official terminal student results, approval workflow, and remarks",
            href: "/dashboard/teacher/records",
            icon: FileCheck2,
            featureKey: "records",
            keywords: ["results", "terminal report", "records", "broadsheet", "approve", "publish"],
          },
          {
            id: "nav-t-exams",
            title: "Exams & Quizzes",
            category: "Academics & Records",
            description: "Manage test questions, CBT assessments, and student exam attempts",
            href: "/dashboard/teacher/exams&quizzes",
            icon: FileCheck2,
            featureKey: "exams",
            keywords: ["exams", "quizzes", "tests", "cbt", "questions", "scoring"],
          },
          {
            id: "nav-t-timetable",
            title: "Weekly Timetable & Schedule",
            category: "Academics & Records",
            description: "Weekly period breakdown, subject hours, and classroom allocations",
            href: "/dashboard/teacher/timetable",
            icon: CalendarClock,
            featureKey: "timetable",
            keywords: ["timetable", "schedule", "routine", "periods", "classes"],
          },
          {
            id: "nav-t-reports",
            title: "Performance Reports & Analytics",
            category: "Academics & Records",
            description: "Student grade distributions, subject pass rates, and class trends",
            href: "/dashboard/teacher/reports",
            icon: BarChart3,
            featureKey: "reports",
            keywords: ["performance", "reports", "analytics", "charts", "trends", "pass rate"],
          },
          {
            id: "nav-t-linking",
            title: "Linking Hub",
            category: "Core Navigation",
            description: "Manage student-teacher associations and student group mapping",
            href: "/dashboard/teacher/linking",
            icon: Share2,
            featureKey: "linking",
            keywords: ["linking", "connect", "students", "classes", "hub"],
          },
          {
            id: "nav-t-ai",
            title: "AI Teaching Assistant & Lesson Planner",
            category: "Tools & Settings",
            description: "Generate lesson notes, quiz questions, and automated teaching aids",
            href: "/dashboard/teacher/ai-tools",
            icon: Brain,
            featureKey: "aiTools",
            keywords: ["ai", "lesson plan", "generator", "quiz generator", "assistant"],
          },
          {
            id: "nav-t-resources",
            title: "Teaching Resources & Materials",
            category: "Tools & Settings",
            description: "Course handouts, slides, reference links, and study materials",
            href: "/dashboard/teacher/resources",
            icon: BookMarked,
            featureKey: "resources",
            keywords: ["resources", "materials", "handouts", "slides", "notes"],
          },
          {
            id: "nav-t-documents",
            title: "School Documents & Circulars",
            category: "Tools & Settings",
            description: "Institutional forms, guidelines, calendar PDF, and staff circulars",
            href: "/dashboard/teacher/documents",
            icon: FileText,
            featureKey: "documents",
            keywords: ["documents", "circulars", "policies", "forms", "calendar"],
          },
          {
            id: "nav-t-messages",
            title: "Messages & Class Discussions",
            category: "Communication",
            description: "Communicate with colleagues, parents, and administrative staff",
            href: "/dashboard/teacher/messages",
            icon: MessageSquare,
            featureKey: "messages",
            keywords: ["messages", "chat", "inbox", "parent chat", "communication"],
          },
          {
            id: "nav-t-notifications",
            title: "Notifications & Alerts",
            category: "Communication",
            description: "View deadlines, submission alerts, and administrative notices",
            href: "/dashboard/teacher/notifications",
            icon: Bell,
            featureKey: "notifications",
            keywords: ["notifications", "alerts", "deadlines", "reminders"],
          },
          {
            id: "nav-t-profile",
            title: "Teacher Profile & Credentials",
            category: "Tools & Settings",
            description: "Update personal profile, qualifications, contact email, and avatar",
            href: "/dashboard/teacher/profile",
            icon: User,
            featureKey: "profile",
            keywords: ["profile", "bio", "qualifications", "avatar", "account"],
          },
          {
            id: "nav-t-billing",
            title: "Subscription & Quotas",
            category: "Tools & Settings",
            description: "View school portal membership and accessible feature quotas",
            href: "/dashboard/teacher/billing",
            icon: CreditCard,
            featureKey: "billing",
            keywords: ["subscription", "plan", "quota", "membership"],
          },
          {
            id: "nav-t-settings",
            title: "Settings & Preferences",
            category: "Tools & Settings",
            description: "Notification preferences, display options, and security",
            href: "/dashboard/teacher/settings",
            icon: Settings,
            featureKey: "settings",
            keywords: ["settings", "preferences", "password", "theme"],
          },
          {
            id: "nav-t-support",
            title: "Help & Teacher Support",
            category: "Tools & Settings",
            description: "Get assistance, report issues, and view help documentation",
            href: "/dashboard/teacher/support",
            icon: LifeBuoy,
            featureKey: "support",
            keywords: ["help", "support", "ticket", "guide"],
          },
        ];

      case "student":
        return [
          // ⚡ QUICK ACTIONS (STUDENT)
          {
            id: "act-s-transcript",
            title: "View My Cumulative Transcript",
            category: "Quick Actions",
            description: "Preview and download your official multi-term academic record",
            href: "/dashboard/student/transcript",
            icon: GraduationCap,
            keywords: ["transcript", "cumulative", "history", "official record", "gpa", "cgpa"],
            badge: "Records",
            isQuickAction: true,
          },
          {
            id: "act-s-results",
            title: "Check Final Termly Results",
            category: "Quick Actions",
            description: "Access your certified report card and terminal exam performance",
            href: "/dashboard/student/result/termly",
            icon: School,
            keywords: ["report card", "terminal results", "scores", "marks", "final results", "grades"],
            badge: "Report Card",
            isQuickAction: true,
          },
          {
            id: "act-s-assignments",
            title: "Check Pending Assignments",
            category: "Quick Actions",
            description: "Review homework due dates and submit coursework to teachers",
            href: "/dashboard/student/assignments",
            icon: ClipboardList,
            keywords: ["assignments", "homework", "due dates", "tasks", "submit work"],
            badge: "Homework",
            isQuickAction: true,
          },
          {
            id: "act-s-exams",
            title: "Take Scheduled Quiz / CBT Exam",
            category: "Quick Actions",
            description: "Access online quizzes, midterms, and test questions",
            href: "/dashboard/student/exams&quizzes",
            icon: FileCheck2,
            keywords: ["cbt", "quiz", "test", "exam", "take exam", "questions"],
            badge: "Testing",
            isQuickAction: true,
          },
          {
            id: "act-s-timetable",
            title: "View Class Timetable",
            category: "Quick Actions",
            description: "Check today's period routine, subject hours, and classrooms",
            href: "/student/timetable",
            icon: CalendarClock,
            keywords: ["timetable", "schedule", "classes today", "routine", "periods"],
            badge: "Routine",
            isQuickAction: true,
          },
          {
            id: "act-s-ai",
            title: "Ask AI Study Assistant",
            category: "Quick Actions",
            description: "Get homework help, step-by-step explanations, and revision quizzes",
            href: "/student/ai-study",
            icon: Brain,
            keywords: ["ai", "study helper", "tutor", "homework help", "solve", "bot"],
            badge: "AI Study",
            isQuickAction: true,
          },
          ...(onOpenQR
            ? [
                {
                  id: "act-s-qr",
                  title: "Show My Student ID QR Code",
                  category: "Quick Actions" as const,
                  description: "Digital student badge for library, attendance, and campus verification",
                  action: onOpenQR,
                  icon: QrCode,
                  keywords: ["qr", "badge", "id card", "student card", "scan"],
                  badge: "Digital ID",
                  isQuickAction: true,
                },
              ]
            : []),

          // 🧭 CORE NAVIGATION
          {
            id: "nav-s-dash",
            title: "Student Dashboard",
            category: "Core Navigation",
            description: "Overview of your academic progress, upcoming tasks, and announcements",
            href: "/dashboard/student",
            icon: LayoutDashboard,
            featureKey: "dashboard",
            keywords: ["home", "dashboard", "overview", "progress"],
          },
          {
            id: "nav-s-classes",
            title: "My Classes & Enrolled Subjects",
            category: "Core Navigation",
            description: "List of your subjects, assigned teachers, and course outlines",
            href: "/dashboard/student/my-classes",
            icon: BookOpenCheck,
            featureKey: "classes",
            keywords: ["classes", "subjects", "teachers", "courses"],
          },
          {
            id: "nav-s-grades",
            title: "Academic Grades & CA Scores",
            category: "Academics & Records",
            description: "Continuous assessment scores, test marks, and subject breakdowns",
            href: "/dashboard/student/grades",
            icon: BarChart3,
            featureKey: "results",
            keywords: ["grades", "marks", "scores", "ca", "tests", "continuous assessment"],
          },
          {
            id: "nav-s-offline-grades",
            title: "Offline Test Records",
            category: "Academics & Records",
            description: "Review recorded class test scores and spreadsheet marks",
            href: "/dashboard/student/offline-grades",
            icon: FileSpreadsheet,
            featureKey: "offlineGrades",
            keywords: ["offline", "scores", "marks", "test records"],
          },
          {
            id: "nav-s-attendance",
            title: "Attendance & Punctuality Record",
            category: "Academics & Records",
            description: "Track your class attendance rate, punctuality, and absence history",
            href: "/dashboard/student/attendance",
            icon: CalendarDays,
            featureKey: "attendance",
            keywords: ["attendance", "present", "absent", "roll call", "punctuality"],
          },
          {
            id: "nav-s-documents",
            title: "Study Documents & Handouts",
            category: "Academics & Records",
            description: "Download lesson notes, textbooks, PDF guides, and revision sheets",
            href: "/dashboard/student/documents",
            icon: FileText,
            featureKey: "documents",
            keywords: ["documents", "notes", "handouts", "textbooks", "pdf", "downloads"],
          },
          {
            id: "nav-s-messages",
            title: "Messages & Discussions",
            category: "Communication",
            description: "Chat with teachers, ask questions, and collaborate with classmates",
            href: "/student/messages",
            icon: MessageCircle,
            featureKey: "messages",
            keywords: ["messages", "chat", "teacher chat", "inbox"],
          },
          {
            id: "nav-s-linking",
            title: "Linking Hub & Family Links",
            category: "Communication",
            description: "View verified parent/guardian links and family connections",
            href: "/dashboard/student/linking",
            icon: Link2,
            featureKey: "linking",
            keywords: ["linking", "parents", "family", "guardians"],
          },
          {
            id: "nav-s-notifications",
            title: "Notifications & Alerts",
            category: "Communication",
            description: "Assignment alerts, exam dates, report card publications, and reminders",
            href: "/dashboard/student/notifications",
            icon: Bell,
            featureKey: "notifications",
            keywords: ["notifications", "alerts", "deadlines", "reminders"],
          },
          {
            id: "nav-s-profile",
            title: "Student Profile",
            category: "Tools & Settings",
            description: "View academic registration number, personal bio, and account details",
            href: "/dashboard/student/profile",
            icon: User,
            featureKey: "profile",
            keywords: ["profile", "bio", "reg number", "avatar", "account"],
          },
          {
            id: "nav-s-settings",
            title: "Settings & Preferences",
            category: "Tools & Settings",
            description: "Customize theme, update security password, and notifications",
            href: "/dashboard/student/settings",
            icon: Settings,
            featureKey: "settings",
            keywords: ["settings", "preferences", "password", "theme"],
          },
          {
            id: "nav-s-support",
            title: "Student Support Center",
            category: "Tools & Settings",
            description: "Get assistance, user guides, and contact school portal help desk",
            href: "/dashboard/student/support",
            icon: LifeBuoy,
            featureKey: "support",
            keywords: ["help", "support", "ticket", "assistance"],
          },
        ];

      case "parent":
        return [
          // ⚡ QUICK ACTIONS (PARENT)
          {
            id: "act-p-report-card",
            title: "View Child's Termly Report Card",
            category: "Quick Actions",
            description: "Access certified terminal academic results and teacher comments",
            href: "/dashboard/parent/result/termly",
            icon: School,
            keywords: ["report card", "terminal results", "final marks", "grades", "scores", "position"],
            badge: "Report Card",
            isQuickAction: true,
          },
          {
            id: "act-p-performance",
            title: "Check Academic Performance Trends",
            category: "Quick Actions",
            description: "View GPA progression, subject rankings, and term-over-term growth",
            href: "/dashboard/parent/performance",
            icon: BarChart3,
            keywords: ["performance", "gpa", "analytics", "progress", "growth", "scores", "ranks"],
            badge: "Analytics",
            isQuickAction: true,
          },
          {
            id: "act-p-attendance",
            title: "Monitor Attendance & Punctuality",
            category: "Quick Actions",
            description: "Check roll call status, morning punctuality, and attendance rate",
            href: "/dashboard/parent/attendance",
            icon: CalendarDays,
            keywords: ["attendance", "present", "absent", "roll call", "late", "punctuality"],
            badge: "Attendance",
            isQuickAction: true,
          },
          {
            id: "act-p-fees",
            title: "Check School Fees & Tuition",
            category: "Quick Actions",
            description: "Review fee breakdown, outstanding balances, and payment receipts",
            href: "/dashboard/parent/billing",
            icon: CreditCard,
            keywords: ["fees", "tuition", "bills", "payment", "money", "receipts", "balance"],
            badge: "Finance",
            isQuickAction: true,
          },
          {
            id: "act-p-homework",
            title: "Review Homework & Assignments",
            category: "Quick Actions",
            description: "Inspect assigned homework tasks, due dates, and submissions",
            href: "/dashboard/parent/assignments",
            icon: ClipboardList,
            keywords: ["homework", "assignments", "tasks", "due dates", "coursework"],
            badge: "Homework",
            isQuickAction: true,
          },
          {
            id: "act-p-message-teacher",
            title: "Message Class Teacher",
            category: "Quick Actions",
            description: "Send direct inquiries and communicate with classroom educators",
            href: "/dashboard/parent/messages",
            icon: MessageSquare,
            keywords: ["chat", "message teacher", "inquiry", "contact", "educator"],
            badge: "Communication",
            isQuickAction: true,
          },
          ...(onOpenQR
            ? [
                {
                  id: "act-p-qr",
                  title: "Show Parent Access Pass QR",
                  category: "Quick Actions" as const,
                  description: "Digital guardian pass for school gate and student pick-up verification",
                  action: onOpenQR,
                  icon: QrCode,
                  keywords: ["qr", "pass", "pickup", "gate pass", "guardian id"],
                  badge: "Gate Pass",
                  isQuickAction: true,
                },
              ]
            : []),

          // 🧭 CORE NAVIGATION
          {
            id: "nav-p-dash",
            title: "Parent Overview",
            category: "Core Navigation",
            description: "Comprehensive summary of your child's attendance, grades, and school alerts",
            href: "/dashboard/parent",
            icon: LayoutDashboard,
            featureKey: "dashboard",
            keywords: ["home", "dashboard", "overview", "summary", "progress"],
          },
          {
            id: "nav-p-children",
            title: "My Children Directory",
            category: "Core Navigation",
            description: "Switch between your linked children, view profiles, and school details",
            href: "/dashboard/parent/my-children",
            icon: Users,
            featureKey: "children",
            keywords: ["children", "kids", "wards", "sons", "daughters", "pupils", "switcher"],
          },
          {
            id: "nav-p-class",
            title: "Class & Teacher Information",
            category: "Core Navigation",
            description: "Child's assigned classroom, form teacher, subject teachers, and timetable",
            href: "/dashboard/parent/class",
            icon: School,
            featureKey: "classes",
            keywords: ["class", "form teacher", "teachers", "classroom", "division"],
          },
          {
            id: "nav-p-exams-results",
            title: "Exams & Continuous Assessment",
            category: "Academics & Records",
            description: "Detailed breakdown of continuous assessment tests and exam results",
            href: "/dashboard/parent/exams&results",
            icon: FileCheck2,
            featureKey: "results",
            keywords: ["exams", "quizzes", "test results", "scores", "marks", "ca"],
          },
          {
            id: "nav-p-offline-results",
            title: "Offline Test Scores",
            category: "Academics & Records",
            description: "View teacher-recorded class assessments and test sheets",
            href: "/dashboard/parent/offline-grades",
            icon: FileSpreadsheet,
            featureKey: "offlineGrades",
            keywords: ["offline", "scores", "marks", "test records"],
          },
          {
            id: "nav-p-behavior",
            title: "Behavior, Conduct & Remarks",
            category: "Academics & Records",
            description: "Teacher remarks, character commendations, and behavioral reports",
            href: "/dashboard/parent/behavior",
            icon: Award,
            featureKey: "behavior",
            keywords: ["behavior", "conduct", "remarks", "character", "discipline", "commendations"],
          },
          {
            id: "nav-p-ai-insights",
            title: "AI Growth & Parental Insights",
            category: "Tools & Settings",
            description: "Personalized AI suggestions to support your child's academic development",
            href: "/dashboard/parent/ai-insights",
            icon: Brain,
            featureKey: "aiInsights",
            keywords: ["ai", "insights", "study tips", "growth", "strengths", "weaknesses"],
          },
          {
            id: "nav-p-events",
            title: "School Events & Timetable",
            category: "Tools & Settings",
            description: "Academic calendar, term dates, PTA meetings, and sports activities",
            href: "/dashboard/parent/events",
            icon: CalendarClock,
            featureKey: "events",
            keywords: ["events", "calendar", "term dates", "pta", "holidays", "schedule"],
          },
          {
            id: "nav-p-resources",
            title: "Learning Resources",
            category: "Tools & Settings",
            description: "Recommended reading, study resources, and digital guides for parents",
            href: "/dashboard/parent/resources",
            icon: BookMarked,
            featureKey: "resources",
            keywords: ["resources", "materials", "books", "study guides"],
          },
          {
            id: "nav-p-profile",
            title: "Parent Profile",
            category: "Tools & Settings",
            description: "Update guardian contact information, address, and phone number",
            href: "/dashboard/parent/profile",
            icon: User,
            featureKey: "profile",
            keywords: ["profile", "guardian", "phone", "email", "account"],
          },
          {
            id: "nav-p-settings",
            title: "Settings & Notification Alerts",
            category: "Tools & Settings",
            description: "SMS notifications, email alerts, security settings, and preferences",
            href: "/dashboard/parent/settings",
            icon: Settings,
            featureKey: "settings",
            keywords: ["settings", "preferences", "notifications", "alerts", "password"],
          },
          {
            id: "nav-p-support",
            title: "Parent Help & Support",
            category: "Tools & Settings",
            description: "Get answers to common questions and reach the school help desk",
            href: "/dashboard/parent/support",
            icon: LifeBuoy,
            featureKey: "support",
            keywords: ["help", "support", "ticket", "assistance", "faq"],
          },
        ];

      default:
        return [];
    }
  }, [role, onOpenQR]);

  // Filter items based on active feature flags
  const activeItems = useMemo(() => {
    return searchItems.filter((item) => {
      if (!item.featureKey) return true;
      // If feature flag is explicitly defined as false, exclude it
      if (featureFlags[item.featureKey] === false) return false;
      return true;
    });
  }, [searchItems, featureFlags]);

  // Dynamic search matching (Title, Description, Category, Keywords)
  const filteredResults = useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    let items = activeItems;

    // Filter by selected category chip if not "All"
    if (selectedCategory !== "All") {
      items = items.filter((item) => item.category === selectedCategory);
    }

    if (!trimmed) {
      // Return popular items (Quick actions and core items)
      return items.filter((item) => item.isQuickAction || item.category === "Core Navigation").slice(0, 8);
    }

    // Split search query into tokens for multi-term matching
    const tokens = trimmed.split(/\s+/).filter(Boolean);

    return items
      .map((item) => {
        let score = 0;
        const lowerTitle = item.title.toLowerCase();
        const lowerDesc = (item.description || "").toLowerCase();
        const lowerCat = item.category.toLowerCase();
        const keywords = item.keywords.map((k) => k.toLowerCase());

        // Exact match boost
        if (lowerTitle === trimmed) score += 100;
        else if (lowerTitle.startsWith(trimmed)) score += 60;
        else if (lowerTitle.includes(trimmed)) score += 40;

        // Token match
        for (const token of tokens) {
          if (lowerTitle.includes(token)) score += 20;
          if (keywords.some((k) => k.includes(token))) score += 25;
          if (keywords.some((k) => k === token)) score += 50;
          if (lowerDesc.includes(token)) score += 10;
          if (lowerCat.includes(token)) score += 15;
        }

        // Quick actions slight priority boost
        if (item.isQuickAction) score += 5;

        return { item, score };
      })
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
  }, [activeItems, query, selectedCategory]);

  // Available categories for filtering
  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add("All");
    activeItems.forEach((i) => cats.add(i.category));
    return Array.from(cats);
  }, [activeItems]);

  // Reset selected index when filtered results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredResults]);

  // Keyboard shortcut listener (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (window.innerWidth < 768) {
          setIsMobileModalOpen(true);
        } else {
          setIsOpen(true);
          desktopInputRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle outside click for desktop dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation (Arrow keys, Enter, Escape)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredResults.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredResults.length) % Math.max(1, filteredResults.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredResults[selectedIndex]) {
        handleSelectItem(filteredResults[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsOpen(false);
      setIsMobileModalOpen(false);
    }
  };

  const handleSelectItem = (item: SearchItem) => {
    setIsOpen(false);
    setIsMobileModalOpen(false);
    setQuery("");

    if (item.action) {
      item.action();
    } else if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. DESKTOP SEARCH BAR
      ───────────────────────────────────────────────────────────── */}
      <div className={cn("hidden md:flex flex-1 justify-center max-w-md lg:max-w-lg xl:max-w-2xl mx-auto px-2 lg:px-4 relative z-50", className)} ref={containerRef}>
        <div className="relative w-full group">
          <Search
            className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:scale-105 transition-all duration-200 z-10",
              isOpen ? theme.textAccent : "group-hover:text-slate-600 dark:group-hover:text-slate-300"
            )}
            size={18}
          />
          <input
            ref={desktopInputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={theme.placeholder}
            className={cn(
              "w-full pl-11 pr-24 py-2.5 rounded-xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 shadow-sm relative z-10",
              theme.ringFocus
            )}
          />

          {/* Action pills right side: Clear button + ⌘K */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 z-10">
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  desktopInputRef.current?.focus();
                }}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md transition-colors"
                title="Clear query"
              >
                <X size={14} />
              </button>
            )}
            <div className="flex items-center gap-0.5 px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 text-[10px] font-black text-slate-400 select-none shadow-xs">
              <span className="text-[11px] leading-none">⌘</span>K
            </div>
          </div>
        </div>

        {/* Desktop Results Dropdown */}
        {isOpen && (
          <div className="absolute top-[calc(100%+8px)] left-2 lg:left-4 right-2 lg:right-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-3 duration-200 max-h-[520px] flex flex-col">
            {/* Category Filter Chips */}
            <div className="px-3 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all",
                    selectedCategory === cat
                      ? cn("bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs")
                      : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Results List */}
            <div className="overflow-y-auto p-2 space-y-1 custom-scrollbar flex-1" ref={resultsContainerRef}>
              {!query.trim() && (
                <div className="px-3 py-1.5 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={12} className={theme.textAccent} /> Suggested Shortcuts & Quick Actions
                  </span>
                  <span>{filteredResults.length} options</span>
                </div>
              )}

              {filteredResults.length > 0 ? (
                filteredResults.map((item, index) => {
                  const Icon = item.icon;
                  const isSelected = selectedIndex === index;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 group/item border",
                        isSelected
                          ? cn("border-slate-300 dark:border-slate-700 shadow-xs", theme.bgAccentLight)
                          : "border-transparent hover:bg-slate-50 dark:hover:bg-white/5"
                      )}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 border",
                          isSelected
                            ? cn("scale-105 border-transparent shadow-xs", theme.badgeBg, theme.textAccent)
                            : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 group-hover/item:text-slate-800 dark:group-hover/item:text-slate-200"
                        )}
                      >
                        <Icon size={18} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-sm font-bold truncate transition-colors",
                              isSelected ? cn("text-slate-950 dark:text-white", theme.textAccent) : "text-slate-800 dark:text-slate-200"
                            )}
                          >
                            {item.title}
                          </span>
                          {item.badge && (
                            <span
                              className={cn(
                                "text-[9px] uppercase font-black px-1.5 py-0.5 rounded border",
                                theme.badgeBg,
                                theme.badgeText
                              )}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Right indicator */}
                      <div className="shrink-0 flex items-center gap-1 text-slate-300 dark:text-slate-600 group-hover/item:text-slate-500 dark:group-hover/item:text-slate-400">
                        {isSelected ? (
                          <CornerDownLeft size={14} className={theme.textAccent} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="py-12 px-4 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3">
                    <Search className="w-6 h-6 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No matches found</h4>
                  <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs mt-1">
                    We couldn't find anything matching "{query}". Try searching for modules like "grades", "records", "profile", "billing", or "attendance".
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Keyboard Hint Bar */}
            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between text-[11px] font-semibold text-slate-400 shrink-0">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px]">↑</kbd>
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px]">↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px]">↵</kbd>
                  to select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px]">esc</kbd>
                  to close
                </span>
              </div>
              <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                SchoolHub Search
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. MOBILE SEARCH TRIGGER BUTTON (Visible on < md)
      ───────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsMobileModalOpen(true)}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors shadow-xs"
        aria-label="Open mobile search"
      >
        <Search size={18} />
      </button>

      {/* ─────────────────────────────────────────────────────────────
          3. MOBILE COMMAND PALETTE MODAL
      ───────────────────────────────────────────────────────────── */}
      <Dialog open={isMobileModalOpen} onOpenChange={setIsMobileModalOpen}>
        <DialogContent className="p-0 sm:max-w-lg overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
          <DialogTitle className="sr-only">Search</DialogTitle>

          {/* Search Header */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <Search size={18} className={theme.textAccent} />
            <input
              ref={mobileInputRef}
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search features, records, actions..."
              className="flex-1 bg-transparent border-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-sm font-semibold outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Mobile Category Filters */}
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all",
                  selectedCategory === cat
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Mobile Results Scrollable Area */}
          <div className="overflow-y-auto p-2 space-y-1.5 custom-scrollbar flex-1">
            {filteredResults.length > 0 ? (
              filteredResults.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectItem(item)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 active:scale-[0.99] transition-all text-left shadow-xs"
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                        item.isQuickAction ? cn(theme.badgeBg, theme.textAccent) : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                      )}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span
                            className={cn(
                              "text-[9px] uppercase font-black px-1.5 py-0.5 rounded border",
                              theme.badgeBg,
                              theme.badgeText
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight size={16} className="text-slate-400 shrink-0" />
                  </button>
                );
              })
            ) : (
              <div className="py-12 px-4 text-center">
                <Search className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No results found</p>
                <p className="text-xs text-slate-400 mt-1">Try keywords like "grades", "profile", or "attendance"</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GlobalCommandSearch;
