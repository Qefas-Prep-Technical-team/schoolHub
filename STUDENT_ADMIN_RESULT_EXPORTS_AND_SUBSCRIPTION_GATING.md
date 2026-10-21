# Student & Admin Result Exports and Subscription Tier Gating Specification

## 1. Executive Summary

This document outlines the standardized architecture, visual parity, and institutional subscription gating governing all downloadable examination results, academic transcripts, assessment dossiers, and termly report sheets across Qefas Hub (both Student and Admin dashboards).

### Core Principles
1. **Visual Parity**: Student result exports match the design system and layout standards of the Admin dashboard exports, utilizing the global PDF generation utility (`frontend/src/utils/pdfGenerator.ts`).
2. **Subscription Plan Gating**: Only students enrolled in schools on active, paid institutional subscription tiers (or active trial periods) are authorized to export results. Free-tier access blocks exports and prompts the student to contact school administration.
3. **No Direct DOM Printing**: Outdated `window.print()` or unthemed canvas exports are deprecated in favor of structured jsPDF + autoTable documents conforming to `.agents/skills/global_export_template/SKILL.md`.

---

## 2. Subscription Plan Gating Architecture

### 2.1 Enforcement Logic (`subscriptionPlanCheck.ts`)

Access control is centrally governed by `assertSchoolPayingPlan` in `frontend/src/utils/subscriptionPlanCheck.ts`:

```typescript
export interface SchoolSubscriptionContext {
  id?: string;
  name?: string;
  plan?: string | null;
  subscriptionStatus?: string | null;
  isTrialActive?: boolean;
  subscriptionEnd?: string | Date | null;
}

export function isSchoolOnPayingPlan(school?: SchoolSubscriptionContext | null): boolean {
  if (!school) return false;
  if (school.isTrialActive) return true; // Active trials are permitted

  const planName = (school.plan || '').trim().toUpperCase();
  if (!planName || planName === 'FREE' || planName === 'NONE') return false;

  const status = (school.subscriptionStatus || '').trim().toUpperCase();
  if (status !== 'ACTIVE') return false;

  if (school.subscriptionEnd) {
    const expiry = new Date(school.subscriptionEnd);
    if (!isNaN(expiry.getTime()) && expiry.getTime() < Date.now()) return false;
  }

  return true;
}

export function assertSchoolPayingPlan(school?: SchoolSubscriptionContext | null): boolean {
  const isPaying = isSchoolOnPayingPlan(school);
  if (!isPaying) {
    toast.error(
      "Export and downloadable reports are an institutional feature reserved for schools on an active paid subscription. Please contact your school administration to upgrade from the Free tier.",
      { autoClose: 6000 }
    );
    return false;
  }
  return true;
}
```

### 2.2 Client-Side Interception Workflow

Before any PDF generation task initiates:
1. The student's institutional context is retrieved from `profile?.school || user?.schools?.[0]`.
2. `assertSchoolPayingPlan(school)` is called.
3. If the school plan is `FREE` or expired:
   - A non-intrusive error notification is rendered explaining that exports require an institutional plan.
   - Generation halts immediately, avoiding unnecessary client CPU overhead.
4. If verified, institutional `generatePDF` proceeds.

---

## 3. Result Export Touchpoints & Admin Parity Matrix

| Feature / Report | Student Dashboard Path | Admin Dashboard Path | Design Match / Architecture | Gating Status |
|---|---|---|---|---|
| **Termly Official Result Sheet** | `/dashboard/student/result/termly/view` | `/dashboard/admin/records` (Records Report View) | **100% Identical**: School logo header, student bio & term metadata, cognitive domain table (CA 40 + Exam 60 = 100), affective & psychomotor domains, teacher & principal AI remarks, signatures | Active (`assertSchoolPayingPlan`) |
| **Official Academic Transcript** | `/dashboard/student/grades` (Header & Transcript Tab) | `/dashboard/admin/grades` (`ComprehensiveTranscriptReport`) | **100% Identical**: Institutional header, student identity credentials, cumulative GPA (4.0 scale), multi-subject grade breakdown, WAEC grade scale (`A1`–`F9`), evaluator remarks | Active (`assertSchoolPayingPlan`) |
| **Exam / Assessment Dossier** | `/dashboard/student/grades/view/[type]/[id]` | `/dashboard/parent/exams&results/details` & `/dashboard/admin/records` | **Structured Dossier**: Comprehensive metadata header, subject component breakdown table, performance insight diagnosis, proficiency standing | Active (`assertSchoolPayingPlan`) |
| **Exam Solution Key & Review** | `/dashboard/student/exams&quizzes/[examId]/review` | `/dashboard/admin/classes/[id]` (Exam Results Review) | **Solution Key Dossier**: Candidate particulars, subject score summary, detailed question-by-question breakdown (Prompt, Student Answer, Answer Key, Marks Awarded, Status) | Active (`assertSchoolPayingPlan`) |

---

## 4. Institutional PDF Layout Specifications

All result exports utilize `generatePDF` adhering to the following structural requirements:

### 4.1 Header & Page Geometry
- **Page Size**: A4 portrait or landscape (`unit: 'mm'`).
- **Institutional Borders**: Dual concentric border (Outer: `0.5mm`, Inner: `0.2mm`).
- **Logo Integration**: Dynamic loading with institutional fallback (`/schoolhub.png`).
- **Institution Name**: Uppercase bold text, 14pt, center-aligned.
- **Address & Contacts**: 8pt muted gray text.

### 4.2 Metadata Block
- Clean two-column key-value grid specifying:
  - Student Name & Identification Code
  - Class, Stream, and Session
  - Term / Assessment Title & Date
  - Cumulative GPA, Weighted Average, and Proficiency Rank

### 4.3 Data Tables (`jspdf-autotable`)
- **Theme**: Clean grid (`theme: 'grid'`).
- **Header Styles**: Deep slate / charcoal `#1E293B`, bold white typography.
- **Alternating Rows**: `#F8FAFC` zebra-striping for optimal scanning.
- **WAEC Grade Annotations**: Distinct column showing WAEC standard classifications (`A1` Excellent through `F9` Fail).

### 4.4 Additional Sections
- **AI Evaluator Endorsements**: Structured box displaying class teacher and principal remarks.
- **Signatures**: Formatted signature lines for Class Teacher, Principal, and Date Stamp.
- **Institutional Watermark**: Official footer stamp `Powered by Qefas Hub — Official Academic Record`.

---

## 5. Maintenance & Extension Guidelines

When implementing any future result or assessment export within the student workspace:
1. **Never use inline PDF generation or `window.print()`**. Always import `generatePDF` from `@/utils/pdfGenerator`.
2. **Never omit subscription checks**. Guard the handler with:
   ```typescript
   if (!assertSchoolPayingPlan(profile?.school || user?.schools?.[0])) return;
   ```
3. **Always type data parameters explicitly** (Zero `any` in TypeScript).
4. **Provide visual loading indicators** (`isExporting` with `Loader2`) on export buttons to prevent duplicate clicks during rendering.
