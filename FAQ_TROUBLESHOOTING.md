# SchoolHub - FAQ & Troubleshooting Guide

**Common issues, error messages, and solutions for AI support agents**

---

## ❓ Frequently Asked Questions

### **Account & Access**

#### Q: "I forgot my password. What do I do?"

**A:**

1. Go to `/login`
2. Click "Forgot Password?" link
3. Enter email address
4. Click "Send Reset Link"
5. Check email for password reset link (might be in spam)
6. Click link in email
7. Enter new password (min 8 chars, mix of upper/lower/numbers/symbols)
8. Click "Update Password"
9. Login with new password

_Note: Link expires in 24 hours. Request new one if expired._

---

#### Q: "I can't log in. Email or password is wrong."

**A:**

1. Check caps lock is OFF
2. Verify correct email address (check for typos)
3. Try "Forgot Password" to reset password
4. Check if email is verified (you might have received verification email first)
5. Check if account is active (not deactivated by admin)
6. Try different browser or clear cache
7. Contact support if still failing

---

#### Q: "My email/account is not verified. How do I verify?"

**A:**

1. Check email inbox (and spam folder) for verification code
2. Go to `/verification` page
3. Paste code from email
4. Click "Verify"
5. If you don't see email:
   - Click "Resend verification code" on verification page
   - Wait a few minutes for new email
   - Check spam folder

---

#### Q: "I need to change my password."

**A:**

1. Login to your dashboard
2. Click profile icon (👤) top right
3. Click "Settings" or "Change Password"
4. Enter current password
5. Enter new password twice
6. Click "Update"
7. You might need to login again with new password

---

#### Q: "Can I have multiple accounts?"

**A:**

- **No** - Same email can only have one account
- **But** - You can have multiple roles in one account (student + parent)
- **Or** - Use different email addresses for different roles/schools

---

#### Q: "I can't see my school in the school selector. What now?"

**A:**

- **Option 1:** Admin hasn't activated your school yet (contact school admin)
- **Option 2:** Use school invite code: `/join/school/[code]` (ask admin for code)
- **Option 3:** Use class invite code: `/join/class/[id]` (ask teacher for code)
- **Option 4:** Try signing up with different email registered with school

---

### **Navigation & Features**

#### Q: "Where do I find [specific feature]?"

**A:** Use the Quick Reference Feature Finder document:

- Search for feature name
- Find Web location and Mobile location
- Follow navigation path provided

**Most common:**

- Grades → Dashboard → Grades (web) or Grades tab (mobile)
- Exams → Dashboard → Exams (web) or Exams tab (mobile)
- Classes → Dashboard → Classes (web) or Classes tab (mobile)
- Timetable → Dashboard → Timetable (web) or Timetable tab (mobile)

---

#### Q: "Why can't I see this feature?"

**A:** Check the following:

1. **Wrong role** - Feature only available to Admin/Teacher/Parent/Student
   - Check your profile → confirm your role
2. **Subscription limit** - You've hit your plan limit
   - Go to Settings → Subscription
   - See what's at limit
   - Click "Upgrade Plan" to get more access
3. **Feature not enabled** - School admin hasn't activated feature
   - Contact your school admin to enable it
4. **Different version** - Using old browser, clear cache
   - Try Ctrl+F5 (hard refresh) or clear browser cache

---

#### Q: "The page is blank/won't load."

**A:**

1. Check internet connection
2. Hard refresh page: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
3. Clear browser cache:
   - Chrome: Settings → Privacy → Clear browsing data
   - Firefox: Settings → Privacy → Clear data
4. Try different browser
5. Sign out and sign back in
6. Contact support if persists

---

### **Exams & Assessments**

#### Q: "I can't start an exam. What's wrong?"

**A:**

1. Check exam is **published** (not draft) - Contact teacher/admin if in draft
2. Check you're **enrolled in the class** - Join class if not enrolled
3. Check **exam date hasn't passed** - Can't start ended exams
4. Check **exam time window** - Some exams only open during specific times (ask teacher)
5. Check **technical issues**:
   - Refresh page
   - Try different browser
   - Check internet connection
6. Check **browser compatibility** - Use Chrome/Firefox/Safari (not old IE)

---

#### Q: "My exam submission failed. What happened?"

**A:**

- **Possible causes:**
  - Internet disconnected during submission
  - Browser crashed
  - Server error
  - File was too large

- **What to do:**
  - Check if exam shows as "submitted" in your exam list
  - If not, try submitting again
  - Contact teacher to confirm if submission received
  - Teacher can extend deadline if needed

