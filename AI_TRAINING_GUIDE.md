# SchoolHub App - Comprehensive AI Training Guide

**Last Updated:** June 2026  
**Purpose:** Help AI assistants guide users on navigating and using the SchoolHub educational management platform

---

## 📋 Table of Contents

1. [App Overview](#app-overview)
2. [User Roles & Capabilities](#user-roles--capabilities)
3. [Web App Navigation Guide](#web-app-navigation-guide)
4. [Mobile App Navigation Guide](#mobile-app-navigation-guide)
5. [Feature-to-Location Mapping](#feature-to-location-mapping)
6. [Common Tasks & How-To Guide](#common-tasks--how-to-guide)
7. [Subscription & Access Control](#subscription--access-control)
8. [Technical Details for Support](#technical-details-for-support)

---

## App Overview

### What is SchoolHub?

SchoolHub is a **full-stack educational management platform** that helps schools manage:
- 👨‍🎓 Students and their academic progress
- 👨‍🏫 Teachers and their schedules
- 📊 Grades, exams, and assessments  
- 📅 Attendance and timetables
- 💰 Payments and subscriptions
- 📱 Multi-device access (web + mobile)
- 👨‍👩‍👧 Parent-student connections
- 🎯 School customization and branding

### Technology Stack

- **Web Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Mobile:** React Native (Expo), NativeWind
- **Backend:** Node.js/Express with TypeScript
- **Database:** PostgreSQL (via Prisma ORM)
- **Storage:** File uploads with audit tracking
- **Payments:** Paystack (supports GHS, NGN currency)
- **Notifications:** Push notifications (FCM, Expo) + Email

---

## 👥 User Roles & Capabilities

### 1. **ADMIN** (School/Platform Administrator)

**What they can do:**
- Create and manage school information
- Manage all users (teachers, students, parents)
- Configure subscription and billing
- Create exams, quizzes, and assignments
- Review grades and reports
- Manage school settings and custom landing pages
- Access analytics and dashboards
- Manage support tickets

**Where to go:**
- Login → Redirected to `/dashboard/admin`

---

### 2. **TEACHER** (Educator)

**What they can do:**
- Create and manage classes
- Create exams, quizzes, and assignments
- Record student attendance
- Grade assignments and exams
- Track student performance
- Communicate with parents
- View timetables

**Where to go:**
- Login → Redirected to `/dashboard/teacher`

---

### 3. **STUDENT** (Learner)

**What they can do:**
- View enrolled classes
- Take exams and quizzes
- Submit assignments
- View grades and performance
- Track attendance
- Receive notifications
- Apply for prefect roles

**Where to go:**
- Login → Redirected to `/dashboard/student`

---

### 4. **PARENT** (Guardian)

**What they can do:**
- Monitor child's grades
- View attendance records
- Receive notifications
- Communicate with teachers
- View payment history
- Link to children (with verification)

**Where to go:**
- Login → Redirected to `/dashboard/parent`

---

### 5. **Platform Roles** (Less common)

- **OWNER** - Full platform control
- **FINANCE_ADMIN** - Payment and subscription management
- **SUPPORT_AGENT** - Customer support
- **TECH_ADMIN** - Technical maintenance

---

## 🌐 Web App Navigation Guide

### **Homepage & Public Pages**

| Page | URL | Purpose |
|------|-----|---------|
| Landing Page | `/` | Features showcase |
| Features | `/features` | Detailed feature list |
| Pricing | `/pricing` | Subscription plans |
| About | `/about` | Company information |
| Contact | `/contact` | Contact form |
| Terms | `/terms` | Terms of service |
| Privacy | `/privacy` | Privacy policy |

### **Authentication Routes**

| Page | URL | Who Uses It |
|------|-----|------------|
| Login | `/login` | All users |
| Sign Up | `/signup` | New users |
| Email Verification | `/verification` | During signup |
| School Invite Join | `/join/school/[code]` | New students via invite |
| Class Invite Join | `/join/class/[id]` | New students via invite |
| Onboarding | `/onboarding` | First-time users |

**Login Flow:**
1. Visit `/login`
2. Enter email and password
3. Select your user role (if multi-role)
4. Click "Sign In"
5. Automatically redirected to your role dashboard

**Sign Up Flow:**
1. Visit `/signup`
2. Enter name, email, password
3. Select role (Teacher, Student, Parent, Admin)
4. Create account
5. Email verification sent
6. Go to `/verification` to verify email
7. Complete onboarding flow

---

### **ADMIN DASHBOARD** (`/dashboard/admin/`)

**Main Navigation:**
- Dashboard Home
- Settings
- Subdomain (Landing Page)
- Exams & Quizzes

#### **Dashboard Home** → `/dashboard/admin`
- Overview of school stats
- Recent activities
- Quick action buttons

#### **Settings** → `/dashboard/admin/settings`
- School name and information
- School logo and colors
- Email notification preferences
- Maintenance mode toggle
- User management (view teachers, students, parents)
- Class management
- Subject management
- Academic sessions
- Payment settings
- Subscription details

#### **Custom Landing Page** → `/dashboard/admin/subdomain`
- Create custom subdomain (e.g., myschool.schoolhub.com)
- Landing page builder
- Customize:
  - Hero section with banner image
  - Features/highlights
  - Testimonials
  - Photo gallery
  - Contact information
  - Theme colors
  - Dark mode support

#### **Landing Page Pro Builder** → `/dashboard/admin/subdomain/pro-builder`
- Advanced customization
- Drag-and-drop editor
- Theme configuration
- Mobile preview

#### **Exams & Quizzes** → `/Exams&Quizzes` (Or via menu)
- Create new exam
- Create new quiz
- View exam list
- Edit exams
- Publish exams
- View exam attempts
- Grade exams
- AI question generation
- Question types:
  - Multiple choice
  - True/False
  - Short answer
  - File upload

---

### **TEACHER DASHBOARD** (`/dashboard/teacher/`)

**Main Navigation:**
- Dashboard Home
- My Classes
- Grades
- Assignments
- Attendance
- Profile
- Settings

#### **Dashboard Home** → `/dashboard/teacher`
- Quick overview of classes
- Recent student submissions
- Pending grading
- Upcoming exams

#### **My Classes** → `/dashboard/teacher/classes`
- List all classes you teach
- View class roster (students in each class)
- Add new class
- Edit class details
- View class timetable
- Manage class subjects
- Create assignment for class
- Create exam for class

**Within Each Class:**
- Student list with attendance summary
- Class analytics
- Timetable view
- Assignment records
- Exam records

#### **Grades Management** → `/dashboard/teacher/grades`
- View all student grades
- Create grade entries
- Edit existing grades
- Grade audit log (see who changed what)
- Filter by class, student, or term
- Download grade reports

#### **Assignments** → `/dashboard/teacher/assignments`
- Create new assignment
- Set due date
- Attach files / add instructions
- View submissions
- Grade submissions
- Leave feedback
- Set rubric criteria
- View submission status

#### **Attendance** → `/dashboard/teacher/attendance`
- Record daily attendance
- View attendance patterns
- Generate attendance reports
- Export attendance data
- Set attendance rules

#### **Profile** → `/dashboard/teacher/profile`
- View/edit personal information
- Change password
- Upload profile picture
- View assigned subjects
- View assigned classes
- Notification preferences

---

### **STUDENT DASHBOARD** (`/dashboard/student/`)

**Main Navigation:**
- Dashboard Home
- Classes
- Grades
- Timetable
- Assignments
- Exams
- Profile
- Notifications

#### **Dashboard Home** → `/dashboard/student`
- Summary of grades
- Upcoming assignments
- Upcoming exams
- Upcoming classes (today/this week)
- Recent announcements
- Performance analytics

#### **Classes** → `/dashboard/student/classes`
- List all enrolled classes
- View class details
- See class teacher
- View class timetable
- View class announcements
- Access class materials

#### **Grades** → `/dashboard/student/grades`
- View all grades by subject
- View grade breakdown (exam, assignment, assessment)
- Compare performance against class average
- Download grade report
- View grade history by term
- AI performance insights (if subscription allows)

#### **Timetable** → `/dashboard/student/timetable`
- View class schedule
- Filter by day/week/month
- Get notifications for class time
- Download timetable
- View exam schedule

#### **Assignments** → `/dashboard/student/assignments`
- View all assigned assignments
- See due dates
- View submission status
- Upload submission/files
- View feedback from teacher
- Download assignment materials

#### **Exams** → `/dashboard/student/exams`
- View available exams
- Check exam schedule
- Exam start button
- Take exam (with timer)
- View started/completed exams
- Review submitted answers
- View exam results once released
- See exam feedback

**Taking an Exam:**
1. Go to `/dashboard/student/exams`
2. Click on exam name
3. Read instructions
4. Click "Start Exam"
5. Answer all questions (timer shows)
6. Review before submitting
7. Click "Submit Exam"
8. Get confirmation

#### **Profile** → `/dashboard/student/profile`
- View personal information
- Edit profile picture
- Change password
- Notification settings
- School enrollment details
- Parent connections

---

### **PARENT DASHBOARD** (`/dashboard/parent/`)

**Main Navigation:**
- Dashboard Home
- Child Performance
- Child Attendance
- Child Grades
- Notifications
- Profile

#### **Dashboard Home** → `/dashboard/parent`
- Quick summary of child's progress
- Recent grades
- Attendance summary
- Upcoming events
- Links to children

#### **Link Child** 
- Request to link to child student
- Enter child's registration code or email
- Send verification request
- Child/Admin must approve link
- Once approved, can monitor child

#### **Child Performance** → `/dashboard/parent/child-[id]/performance`
- Overall performance summary
- Subject-wise performance
- Performance trends
- Attendance percentage
- Behavioral score

#### **Child Grades** → `/dashboard/parent/child-[id]/grades`
- List all grades
- Filter by subject/term
- View grade progress
- Compare to class average
- Download grade report

#### **Child Attendance** → `/dashboard/parent/child-[id]/attendance`
- Daily attendance record
- Attendance percentage
- Absence patterns
- Download attendance report

#### **Notifications** → `/dashboard/parent/notifications`
- School announcements
- Child grade updates
- Attendance alerts
- Behavioral alerts
- Event notifications

#### **Profile** → `/dashboard/parent/profile`
- Edit personal information
- Change password
- Manage linked children
- Notification preferences
- Email settings

---

### **Platform Console** (`(internal-console)`)

*Only accessible to platform staff/admins*

| Page | URL | Purpose |
|------|-----|---------|
| Features Registry | `/console/features` | Manage platform features |
| School Management | `/console/schools` | Manage schools |
| User Management | `/console/users` | Manage users |

---

### **Utility Pages**

| Page | URL | Reason |
|------|-----|--------|
| Unauthorized | `/unauthorized` | User lacks permission |
| User Panel | `/user-panel` | Account settings |
| Not Found | `/not-found` | Page doesn't exist |

---

## 📱 Mobile App Navigation Guide

### **Login & Authentication**

**Login Screen** → `/(auth)/login`
- Email input
- Password input
- "Remember me" checkbox
- "Forgot password" link
- "Sign up" link
- Role selector (if multi-role)

**After Login:**
- Automatically directed to role-specific dashboard

---

### **Student Mobile Dashboard** → `/(student-tabs)/`

**Bottom Tab Navigation:**
1. **Dashboard** 
   - Quick overview
   - Classes today
   - Upcoming assignments
   - Recent grades

2. **Classes**
   - List of enrolled classes
   - Class details
   - Class timetable
   - Quick class access

3. **Grades**
   - Grade overview
   - Subject-wise grades
   - Performance charts
   - Grade trends

4. **Timetable**
   - Weekly view
   - Class schedule
   - Exam schedule
   - Calendar view

5. **Assignments**
   - List of assignments
   - Due dates
   - Submission status
   - Upload submission

6. **Exams**
   - Available exams
   - Exam schedule
   - Start exam
   - Review results

7. **Profile**
   - Personal info
   - Edit profile
   - Settings
   - Logout

---

### **Teacher Mobile Dashboard** → `/(teacher-tabs)/`

**Bottom Tab Navigation:**
1. **Dashboard**
   - Classes overview
   - Pending tasks
   - Recent submissions

2. **Classes**
   - My classes list
   - Class roster
   - Manage class

3. **Attendance**
   - Mark attendance
   - Attendance records
   - Attendance reports

4. **Grades**
   - Grade entry
   - Grade management
   - Grade history

5. **Assignments**
   - Create assignment
   - View submissions
   - Grade assignments

6. **Profile**
   - Personal info
   - Settings
   - Logout

---

### **Exam Taking on Mobile**

**Path:** `/(student-tabs)/exams/[id]/take`

1. Open "Exams" tab
2. Select exam from list
3. Tap "Start Exam"
4. Timer displays at top
5. Swipe between questions (or use pagination)
6. For multiple choice: tap option to select
7. For short answer: tap to open keyboard and type
8. For file upload: tap "+ Upload" and select file
9. After all questions: tap "Review Answers"
10. Verify all answered
11. Tap "Submit Exam"
12. Get confirmation

---

### **Dark Mode & Settings**

- Available on all screens
- Toggle in profile/settings
- Automatic theme sync with system

---

## 🎯 Feature-to-Location Mapping

### **Academic Features**

| Feature | Web Location | Mobile Location | Who Can Access |
|---------|--------------|-----------------|-----------------|
| **Create Class** | Dashboard → Classes → + New | N/A | Admin, Teacher |
| **Enroll Student** | Dashboard → Classes → Class → + Enroll | N/A | Admin, Teacher |
| **View Grades** | Dashboard → Grades | Grades tab | Student, Parent, Teacher |
| **Enter Grades** | Dashboard → Grades → + New | Grades tab | Teacher, Admin |
| **Create Exam** | `/Exams&Quizzes` → + New Exam | N/A | Admin, Teacher |
| **Take Exam** | Dashboard → Exams → [Exam] → Start | Exams tab → Start | Student |
| **Review Exam** | Dashboard → Exams → [Exam] → Review | Exams tab → Review | Student |
| **Create Assignment** | Dashboard → Assignments → + New | Assignments tab (Teacher) | Teacher, Admin |
| **Submit Assignment** | Dashboard → Assignments → [Assignment] → Submit | Assignments tab → Submit | Student |
| **Grade Assignment** | Dashboard → Assignments → [Assignment] → Grade | Assignments tab → Grade | Teacher |
| **View Timetable** | Dashboard → Timetable | Timetable tab | All roles |
| **Create Timetable** | Dashboard → Settings → Timetable | N/A | Admin |

---

### **Attendance Features**

| Feature | Web Location | Mobile Location | Who Can Access |
|---------|--------------|-----------------|-----------------|
| **Mark Attendance** | Dashboard → Attendance → [Class] → Mark | Attendance tab | Teacher, Admin |
| **View Attendance** | Dashboard → Attendance | N/A | Student, Parent, Admin |
| **Attendance Report** | Dashboard → Attendance → Reports | N/A | Admin, Parent |

---

### **School Management Features**

| Feature | Web Location | Mobile Location | Who Can Access |
|---------|--------------|-----------------|-----------------|
| **School Info** | Dashboard → Settings | N/A | Admin |
| **Manage Users** | Dashboard → Settings → Users | N/A | Admin |
| **Manage Classes** | Dashboard → Settings → Classes | N/A | Admin |
| **Manage Subjects** | Dashboard → Settings → Subjects | N/A | Admin |
| **Session Management** | Dashboard → Settings → Sessions | N/A | Admin |
| **Payment Settings** | Dashboard → Settings → Payments | N/A | Admin |
| **Custom Landing Page** | `/dashboard/admin/subdomain` | N/A | Admin |
| **Landing Page Builder** | `/dashboard/admin/subdomain/pro-builder` | N/A | Admin |

---

### **Communication Features**

| Feature | Web Location | Mobile Location | Who Can Access |
|---------|--------------|-----------------|-----------------|
| **View Notifications** | Bell icon (top right) | Notifications tab/section | All roles |
| **Parent-Student Link** | Dashboard → Profile | Profile tab | Parent, Student |
| **View Teacher Info** | Classes → Class Details | Classes tab → Class Details | All roles |
| **Receive Notifications** | In-app + Email | Push notification | All roles |

---

### **Financial Features**

| Feature | Web Location | Mobile Location | Who Can Access |
|---------|--------------|-----------------|-----------------|
| **View Subscription** | Dashboard → Settings → Subscription | N/A | Admin, User |
| **View Payments** | Dashboard → Settings → Payments | N/A | Admin, Parent |
| **Download Invoice** | Dashboard → Settings → Payments → Invoices | N/A | Admin, Parent |

---

### **Behavioral & Performance Features**

| Feature | Web Location | Mobile Location | Who Can Access |
|---------|--------------|-----------------|-----------------|
| **View Conduct Score** | Dashboard → Profile | Profile tab | Student, Parent, Admin |
| **Report Behavior Alert** | Dashboard → Behavior Alerts → + New | N/A | Teacher, Admin |
| **AI Performance Insights** | Dashboard → Grades → Insights | N/A | Student (with paid plan) |
| **Student History Timeline** | Dashboard → Student Profile → History | N/A | Admin |
| **Termly Evaluations** | Dashboard → Evaluations | N/A | Teacher, Admin |

---

## 📚 Common Tasks & How-To Guide

### **STUDENT: How to Check My Grades**

**Web:**
1. Login to `/login` with student email
2. Click "Grades" in dashboard menu
3. View grades by subject
4. Click subject to see breakdown
5. Click exam/assignment to see specific feedback

**Mobile:**
1. Login
2. Tap "Grades" tab at bottom
3. Scroll through grades by subject
4. Tap grade to see details

---

### **STUDENT: How to Submit an Assignment**

**Web:**
1. Login to student dashboard
2. Click "Assignments" in menu
3. Find assignment (not yet submitted)
4. Click on assignment
5. Click "Submit Assignment"
6. Upload file or paste text
7. Click "Submit"
8. Get confirmation

**Mobile:**
1. Login
2. Tap "Assignments" tab
3. Find assignment
4. Tap "Submit"
5. Select file from device
6. Tap "Upload"
7. Get confirmation

---

### **STUDENT: How to Take an Exam**

**Web:**
1. Login to student dashboard
2. Click "Exams" 
3. Find exam (status: "Ready to Take")
4. Click exam
5. Read instructions
6. Click "Start Exam"
7. Answer questions (timer shows at top)
8. After all questions, click "Submit"
9. Confirmation appears

**Mobile:**
1. Login
2. Tap "Exams" tab
3. Find exam
4. Tap "Start"
5. Answer questions (swipe between them)
6. Tap "Submit"
7. Get confirmation

---

### **TEACHER: How to Create a Class**

**Web:**
1. Login to teacher dashboard
2. Click "Classes" 
3. Click "+ New Class"
4. Enter class name
5. Select academic level (JSS1, SSS3, etc.)
6. Select subjects (taught in class)
7. Click "Create Class"
8. Class now appears in list
9. Enroll students in class

---

### **TEACHER: How to Create an Exam**

**Web:**
1. Login to admin/teacher dashboard
2. Click "Exams & Quizzes" (top menu or Settings)
3. Click "+ New Exam"
4. Enter exam name
5. Select classes to add this exam to
6. Set exam date and time
7. Click "Add Questions" 
8. Add questions:
   - Click "+ New Question"
   - Select question type (multiple choice, true/false, short answer, file upload)
   - Enter question text and answer(s)
   - Set points
   - Click "Save"
9. Repeat for all questions
10. Review exam
11. Click "Publish" to make available to students

---

### **TEACHER: How to Grade an Assignment**

**Web:**
1. Login to teacher dashboard
2. Click "Assignments"
3. Click assignment needing grading
4. Click on individual student submission
5. View their answer/uploaded file
6. Enter score/grade
7. Add feedback comment
8. Click "Save Feedback"
9. Move to next student
10. Once all graded, click "Release Scores" (makes visible to students)

---

### **PARENT: How to Link to My Child**

**Web:**
1. Login to parent dashboard
2. Click "Profile" or "Link Child"
3. Click "+ Link New Child"
4. Enter child's email or student ID
5. Click "Send Request"
6. Child (or admin) receives notification
7. They click "Approve" on notification
8. Link established
9. You can now see child's:
   - Grades
   - Attendance
   - Performance
   - Assignments

---

### **PARENT: How to Check My Child's Attendance**

**Web:**
1. Login to parent dashboard
2. Click "Child Attendance" (dashboard card) OR find child name
3. View attendance calendar
4. See percentage attendance
5. View specific absence dates
6. Download report if needed

---

### **ADMIN: How to Create a Custom School Landing Page**

**Web:**
1. Login to admin dashboard
2. Click "Settings" or "Subdomain"
3. Click "Create Custom Landing Page"
4. Enter custom subdomain (e.g., "myschool")
5. Your URL becomes: `myschool.schoolhub.com`
6. Click "Edit Landing Page"
7. In builder, customize:
   - Upload school logo
   - Set hero image
   - Add school description
   - Add features/highlights
   - Add testimonials
   - Add gallery images
   - Set accent colors
   - Toggle dark mode
8. Click "Preview" to see mobile view
9. Click "Save" to apply
10. Share URL with students/parents to view

---

### **ADMIN: How to Manage User Roles**

**Web:**
1. Login to admin dashboard
2. Click "Settings"
3. Click "Users" or "User Management"
4. View list of all users
5. Click user to edit
6. Change role (Admin, Teacher, Student, Parent)
7. Set permissions for role
8. Click "Save"

---

### **ADMIN: How to Configure Subscription**

**Web:**
1. Login to admin dashboard
2. Click "Settings"
3. Click "Subscription" or "Plans"
4. View current plan details
5. Limits shown:
   - Max students
   - Max teachers
   - Max classes
   - Max exams
   - Storage limit
   - AI usage limit
6. To upgrade: Click "Upgrade Plan"
7. Select new plan tier
8. Proceed to payment (Paystack)
9. Confirm with payment
10. Plan upgrades immediately

---

### **ADMIN: How to View School Statistics**

**Web:**
1. Login to admin dashboard
2. Dashboard home shows:
   - Total students
   - Total teachers
   - Total classes
   - Total exams created
   - Storage used
   - Current plan
3. Click cards for detailed view
4. Download analytics report

---

## 🔐 Subscription & Access Control

### **Subscription Plans Overview**

**FREE Plan:**
- Basic functionality
- Limited to small class
- No AI features
- Limited storage
- Community support only

**PAID Plans** (Multiple tiers):

| Feature | Free | Basic | Professional | Enterprise |
|---------|------|-------|--------------|------------|
| Students | 10 | 50 | 500 | Unlimited |
| Teachers | 5 | 20 | 100 | Unlimited |
| Classes | 2 | 10 | 50 | Unlimited |
| Exams | 5 | 20 | 100 | Unlimited |
| Storage (GB) | 1 | 5 | 50 | Unlimited |
| AI Features | ❌ | ❌ | ✅ | ✅ |
| Custom Domain | ❌ | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ❌ | ✅ |
| Priority Support | ❌ | ❌ | ✅ | ✅ |

### **Feature Gating by Subscription**

**Free Users Cannot:**
- Create more than limit allows
- Use AI features
- Use custom domain
- Use advanced analytics

**Paid Users Get:**
- All features up to tier limit
- Priority support
- Higher storage
- AI-powered insights
- Custom landing pages

### **How to Handle "Feature Not Available" Messages**

**If user sees "Upgrade to unlock":**
1. They've hit their plan limit
2. Go to Settings → Subscription
3. Click "Upgrade Plan"
4. Select higher tier
5. Complete payment
6. Feature immediately available
7. Enter data and continue

---

### **Billing & Payments**

**Payment Methods:**
- Paystack payment gateway
- Supports: Ghana Cedis (GHS), Nigerian Naira (NGN)
- Credit/Debit cards accepted
- Mobile money (depending on region)

**Billing Cycles:**
- Monthly: Full price each month
- Yearly: Discounted price (usually 20% off)
- Trial period: 14 days free (auto-charge after if not cancelled)

**Invoice Management:**
- View all invoices in Settings → Payments
- Download as PDF
- Email invoices to stakeholders

---

## 🛠️ Technical Details for Support

### **Error Messages & Solutions**

| Error | Cause | Solution |
|-------|-------|----------|
| "Unauthorized Access" | User lacks role permission | Contact admin to upgrade role |
| "Feature Not Available" | Subscription limit reached | Upgrade plan in Settings |
| "Class Full" | Max students reached | Admin increases class capacity |
| "Upload Failed" | File too large or storage full | Free space or upgrade storage |
| "Session Expired" | JWT token expired | Logout and login again |
| "Payment Failed" | Payment gateway issue | Retry or use different card |
| "Email Not Verified" | User hasn't verified email | Resend verification code |
| "Server Error" | Backend issue | Contact support or try later |

### **Supported File Types**

- Documents: PDF, DOCX, DOC, TXT
- Spreadsheets: CSV, XLSX, XLS
- Images: PNG, JPG, JPEG, GIF
- Archives: ZIP, RAR
- Videos: MP4, MOV, AVI (up to size limit)

### **Storage & Performance**

- **File Size Limits:** Per file ~50MB (depends on plan)
- **Total Storage:** Based on subscription tier
- **Database:** PostgreSQL (Supabase)
- **Backup:** Automatic daily backups
- **Uptime:** 99.9% SLA for paid plans

### **Browser Compatibility**

**Recommended:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Mobile Browsers:**
- iOS Safari
- Chrome Android
- Samsung Internet

**Mobile App:** 
- iOS 12.0+
- Android 6.0+

### **Account Security**

- **Password:** Min 8 characters, mix of letters/numbers/symbols
- **2FA:** Available for accounts with sensitive data
- **Session Timeout:** 30 minutes inactivity
- **Email Verification:** Required for signup
- **OAuth:** Google login available

### **Data Privacy**

- **Data Encryption:** AES-256 in transit and at rest
- **GDPR Compliant:** Data export/deletion available
- **Data Retention:** Per school contract
- **Audit Logs:** All actions timestamped and logged
- **Access Logs:** Tracks who accessed what data and when

---

## 🎓 Best Practices for Users

### **For Administrators:**
1. Set up school info and branding immediately
2. Invite teachers and create classes before enrollment
3. Configure academic sessions and terms
4. Enable email notifications for important events
5. Regular data backups (automatic, verify settings)
6. Review user list quarterly to remove inactive users
7. Check subscription limits monthly

### **For Teachers:**
1. Create class roster before school starts
2. Upload class materials to assignment section
3. Set clear assignment deadlines
4. Grade assignments within 48 hours for engagement
5. Use AI question generation for exams (saves time)
6. Check attendance records weekly
7. Communicate grades promptly to parents

### **For Students:**
1. Complete assignments before deadline
2. Check timetable for schedule changes
3. Review exam schedule and prepare
4. Submit assignments on time for better grades
5. Check notifications regularly
6. Request parent link if parent needs access
7. Update profile picture and information

### **For Parents:**
1. Link to child within first week
2. Check grades and attendance weekly
3. Enable notifications for grade updates
4. Respond to teacher messages promptly
5. Attend parent-teacher conferences
6. Monitor conduct scores
7. Review payment history regularly

---

## 📞 Getting Help

### **In-App Support Options:**

1. **Help/FAQ** - Click "?" icon in dashboard
2. **Contact Form** - `/contact` page
3. **Support Tickets** - Create in dashboard if available
4. **Email Support** - support@schoolhub.app (when applicable)
5. **Documentation** - In-app tooltips and help texts

### **Common Issues Contact Points:**

- **Login/Authentication:** Support team
- **Payment/Billing:** Finance admin
- **Technical Issues:** Tech support
- **Feature Requests:** Product team
- **Data Access:** Admin + support

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | June 2026 | Initial comprehensive guide |

---

**This guide is designed to be used by AI assistants to help users navigate SchoolHub. Keep it updated as new features are added or UI changes occur.**

