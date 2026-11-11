---
name: Nigerian Curriculum & Academic Configuration Suggestions
description: Standard guidelines and implementation patterns for suggesting, deduplicating, and auto-persisting Nigerian standard academic levels, curriculum subjects (with 10-week scheme of work), and departments across school management workflows.
---

# Nigerian Curriculum & Academic Configuration Suggestions Skill

This skill defines the architectural pattern, data structures, and UI behaviors for providing intelligent suggestions for:
1. **Academic Class Levels** (Early Years, Primary, Secondary, Exam Prep)
2. **Academic Departments** (Science, Arts, Commercial, Vocational, Basic Education)
3. **Curriculum Subjects** with structured 10-Week Term 1 Schemes of Work (NERDC-aligned)

---

## 1. Core Principles

1. **Strict School Isolation & Per-School Uniqueness (`@@unique([schoolId, code])`)**:
   - Configured data belongs exclusively to `schoolId`.
   - Suggestions are standardized national defaults and must never be populated from another tenant's private entries.
   - Both `Subject` and `Department` models use the composite tenant constraint `@@unique([schoolId, code])` in `schema.prisma` (NOT a global `@unique` on `code`), so multiple schools can independently configure the exact same standard department codes (`SCI-MATH`, `ARTS-HUM`, `COMM-BUS`, etc.) and subject codes (`MTH`, `ENG`, `PHY`, etc.) without colliding with one another.

2. **Deduplication & Permanent Hiding Once Added to School**:
   - Suggested items must be dynamically filtered using case-insensitive matching against existing school records (`getFilteredLevelSuggestions`, `getFilteredSubjectSuggestions`, `getFilteredDepartmentSuggestions`).
   - Once a suggestion (Level, Subject, or Department) is added or selected by a school, it is immediately persisted to that school's profile/database and added to local state.
   - Because the filter helpers check both `name` and `code` (including prefix matches like `code === sugCode || code.startsWith(sugCode + "-")`), **any suggestion that has already been added to the school is permanently hidden from the "Suggested" section for that school**—both immediately in the active session and on every future visit.

3. **One-Click Auto-Persistence**:
   - Selecting or clicking a suggested item immediately creates and persists it to the school's profile / curriculum database (`schoolService.updateProfile`, `subjectService.createSubject`, `departmentService.createDepartment`).
   - For subjects, the 10-week scheme of work is automatically seeded via `POST /academic/subjects/:id/scheme/sync`.
   - The newly created item is automatically selected in the active form and removed from suggestions.

4. **Searchable Select Dropdowns**:
   - High-volume dropdowns (Levels, Sessions, Terms) must contain a search input inside `<SelectContent>` stopping keyboard event propagation (`e.stopPropagation()`) so typing does not prematurely close the dropdown.

5. **Cascading Hierarchy (Session -> Term)**:
   - A Term must not be selectable until a Session is chosen.
   - The Term dropdown shows only the terms attached to that session's `termPeriods`. Changing the session automatically resets the selected term.

---

## 2. Standard Nigerian Levels Reference (`utils/levelConstants.ts`)

```ts
export const SUGGESTED_LEVELS = [
  "KG 1",
  "KG 2",
  "Nursery 1",
  "Nursery 2",
  "Primary 1",
  "Primary 2",
  "Primary 3",
  "Primary 4",
  "Primary 5",
  "Primary 6",
  "JSS 1",
  "JSS 2",
  "JSS 3",
  "SSS 1",
  "SSS 2",
  "SSS 3",
  "UTME",
  "GCE",
  "NECO",
] as const;
```

---

## 3. Standard Nigerian Departments Reference (`utils/curriculumConstants.ts`)

| Department Name | Code | Description |
|---|---|---|
| **Sciences & Mathematics** | `SCI-MATH` | Natural sciences, applied mathematics, technology, computing |
| **Arts & Humanities** | `ARTS-HUM` | Languages, literature, civic, historical, religious studies |
| **Commercial & Business Studies** | `COMM-BUS` | Financial accounting, commerce, economics, marketing |
| **Vocational & Technical Education** | `VOC-TECH` | Technical drawing, food & nutrition, data processing, crafts |
| **Basic Education (Junior Secondary)** | `BASIC-EDU` | Foundational universal basic education curricula |

---

## 4. Standard Nigerian Subjects & 10-Week Scheme of Work (`utils/curriculumConstants.ts`)