---

#### Q: "I submitted exam but can't see my grade. When will it be graded?"

**A:**

- **Timing:**
  - Auto-graded exams (multiple choice, True/False) → Instant results show
  - Manual grading (short answer, essays) → 1-3 days typically
  - Teacher sets deadline, grades after
- **What to do:**
  - Go to Exams page, check exam status
  - If status = "Grading in Progress" → Teacher hasn't finished
  - If status = "Graded" but you don't see grade → Contact teacher
  - Grade appears in Grades tab once released by teacher

---

#### Q: "Can I retake an exam?"

**A:**

- **Depends on teacher:** Some allow retakes, some don't
- **Check:**
  - Go to Exams page
  - See if exam shows "Retake available" or "Retake not allowed"
  - If available, click "Retake"
  - If not allowed, ask teacher for permission

---

### **Assignments**

#### Q: "I can't upload my assignment. File won't upload."

**A:**

1. Check **file size** - Max ~50MB per file
   - Compress large files before uploading
2. Check **file type** - Supported: PDF, DOCX, DOC, TXT, CSV, XLSX, XLS, PNG, JPG, JPEG, GIF, ZIP, RAR, MP4, MOV, AVI
   - If unsupported type, convert to PDF
3. Check **storage** - You might be out of storage
   - Contact admin if storage full
   - Can upgrade plan to get more storage
4. Check **internet** - Weak connection might fail upload
   - Use stronger WiFi or mobile data
   - Try uploading again
5. Check **deadline** - Deadline passed = can't submit
   - Ask teacher for extension if urgent

---

#### Q: "When can I submit an assignment?"

**A:**

- After teacher creates it and date arrives
- Status shows "Open" or "Available"
- If shows "Closed" = deadline passed (ask teacher for extension)
- If shows "Draft" = Not yet available (wait)

---

#### Q: "How long do I have to submit?"

**A:**

- See due date on assignment card
- Assignments submitted after due date show as "Late"
- Teacher can still accept late, but may deduct points
- Ask teacher if deadline flexible

---

#### Q: "Can I submit multiple times?"

**A:**

- **Usually yes** - Teacher can allow multiple submissions
- Latest submission = the one graded
- Check assignment settings for submission limit
- Ask teacher if unclear

---

#### Q: "Why can't I see teacher feedback on my submission?"

**A:**

- Teacher hasn't graded yet
- Go to Assignments → [Assignment] → "Submissions" tab → Look for your submission
- If showing "Pending Grading" → Still being graded
- Feedback appears once teacher grades and "releases" feedback
- Deadline for feedback varies (ask teacher)

---

### **Grades**

#### Q: "Why don't all my grades show up?"

**A:**

1. **Different term/period** - Filter to current term
   - Click "Filter by Term" → Select current term
2. **Grade not released yet** - Teacher marked it but didn't release
   - Check grade status (draft vs released)
   - Ask teacher to release
3. **Different class** - Enroll in more classes to see more grades
4. **Assignment/exam not graded** - Teacher hasn't graded yet
   - Wait for grading or ask teacher

---

#### Q: "My grade seems wrong. What do I do?"

**A:**

1. **Check the breakdown:**
   - Go to Grades page
   - Click on subject → See exam score + assignment score + average
   - Review individual assignment feedback (might have calculation error wrong)

2. **If still wrong:**
   - Take screenshot
   - Email teacher or parent
   - **Don't change it yourself** - Only teacher/admin can change
   - Ask teacher to review and correct in system

3. **For audit/verification:**
   - Admin can view "Grade Audit Log" to see who changed what and when

---

#### Q: "Can I download my grades to Excel?"

**A:**

- **Web only** - Mobile doesn't have export
- Go to Grades page
- Click "Download Report" button (usually top right)
- Saves as PDF or Excel depending on browser

---

#### Q: "How is my GPA calculated?"

**A:**

- Depends on school scale (most use 4.0 scale)
- Typically: Average of all grades weighted by subject
- Shows at top of Grades page
- Calculation method set by school admin
- Ask teacher/admin for exact formula

---

### **Attendance**

#### Q: "Why is my attendance low?"

**A:**

- Check Attendance page for absences
- If marked absent incorrectly:
  - **Student/Parent:** Contact teacher to correct
  - **Teacher:** Edit attendance record if error made
- If legitimate absence:
  - Provide excuse to teacher
  - Ask admin to mark as "excused/accepted"
  - Excused absences may not count against percentage

---

#### Q: "How do I check attendance percentage?"

**A:**

