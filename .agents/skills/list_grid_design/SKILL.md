---
name: Qefas Hub UI - List and Grid Design
description: Rules and patterns for designing lists, grids, tables, filtering dialogs, and status badges in the web dashboard. Use this skill when asked to build or refine a table/grid UI.
---

# Qefas Hub - List & Grid UI Design Guidelines

When designing lists, tables, grids, and filtering interfaces for Qefas Hub, strictly adhere to the following patterns. These rules were established to maintain a consistent, premium, and functional user experience across all dashboards.

## 1. Type and Status Badges (Pills)
Always use visually distinct colored "pills" (badges) to represent types and statuses. This improves scannability.
- **Pill base styling**: `px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider`

### Assessment Types
Map assessment data into standard types and enforce the following UI themes and Icons:
- **Assignment**: Orange (`bg-orange-100 text-orange-700` | dark: `bg-orange-900/40 text-orange-400`), Icon: `assignment`
- **Continuous Assessment (CA)**: Blue (`bg-blue-100 text-blue-700` | dark: `bg-blue-900/40 text-blue-400`), Icon: `assignment_turned_in`
- **Quiz**: Emerald (`bg-emerald-100 text-emerald-700` | dark: `bg-emerald-900/40 text-emerald-400`), Icon: `quiz`
- **Subject Paper**: Emerald (`bg-emerald-100 text-emerald-700` | dark: `bg-emerald-900/40 text-emerald-400`), Icon: `description`
- **Exam (Default)**: Purple (`bg-purple-100 text-purple-700` | dark: `bg-purple-900/40 text-purple-400`), Icon: `file_question`

### Statuses
- **Published / Graded**: Green/Emerald (`bg-green-100 text-green-800` | dark: `bg-green-900/50 text-green-300`)
- **Scheduled**: Blue (`bg-blue-100 text-blue-800` | dark: `bg-blue-900/50 text-blue-300`)
- **Completed**: Purple (`bg-purple-100 text-purple-800` | dark: `bg-purple-900/50 text-purple-300`)
- **Cancelled / Failed**: Red (`bg-red-100 text-red-800` | dark: `bg-red-900/50 text-red-300`)
- **Draft / Pending**: Gray (`bg-gray-100 text-gray-800` | dark: `bg-gray-700 text-gray-300`)

### Scores and Grades
When displaying student grades:
- **Score >= 70**: Green
- **Score 50-69**: Yellow/Orange
- **Score < 50**: Red

## 2. Table and Grid Container Styles
- **Table Container**: Ensure tables are responsive (`overflow-x-auto`). Container should have a clean border and subtle background:
  `bg-white dark:bg-emerald-950/60 rounded-2xl border border-slate-200/80 dark:border-emerald-800/50 overflow-hidden shadow-sm`
- **Table Headers (`th`)**: Minimalist, uppercase tracking:
  `p-4 text-[10px] font-black uppercase tracking-widest text-slate-400`
- **Row Interactions (`tr`)**: Make rows interactive if they lead to detail views:
  `border-b border-slate-100 dark:border-emerald-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer`

## 3. Filtering Interfaces
- **Dropdowns over Text Inputs**: For categorical filters (Type, Subject, Class, Status), ALWAYS use `<select>` dropdowns instead of free-text inputs.
- **Dynamic Options**: Fetch available filter options (like classes or subjects) from the API/data rather than hardcoding them.
- **Loading States**: If a dropdown's options are being fetched asynchronously, display a skeleton loader in its place until the data resolves:
  ```tsx
  {isLoadingClasses ? (
    <div className="w-full h-[38px] rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" />
  ) : (
    <select ...>
  )}
  ```
- **Context-Aware Filters**: Do not include filters that are redundant in the current view (e.g., do not show a "Class" filter if the user is already viewing a specific class).
- **Spacing**: Ensure sufficient spacing (`gap-2` or `gap-4`) between filter inputs and their labels for readability.

## 4. Backend Data Mapping
- Backend APIs often return ambiguous or generic types. Always smartly parse the data before rendering.
- For Assessments: Analyze the `category` first. If `category` is missing or null, inspect the `title` to infer the correct type (e.g. `title.toLowerCase().includes('ca') ? 'ca' : 'exam'`). Do not blindly default everything to "Exam" or "Subject Paper".
