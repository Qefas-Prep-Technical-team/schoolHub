# AI Support Knowledge Base: Operational Guidelines (Section 7)

## Overview
This document provides the operational details and policies for the AI support agent to resolve tickets end-to-end. It fills the previous coverage gaps regarding diagnostics, pricing, billing, privacy, and escalation paths.

---

## 7. Operational Guidelines & Troubleshooting

### 7.1 Error Messages & Diagnostics
When users report errors, the AI should use the following mapping to guide them:
* **"Invalid Credentials" / 401 Unauthorized:** The user's session has expired or password is incorrect. **Fix:** Guide the user to reset their password or log in again.
* **"Permission Denied" / 403 Forbidden:** The user is trying to access a restricted module (e.g., a student trying to view admin financial records). **Fix:** Explain role restrictions gracefully.
* **"Resource Not Found" / 404:** Usually occurs when an invalid Student ID or Invoice number is entered. **Fix:** Ask the user to verify the ID or URL.
* **"Network Timeout" / 500 Server Error:** **Fix:** Apologize for the inconvenience, advise the user to wait 5 minutes and try again. Escalate to engineering if the issue persists for multiple users.

### 7.2 Step-by-Step UI Navigation
The AI must guide users with explicit, click-by-click instructions:
* **To Create a Timetable (Admin):** Go to `Admin Dashboard` → Click `Academics` on the sidebar → Select `Timetable` → Click the `Create New` button → Select the Class and Term → Drag and drop subjects into the time slots.
* **To Enroll a Student (Admin):** Go to `Admin Dashboard` → Click `Users` → Select `Students` → Click `Add Student` → Fill in the biodata and class → Click `Save`.
* **To Pay Fees (Parent):** Go to `Parent Portal` → Click `Finances` → Go to `Outstanding Fees` → Click `Pay Now` on the active invoice → Complete payment via Paystack.

### 7.3 Pricing, Plans & Quota Numbers
* **Free School Plan:** ₦0 / month. Limits: Up to 50 students, 10 exams, 5 classes, 5 teachers, and 1GB storage. Includes basic analytics.
* **Pro School Plan:** ₦50,000 / month (or ₦500,000 / year). Limits: Up to 1000 students, 500 exams, 50 classes, 100 teachers, and 50GB storage. Includes advanced analytics, AI tools, and exam proctoring.
* **Teacher Premium:** ₦2,000 / month (or ₦20,000 / year). For individual teachers, includes AI lesson planner and advanced analytics.

### 7.4 Account, Billing & Payment Failure Scenarios
* **Paystack - Insufficient Funds:** Advise the user to fund their account or use a different card.
* **Paystack - Card Declined/Do Not Honor:** Advise the user to contact their bank as their card issuer blocked the transaction.
* **Timeout/Network Error during Payment:** Tell the user to wait 10 minutes. If debited without value, they should email support with the transaction receipt.
* **Refund Policy:** No automatic refunds after 7 days of active subscription. Escalate all refund requests to the billing team.

### 7.5 Account Recovery & Security
* **Account Lockouts:** Accounts lock after 5 failed login attempts. They automatically unlock after 30 minutes. Admins can manually unlock staff accounts via the `User Management` panel.
* **Email Change Requests:** The AI cannot change emails. Users must submit a support ticket, and it will be verified via a phone call to the registered owner.
* **Admin Transfer:** If a school changes its proprietor/director, a written authorization on the school's official letterhead must be emailed to support before admin rights are transferred.

### 7.6 Data Privacy & Student Records
* **NDPR Compliance:** Qefas Hub complies with the Nigeria Data Protection Regulation. All student records are securely stored.
* **Disclosure Rules:** The AI **MUST NEVER** share a student's grades, disciplinary logs, or financial status with any unverified user. Parents can only see data for children linked to their specific account.

### 7.7 Multi-School / Multi-Child Edge Cases
* **Parents with Multiple Children:** Parents do not need multiple accounts. They can link multiple children from the `My Wards` section using the unique `Student ID` and `Link Code` provided by the school.
* **Staff at Multiple Schools:** Teachers who teach at more than one Qefas Hub school can use the same email to log in. They can toggle between school workspaces using the dropdown menu in the top-right corner of their dashboard.

### 7.8 Mobile App / Offline Behavior
* **App Status:** Qefas Hub is a mobile-responsive web app (Progressive Web App). Users can install it to their home screen via their browser settings. There is currently no native app on the Play Store or App Store.
* **Connectivity Issues:** If a page is stuck loading or a spinner won't disappear, the AI should advise the user to check their internet connection, clear their browser cache, or switch networks (as connectivity in Nigeria can fluctuate).

### 7.9 SLA, Support Hours & Human Escalation Path
* **Support Hours:** Monday to Friday, 8:00 AM - 5:00 PM (WAT).
* **Escalation Channel:** Email `support@qefashub.com` or use the in-app chat widget.
* **SLA (Service Level Agreement):** Routine queries will be answered within 24 hours. Critical system downtime is prioritized within 2 hours.

### 7.10 Known Bugs / Current Limitations
* **PDF Result Generation:** Sometimes fails on weak internet connections. **Workaround:** Advise the user to clear their browser cache and try again.
* **SMS Delivery:** Messages sent to DND (Do Not Disturb) active numbers may experience delivery delays or failures depending on the telecom provider.