- **Web (Student/Parent):** Dashboard → Attendance
- **Web (Teacher/Admin):** Dashboard → Attendance → Reports
- Shows percentage present for term
- Breakdown by month/week available

---

#### Q: "Can attendance records be changed?"

**A:**

- **Teacher/Admin** - Yes, can edit if marked wrong
- **Student/Parent** - No, can't change. Must ask teacher
- Corrections create audit trail (recorded in logs)

---

### **Classes**

#### Q: "How do I join a class?"

**A:**

1. **Option 1 - Enroll:**
   - Ask teacher/admin to enroll you
   - Teacher goes to Classes → [Class] → + Enroll → Search your name → Add
2. **Option 2 - Invite Code:**
   - Teacher gives you invite code (usually like: CLASS-XXXX or URL)
   - Go to `/join/class/[id]`
   - Click "Join This Class"
   - Auto-enrolled

---

#### Q: "Why can't I see this class? Am I enrolled?"

**A:**

- Check Classes page - See all enrolled classes
- If not there:
  - Ask teacher/admin to enroll you
  - OR use invite code if you have one
- If enrolled but can't see:
  - Clear cache and refresh
  - Logout and login again

---

#### Q: "Can I leave a class?"

**A:**

- **Students:** Ask teacher/admin to remove you
- **Teachers:** Contact admin to drop class management
- Cannot self-remove (prevents accidental removal)

---

### **Parents & Guardians**

#### Q: "How do I link to my child's account?"

**A:**

1. Login as parent
2. Click "Link Child" or "Add Child" button
3. Option A - Enter child's **student ID or email**
4. Option B - Click unique link provided by child
5. Click "Send Request"
6. **Child or admin must approve** - Notification sent
7. Once approved: You see child's grades, attendance, timetable

---

#### Q: "My linking request was rejected. What now?"

**A:**

- Child or admin clicked "Deny"
- Reasons:
  - Child doesn't recognize email
  - Admin doesn't confirm relationship
  - Link already exists with another parent

**What to do:**

- **Option 1:** Contact child - Ask them to approve
- **Option 2:** Contact school admin - Ask to link
- **Re-send request:** Try again with correct email

---

#### Q: "Can I see multiple children's grades?"

**A:**

- **Yes** - Link to all children
- Go to Child Selection (dashboard top)
- Switch between children to view each one's data
- All children shown in lists if linked

---

#### Q: "My child still shows old school after transfer. When updates?"

**A:**

- Admin must update child's school enrollment
- Status changes from "Active" to "Transferred"
- New school enrollment created as "Active"
- Takes effect within 24 hours
- Contact school admin if delayed

---

### **Learning & Study**

#### Q: "How do I improve my grades?"

**A:**

1. **Analyze weak areas:**
   - Go to Grades → Review each subject
   - Identify patterns (exam weakness? assignment weakness?)

2. **Review feedback:**
   - Go to Assignments → View teacher feedback
   - Understand why points deducted

3. **Use AI insights** (paid plan):
   - Dashboard → Grades → Insights tab
   - Shows personalized recommendations
   - Identifies trending subjects

4. **Talk to teacher:**
   - Email teacher about weak areas
   - Ask what to focus on
   - Request tutoring/extra help if available

5. **Plan ahead:**
   - Check timetable for when exams scheduled
   - Start studying 1-2 weeks before
   - Ask for study materials

---

#### Q: "When are past papers available?"

**A:**

- Teacher uploads in Assignments section
- Or shared through "Class Materials"
- Ask teacher for past papers if not found
- Usually available closer to exam

---

### **Technical Issues**

#### Q: "The app/website is slow. What's wrong?"

**A:**

1. Check **internet speed** - Mobile data might be slow
   - Try WiFi instead
   - Speed test: speedtest.net
2. Check **browser extensions** - Ad blockers can slow things
   - Temporarily disable and test
3. Check **device storage** - Full device slows everything
   - Delete unused apps/files
4. Check **browser cache** - Old data can slow things
   - Clear cache (see other technical questions)
