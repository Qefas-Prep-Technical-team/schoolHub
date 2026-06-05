# Student Enrollment, Academic Progression, History Tracking & Notification System

## Overview

The system must be designed so that a student can only have **one active school enrollment at a time**. Every major event that occurs during a student's journey in a school must be permanently tracked in a centralized Student History Timeline. This history serves as the student's complete academic and administrative record and should never be deleted.

The goal is to create a full student lifecycle management system that tracks admissions, promotions, transfers, exits, awards, leadership positions, certifications, disciplinary actions, and all significant changes made to the student's profile.

---

# 1. Single School Enrollment Restriction

A student may only be actively linked to one school at any given time.

## Rules

* A student cannot be enrolled in multiple schools simultaneously.
* Before joining a new school, the student's existing active enrollment must be closed.
* The system must prevent administrators from linking a student to another school while an active enrollment exists.
* Historical school enrollments must remain accessible for reporting and auditing purposes.

## Enrollment Statuses

Each school enrollment should have one of the following statuses:

* Active
* Graduated
* Transferred
* Expelled
* Withdrawn
* Suspended (Optional)

Only enrollments marked as **Active** should be considered current school enrollments.

---

# 2. Student Registration

When a student is registered into a school, the system should automatically create all required records.

## Automatic Actions

### Create School Enrollment

```text
Status: Active
Enrollment Date: Registration Date
School: Selected School
```

### Create Academic Assignment

Assign:

* Academic Session
* Academic Term
* Academic Level
* Class

### Create Student Status

```text
Status: Active
```

### Create Student History Entry

```text
Event Type: JOINED_SCHOOL
Title: Student Enrolled
Description: Student was successfully enrolled into the school.
```

### Send Notifications

Notify:

* School Administrator
* Class Teacher
* Parent/Guardian

Example:

```text
John Doe has been successfully enrolled into JSS1 A for the 2026/2027 academic session.
```

### Create Audit Record

Store:

* Created By
* Date Created
* School
* Timestamp

---

# 3. Student Profile History Timeline

Every student should have a dedicated History Timeline section accessible from their profile.

The timeline should display all events in chronological order and act as the student's permanent record.

## History Categories

### Enrollment Events

* Joined School
* Re-enrolled
* Transferred
* Graduated
* Withdrawn
* Expelled

### Academic Events

* Promotion
* Demotion
* Class Change
* Stream Change

### Leadership Events

* Prefect Assigned
* Prefect Removed
* Leadership Position Changed

### Awards & Recognition

* Award Received
* Competition Won
* Special Recognition

### Certifications

* Certificate Issued
* Certification Completed

### Discipline

* Warning Issued
* Suspension
* Expulsion

### Administrative Changes

* Parent Updated
* Student Details Updated
* Medical Information Updated

---

# 4. Student Exit Management

A button called **Exit Student** should be available on every student profile within the Admin Dashboard.

## Exit Workflow

When clicked:

Open a modal containing:

### Exit Type

Choose one:

* Graduated
* Transferred
* Expelled
* Withdrawn
* Other

### Additional Fields

* Exit Date
* Exit Reason
* Notes

## System Actions

Upon confirmation:

### Update Enrollment

```text
Status: Exit Type Selected
```

### Remove Active Enrollment

Student is no longer considered actively enrolled.

### Create History Entry

Example:

```text
Event Type: EXITED_SCHOOL
Status: Transferred
Date: 15 June 2026
Reason: Moved to another school
```

### Send Notifications

Notify:

* School Administrator
* Principal
* Class Teacher
* Parent/Guardian

Example:

```text
John Doe has been marked as Transferred effective 15 June 2026.
```

---

# 5. Student Transfer Management

When a student is transferred:

## System Actions

1. Close current enrollment.
2. Mark status as Transferred.
3. Create transfer history.
4. Store transfer reason and destination school (if provided).

## History Entry

```text
Event Type: TRANSFERRED
```

## Notifications

Notify:

* School Administrator
* Principal
* Parent/Guardian

---

# 6. Student Promotion System

On the Class Management page, there should be a **Promote Students** button.

---

## Promotion Workflow

When clicked:

Open a promotion modal.

### Display Current Information

* Current Session
* Current Class
* Current Level

### Promotion Setup

Allow administrators to configure:

* New Academic Session
* New Academic Level
* New Class
* Effective Date

Example:

```text
From:
JSS1 A

To:
JSS2 A

Session:
2026/2027
```

---

## Student Selection

Display all students in the current class.

Allow:

* Select All
* Deselect Individual Students
* Exclude Students From Promotion

Example:

```text
☑ John Doe
☑ Mary James
☐ David Smith (Repeat Class)
☑ Peter Johnson
```

Students excluded remain in their current class.

---

## Promotion Actions

For every selected student:

Update:

* Current Session
* Current Level
* Current Class

Generate history:

```text
Event Type: PROMOTED
From Class: JSS1 A
To Class: JSS2 A
Session: 2026/2027
```

### Notifications

