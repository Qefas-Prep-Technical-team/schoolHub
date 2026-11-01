---
name: Date Sectioning - List and Grid Display Pattern
description: Rules, helpers, and layout standards for sectioning lists, tables, and card grids by creation/activity dates across Qefas Hub dashboards (e.g. Grades, Offline Marksheets, Assignments, Exams).
---

# Date Sectioning - List and Grid Display Pattern

When displaying chronological or academic records in tables, lists, or card grids, users need clear temporal grouping so recent work is immediately distinct from historical records.

---

## 1. Core Principles

1. **Frontend-Only Display Arrangement**:
   - Never alter backend querying mechanisms, pagination schemas, or database relationships just to section elements by date.
   - The backend query returns records (typically sorted `ORDER BY createdAt DESC` or `updatedAt DESC`).
   - Grouping is executed client-side via a memoized mapping function.

2. **Natural & Relative Date Labels**:
   - Items from today: `Today`
   - Items from yesterday: `Yesterday`
   - Items within the past 7 days: formatted as `day month` (e.g. `28 October`)
   - Older items: formatted as `day month year` (e.g. `14 May 2026`)
   - Missing or corrupted dates: `Undated & Previous Records`

---

## 2. Canonical Date Helper Implementation

Always use this exact helper pattern to compute uniform section titles:

```typescript
export function getDateGroupLabel(dateVal?: string | Date | null): string {
  if (!dateVal) return 'Undated & Previous Records';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return 'Undated & Previous Records';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diffTime = today.getTime() - itemDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays > 1 && diffDays <= 7) {
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  }

  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}
```

---

## 3. Grouping Function

Use `React.useMemo` to group items into an ordered array of sections:

```typescript
export interface DateGroup<T> {
  label: string;
  items: T[];
}

export function groupByDate<T>(
  items: T[], 
  getDateFn: (item: T) => string | Date | undefined | null
): DateGroup<T>[] {
  const groupsMap = new Map<string, T[]>();
  const groupOrder: string[] = [];

  items.forEach((item) => {
    const label = getDateGroupLabel(getDateFn(item));
    if (!groupsMap.has(label)) {
      groupsMap.set(label, []);
      groupOrder.push(label);
    }
    groupsMap.get(label)!.push(item);
  });

  return groupOrder.map((label) => ({
    label,
    items: groupsMap.get(label)!,
  }));
}
```

---

## 4. UI Section Header Pattern

Every section header must follow this standard styling:

```tsx
<div className="flex items-center gap-2.5 px-1 py-1">
  {/* Accent dot themed to role (emerald for Teacher, indigo for Admin) */}
  <div className={`size-2 rounded-full ${isTeacher ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
  
  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
    {section.label}
  </h4>
  
  <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
    {section.items.length} {section.items.length === 1 ? 'record' : 'records'}
  </span>
</div>
```

---

## 5. Grid View Integration

Wrap the grid layout inside the sections loop:

```tsx
<div className="space-y-6">
  {groupsMap.map((section) => (
    <div key={section.label} className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center gap-2.5 px-1 py-1">
        <div className="size-2 rounded-full bg-emerald-500" />
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
          {section.label}
        </h4>
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
          {section.items.length} {section.items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Grid Cards for this date group */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {section.items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  ))}
</div>
```

---

## 6. Table View Integration

Wrap each date group into its own self-contained responsive table container:

```tsx
<div className="space-y-6">
  {groupsMap.map((section) => (
    <div key={section.label} className="space-y-2">
      {/* Section Header */}
      <div className="flex items-center gap-2.5 px-1 py-1">
        <div className="size-2 rounded-full bg-emerald-500" />
        <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
          {section.label}
        </h4>
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
          {section.items.length} {section.items.length === 1 ? 'record' : 'records'}
        </span>
      </div>

      {/* Table Container */}
      <div className="w-full overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            {/* Table Column Headers */}
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900/50">
            {section.items.map((item) => (
              <tr key={item.id}>
                {/* Row columns */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ))}
</div>
```