5. Check **traffic** ` - System might be slow at peak times
   - Try again in off-peak hours (late night/early morning)

---

#### Q: "I see a 'Server Error' message. What happened?"

**A:**

- **Temporary issue** - Backend server had problem
- **What to do:**
  - Wait 1-2 minutes
  - Refresh page (F5 or Cmd+R)
  - Try again
  - If persists, contact support with:
    - Screenshot of error
    - What you were trying to do
    - Time error occurred
    - Browser type

---

#### Q: "My browser keeps asking for password again."

**A:**

- **Could be:**
  - Browser cache cleared automatically
  - Cookies disabled in browser settings
  - Session timed out (auto-logout after 30 mins inactivity)
- **To fix:**
  - **Windows:** Settings → Privacy & Security → Cookies → Allow
  - **Mac:** Safari → Privacy → Cookies → Always allow
  - Check if "Remember me" checkbox not selected on login

---

#### Q: "File upload keeps failing."

**A:**
See "I can't upload my assignment" section above.

---

#### Q: "The system logged me out. Why?"

**A:**

- **Auto-logout:** Session times out after 30 minutes inactivity
- **Security feature:** Prevents unauthorized access if device left unattended
- **What to do:**
  - Login again normally
  - Click "Remember me" to stay logged in longer (if available)

---

#### Q: "Can I use SchoolHub on mobile web?"

**A:**

- **Yes** - Mobile web browser (Chrome, Safari) works
- **But** - Mobile app is better (optimized UI, notifications, offline features)
- **Download:** Search "SchoolHub" in Google Play (Android) or App Store (iOS)

---

### **Payments & Subscriptions**

#### Q: "Why can't I create more [exams/classes/students]?"

**A:**

- **Hit plan limit** - Your subscription has max set
- **Check limit:** Settings → Subscription
- Shows: Max Students X, Max Classes Y, etc.
- **To get more:**
  - Click "Upgrade Plan" button
  - Select higher tier (more limits)
  - Complete payment
  - Limits increase immediately

---

#### Q: "How much does SchoolHub cost?"

**A:**

- See `/pricing` page on website
- Multiple tiers: Free, Basic, Professional, Enterprise
- Pricing in GHS (Ghana) or NGN (Nigeria)
- Monthly and yearly options (yearly = discount)
- Contact sales for custom quotes

---

#### Q: "When will I be charged for upgrade?"

**A:**

- **Immediately** - Charged when you confirm payment
- **Next cycle** - Pro-rated to your next billing date if mid-cycle
- **Receipt:** Sent to email immediately
- **View invoices:** Settings → Payments → Invoices

---

#### Q: "Can I get a refund?"

**A:**

- **Refund policy:** Set by school/organization admin
- **For physical damage:** Check Terms of Service
- **Contact support:** With order ID and reason
- **Billing disputes:** Finance admin reviews and responds

---

#### Q: "Do you accept payment plans?"

**A:**

- Contact sales/support
- Enterprise plans available for large institutions
- Custom billing arrangements possible

---

### **Admin/Teacher Questions**

#### Q: "How do I invite students to my class?"

**A:**

1. **Option 1 - Direct Enrollment:**
   - Dashboard → Classes → [Class name]
   - Click "+ Enroll Student"
   - Search student by name/email
   - Click "Add"
   - Student auto-enrolled

2. **Option 2 - Invite Code:**
   - Dashboard → Classes → [Class name]
   - Click "Share Invite Code"
   - Copy URL or code
   - Share with students
   - Students click link → Auto-join class

3. **Option 3 - Bulk Import:**
   - Dashboard → Classes → [Class]
   - Click "Import Students"
   - Upload CSV file with student emails
   - System enrolls all

---

#### Q: "How do I create an exam with questions?"

**A:**
See "Where do I create an exam?" in Feature Finder guide.
**Quick:**

1. Click "Exams & Quizzes"
2. "+ New Exam"
3. Fill details (name, date, classes)
4. "Add Questions" → Add each question
5. Review, then "Publish"

---

#### Q: "Can I use AI to create exam questions?"

**A:**

- **Yes** (paid plan only)
- While creating exam questions
- Click "AI Generate" button
- Type topic/subject
- Select # of questions and type
- AI generates questions
- You review and approve before using

---

#### Q: "How do I generate a conflict-free timetable?"

**A:**

1. Dashboard or Settings → Timetable
2. Click "+ Create Timetable"
3. Select class
4. Define time periods (Period 1, 2, 3, etc.)
5. Assign subjects to periods and teachers
6. Click "Generate"
7. AI checks for conflicts:
   - Same teacher teaching 2 classes same time
   - Same room double-booked
8. Conflicts resolved automatically or shows warning
9. Review and "Save"

---

#### Q: "Why can't I see attendance marked?"

**A:**

- Check you selected **correct date and class**
- Check if students enrolled in class
- Try refreshing page
- Check if teacher who marked has access (different teacher?)
- Contact admin if attendance data missing

---

#### Q: "How do I manage landing page?"

**A:**
See "Where do I create a custom landing page?" in Feature Finder.
**Quick:**

1. Dashboard → "Subdomain" or Settings
2. Create custom domain (myschool.schoolhub.com)
3. "Edit Landing Page"
4. In builder:
   - Add images, hero section
   - Customize colors
   - Add content sections
5. Preview on mobile
6. Save → Live

---

---

## 🐛 Common Error Messages & Solutions

| Error Message                     | Cause                         | Solution                                    |
| --------------------------------- | ----------------------------- | ------------------------------------------- |
| "Unauthorized Access"             | Wrong role/permissions        | Contact admin to upgrade role               |
| "Session Expired"                 | Too long inactive             | Logout and login again                      |
| "Payment Declined"                | Card/payment failed           | Try different card or payment method        |
| "File Too Large"                  | Exceeds size limit            | Compress file or upload smaller chunks      |
| "Class Full"                      | Max enrollment reached        | Increase class capacity or create new class |
| "Email Already Registered"        | Email used before             | Use different email or reset password       |
| "Invalid Verification Code"       | Wrong/expired code            | Request new code and retry                  |
| "Cannot Access Before Start Date" | Exam/assignment not open yet  | Wait for start date/time                    |
| "Deadline Passed"                 | Submission deadline over      | Ask teacher for extension                   |
| "Grade Not Found"                 | Exam results not released     | Teacher still grading                       |
| "Student Not Enrolled"            | Not in class roster           | Enroll in class first                       |
| "Server Timeout"                  | Server slow/busy              | Wait and retry, or contact support          |
| "Browser Not Supported"           | Old browser version           | Update browser (Chrome/Firefox/Safari)      |
| "Network Connection Error"        | Internet disconnected         | Check WiFi/mobile data connection           |
| "Feature Unavailable"             | Not in your subscription tier | Upgrade plan in Settings                    |

---

## 📞 When to Contact Support

**Contact Support if:**

- Error message persists after troubleshooting
- Data seems missing or corrupted
- Payment/billing issue
- Account access problem
- Feature request
- Report bug/technical issue
- Data export/deletion request

**Don't Contact Support for:**

- How-to questions → Use this guide
- Forgot password → Use "Forgot Password" link
- Specific grade questions → Ask teacher
- School-specific policies → Ask school admin

**Support Contact Methods:**

- In-app support form (if available)
- `/contact` page
- Email: support@schoolhub.app (if applicable)
- Where to get help article links

---

## 💡 Tips for Smooth Experience

### **For All Users:**

1. Keep browser updated (Chrome, Firefox, Safari)
2. Clear cache monthly
3. Use strong, unique password
4. Have stable internet before submitting important data
5. Download important reports regularly (grades, transcripts)
6. Enable email notifications for important updates
7. Check "Remember me" on trusted device only

### **For Students:**

1. Check timetable before each week
2. Mark assignment due dates in personal calendar
3. Start exams with plenty of battery (or plug in)
4. Submit assignments few minutes before deadline (not last second)
5. Review grade feedback right after release
6. Enable notifications for exam announcements

### **For Teachers:**

1. Grade assignments within 48 hours (increases engagement)
2. Publish exams 24+ hours before taking
3. Set clear assignment instructions
4. Backup your class data regularly
5. Check if students enrolled before sending notifications
6. Use AI features when available (saves time)

### **For Parents:**

1. Check grades/attendance weekly, not daily
2. Enable important notifications only (avoid alert fatigue)
3. Save invoices/receipts for records
4. Follow up on behavior alerts quickly
5. Link to child within first week of enrollment
6. Message teacher 2-3 days for response (not expecting instant)

### **For Admins:**

1. Create backup of school data regularly
2. Monitor subscription usage monthly
3. Review user access quarterly (remove inactive)
4. Set up landing page within first month
5. Configure email settings early
6. Test features in draft before publishing
7. Keep school contact info up to date

---

## 🔄 Data Backup & Recovery

**What's Automatically Backed Up:**

- All academic records (grades, exams, attendance)
- User accounts and credentials
- School configuration
- Payment records
- Email logs

**Backup Frequency:** Daily (varies by plan)

**How to Recover Data:**

1. If data accidentally deleted:
   - Contact admin/support immediately
   - Provide last known state (date, what was there)
   - Backup restoration available within 30 days typically
2. Export before deleting:
   - Always download reports before major changes
   - Keep copies of important documents

**Data Retention:**

- Active school data: Kept indefinitely
- Student history: Retained for 7 years (educational standard)
- Deleted content: 30-day recovery window

---
