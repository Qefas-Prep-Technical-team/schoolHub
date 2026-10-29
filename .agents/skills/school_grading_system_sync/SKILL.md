---
name: school_grading_system_sync
description: Standard guidelines and implementation patterns for synchronizing score evaluations, letter grades, averages, and badges with the connected school's configured grading system in Qefas Hub, with strict fallback to the default 9-grade institutional matrix.
---

# School Grading System Synchronization Skill

> **MANDATORY**: Follow this skill whenever implementing, fixing, or auditing grading, letter grade calculations, grade pill badges, class score averages, or grade distributions across any portal (Teacher, Admin, Student, Parent).

---

## 1. Core Principles

1. **Never hardcode grade boundaries** (e.g. `score >= 70 ? 'A' : ...`).
2. **Always resolve the connected school's configured grading system** dynamically from the school profile (`/dashboard/admin/school-profile`).
3. **Strict Fallback**: If the school has no custom grading system configured, strictly fall back to the institutional **9-grade standard matrix**:
   - **A+**: 90% – 100% (*EXCELLENT*)
   - **A**: 70% – 89% (*VERY GOOD*)
   - **B+**: 65% – 69% (*GOOD*)
   - **B**: 60% – 64% (*CREDIT*)
   - **C+**: 55% – 59% (*CREDIT*)
   - **C**: 50% – 54% (*PASS*)
   - **D**: 40% – 49% (*FAIR*)
   - **F**: 30% – 39% (*WEAK*)
   - **F9**: 0% – 30% (*FAIL*)
4. **Consistency**: Use the centralized grading utility in `frontend/src/utils/gradingSystem.ts` for all computations and UI pill styling.

---

## 2. Centralized Utility Reference (`@/utils/gradingSystem`)

Location: `frontend/src/utils/gradingSystem.ts`

```typescript
import {
  DEFAULT_GRADING_SYSTEM,
  getEffectiveGradingSystem,
  getGradeEvaluation,
  computeGradePill,
  getGradeColorAndBg,
  getGradeDefaultRemark,
  type GradingTier
} from "@/utils/gradingSystem";
```

### Key Functions

| Function | Purpose | Returns |
|---|---|---|
| `getEffectiveGradingSystem(customGradingSystem?)` | Returns the school's configured grading scale sorted descending by `min`, or `DEFAULT_GRADING_SYSTEM` if empty/invalid. | `GradingTier[]` |
| `getGradeEvaluation(percentage, customGradingSystem?)` | Evaluates a numeric percentage score against the active scale. | `{ grade, remark, color, bg, min, max }` |
| `computeGradePill(percentage, customGradingSystem?)` | Helper specifically designed for UI pill badges and cards. | `{ label, remark, bg, color }` |
| `getGradeColorAndBg(grade)` | Returns consistent Tailwind color & background tokens for any letter grade (e.g., A+, A, B+, B, C+, C, D, F, F9). | `{ color, bg }` |

---

## 3. Implementation Workflow

### Step 1: Resolve the Connected School ID

On teacher/staff screens, derive `effectiveSchoolId` prioritizing the active dashboard store, teacher's connected school list, or class/entity `schoolId`:

```typescript
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";
import { useSchoolProfile } from "@/lib/api/hooks/useSchool";

const { user } = useAuthStore();
const { selectedSchoolId } = useDashboardStore();
const currentTeacherId = (user as any)?.id as string | undefined;

const effectiveSchoolId = (selectedSchoolId && selectedSchoolId !== currentTeacherId)
  ? selectedSchoolId
  : (classData?.schoolId || (user as any)?.schools?.[0]?.schoolId || (user as any)?.schoolId || (user as any)?.school?.id);

const { data: schoolProfile } = useSchoolProfile(effectiveSchoolId);
```

### Step 2: Pass `gradingSystem` to Components / Modals

Pass `schoolProfile?.gradingSystem` into tables, cards, summary panels, and dialogs:

```tsx
<GradeStatistics 
  grades={grades} 
  gradingSystem={schoolProfile?.gradingSystem} 
/>

<GradeTable 
  grades={paginatedGrades}
  gradingSystem={schoolProfile?.gradingSystem}
/>

<ViewGradeDetailsDialog 
  grade={selectedGrade}
  open={isOpen}
  onClose={() => setIsOpen(false)}
  gradingSystem={schoolProfile?.gradingSystem}
/>
```

---

## 4. UI Patterns & Best Practices

### Pattern A: Score Pill / Badge Display
Always compute percentage relative to maximum marks possible, then render `computeGradePill`:

```tsx
{(() => {
  const percentage = maxMarks > 0 ? Math.round((earnedScore / maxMarks) * 100) : 0;
  const pill = computeGradePill(percentage, schoolProfile?.gradingSystem);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${pill.bg} ${pill.color}`}>
      {pill.label}
    </span>
  );
})()}
```

### Pattern B: Class Average & Stat Cards
In metric cards (e.g. Class Average, Subject Average Score):

```tsx
const avgScore = Number(classAverage);
const avgPill = !isNaN(avgScore) ? computeGradePill(avgScore, schoolProfile?.gradingSystem) : null;

<div className="flex items-center gap-2">
  <span className="text-2xl font-bold">{avgScore}%</span>
  {avgPill && (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${avgPill.bg} ${avgPill.color}`}>
      {avgPill.label}
    </span>
  )}
</div>
```

### Pattern C: Grade Distribution
Build grade distribution dynamically from the effective tiers rather than hardcoded keys:

```typescript
function calculateGradeDistribution(grades: StudentGrade[], gradingSystem?: GradingTier[]): Record<string, number> {
  const tiers = getEffectiveGradingSystem(gradingSystem);
  const distribution: Record<string, number> = {};
  tiers.forEach(t => {
    distribution[t.grade] = 0;
  });
  
  grades.forEach(g => {
    const evalRes = getGradeEvaluation(g.grades.total, gradingSystem);
    if (distribution[evalRes.grade] !== undefined) {
      distribution[evalRes.grade]++;
    } else {
      distribution[evalRes.grade] = 1;
    }
  });
  
  return distribution;
}
```

### Pattern D: Passing Rate Threshold
Avoid hardcoding `total >= 50` or `total >= 60`. Check whether the evaluated grade represents a pass/credit:

```typescript
const passingCount = gradedList.filter(g => {
  const evaluation = getGradeEvaluation(g.score, schoolProfile?.gradingSystem);
  return evaluation.grade !== 'F' && evaluation.grade !== 'F9';
}).length;
const passingRate = gradedList.length > 0 ? Math.round((passingCount / gradedList.length) * 100) : 0;
```

---

## 5. Checklist for Auditing / Fixing Grading Pages

- [ ] Replaced any hardcoded `if (pct >= 70)` or `switch (grade)` logic with `@/utils/gradingSystem`.
- [ ] Fetched the connected school profile using `useSchoolProfile(effectiveSchoolId)`.
- [ ] Passed `schoolProfile?.gradingSystem` into child modals, tables, and distribution charts.
- [ ] Converted total scores to numeric percentages before calling `computeGradePill(Number(val), gradingSystem)`.
- [ ] Verified that `computeGradePill` returns `{ label, remark, bg, color }` (use `pill.label` for the grade letter).
- [ ] Verified with TypeScript compiler: `npx tsc --noEmit` in `frontend/` (0 errors).
- [ ] Updated `STATE.md` with session changes.
