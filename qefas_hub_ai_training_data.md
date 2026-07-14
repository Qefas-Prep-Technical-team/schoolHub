# Qefas Hub - AI Customer Support & Knowledge Base Training Data

## 1. Introduction: What is Qefas Hub?

**Qefas Hub** is a state-of-the-art, full-stack educational management platform and school administration ecosystem. It is designed to modernize how schools operate by bringing simplicity, scalability, and efficiency to educational institutions. Qefas Hub seamlessly connects School Administrators, Teachers, Students, and Parents into a unified digital environment.

### Core Value Proposition

- **All-in-One Management**: Handles student lifecycles, staff registries, academics, and behavioral tracking.
- **Premium Design Aesthetics**: Features a modern, glassmorphic UI, responsive layouts, and a dark/light mode toggle that offers a premium, fintech-grade experience.
- **AI Integration**: Powered by intelligent tools that help grade, generate performance insights, and craft pedagogical remarks.
- **White-Labeling**: Allows schools to have their own custom subdomain, fully branded landing page, and personalized login portals.
- **Compliance & Localization**: Complies with standard Nigerian educational requirements (WAEC grading scale, official Nigerian transcript layouts, 40/60 CA/Exam splitting).

## 2. User Roles & Portals

Qefas Hub operates with distinct user scopes, each possessing a tailored dashboard:

### 1. School Administrator (Admin)

The highest level of access within a school.

- **Role**: Manages the school’s digital infrastructure, curriculum, and global registry.
- **Key Capabilities**:
  - Subdomain & Landing Page Builder (Visual Elementor-style builder).
  - Student, Teacher, and Department registries.
  - Timetable auto-generation and term management.
  - Subscription management and payment processing via Paystack.
  - Oversight of academic performance, attendance metrics, and AI quotas.

### 2. Teacher (Faculty)

The academic engine of the school.

- **Role**: Delivers curriculum, tracks student performance, and manages day-to-day class activities.
- **Key Capabilities**:
  - Viewing assigned classes and subjects.
  - Creating assignments, exams, and quizzes (with AI assistance).
  - Taking daily class attendance and logging behavior.
  - Grading and uploading marks via CSV or direct entry.
  - Generating and exporting subject paper reports and academic metrics.

### 3. Student

The core focus of the educational ecosystem.

- **Role**: Participates in academics and tracks personal progress.
- **Key Capabilities**:
  - Viewing academic summaries (Average score, position, strongest/weakest subjects).
  - Submitting assignments and viewing grades.
  - Checking personalized timetables and historical timelines.
  - Viewing behavioral logs and disciplinary warnings.
  - Downloading official comprehensive transcripts.

### 4. Parent / Guardian

The support system.

- **Role**: Monitors their child’s performance, attendance, and behavior.
- **Key Capabilities**:
  - Viewing child’s academic records and progress.
  - Tracking attendance and disciplinary actions.
  - Monitoring fee payments and subscriptions.

---

## 2.5. Feature Summary by User Type

### School Administrator (Admin)

- Build and customize the school subdomain and branded landing page
- Manage student, teacher, department, and class registries
- Create timetables, manage academic terms, and publish schedules
- Oversee subscriptions, payments, and billing plans
- Monitor academic performance, attendance, and AI usage quotas
- Export reports and branded PDFs

### Teacher (Faculty)

- View assigned classes, subjects, and schedules
- Create assignments, exams, and quizzes
- Take attendance and log student behavior
- Record grades manually or upload via CSV
- Generate academic reports and subject performance summaries
- Use AI assistance for exam generation and remark drafting

### Student

- View grades, exam results, and academic summaries
- Track individualized timetables and lifecycle timelines
- Submit assignments and view feedback
- Review behavioral logs and disciplinary warnings
- Download official transcripts

### Parent / Guardian

- View child performance, attendance, and behavior
- Monitor fee payments and subscription status
- Access academic records and progress dashboards
- Stay informed with discipline and attendance alerts

---

## 2.6. Registration & Login

### Main Website

- Visit the main Qefas Hub website at `qefashub.com`
- This is the public landing page for school admins, teachers, students, and parents
- Use the site to access login portals, school landing pages, and support information

### Registration and Access

- **Anyone can self-register** by visiting `qefashub.com` and selecting the Register option.
- **School Administrators**: Register your school directly at `https://qefashub.com/signup/school` or use the invitation link provided by Qefas Hub support.
- **Teachers**: Register directly at `https://qefashub.com/signup/teacher` or join via a school-issued invitation email.
- **Students**: Register directly at `https://qefashub.com/signup/student` or use the registration link sent by the school.
- **Parents / Guardians**: Register directly at `https://qefashub.com/signup/parent` or log in with credentials shared by the school.

### Login Steps

1. Go to `qefashub.com` and click the Login button.
2. Choose your role or school portal if prompted.
3. Enter your email and password.
4. Use the “Forgot Password” flow to reset your password by email if needed.

### Notes

- Schools may have a custom school portal at `schoolname.qefashub.com`.
- If registration is restricted, contact your school administrator for access.
- Admins can manage user accounts, reset passwords, and send invitations from the dashboard.

---

## 3. Core Modules and How to Use Them

### A. School Branding & Custom Landing Pages (Admin)

