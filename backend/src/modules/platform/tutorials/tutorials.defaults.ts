import { TutorialItem } from "./tutorials.schema";

export const DEFAULT_TUTORIALS: TutorialItem[] = [
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
    category: "Academics",
    duration: "4:45",
    videoUrl: "/videos/hero video.mp4",
    thumbnail: "/image/Student Management.png",
    featured: false,
    difficulty: "Intermediate",
    steps: [
      {
        title: "Generate School Admission Link",
        description: "Open the Student Directory, click 'Enroll Students' -> 'Generate Direct School Link'.",
        tips: "Links can be generated per class arm or globally for the entire institution."
      },
      {
        title: "Share QR Code or Direct URL",
        description: "Distribute the generated joining QR code to students and parents during enrollment or orientation.",
        tips: "When an existing student signs in via this link, their account is instantly matched with zero manual approval delays."
      },
      {
        title: "Review Verification Requests",
        description: "Approve pending links under 'Linking Management' for any applicants requiring identity validation.",
        tips: "Check national student identification codes or admission numbers before confirming links."
      }
    ],
    keyTakeaways: [
      "Zero-friction student onboarding via dynamic URL tokens",
      "Class-specific QR code handouts for orientation days",
      "Real-time roster synchronization across web and mobile"
    ],
    faqs: [
      {
        q: "What happens if a student loses their admission code?",
        a: "Admins can re-issue or view the student's unique admission code directly from the Student Directory profile modal."
      }
    ],
    richTextGuide: `# Student Admissions & Institutional Roster Masterclass

Efficient student enrollment is the cornerstone of a streamlined academic year.

### Link Distribution Workflow:
1. Generate the tokenized link: $\\text{URL} = \\text{https://qefashub.com/link/accept?token=} \\tau$
2. Provide candidate admission verification threshold:
   $$\\text{Match Ratio} = \\frac{\\text{Verified Credentials}}{\\text{Total Admission Attributes}} \\ge 1.0$$
3. Confirm instantaneous class roster ingestion.`
  },
  {
    id: "admin-broadsheet-export",
    title: "Generating Institutional Broadsheets & Terminal Reports",
    summary: "Compile continuous assessments, exam results, conduct ratings, and export certified PDF broadsheets.",
    role: "ADMIN",
    category: "Assessments",
    duration: "7:10",
    videoUrl: "/videos/hero video.mp4",
    thumbnail: "/image/Automated Reporting.png",
    featured: true,
    difficulty: "Advanced",
    steps: [
      {
        title: "Lock Continuous Assessments",
        description: "Ensure all subject teachers have submitted their term CA scores and that the exam committee has approved outstanding marks.",
        tips: "Use the 'Pending Submissions' filter on the Assessment Overview page to identify lagging subject entries."
      },
      {
        title: "Review Cumulative Broadsheet",
        description: "Open 'Terminal Reports' -> 'Broadsheet Matrix' to view subject-by-subject grades, averages, and class position rankings.",
        tips: "Our standard 9-tier institutional grading engine automatically computes cumulative averages across all core subjects."
      },
      {
        title: "Export Official PDF Dossiers",
        description: "Click 'Export Certified PDF' to produce print-ready student report cards bearing digital signatures, QR authenticity seals, and school headers.",
        tips: "Export in batch mode to generate a combined multi-page document for entire graduation sets."
      }
    ],
    keyTakeaways: [
      "Automated grade aggregation and rank sorting",
      "Tamper-proof QR verification code on every report card",
      "Bulk export formatted specifically for A4 standard printing"
    ]
  },

  // --- TEACHER TUTORIALS ---
  {
    id: "teacher-grade-entry",
    title: "Continuous Assessment Logging & Marksheet Sync",
    summary: "Record test, quiz, project, and terminal exam marks seamlessly, including offline spreadsheet synchronization.",
    role: "TEACHER",
    category: "Assessments",
    duration: "5:30",
    videoUrl: "/videos/hero video.mp4",
    thumbnail: "/image/Automated Reporting.png",
    featured: true,
    difficulty: "Beginner",
    steps: [
      {
        title: "Select Class & Subject Roster",
        description: "From your Teacher Dashboard, navigate to 'Grades' and select the assigned class and subject.",
        tips: "Only classes where you have been designated as the primary subject instructor will appear."
      },
      {
        title: "Input Scores in the Assessment Matrix",
        description: "Type marks directly into test, project, or exam columns. The interface calculates percentage totals live as you type.",
        tips: "Pressing the Tab or Down Arrow key advances instantly to the next student row for ultra-fast grade entry."
      },
      {
        title: "Download Offline Spreadsheet for Remote Work",
        description: "Traveling or experiencing slow internet? Click 'Export Blank Template' to input grades in Excel and re-upload anytime.",
        tips: "Never modify the student code column in Excel to prevent synchronization mismatch errors."
      }
    ],
    keyTakeaways: [
      "Keyboard-optimized score logging workflow",
      "Offline spreadsheet import & auto-conflict resolution",
      "Real-time weighted score and letter grade computation"
    ]
  },
  {
    id: "teacher-attendance-rollcall",
    title: "Daily Attendance Tracking & Real-Time Parent Alerts",
    summary: "Take morning and subject roll calls in under two minutes with automated SMS/email alerts to parents for unexcused absences.",
    role: "TEACHER",
    category: "Academics",
    duration: "3:40",
    videoUrl: "/videos/hero video.mp4",
    thumbnail: "/image/Attendance Tracking.png",
    featured: false,
    difficulty: "Beginner",
    steps: [
      {
        title: "Open Daily Attendance Roster",
        description: "Click 'Attendance' -> 'Daily Roll Call' on your Teacher Dashboard.",
        tips: "Defaults to today's date and the current active morning lecture period."
      },
      {
        title: "Use One-Tap Quick Mark",
        description: "Click 'Mark All Present', then tap individual student avatars to toggle between Absent, Late, or Excused.",
        tips: "Clicking 'Excused' opens a quick prompt to type medical or travel excuses."
      },
      {
        title: "Submit & Dispatch Alerts",
        description: "Hit 'Save Attendance Record'. Parents of absent students are notified instantly through their linked mobile apps.",
        tips: "Review weekly trend charts to detect chronic absenteeism patterns early."
      }
    ],
    keyTakeaways: [
      "Single-tap mass presence marking",
      "Instant push alerts to parents of unexcused absences",
      "Automated attendance percentages on end-of-term broadsheets"
    ]
  },

  // --- STUDENT TUTORIALS ---
  {
    id: "student-exam-taking",
    title: "Taking Computer-Based Exams & Real-Time Reviews",
    summary: "Navigate online tests, flag questions for review, monitor the countdown timer, and submit with full score transparency.",
    role: "STUDENT",
    category: "Assessments",
    duration: "4:15",
    videoUrl: "/videos/hero video.mp4",
    thumbnail: "/image/backgroundSchool2.jpg",
    featured: true,
    difficulty: "Beginner",
    steps: [
      {
        title: "Access Upcoming Assessment",
        description: "Open your Student Portal, select 'Exams & Quizzes', and verify the test schedule, duration, and instructions.",
        tips: "Ensure your device battery is charged and you have a steady internet connection before starting."
      },
      {
        title: "Answer Questions & Flag Items",
        description: "Select choices or write essay responses. Use the question palette on the right to jump directly between question numbers.",
        tips: "Questions marked with a yellow flag indicate you intended to double-check your answer before final submission."
      },
      {
        title: "Review & Final Submission",
        description: "Check the review screen for any unanswered questions, then click 'Confirm & Submit Exam'.",
        tips: "If the countdown timer reaches zero, your answers are automatically sealed and submitted safely."
      }
    ],
    keyTakeaways: [
      "Auto-save mechanism prevents lost answers during network flickers",
      "Visual question palette flags answered and pending questions",
      "Instant objective score summaries upon examiner approval"
    ]
  },
  {
    id: "student-transcript-request",
    title: "Requesting Official Certified Transcripts",
    summary: "How students and alumni can order certified digital transcripts, pay processing fees, and download sealed PDF credentials.",
    role: "STUDENT",
    category: "Billing",
    duration: "5:00",
    videoUrl: "/videos/hero video.mp4",
    thumbnail: "/image/Student Management.png",
    featured: false,
    difficulty: "Intermediate",
    steps: [
      {
        title: "Navigate to Digital Credentials",
        description: "From your Student Portal sidebar, click 'Academic Records' -> 'Request Official Transcript'.",
        tips: "Graduated alumni can access this service using their permanent student registration code."
      },
      {
        title: "Select Delivery Destination & Purpose",
        description: "Specify whether the document is for University Admissions, Employment, or Personal Archival.",
        tips: "You can enter destination university admissions email addresses for direct institutional forwarding."
      },
      {
        title: "Pay Processing Fee & Track Status",
        description: "Complete checkout via secure online card payment. Track admin review and cryptographic sealing live.",
        tips: "Each delivered transcript includes an encrypted QR validation seal that universities can scan for instant verification."
      }
    ],
    keyTakeaways: [
      "Self-service official transcript ordering",
      "Instant electronic delivery upon admin sign-off",
      "Tamper-evident verification link on every document"
    ]
  },

  // --- PARENT TUTORIALS ---
  {
    id: "parent-child-monitoring",
    title: "Connecting with Your Child & Monitoring Real-Time Academic Progress",
    summary: "Link your parent account to your child's profile, monitor live exam scores, track attendance, and inspect teacher remarks.",
    role: "PARENT",
    category: "Academics",
    duration: "4:50",
    videoUrl: "/videos/hero video.mp4",
    thumbnail: "/image/backgroundSchool.jpg",
    featured: true,
    difficulty: "Beginner",
    steps: [
      {
        title: "Request Parent-Child Link",
        description: "In your Parent Portal, click 'Link Child', input your child's unique admission code and birth date.",
        tips: "Your child's admission code is printed on their school badge or admission letter."
      },
      {
        title: "Verify Linking Approval",
        description: "Once the school or student verifies the link request, your parent dashboard unlocks their full academic dossier.",
        tips: "Multiple children in different classes or different schools can be monitored under one single parent login."
      },
      {
        title: "Inspect Performance & Report Cards",
        description: "View real-time continuous assessment test scores, attendance ratios, and download signed terminal reports.",
        tips: "Set up push notifications to receive instant alerts whenever a teacher posts new assessment results."
      }
    ],
    keyTakeaways: [
      "Single unified login for all children across multiple schools",
      "Real-time grade alerts as soon as teachers grade assessments",
      "Direct mobile viewing of attendance check-ins and absences"
    ]
  },
  {
    id: "parent-tuition-payment",
    title: "Paying Tuition Fees & Generating Instant Tax Receipts",
    summary: "Review fee schedules, choose flexible installment plans, make card or bank transfer payments, and download certified receipts.",
    role: "PARENT",
    category: "Billing",
    duration: "3:30",
    videoUrl: "/videos/hero video.mp4",
    thumbnail: "/image/videoThumbnail.jpg",
    featured: false,
    difficulty: "Beginner",
    steps: [
      {
        title: "Access Fee Invoices",
        description: "Open 'Fees & Billing' on your Parent Dashboard to view current term invoices and payment deadlines.",
        tips: "Early payment discounts and multi-sibling concessions are automatically calculated."
      },
      {
        title: "Choose Payment Method",
        description: "Select full payment or configured installment milestones, then proceed through the Flutterwave/Paystack secure checkout.",
        tips: "Cards, USSD, and direct bank transfers are supported with zero convenience surcharges."
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

