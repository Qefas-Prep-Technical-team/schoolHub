import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { CalendarDay } from "./types";

export function generateCalendarDays(date: Date): CalendarDay[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Sample attendance data - in real app, this would come from an API
  const attendanceEvents = [
    {
      date: new Date(date.getFullYear(), date.getMonth(), 2),
      status: "present" as const,
    },
    {
      date: new Date(date.getFullYear(), date.getMonth(), 3),
      status: "present" as const,
    },
    {
      date: new Date(date.getFullYear(), date.getMonth(), 4),
      status: "late" as const,
      lateMinutes: 15,
    },
    {
      date: new Date(date.getFullYear(), date.getMonth(), 5),
      status: "present" as const,
    },
    {
      date: new Date(date.getFullYear(), date.getMonth(), 6),
      status: "absent" as const,
    },
    {
      date: new Date(date.getFullYear(), date.getMonth(), 9),
      status: "holiday" as const,
    },
    {
      date: new Date(date.getFullYear(), date.getMonth(), 16),
      status: "present" as const,
    },
    {
      date: new Date(date.getFullYear(), date.getMonth(), 17),
      status: "present" as const,
    },
    {
      date: new Date(date.getFullYear(), date.getMonth(), 18),
      status: "present" as const,
    },
  ];

  return days.map((day) => {
    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
    const isCurrentMonth = isSameMonth(day, date);

    const event = attendanceEvents.find((event) => isSameDay(event.date, day));

    let attendanceStatus: CalendarDay["attendance"];
    if (event) {
      attendanceStatus = {
        status: event.status,
        lateMinutes: event.lateMinutes,
      };
    } else if (isWeekend) {
      attendanceStatus = { status: "weekend" };
    }

    const isToday = isSameDay(day, new Date());

    return {
      date: day,
      day: day.getDate(),
      isCurrentMonth,
      isWeekend,
      attendance: attendanceStatus,
      isToday,
    };
  });
}

export function getNextMonth(date: Date): Date {
  return addMonths(date, 1);
}

export function getPreviousMonth(date: Date): Date {
  return subMonths(date, 1);
}

export function formatMonthYear(date: Date): string {
  return format(date, "MMMM yyyy");
}

export function getWeekdayNames(): string[] {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
}
