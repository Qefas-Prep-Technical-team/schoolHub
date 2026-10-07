---
name: PDF Export Design Pattern
description: Standards and patterns for generating PDF exports with a premium tabular design using jsPDF and jspdf-autotable.
---

# PDF Export Design Pattern

When asked to implement or redesign a PDF export feature in the school dashboard, ALWAYS follow this design pattern to ensure a consistent, premium aesthetic that matches formal report card standards.

## 1. Do NOT use HTML-to-Canvas renderers
Never use `html2pdf.js` or `html2canvas` for PDF generation in this project. They crash on modern CSS color functions (like `oklch` and `lab` from Tailwind) and generate unnecessarily bloated files with unselectable text.

## 2. Reusable Utility First
You MUST use the `generatePDF` utility located at `frontend/src/utils/pdfGenerator.ts`.
Do NOT write raw `jsPDF` or `autoTable` code inside React components. 

### Usage Example:
```typescript
import { generatePDF } from '@/utils/pdfGenerator';

await generatePDF({
  title: 'Master Subjects List',
  filename: 'School_Subjects_Report.pdf',
  schoolProfile,
  metaData: [
    { label: 'Total Subjects', value: '12' },
    { label: 'Academic Year', value: '2026-2027' }
  ],
  tableHeaders: [['#', 'Subject Name', 'Code']],
  tableData: [
    ['1', 'Mathematics', 'MTH'],
    ['2', 'Science', 'SCI']
  ]
});
```

## 3. The Formal Report Aesthetic
The `generatePDF` utility automatically applies this exact design, which you should not deviate from unless requested:

1. **Page Border:** A formal double border surrounds the entire page.
2. **Classic Typography:** Uses the `times` (Times New Roman) font for a formal, official look.
3. **Structured Header:** 
   - Logo aligned top-left.
   - School name and details adjacent to logo.
   - Report title boldly centered below.
4. **Metadata Grid:** The `metaData` array is automatically formatted into a 2-column shaded grid at the top of the report.
5. **Main Table Style:** 
   - **Navy Blue Headers:** `[20, 40, 80]` with white text.
   - **Solid Grid Lines:** Strict black grid lines for every cell (width `0.2`).
   - **Centered Text:** All body text is center-aligned for readability in tight grids.
6. **Signature Block:** Automatically includes formal signature lines for "Prepared By" and "Authorized Signature" at the bottom of the last page.
