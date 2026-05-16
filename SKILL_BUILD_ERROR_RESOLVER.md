# 🛠️ BUILD ERROR RESOLVER SKILL

This skill defines a structured, iterative workflow for resolving complex build errors across the codebase.

---

## 📋 WORKFLOW

### 1. Initial Assessment & Grouping
- **Step 1.1**: Run a full build command (e.g., `npm run build`, `npx tsc`, etc.).
- **Step 1.2**: Group all errors into logical sections (e.g., by module, by error type, or by file dependency).
- **Step 1.3**: Add these groups to the `task.md` plan as high-level TODO items.

### 2. Section-by-Section Fixing
- **Step 2.1**: Select the first group of errors.
- **Step 2.2**: Implement fixes for all errors in that section.
- **Step 2.3**: Run the build again to confirm that *this specific section* is truly fixed.

### 3. Verification & Progression
- **Step 3.1**: Once the section is confirmed fixed, check it off as resolved in `task.md`.
- **Step 3.2**: **STOP** and ask the user for permission to continue to the next group.
- **Step 3.3**: Only proceed to the next group after receiving user approval.

---

## ⚖️ RULES & CONSTRAINTS

- **No Premature Continuation**: Never move to the next group without confirming the current one is fixed and getting user approval.
- **Task Integrity**: Always keep `task.md` updated with the current status of each error group.
- **Pragmatic Fixing**: Prioritize fixing underlying type issues or architectural mismatches over ad-hoc casting where possible.
- **Zero Tolerance for `any`**: Follow the project's `GEMINI.md` standards even when fixing errors.

---

## 🚀 USAGE EXAMPLES

### Example Task Entry:
- `[ ]` Group 1: Frontend Type Errors (Exams & Quizzes)
- `[ ]` Group 2: Backend Prisma Relation Mismatches
- `[ ]` Group 3: Mobile Navigation Reference Errors

### Confirmation Message:
> "I have resolved all errors in **Group 1: Frontend Type Errors**. A fresh build confirms these are fixed. Should I proceed to **Group 2: Backend Prisma Relation Mismatches**?"
