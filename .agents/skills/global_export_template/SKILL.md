---
name: Global Export Template
description: Rules and patterns for generating PDF exports using the global template in `frontend/src/utils/pdfGenerator.ts`. Use this skill when asked to create or modify an export feature.
---

# Global Export Template Skill

> **MANDATORY**: Follow this skill whenever a user asks to implement an "Export" feature, a "Print" feature, or generate a PDF.

## 1. The Global Utility

All frontend PDF exports **MUST** use the central `generatePDF` utility located at:
`frontend/src/utils/pdfGenerator.ts`

**NEVER** write ad-hoc `jsPDF` or `html2pdf` logic inside components.

## 2. Usage Pattern

### Importing
```typescript
import { generatePDF } from '@/utils/pdfGenerator';
import { useSchoolProfile } from '@/lib/api/hooks/useSchool';
```

### Loading State & Toasts
Always provide feedback to the user when exporting (it can take a second to render the PDF). Use `react-toastify`.

```typescript
import { toast } from 'react-toastify';

const [isExporting, setIsExporting] = useState(false);
const { data: schoolProfile } = useSchoolProfile(classData?.schoolId || '');

const handleExport = async () => {
  setIsExporting(true);
  const toastId = toast.loading("Generating PDF...", { autoClose: false });

  try {
    // Transform your raw data into arrays of strings/numbers
    const tableData = rawData.map((item, index) => [
      index + 1,
      item.name,
      item.value
    ]);

    await generatePDF({
      title: 'Detailed Class Report',
      filename: 'Class_Report.pdf',
      schoolProfile, // Crucial for injecting school logo and details
      metaData: [
        { label: 'Class', value: classData?.name || '-' },
        { label: 'Date', value: new Date().toLocaleDateString() }
      ],
      tableHeaders: [['S/N', 'Name', 'Value']],
      tableData
    });
    
    toast.update(toastId, { render: "PDF Exported Successfully!", type: "success", isLoading: false, autoClose: 3000 });
  } catch (error) {
    console.error('Failed to export PDF:', error);
    toast.update(toastId, { render: "Failed to export PDF", type: "error", isLoading: false, autoClose: 3000 });
  } finally {
    setIsExporting(false);
  }
};
```

## 3. Formatting Rules
1. **Ordinal Positions**: If you are exporting a ranked list, use an ordinal suffix helper (e.g. `1st`, `2nd`, `3rd`) rather than raw numbers for positions.
2. **Metadata Pairs**: The `metaData` array is automatically formatted into a 2-column grid. Always provide an even number of key-value pairs if possible for the best visual layout.
3. **No Direct DOM Mapping**: Do not attempt to export HTML directly. The `pdfGenerator` utility relies strictly on passing structured data (arrays and objects) to generate a premium, formal document design.