Subjects included with 10-week NERDC schemes of work:
- **Mathematics (`MTH`)**: Number Bases, Modular Arithmetic, Indices/Logarithms, Surds, Simultaneous Equations, Quadratics, Set Theory, Trigonometry, Statistics.
- **English Language (`ENG`)**: Noun Clauses, Comprehension, Synonyms/Antonyms, Vowels/Diphthongs, Letter Writing, Concord, Summary Writing, Syllable Stress, Essays.
- **Biology (`BIO`)**: 5 Kingdoms, Cell Structure, Osmosis/Diffusion, Enzymes, Digestion, Excretion, Biomes/Ecology, Photosynthesis, Mendelian Genetics.
- **Chemistry (`CHM`)**: Atomic Structure, Periodic Trends, Bonding, Stoichiometry, Volumetric Analysis, Acids/Bases/Salts, Gas Laws, Redox, Reaction Rates.
- **Physics (`PHY`)**: Units/Dimensions, Vectors, Kinematics, Projectiles, Newton's Laws, Work/Energy, Circular Motion/Gravity, Thermal Expansion, Optics.
- **Economics (`ECO`)**: Scarcity/Opportunity Cost, Demand/Supply Schedules, Equilibrium, Elasticity, Diminishing Returns, Market Structures, Central Banking, Inflation, National Income.
- **Financial Accounting (`ACC`)**: Double-Entry Principles, Prime Journals, Three-Column Cash Book, Ledger/Trial Balance, Bank Reconciliation, Final Accounts, Balance Sheet Adjustments.
- **Government (`GOV`)**: Sovereignty, Presidential/Parliamentary Systems, Rule of Law, Pre-Colonial Administration, Indirect Rule, Constitutional Conferences, Nigerian Federalism.
- **Literature in English (`LIT`)**: African/Non-African Drama, African/Non-African Poetry, Character Analysis, African Prose, Critical Comparative Essays.
- **Civic Education (`CVE`)**: National Values, Constitutional Rights/Duties, National Consciousness, Rule of Law, Cultism Prevention, NDLEA, Public Service Ethics.
- **Agricultural Science (`AGR`)**: Soil Physics/Profiles, Fertilizer Formulation, Crop Husbandry (Cassava, Maize, Yam), Farm Machinery, Weeds/Pests, Animal Digestion/Health.
- **Computer Studies / ICT (`CSC`)**: Computer Generations, Hardware Architecture, Operating Systems, Spreadsheets, Number Bases/ASCII, Computer Networks, DBMS/SQL, Cyber Ethics, Algorithms/Flowcharts.

---

## 5. UI Implementation Pattern

### 5.1 Dropdown with Integrated Search
```tsx
<Select value={value || "NONE"} onValueChange={onChange}>
  <SelectTrigger className="h-[42px] rounded-xl ...">
    <SelectValue placeholder="Select Level..." />
  </SelectTrigger>
  <SelectContent className="rounded-xl max-h-72 overflow-y-auto">
    <div className="p-2 border-b">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
        <Input
          placeholder="Search levels..."
          className="pl-9 h-9 text-xs border-none bg-slate-100 rounded-lg"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.stopPropagation()}
        />
      </div>
    </div>
    <SelectItem value="NONE">No Level Assigned</SelectItem>
    {/* Group: School Levels */}
    {/* Group: Suggested Levels */}
  </SelectContent>
</Select>
```

### 5.2 Auto-Seeding Subject with Scheme of Work & Bidirectional Department Linking
When adding a suggested subject or department:
- **Adding a Suggested Department**:
  1. Creates the `Department` in the school (`departmentService.createDepartment`).
  2. Iterates through its `recommendedSubjectCodes` (e.g., `MTH`, `ENG`, `PHY`, `CHM`, `BIO`).
  3. Reuses any existing school subject matching the code/name, or automatically creates missing recommended subjects along with their 10-week Term 1 Schemes of Work (`POST /academic/subjects/:id/scheme/sync`).
  4. Links all resolved & newly created subjects to the department in `DepartmentSubject` via `departmentService.attachSubjects(departmentUuid, subjectIds)` (`POST /academic/departments/subjects/attach`).
  5. Selects both the department and all its linked subjects in the class form.
- **Adding a Suggested Subject**:
  1. Creates the `Subject` and seeds its 10-week scheme of work.
  2. Checks if the school already has any departments whose `recommendedSubjectCodes` include this subject, and automatically links them via `subjectService.attachDepartments(subjectId, matchingDeptIds)` (`POST /academic/subjects/:id/departments`).


