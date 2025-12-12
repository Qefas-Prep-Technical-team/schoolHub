/* eslint-disable @typescript-eslint/no-explicit-any */
import { CalendarDay, ExamEvent } from "./types";
import { mockExams } from "./data";

export const generateCalendarDays = (year: number, month: number): CalendarDay[] => {
  const days: CalendarDay[] = [];

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Start from Sunday of the first grid row
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());

  // End at Saturday of the last grid row
  const endDate = new Date(lastDay);
  endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateCopy = new Date(currentDate);
    const isCurrentMonth = dateCopy.getMonth() === month;
    const isToday = dateCopy.toDateString() === today.toDateString();

    const dateStr = dateCopy.toISOString().split("T")[0];

    const dayEvents: ExamEvent[] = mockExams.filter(
      (exam) => exam.date === dateStr
    );

    days.push({
      date: dateCopy,
      dayOfMonth: dateCopy.getDate(),
      isCurrentMonth,
      isToday,
      hasEvents: dayEvents.length > 0,
      events: dayEvents.length ? dayEvents : undefined,
    });

    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
};