- **Subdomain Routing**: Schools get a dedicated subdomain (e.g., `schoolname.qefashub.com`).
- **Visual Page Builder**: Found in `Admin Dashboard -> Subdomain`. Admins can customize the Hero section, Vision & Mission, core features, primary colors, and parent testimonials.
- **Live Preview**: The builder features a real-time responsive preview frame. All updates are synced to the live public-facing portal instantly.

### B. Student Lifecycle & Registry Management (Admin)

The system enforces a strict rule: **A student can only have one active school enrollment at a time.**

- **Registration**: Registering a student automatically creates an active enrollment, assigns them to a class, and generates an audit record. Credentials (email and auto-generated secure password) are provided to the admin to distribute.
- **History Timeline**: A permanent, immutable ledger on the student's profile tracking everything from admission to graduation, including promotions, awards, prefect assignments, warnings, and suspensions.
- **Promotion System**: Bulk promotion tools allow admins to move students to the next academic session or class, automatically notifying parents and teachers.
- **Transfers & Exits**: Dedicated workflows to mark students as Graduated, Transferred, Withdrawn, or Expelled.

### C. Academic & Curriculum Management (Admin & Teacher)

- **Departments & Subjects**: Admins define departments and subjects. Subjects can be attached to specific classes and assigned to teachers. Reports can be exported as high-fidelity PDFs.
- **Timetable Generation**: Admins use a timetable builder (with 12-hour AM/PM formatting) to slot subjects and breaks. Timetables can be duplicated across terms and exported as branded PDFs.
- **Exams & Quizzes**: Teachers create exams using a 3-step progressive stepper (Basic Info -> Scope & Target -> Results Release). Supports dynamic status tracking (Draft, Scheduled, Active, Expired).

### D. Grading & Transcripts (Teacher & Admin)

- **Result Recording**: Teachers can upload grades via CSV (Premium feature) or input them manually.
- **Transcript Generation**: The system dynamically calculates CA (40%) and Exam (60%) scores. It generates an official Nigerian-style transcript complete with the student's passport, school logo, calculated WAEC alpha grades (A1 - F9), and auto-generated AI pedagogical remarks for the Teacher and Principal.

### E. Attendance & Behavioral Tracking

- **Attendance**: Teachers and admins can mark daily attendance. The system highlights the current calendar date and provides monthly summary dropdowns and branded PDF exports.
- **Behavioral Logs**: Teachers log incidents (Positive, Warning, Danger). These are tracked on a timeline visible to Admins, Parents, and the Student. This includes an aggregate "Exemplary Conduct Score" (e.g., 92/100).

### F. Subscription & Billing

- **Paystack Integration**: Handles auto-renewal subscriptions with seamless card tokenization.
- **Graceful Degradation**: If a subscription expires, a midnight cron job dynamically sweeps accounts, downgrading them to a restrictive "Free Tier" that preserves core data but blocks premium features.
- **Quota Limits**: Schools are bound by quota limits configured by the platform owner, including Max Students, Max Storage (direct to AWS S3), and Max AI Prompts.

---

## 4. AI Features & Tools

Qefas Hub includes embedded AI capabilities designed to reduce administrative overhead.

- **AI Performance Insights**: Detailed, AI-generated analytical breakdown of a student's performance based on their exam and assignment records.
- **AI Exam Generation/Parsing**: Tools to assist teachers in setting questions.
- **AI Transcript Remarks**: Automatically drafts personalized remarks from the Class Teacher and Principal on end-of-term transcripts based on the student's average.
- **AI Usage Quotas**: Every AI prompt consumes the school's AI quota. The system tracks daily usage (`AiLimiterService`) and displays remaining limits to teachers. Once 100% is reached, the feature locks until the next reset.

---

## 5. Technical Architecture (For Support Context)

If users experience technical issues, it helps to understand how the platform is built:

- **Frontend**: Next.js, React, Tailwind CSS (Strictly Tailwind, no ad-hoc CSS), Framer Motion for animations.
- **Backend**: Node.js, Express.js, TypeScript (Strict).
- **Database**: PostgreSQL (via Supabase).
- **ORM**: Prisma.
- **Validation**: Zod (Strict entry-point validation).
- **File Storage**: AWS S3 direct uploads (no proxy bottlenecks).

---

## 6. Common Customer Support Scenarios

**Q: Why can't I add a student to my school?**
_A: Check your Subscription limits. If you have reached your 'Max Students' quota, you will need to upgrade your pricing plan via the Billing dashboard._

**Q: How do I change the look of my school's login page?**
_A: As a School Admin, navigate to your Dashboard -> Settings -> Subdomain. Here you can use the visual page builder to update your school's Hero text, brand colors, vision, and testimonials._

**Q: A student left our school but is returning. How do I add them back?**
_A: Navigate to the student's profile. Since Qefas Hub tracks student lifecycles permanently, you will use the "Re-enroll" action, which will close their "Transferred/Exited" status and create a new Active enrollment timeline event._

**Q: My AI Insights feature is locked, but I have a premium plan.**
_A: The AI tool has a daily limit on the number of prompts/tokens that can be generated. Check your AI limit quota; you may have exhausted your daily allowance. It will reset automatically at midnight._

**Q: How do we handle end-of-term report cards?**
_A: Once all teachers have recorded their CA and Exam grades, the system automatically aggregates them on a 40/60 scale. Admins or Students can then navigate to the transcript area and download a comprehensive, official PDF report card complete with AI-generated remarks and digital signatures._
