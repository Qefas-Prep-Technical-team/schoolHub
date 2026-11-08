---
name: connected_school_signature_fetcher
description: Standard guidelines and implementation patterns for fetching and endorsing official leadership signatures (Principal, School Owner/Proprietor, Registrar) strictly for connected schools in Qefas Hub.
---

# Connected School Signature Fetcher Skill

This skill provides the mandatory architectural standards and usage guidelines for resolving, displaying, and binding official institutional signatures in Qefas Hub.

---

## 1. Core Principles

1. **Connected Schools Only**:
   - Never resolve or display administrator signatures from unrelated institutions.
   - All lookups require a valid `schoolId` and active tenant relationship.
   - If the user/admin is not connected to the school, resolution must fail gracefully or fallback to generic institutional endorsement lines without leaking signatures.

2. **Official Leadership Hierarchy**:
   When resolving the primary institutional signatory for official documents (Report Cards, Assessment Transcripts, Exam Master Sheets):
   1. **Principal / Head of Institution** (`PRINCIPAL`, excluding "VICE")
   2. **School Owner / Proprietor / Director** (`SCHOOL_OWNER`, `PROPRIETOR`)
   3. **Registrar / Academic Office** (`REGISTRAR`)
   4. **Vice Principal (Academic)** (`VICE_PRINCIPAL`)
   5. Fallback: Authenticated School Administrator or generic Head of Institution line.

3. **Secondary Signatory Priority**:
   - If a **Class / Subject Teacher** context is provided (`teacherName`, `teacherSignatureUrl`), the teacher is assigned as the secondary signatory.
   - If no teacher context is present, the **Registrar / Academic Office** is designated as the secondary signatory.

---

## 2. Reusable Hooks & Components

### 2.1 Universal React Hook: `useConnectedSchoolSignature`
Location: `frontend/src/lib/api/hooks/useConnectedSchoolSignature.ts`

```tsx
import { useConnectedSchoolSignature } from '@/lib/api/hooks/useConnectedSchoolSignature';

const {
  isLoading,
  headOfSchool,
  secondarySignatory,
  availableSignatories,
} = useConnectedSchoolSignature(schoolId, schoolProfile, teacherContext);
```

- **Parameters**:
  - `schoolId` *(string, optional)*: Connected school identifier.
  - `schoolProfile` *(object, optional)*: Current school profile containing fallback metadata (`principalName`, `primarySignature`).
  - `teacherContext` *(object, optional)*: Optional subject or class teacher name and digital signature URL.
- **Return Value**:
  - `headOfSchool`: Primary signatory object with `{ title, name, role, signatureUrl, isImage, isFallback }`.
  - `secondarySignatory`: Secondary signatory object.
  - `availableSignatories`: Full list of resolved administrative signatories for the school.

### 2.2 UI Component: `ConnectedSchoolSignatureFetcher`
Location: `frontend/src/components/signature/ConnectedSchoolSignatureFetcher.tsx`

```tsx
import { ConnectedSchoolSignatureFetcher } from '@/components/signature/ConnectedSchoolSignatureFetcher';

// Variant 1: Compact status badge
<ConnectedSchoolSignatureFetcher
  schoolId={school.id}
  schoolProfile={school}
  variant="badge"
/>

// Variant 2: Full preview card for modals & export dialogues
<ConnectedSchoolSignatureFetcher
  schoolId={school.id}
  schoolProfile={school}
  teacherContext={{ name: "Mr. Chukwuma", signatureUrl: "/path/to/sig.png" }}
  variant="card"
  onSignaturesResolved={(sigs) => handleSignatures(sigs)}
/>

// Variant 3: Endorsement strip for bottom of review sheets
<ConnectedSchoolSignatureFetcher
  schoolId={school.id}
  schoolProfile={school}
  variant="endorsement-strip"
/>
```

---

## 3. PDF Generator Integration

When invoking `generatePDF` from `@/utils/pdfGenerator.ts`, map the resolved signatories into `signatures`:

```tsx
await generatePDF({
  title: "Official Term Report Sheet",
  filename: "Term_Report.pdf",
  schoolProfile: {
    ...school,
    name: school.name,
  },
  signatures: [
    {
      label: headOfSchool.title,
      name: headOfSchool.name,
      signatureUrl: headOfSchool.signatureUrl,
    },
    {
      label: secondarySignatory.title,
      name: secondarySignatory.name,
      signatureUrl: secondarySignatory.signatureUrl,
    },
  ],
  // ...
});
```

---

## 4. Verification & Non-Regression Rules

1. Every file touched or created must remain strictly under **300 lines**.
2. Zero `any` usage in new interfaces.
3. Verify TypeScript validity across `frontend` with `npx tsc --noEmit`.

