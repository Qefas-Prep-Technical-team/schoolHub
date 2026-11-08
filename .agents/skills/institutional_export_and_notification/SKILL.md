---
name: institutional_export_and_notification
description: Rules and patterns for creating comprehensive export workflows (PDF, Excel .xlsx, and CSV) for connected school admins and teachers in Qefas Hub, including automated audit notifications dispatched to school leadership (Principal, School Owner, Registrar).
---

# Institutional Export and Leadership Notification Skill

This skill defines the standard architecture and implementation patterns for exporting academic records (assessment grades, exam scores, attendance, student transcripts) across Qefas Hub dashboards, ensuring compliance with format requirements, Nigerian educational naming standards, connected-school tenancy, and automated leadership notifications.

---

## 1. Architectural Principles

1. **Multi-Format Export Options**:
   Every institutional export dialog must provide a choice of format:
   - **PDF (.pdf)**: Formal institutional document following `pdf_export_design` with verified digital signatures and double borders.
     - Single student: Direct PDF download.
     - Multiple students: Compressed archive (.zip) with individual student result PDFs, or a unified Master Assessment Results Sheet.
   - **Excel (.xlsx)**: Clean tabular workbook formatted with headers, candidate numbers, scores, percentages, and letter grades using `xlsx`.
   - **CSV (.csv)**: Universal comma-delimited export with standard headers for third-party spreadsheet imports.

2. **Leadership Audit Notification**:
   Whenever an administrative user or teacher initiates an export or download of student academic records:
   - An academic audit notification must be automatically dispatched to the connected school's leadership:
     - **Principal / Head of Institution**
     - **School Owner / Proprietor**
     - **Registrar / Academic Office**
   - The notification records:
     - Actor name and role (e.g., "Mr. Okon (Teacher)").
     - Title of the exported assessment/record.
     - Number of student records exported and format chosen (PDF, Excel, or CSV).
     - Timestamp and security notice.

3. **Nigerian Educational Naming Standards**:
   - Strictly prohibit the term "Cohort".
   - Use standard Nigerian academic terms:
     - "Class" (e.g. JSS 1, SSS 3)
     - "Class Average"
     - "Official Results Sheet" or "Master Assessment Grade Report"
     - "Continuous Assessment (CA)" and "Examination"

4. **Universal Modularization Rule (< 300 Lines)**:
   - Export modals and tables must be broken into functional subcomponents in an `export/` subfolder (e.g. `ExportFormatSelector.tsx`, `ExportStudentList.tsx`, `ExportScopeOptions.tsx`).

---

## 2. Notification Dispatch Implementation

Notifications can be dispatched via the backend notification service or client-side dispatch utility:

```ts
import { dispatchExportLeadershipNotification } from '@/lib/api/services/exportNotificationService';

await dispatchExportLeadershipNotification({
  schoolId: currentSchoolId,
  actorName: user.name,
  actorRole: user.role,
  resourceTitle: examTitle,
  recordCount: selectedStudents.length,
  format: 'PDF', // 'PDF' | 'EXCEL' | 'CSV'
});
```

The notification payload sent to leadership:
```json
{
  "recipientType": "SCHOOL",
  "recipientId": "<schoolId>",
  "type": "ACADEMIC",
  "title": "Academic Records Exported",
  "message": "Mr. Okon (Teacher) exported 35 student results for 'SS2 Mathematics Mid-Term Exam' in PDF format.",
  "meta": {
    "priority": "NORMAL",
    "exportAudit": true
  }
}
```

---

## 3. Excel & CSV Generator Pattern

```ts
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export function exportResultsToExcel(rows: Array<Record<string, unknown>>, filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Results Sheet");
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}.xlsx`);
}

export function exportResultsToCSV(rows: Array<Record<string, unknown>>, filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csv = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
}
```

---

## 4. Verification Checklist

- [ ] PDF exports include verified digital signatures via `useConnectedSchoolSignature`.
- [ ] Export dialog provides PDF, Excel (.xlsx), and CSV (.csv) format options.
- [ ] Audit notification is dispatched to Principal, Proprietor, and Registrar on export.
- [ ] No occurrences of "cohort" in user-facing labels or generated filenames.
- [ ] All involved files are strictly under 300 lines.
- [ ] Type check passes with `npx tsc --noEmit`.

