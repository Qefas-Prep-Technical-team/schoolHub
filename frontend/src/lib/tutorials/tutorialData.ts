export type UserRoleCategory = "ALL" | "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

export interface TutorialStep {
  title: string;
  description: string;
  tips?: string;
}

export interface TutorialItem {
  id: string;
  title: string;
  summary: string;
  role: "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";
  category: "Setup" | "Academics" | "Assessments" | "Billing" | "Communication" | "General";
  duration: string;
  videoUrl: string;
  thumbnail: string;
  featured?: boolean;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  steps: TutorialStep[];
  keyTakeaways: string[];
  faqs?: { q: string; a: string }[];
  richTextGuide?: string; // Supports LaTeX formulas, numbered lists, bullet points, indentation and spacing
}

export const TUTORIALS_STORAGE_KEY = "qefas_tutorials_data";

export const INITIAL_TUTORIALS: TutorialItem[] = [
  // --- SCHOOL ADMIN TUTORIALS ---
  {
    id: "admin-school-setup",
    title: "Complete School Onboarding & Initial Setup",
    summary: "Learn how to configure your school profile, academic terms, departments, classes, and assign class arms.",
    role: "ADMIN",
    category: "Setup",
    duration: "6:20",
    videoUrl: "/videos/hero video.mp4",
    thumbnail: "/image/backgroundSchool.jpg",
    featured: true,
    difficulty: "Beginner",
    steps: [
      {
        title: "Access School Profile in Settings",
        description: "Log into your School Admin portal, click 'School Profile' from the sidebar, and input your school's official registration details, logo, contact information, and grading scales.",
        tips: "Uploading a high-resolution transparent PNG logo ensures crisp branding on student report cards and fee receipts."
      },
      {
        title: "Define Academic Terms & Sessions",
        description: "Set up the current academic session (e.g. 2026/2027) and define the starting and ending dates for Term 1, Term 2, and Term 3.",
        tips: "Setting term dates automatically gates continuous assessment submission deadlines."
      },
      {
        title: "Create Classes, Arms & Assign Teachers",
        description: "Navigate to 'Classes', click 'Create Class', define names (e.g., JSS 1 Gold, SS 3 Science), and designate class teachers from your verified staff directory.",
        tips: "Each class receives a unique joining code that students can use to request direct enrollment."
      }
    ],
    keyTakeaways: [
      "School profile customization with logo and contact information",
      "Term and academic calendar scheduling",
      "Arm and department allocation for streamlined management",
      "Teacher-to-class assignment with access delegation"
    ],
    faqs: [
      {
        q: "Can I edit school details after onboarding?",
        a: "Yes, school details can be updated anytime under Dashboard -> Settings -> School Profile."
      },
      {
        q: "How many class arms can I create?",
        a: "You can create unlimited class arms according to your active subscription quota."
      }
    ],
    richTextGuide: `# Comprehensive School Onboarding & Architecture Guide

Welcome to Qefas Hub! This comprehensive guide walks administrators through setting up the academic backbone of your institution.

---

### Phase 1: Core Institutional Profile Setup
Before enrolling students or deploying timetables, ensure your school records are certified:

1. **School Profile & Accreditation**: Navigate to \`Settings -> School Profile\`. Provide the statutory Ministry of Education registration identifier.
2. **Branding Assets**: Upload a high-resolution vector or PNG emblem (recommended aspect ratio: 1:1, minimum $512 \\times 512$ px).
3. **Grading Metric Configuration**:
   The standard aggregate GPA formula used across terminal report calculations is defined as:
   $$\\text{GPA} = \\frac{\\sum_{i=1}^{n} (C_i \\times G_i)}{\\sum_{i=1}^{n} C_i}$$
   where $C_i$ denotes credit units and $G_i$ represents numerical grade points.

---

### Phase 2: Class Arms, Divisions & Allocation
Structure classes into coherent academic tiers:

* **Junior Secondary / Lower Middle**:
  - JSS 1 (Gold, Silver, Platinum)
  - JSS 2 (Emerald, Ruby)
  - JSS 3 (Diamond, Onyx)

* **Senior Secondary / Upper School**:
  - SS 1 Science & Technical
  - SS 2 Humanities & Arts
  - SS 3 Commercial & Business

> **Important Institutional Policy**:
> Class arm creation locks after students are formally linked and examination numbers are generated. Double-check arm nomenclatures prior to student invitation dispatch.

---

### Phase 3: Teacher Assignment & Permissions
Assign qualified subject instructors and form masters:
1. Open \`Academic Staff\` -> click **Assign Teacher**.
2. Select target teacher profile and link to corresponding class arms.
3. Toggle permissions for continuous assessment score logging.`
  },
  {
    id: "admin-student-roster",
    title: "Managing Student Rosters & Direct Invitation Links",
    summary: "Master student admissions, generating auto-linking invitation links, QR codes, and tracking student claims.",
    role: "ADMIN",
    category: "Setup",
    duration: "5:15",
    videoUrl: "/videos/hero video.mp4",
    thumbnail: "/image/Student Management.png",
    difficulty: "Beginner",
    steps: [
      {
        title: "Generate School & Class Invite Links",
        description: "Navigate to Dashboard -> Linking & Invitations to view your school's universal join link (e.g. /join/school/sch-qef-896440) and printable QR code poster.",
        tips: "Print the generated QR code poster and display it on your school notice board for easy student registration."
      },
      {
        title: "Review & Approve Connection Requests",
        description: "Check the 'Pending Requests' tab to verify students claiming affiliation with your school. Click 'Approve' to instantly activate their platform records.",
        tips: "You can batch-approve verified students or reject unrecognized requests with a single click."
      },
      {
        title: "Assign Approved Students to Classes",
        description: "Select students from the master directory and enroll them into their designated classes and arms.",
        tips: "Enrolling a student automatically assigns their subject timetable and exam rosters."
      }
    ],
    keyTakeaways: [
      "Sharing seamless join links and printable QR codes",
      "Batch review and verification of student requests",
      "Assigning classes and student arms in bulk",
      "Tracking student quota limits and active enrolments"
    ]
  },
  {
    id: "admin-billing-plans",
    title: "School Billing, Subscription Quotas & Automated Invoices",
    summary: "Understand how student quota limits work, upgrade plans with Paystack or Flutterwave, and manage invoice payments.",
    role: "ADMIN",
    category: "Billing",
    duration: "4:45",
    videoUrl: "/videos/hero video.mp4",
    thumbnail: "/image/Automated Reporting.png",
    difficulty: "Intermediate",
    steps: [
      {
        title: "Monitor Active Quotas in Billing Console",
        description: "Visit Dashboard -> Billing to inspect your active plan, current student and teacher headcounts, and remaining quota capacity.",
        tips: "Automatic notifications are sent when your student roster reaches 90% capacity."
      },
      {
        title: "Upgrade Plan or Add Student Add-ons",
        description: "Click 'Change Plan' to select higher tiers or apply promo and discount coupons during checkout.",
        tips: "All invoices and transaction receipts can be downloaded as official PDFs with unique tax reference numbers."
      }
    ],
    keyTakeaways: [
      "Real-time quota monitoring and usage enforcement",
      "Seamless checkout via local and international gateways",
      "100% coupon activation and itemized receipts"
    ]
  },

  // --- TEACHER TUTORIALS ---
  {
    id: "teacher-exams-assessments",
    title: "Setting Up Exams, Quizzes & Continuous Assessments (CA)",
    summary: "Comprehensive guide for teachers to create multi-section exams, multiple choice questions, theory tests, and automated grading.",
    role: "TEACHER",
    category: "Assessments",
    duration: "7:10",
    videoUrl: "/videos/hero video.mp4",
    thumbnail: "/image/videoThumbnail.jpg",
    featured: true,
    difficulty: "Intermediate",
    steps: [
      {
        title: "Create Assessment or Quiz Paper",
        description: "From the Teacher Dashboard, go to 'Exams & Quizzes' -> 'Create Exam'. Specify Subject, Class, Assessment Type (Exam, Test 1, Test 2, Quiz), and Duration.",
        tips: "Continuous assessment weighting (e.g. 40% CA + 60% Exam) is automatically computed by the system."
      },
      {
        title: "Add Questions (Objective, Theory, LaTeX Math)",
        description: "Use the question builder to add multiple-choice options with answer keys, rich mathematical formulas, images, and essay questions.",
        tips: "Objective questions are auto-graded by the platform the moment a student completes submission."
      },
      {
        title: "Publish and Schedule Release Time",
        description: "Set the start time window. Students enrolled in the class will receive instant notifications and see the assessment on their dashboard.",
        tips: "You can randomize question order to minimize cheating in physical or remote computer-based tests."
      }
    ],
    keyTakeaways: [
      "Creating CBT exams and continuous assessment tests",
      "Automated instant grading for objective questions",
      "LaTeX math support and rich text formatting",
      "Anti-cheating question shuffling and time limits"
    ],
    faqs: [
      {
        q: "Can students retake exams?",
        a: "By default, exams allow 1 submission, but teachers can grant an extra attempt from the student submission review panel."
      }
    ],
    richTextGuide: `# CBT Assessment Design & Mathematical Question Authoring

This guide equips teachers with best practices for compiling modern computer-based assessments on Qefas Hub.

---

### Mathematical & Scientific Formula Syntax
Qefas Hub features native LaTeX support for all STEM subjects:

1. **Inline Mathematical Expressions**:
   Wrap equations inside single dollar signs:
   - Quadratic root formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$
   - Kinetic energy theorem: $E_k = \\frac{1}{2}mv^2$

2. **Block / Displayed Equations**:
   Wrap large expressions in double dollar signs:
   $$\\int_{a}^{b} f(x)\\,dx = F(b) - F(a)$$

3. **Chemical Reactions & Subscripts**:
   - Combustion of glucose: $\\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2 \\longrightarrow 6\\text{CO}_2 + 6\\text{H}_2\\text{O}$

---

### Step-by-Step Scoring Distribution Matrix
Ensure your continuous assessment balances continuous tasks with summative terminal assessments:

- **Weekly Diagnostic Quizzes**: 10%
- **Mid-Term Practical Laboratory / Project**: 15%
- **Continuous Assessment Test 1 & 2**: 15%
- **Terminal Examination Paper**: 60%

> **Proctored Integrity Guard**:
> Enabling 'Randomize Questions' and 'Fullscreen Lock' prevents unauthorized tab switching during examination sittings.`
  },
  {
    id: "teacher-gradebook-records",
    title: "Gradebook Management, Report Cards & Termly Records",
    summary: "Step-by-step tutorial on compiling term results, recording offline scores, generating broadsheets, and approving report cards.",
    role: "TEACHER",
    category: "Academics",
    duration: "5:50",
    videoUrl: "/videos/hero video.mp4",
    thumbnail: "/image/attendanceTracking.jpg",
    difficulty: "Intermediate",
    steps: [
      {
        title: "Open the Class Gradebook",
        description: "Navigate to 'Gradebook' -> select your Class and Subject to see a broadsheet view of all enrolled students with their continuous assessment scores.",
        tips: "You can enter scores directly into table cells with auto-save enabled."
      },
      {
        title: "Record Offline Grades & Practical Scores",
        description: "Use the 'Offline Grades' feature to input manual classroom projects, laboratory practicals, or assignment marks.",
        tips: "Use Excel import to upload broadsheets if your school calculates scores externally."
      },
      {
        title: "Generate and Approve Terminal Report Cards",
        description: "Review total aggregate marks, grade distribution, class rank positions, and submit teacher remarks for parents to view.",
        tips: "Once approved, parents receive automated SMS and email notifications that report cards are ready."
      }
    ],
    keyTakeaways: [
      "Broadsheet spreadsheet interface with auto-save",
      "Offline and practical assessment integration",
      "One-click terminal report card generation with remarks",
      "Student performance rankings and analytics"
    ]
  },
  {
    id: "teacher-attendance-tracking",
    title: "Daily Attendance Tracking & Student Absence Alerts",
    summary: "Record student attendance in under 30 seconds with smart bulk toggles, late-arrival markers, and automated parent alerts.",
    role: "TEACHER",
    category: "Academics",
    duration: "3:40",
    videoUrl: "/videos/hero video.mp4",
    thumbnail: "/image/Attendance Tracking.png",
    difficulty: "Beginner",
    steps: [
      {
        title: "Launch Daily Register",
        description: "Go to Teacher Dashboard -> 'My Classes' -> select active class -> 'Attendance Register'. The current date is pre-selected.",
        tips: "All students are marked 'Present' by default so you only need to mark absentees or late arrivals."
      },
      {
        title: "Toggle Status & Add Absence Notes",
        description: "Tap on individual student statuses to toggle Present, Absent, Excused, or Late. Add brief notes if an excuse note was provided.",
        tips: "Parents can view real-time attendance trends on their dedicated portal."
      }
    ],
    keyTakeaways: [
      "Instant 30-second classroom roll call",
      "Automated attendance percentages calculation",
      "Immediate alert notifications to linked parents"
    ]
  },

  // --- STUDENT TUTORIALS ---
  {
    id: "student-portal-guide",
    title: "Student Portal Walkthrough: Classes, Timetable & Homework",
    summary: "Discover how students access their daily class timetable, download study materials, and submit homework assignments online.",
    role: "STUDENT",
    category: "Academics",
    duration: "4:30",
    videoUrl: "/videos/hero video.mp4",
    thumbnail: "/image/Student Management.png",
    difficulty: "Beginner",
    steps: [
      {
        title: "View Enrolled Classes & Subjects",
        description: "Log in to the Student Portal. Your dashboard displays today's schedule, current classes, and upcoming deadlines.",
        tips: "Bookmark your student portal on your mobile browser home screen for quick daily access."
      },
      {
        title: "Complete & Submit Homework Assignments",
        description: "Click on 'Assignments' -> choose an active task -> type your answer or upload PDF/photo of handwritten work -> click 'Submit Assignment'.",
        tips: "Always check the deadline counter to ensure on-time submissions and avoid late penalties."
      },
      {
        title: "Track Grades & Teacher Feedback",
        description: "Once your teacher grades your work, check 'Graded Assignments' to review score breakdowns, comments, and corrections.",
        tips: "Reviewing teacher comments helps identify areas for revision before major exams."
      }
    ],
    keyTakeaways: [
      "Accessing daily schedules and lesson resources",
      "Uploading homework assignments seamlessly",
      "Reviewing grades and personalized teacher feedback"
    ]
  },
  {
    id: "student-online-exams",
    title: "Taking Computer-Based Tests (CBT) & Viewing Results",
    summary: "How to take timed exams on Qefas Hub, navigate questions, save answers, and review your performance breakdown.",
    role: "STUDENT",
    category: "Assessments",
    duration: "5:00",
    videoUrl: "/videos/hero video.mp4",
    thumbnail: "/image/videoThumbnail.jpg",
    difficulty: "Beginner",
    steps: [
      {
        title: "Join Scheduled Assessment",
        description: "Go to 'Exams & Quizzes' -> click 'Start Assessment'. Carefully read instructions and rules regarding time limit.",
        tips: "Ensure a stable internet connection before starting the timer."
      },
      {
        title: "Question Navigation & Auto-Save",
        description: "Answers are saved immediately upon selection. Use the Question Palette on the right to jump between questions or flag items for review.",
        tips: "Flagged questions display a distinct yellow ring so you can return to them before final submission."
      },
      {
        title: "Submit and View Instant Score",
        description: "Click 'Submit Exam' -> confirm your submission. Your score for objective sections is computed and displayed immediately.",
        tips: "You can view detailed question-by-question explanations after your teacher publishes results."
      }
    ],
    keyTakeaways: [
      "Real-time timer and auto-save mechanisms",
      "Interactive question palette with review flags",
      "Instant score calculations and performance graphs"
    ]
  },

  // --- PARENT TUTORIALS ---
  {
    id: "parent-portal-guide",
    title: "Parent Gateway: Linking Children, Tracking Grades & Attendance",
    summary: "Learn how parents can connect multiple children to a single account, monitor academic progress, and verify attendance records.",
    role: "PARENT",
    category: "Communication",
    duration: "4:15",
    videoUrl: "/videos/hero video.mp4",
    thumbnail: "/image/Automated Reporting.png",
    featured: true,
    difficulty: "Beginner",
    steps: [
      {
        title: "Link Child with Unique Student Code",
        description: "From the Parent Dashboard, click 'Add Child' -> enter the student code provided by the school (e.g. STU-94821) -> submit link request.",
        tips: "You can link multiple children attending different schools all under your single parent profile."
      },
      {
        title: "Monitor Academic Grades & Report Cards",
        description: "Click on your child's profile to view their continuous assessment scores, homework completion rates, and terminal report cards.",
        tips: "Download official PDF report cards signed with digital school validation."
      },
      {
        title: "Check Attendance & Punctuality Records",
        description: "Inspect the monthly attendance calendar to verify days present, excused absences, or late arrivals.",
        tips: "Receive immediate push or email alerts whenever an absence is registered."
      }
    ],
    keyTakeaways: [
      "Multi-child management from one centralized portal",
      "Instant access to verified terminal report cards",
      "Real-time attendance calendars and alerts"
    ]
  },
  {
    id: "parent-fee-payments",
    title: "School Fees, Online Payments & Official Receipts",
    summary: "How to view itemized school tuition statements, pay fees securely with cards or mobile transfer, and print instant receipts.",
    role: "PARENT",
    category: "Billing",
    duration: "3:50",
    videoUrl: "/videos/hero video.mp4",
    thumbnail: "/image/backgroundSchool2.jpg",
    difficulty: "Beginner",
    steps: [
      {
        title: "Access Invoices & Tuition Statements",
        description: "Navigate to 'Billing & Payments' to view outstanding tuition, uniforms, bus services, and examination fees.",
        tips: "Invoices clearly indicate breakdown items and payment due dates."
      },
      {
        title: "Pay Dues Securely Online",
        description: "Click 'Pay Now' to complete payment via debit card, direct bank transfer, or USSD.",
        tips: "Online transactions are processed through bank-grade encrypted channels."
      },
      {
        title: "Download Official Payment Receipt",
        description: "Once payment completes, an official signed receipt with a unique transaction reference number is generated instantly.",
        tips: "Present this digital receipt to the school bursar or keep it for your personal tax records."
      }
    ],
    keyTakeaways: [
      "Transparent breakdown of school dues",
      "Fast, secure online tuition payments",
      "Instant PDF receipts with verification QR codes"
    ]
  }
];

export function getStoredTutorials(): TutorialItem[] {
  if (typeof window === "undefined") return INITIAL_TUTORIALS;
  try {
    const raw = localStorage.getItem(TUTORIALS_STORAGE_KEY);
    if (!raw) return INITIAL_TUTORIALS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error("Failed to load stored tutorials", err);
  }
  return INITIAL_TUTORIALS;
}

export function saveStoredTutorials(tutorials: TutorialItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TUTORIALS_STORAGE_KEY, JSON.stringify(tutorials));
    window.dispatchEvent(new CustomEvent("qefas_tutorials_updated", { detail: tutorials }));
  } catch (err) {
    console.error("Failed to save tutorials", err);
  }
}

export function resetStoredTutorials(): TutorialItem[] {
  if (typeof window === "undefined") return INITIAL_TUTORIALS;
  try {
    localStorage.setItem(TUTORIALS_STORAGE_KEY, JSON.stringify(INITIAL_TUTORIALS));
    window.dispatchEvent(new CustomEvent("qefas_tutorials_updated", { detail: INITIAL_TUTORIALS }));
  } catch (err) {
    console.error("Failed to reset tutorials", err);
  }
  return INITIAL_TUTORIALS;
}
