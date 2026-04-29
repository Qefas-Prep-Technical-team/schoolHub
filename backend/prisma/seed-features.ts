import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const INITIAL_FEATURES = [
  // CORE FEATURES
  { featureKey: "dashboard", name: "Dashboard", label: "Dashboard", description: "Main overview page" },
  { featureKey: "overview", name: "Overview", label: "Admin Overview", description: "Administrative dashboard" },
  { featureKey: "schoolProfile", name: "School Profile", label: "Profile", description: "Institution information" },
  { featureKey: "classes", name: "Classes", label: "My Classes", description: "Class management and view" },
  { featureKey: "assignments", name: "Assignments", label: "Assignments", description: "Homework and tasks" },
  { featureKey: "exams", name: "Exams", label: "Exams & Quizzes", description: "Examination system" },
  { featureKey: "grades", name: "Grades", label: "Grades", description: "Grade monitoring" },
  { featureKey: "attendance", name: "Attendance", label: "Attendance", description: "Attendance tracking" },
  { featureKey: "documents", name: "Documents", label: "Documents", description: "File sharing and storage" },
  
  // COMMUNICATION & MANAGEMENT
  { featureKey: "messages", name: "Messages", label: "Messaging", description: "Direct messaging system" },
  { featureKey: "notifications", name: "Notifications", label: "Notifications", description: "Push and in-app alerts" },
  { featureKey: "linking", name: "Linking", label: "Linking Hub", description: "Account connection system" },
  { featureKey: "linkingHub", name: "Admin Linking", label: "Linking Manager", description: "Administrative account linking" },
  { featureKey: "students", name: "Students", label: "Student Management", description: "Student database access" },
  { featureKey: "teachers", name: "Teachers", label: "Teacher Management", description: "Staff database access" },
  { featureKey: "parents", name: "Parents", label: "Parent Directory", description: "Parent contact management" },
  { featureKey: "children", name: "Children", label: "My Children", description: "Child academic monitoring" },
  
  // ACADEMIC & REPORTS
  { featureKey: "sessions", name: "Sessions", label: "Academic Sessions", description: "Term and year management" },
  { featureKey: "subjects", name: "Subjects", label: "Subject Catalog", description: "Course management" },
  { featureKey: "departments", name: "Departments", label: "Departments", description: "Academic units" },
  { featureKey: "library", name: "Library", label: "Library", description: "Resource catalog" },
  { featureKey: "reports", name: "Reports", label: "Academic Reports", description: "Performance analysis" },
  { featureKey: "performance", name: "Performance", label: "Performance Analytics", description: "Learning progress tracking" },
  { featureKey: "behavior", name: "Behavior", label: "Behavior & Remarks", description: "Conduct monitoring" },
  { featureKey: "resources", name: "Resources", label: "Educational Resources", description: "Teaching/Learning materials" },

  // ADMINISTRATION & FINANCE
  { featureKey: "finance", name: "Finance", label: "Financial Records", description: "Accounting and fees" },
  { featureKey: "payments", name: "Payments", label: "Direct Payments", description: "Payment processing" },
  { featureKey: "transactionHistory", name: "Transactions", label: "Transaction Logs", description: "Financial audit trail" },
  { featureKey: "globalTransactions", name: "Global Finance", label: "Global Logs", description: "Cross-school financial view" },
  { featureKey: "billing", name: "Subscription", label: "Platform Billing", description: "SaaS subscription management" },
  { featureKey: "gallery", name: "Gallery", label: "Media Gallery", description: "School media and events" },

  // ADVANCED
  { featureKey: "aiStudy", name: "AI Study", label: "AI Study Assistant", description: "AI-powered learning tools" },
  { featureKey: "aiTools", name: "AI Tools", label: "AI Administrative Tools", description: "AI-powered school management" },
  { featureKey: "aiInsights", name: "AI Insights", label: "AI Analytics", description: "AI-powered progress analysis" },
  { featureKey: "simulations", name: "Simulations", label: "Simulations", description: "Virtual labs and scenarios" },
  { featureKey: "timetable", name: "Timetable", label: "Timetable", description: "Schedule management" },
  { featureKey: "events", name: "Events", label: "Events & Calendar", description: "School activities" },

  // SYSTEM & PROFILE
  { featureKey: "profile", name: "Profile", label: "User Profile", description: "Account profile management" },
  { featureKey: "settings", name: "Settings", label: "Account Settings", description: "System preferences" },
  { featureKey: "support", name: "Support", label: "Help & Support", description: "Customer assistance center" },
  { featureKey: "googleLogin", name: "Google Authentication", label: "Google Login", description: "Enable/Disable Google login and signup for this role." }
];

async function main() {
  console.log("Seeding platform features...");
  
  for (const feature of INITIAL_FEATURES) {
    await prisma.platformFeature.upsert({
      where: { featureKey: feature.featureKey },
      update: {},
      create: feature
    });
  }
  
  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
