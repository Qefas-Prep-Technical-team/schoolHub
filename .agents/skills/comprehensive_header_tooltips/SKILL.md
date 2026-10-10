---
name: Comprehensive Header Tooltips
description: Guidelines and instructions for writing highly detailed, context-rich, and comprehensive info tooltips next to section headers and charts.
---

# Comprehensive Header Tooltips

When adding or updating tooltips (such as the `info` prop on a `SectionCard` or an `<Info />` icon near a header) in Qefas Hub, ensure the description is extremely detailed, analytical, and context-aware.

## Rules for Header Tooltips

1. **Be Analytical, Not Just Descriptive**
   - Don't just repeat what the title says. Explain *why* this section is important and *what* insights the user can draw from it.
   - Example (Bad): "Shows the assignment trend."
   - Example (Good): "Tracks scores on all individual assignments over time. Use this to identify how well the student is keeping up with daily/weekly homework and short-term deliverables."

2. **Reflect Dynamic Context (If Applicable)**
   - If the component has filters (e.g., term, session, subject), the tooltip should dynamically echo the current filter state back to the user so they know exactly what slice of data they are looking at.
   - Example: `You are currently viewing data for the ${filter === 'TERM' ? 'current term' : 'entire session'}.`

3. **Provide Examples of Usage**
   - Help the user understand what correlations to look for.
   - Example: "It compares parallel trends across Assignments and Examinations, allowing you to easily spot correlations—such as whether strong homework grades translate to high exam scores."

4. **Tone and Voice**
   - Use plain, simple, and conversational language that is easy for any standard user to understand.
   - AVOID corporate jargon (e.g., "capacity planning", "infrastructure scaling", "aggregate sum").
   - Maintain an empowering and helpful tone.
   - Address the user directly ("allowing you to easily spot...", "Use this to...").

## Implementation Example
```tsx
<SectionCard
    title="Overall Performance Trend"
    info={`This chart provides a comprehensive, timeline-based view of the student's academic trajectory by aggregating all recorded assessments. It compares parallel trends across Assignments, Quizzes, Continuous Assessments, and Examinations, allowing you to easily spot correlations—such as whether strong homework grades translate to high exam scores. You are currently viewing data for the ${filter === 'TERM' ? 'current term' : 'entire session'}${subjectFilter !== 'ALL' ? `, specifically filtered for ${subjectFilter}` : ' across all subjects'}.`}
>
  {/* Content */}
</SectionCard>
```
