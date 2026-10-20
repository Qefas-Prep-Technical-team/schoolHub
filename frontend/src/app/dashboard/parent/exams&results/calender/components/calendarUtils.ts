import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
} from 'date-fns';
import { CalendarDay, ExamEvent, CalendarStats } from './types';

/**
 * Generate calendar day objects for the given month, including leading/trailing days
 * from adjacent months to fill complete 7-day weeks.
 */
export const generateCalendarDays = (
  currentMonth: Date,
  events: ExamEvent[]
): CalendarDay[] => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const today = new Date();

  return days.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const isCurMonth = isSameMonth(day, currentMonth);
    const isCurrentDay = isSameDay(day, today);
    const dayEvents = events.filter((e) => e.date === dateStr);

    return {
      date: day,
      dateStr,
      dayOfMonth: day.getDate(),
      isCurrentMonth: isCurMonth,
      isToday: isCurrentDay,
      hasEvents: dayEvents.length > 0,
      events: dayEvents,
    };
  });
};

/**
 * Compute summary statistics from the list of exam events
 */
export const calculateCalendarStats = (events: ExamEvent[]): CalendarStats => {
  const upcomingCount = events.filter((e) => e.type === 'upcoming').length;
  const completed = events.filter((e) => e.type === 'completed');
  const completedCount = completed.length;
  const totalAssessments = events.length;

  let totalPercentage = 0;
  let gradedCount = 0;

  for (const event of completed) {
    if (typeof event.percentage === 'number' && !isNaN(event.percentage)) {
      totalPercentage += event.percentage;
      gradedCount++;
    } else if (
      typeof event.score === 'number' &&
      typeof event.maxScore === 'number' &&
      event.maxScore > 0
    ) {
      totalPercentage += (event.score / event.maxScore) * 100;
      gradedCount++;
    }
  }

  const averageScore = gradedCount > 0 ? Math.round(totalPercentage / gradedCount) : 0;

  return {
    upcomingCount,
    completedCount,
    totalAssessments,
    averageScore,
  };
};

/**
 * Calculate standard letter grade from percentage
 */
export const getGradeLetter = (pct: number): string => {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 75) return 'B+';
  if (pct >= 70) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
};
