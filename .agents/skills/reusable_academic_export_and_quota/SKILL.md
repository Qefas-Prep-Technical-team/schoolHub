---
name: reusable_academic_export_and_quota
description: Architecture, quota enforcement, and integration guide for the reusable academic export components (ExportResultScopeModal, RoleResultExportModal) across Admins, Teachers, Students, and Parents in Qefas Hub.
---

# Reusable Academic Export and Quota Skill

This skill documents the standard design, component architecture, and tier-based quota rules for exporting and downloading student grades, assessment marksheets, and report cards across all role dashboards (**Admin**, **Teacher**, **Student**, and **Parent**) in Qefas Hub.

---

## 1. Core Architecture & Components

The export system is decomposed into reusable, modular subcomponents that adhere strictly to the **< 300 lines** rule:

### 1.1 Components Overview
| Component | Location | Primary Role | Description |
|---|---|---|---|
| `ExportResultScopeModal` | `frontend/src/app/dashboard/admin/grades/components/ExportResultScopeModal.tsx` | Admin & Teacher Cohorts | Full multi-format modal allowing Master Result Sheet, Zip archives, and custom candidate rosters. |
| `RoleResultExportModal` | `frontend/src/components/export/RoleResultExportModal.tsx` | Student & Parent & Single Teacher | Lightweight, dedicated export dialogue for individual student report cards and termly result sheets. |
| `ExportQuotaBanner` | `frontend/src/app/dashboard/admin/grades/components/export/ExportQuotaBanner.tsx` | All Dialogues | Visual banner displaying monthly quota progress (`used/limit`) or verified institutional pro status. |
| `ExportFormatSelector` | `frontend/src/app/dashboard/admin/grades/components/export/ExportFormatSelector.tsx` | Scope Modal | Multi-format picker for `.pdf`, `.xlsx`, and `.csv`. Locks spreadsheet exports on free tier. |
| `ExportScopeSelector` | `frontend/src/app/dashboard/admin/grades/components/export/ExportScopeSelector.tsx` | Scope Modal | Packaging picker (`combined_pdf`, `all_zip`, `custom`). Locks individual archives on free tier. |
| `ExportStudentPicker` | `frontend/src/app/dashboard/admin/grades/components/export/ExportStudentPicker.tsx` | Scope Modal | Searchable roster checklist with select all / clear all toggles. |
| `exportWorkflowHandler` | `frontend/src/app/dashboard/admin/grades/components/export/exportWorkflowHandler.ts` | Execution Controller | Orchestrates file formatting, quota deduction, and leadership audit dispatch. |
| `exportQuotaManager` | `frontend/src/utils/exportQuotaManager.ts` | Shared Utility | Client-side monthly calendar quota tracking (`YYYY-MM`). |

---

## 2. Tier-Based Quota & Signature Enforcement

### 2.1 Free / Non-Paying Customer Restrictions
1. **Limited Format & Scope**:
   - Only standard **Master Result Sheet PDF** is available.
   - Spreadsheet exports (`.xlsx` Excel and `.csv` files) are disabled and badged with a `PRO` lock.
   - Compressed archive generation (`.zip` of individual PDFs) is disabled.
2. **Monthly Quota Limit**:
   - Maximum **10 downloads per calendar month** per institution/user.
   - The dialogue clearly displays `used/10` and blocks exports once 10 is reached with a prompt to upgrade.
3. **No Digital Signatures**:
   - Exported PDFs for non-paying users show **no digital signatures or stamps** (rendered with formal `—` dashes as an unendorsed record).

### 2.2 Paid / Institutional Premium Customer Entitlements
1. **Unlimited Downloads**: No monthly cap.
2. **All Export Formats**: Instant access to PDF, Excel `.xlsx`, and CSV `.csv`.
3. **All Packaging Options**: Single master assessment sheets, compressed `.zip` archives with individual student PDFs, or custom candidate selections.
4. **Verified Leadership Endorsements**: Official digital signatures of the Principal, Proprietor/Owner, Registrar, or Class Teacher are resolved via `resolveDigitalSignatures()` and stamped directly on the document.

---

## 3. Usage Pattern in Dashboard Roles

### 3.1 Admin & Teacher Dashboards (Multi-Candidate / Cohort View)
```tsx
import ExportResultScopeModal, { ExportScopeMode, ExportStudentOption } from '@/app/dashboard/admin/grades/components/ExportResultScopeModal';

<ExportResultScopeModal
  isOpen={isExportModalOpen}
  onClose={() => setIsExportModalOpen(false)}
  onExport={handleExportScope}
  isExporting={isBatchDownloading}
  students={exportStudentOptions}
  title={`Export ${exam?.title} Results`}
  school={school}
  examTitle={exam?.title}
  className={exam?.class?.name}
  sessionName={exam?.session?.name}
  role="ADMIN" // or "TEACHER"
/>
```

### 3.2 Student & Parent Dashboards (Single Student / Termly Result View)
```tsx
import { RoleResultExportModal } from '@/components/export/RoleResultExportModal';

<RoleResultExportModal
  isOpen={isExportModalOpen}
  onClose={() => setIsExportModalOpen(false)}
  onExportPdf={handleExportPDF}
  isExporting={isExporting}
  resultTitle={`${termLabel} Term Result Sheet`}
  studentName={studentName}
  className={className}
  sessionName={sessionLabel}
  term={termLabel}
  school={school}
  role="STUDENT" // or "PARENT"
/>
```

---

## 4. Leadership Audit Dispatch Protocol

Whenever an export is triggered:
- `dispatchExportLeadershipNotification()` is automatically dispatched to the connected school leadership (Principal, Proprietor, Registrar).
- Notification details include actor role, resource name, candidate record count, format, and timestamp.

