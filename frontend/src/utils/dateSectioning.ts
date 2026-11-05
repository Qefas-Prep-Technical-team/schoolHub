/**
 * Date Grouping Utilities for Chronological Sections
 * Follows Qefas Hub date_sectioning_display skill
 */

export function getDateGroupLabel(dateVal?: string | Date | null): string {
  if (!dateVal) return "Undated & Previous Records";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "Undated & Previous Records";

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const diffTime = today.getTime() - itemDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays > 1 && diffDays <= 7) {
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long" });
  }

  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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