Notify:

* School Administrator
* Current Class Teacher
* New Class Teacher
* Parent/Guardian

Example:

```text
Congratulations! John Doe has been promoted from JSS1 A to JSS2 A.
```

---

# 7. Class Change Management

Administrators should be able to move students between classes manually.

Example:

```text
JSS1 A → JSS1 B
```

## System Actions

Update:

* Current Class

Create History:

```text
Event Type: CLASS_CHANGED
```

### Notifications

Notify:

* Previous Class Teacher
* New Class Teacher
* Parent/Guardian

---

# 8. Prefect & Leadership Management

Administrators should be able to assign leadership positions to students.

Examples:

* Head Boy
* Head Girl
* Sports Prefect
* Library Prefect
* Health Prefect

---

## Assignment Actions

Create History:

```text
Event Type: PREFECT_ASSIGNED
Role: Head Boy
```

### Notifications

Notify:

* Student
* Parent/Guardian
* School Administrator

Example:

```text
Congratulations! John Doe has been appointed Head Boy.
```

---

## Removal Actions

Create History:

```text
Event Type: PREFECT_REMOVED
Role: Head Boy
```

### Notifications

Notify:

* Student
* Parent/Guardian
* School Administrator

---

# 9. Award Management

Administrators should be able to issue awards to students.

## Award Information

Store:

* Award Name
* Award Category
* Description
* Award Date
* Issued By

---

## System Actions

Create History:

```text
Event Type: AWARD_RECEIVED
Award: Best Mathematics Student
```

### Notifications

Notify:

* Student
* Parent/Guardian
* Class Teacher

Example:

```text
John Doe has received the Best Mathematics Student Award.
```

---

# 10. Certification Management

Administrators should be able to issue certificates to students.

## Certificate Information

Store:

* Certificate Name
* Certificate Type
* Date Issued
* Issued By

---

## System Actions

Create History:

```text
Event Type: CERTIFICATE_ISSUED
Certificate: Coding Fundamentals Completion
```

### Notifications

Notify:

* Student
* Parent/Guardian

---

# 11. Disciplinary Management

## Warning

Store:

* Reason
* Date
* Issued By

Create History:

```text
Event Type: WARNING_ISSUED
```

Notify:

* Parent/Guardian
* Class Teacher

---

## Suspension

Store:

* Suspension Reason
* Start Date
* End Date

Create History:

```text
Event Type: SUSPENDED
```

Notify:

* Parent/Guardian
* School Administrator
* Principal

---

## Expulsion

Store:

* Reason
* Date

Create History:

```text
Event Type: EXPELLED
```

Notify:

* Parent/Guardian
* Principal
* School Administrator

---

# 12. Graduation Management

When a student completes the highest level available within the school:

## System Actions

1. Close active enrollment.
2. Mark enrollment as Graduated.
3. Generate graduation history.

### History Entry

```text
Event Type: GRADUATED
```

### Notifications

Notify:

* Student
* Parent/Guardian
* School Administrator

Example:

```text
Congratulations! John Doe has successfully graduated.
```

---

# 13. Re-enrollment Management

If a previously exited student returns:

## System Actions

1. Create a new enrollment record.
2. Mark student as Active.
3. Assign new academic details.
4. Generate history entry.

### History Entry

```text
Event Type: RE_ENROLLED
```

### Notifications

Notify:

* School Administrator
* Class Teacher
* Parent/Guardian

---

# 14. Automatic History Events

The system should automatically generate history records for:

| Event                       | History Type       |
| --------------------------- | ------------------ |
| Student Registration        | JOINED_SCHOOL      |
| Student Exit                | EXITED_SCHOOL      |
| Transfer                    | TRANSFERRED        |
| Graduation                  | GRADUATED          |
| Re-enrollment               | RE_ENROLLED        |
| Promotion                   | PROMOTED           |
| Demotion                    | DEMOTED            |
| Class Change                | CLASS_CHANGED      |
| Prefect Assignment          | PREFECT_ASSIGNED   |
| Prefect Removal             | PREFECT_REMOVED    |
| Award Issued                | AWARD_RECEIVED     |
| Certificate Issued          | CERTIFICATE_ISSUED |
| Warning Issued              | WARNING_ISSUED     |
| Suspension                  | SUSPENDED          |
| Expulsion                   | EXPELLED           |
| Parent Updated              | PARENT_UPDATED     |
| Student Information Updated | STUDENT_UPDATED    |

---

# 15. Notification Center Integration

All notifications should support:

* In-App Notifications
* Email Notifications
* SMS Notifications (Optional)
* WhatsApp Notifications (Optional)

Each school should be able to configure:

* Which notification channels are enabled.
* Which events trigger notifications.
* Which users receive notifications.

---

# Core Business Rule

A student may only have **one active school enrollment at a time**. Every significant event throughout the student's academic journey must automatically generate both a history record and appropriate notifications. This ensures complete traceability, accountability, and a permanent academic record from admission to graduation or exit from the institution.
