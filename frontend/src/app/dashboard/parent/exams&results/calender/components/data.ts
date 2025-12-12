import { ExamEvent } from './types';

export const mockExams: ExamEvent[] = [
  {
    id: '1',
    title: 'Mathematics',
    subject: 'Mid-Term Assessment',
    date: '2023-10-18',
    time: '09:00 AM - 11:00 AM',
    type: 'upcoming',
    icon: 'functions',
    colorClass: {
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-100 dark:border-blue-800/50'
    }
  },
  {
    id: '2',
    title: 'Biology',
    subject: 'Unit 3 Quiz',
    date: '2023-10-21',
    time: '01:00 PM - 02:00 PM',
    type: 'upcoming',
    icon: 'biotech',
    colorClass: {
      bg: 'bg-green-50 dark:bg-green-900/30',
      text: 'text-green-700 dark:text-green-300',
      border: 'border-green-100 dark:border-green-800/50'
    }
  },
  {
    id: '3',
    title: 'Chemistry',
    subject: 'Lab Practical',
    date: '2023-10-28',
    time: '10:30 AM - 12:00 PM',
    type: 'upcoming',
    icon: 'science',
    colorClass: {
      bg: 'bg-purple-50 dark:bg-purple-900/30',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-100 dark:border-purple-800/50'
    }
  },
  {
    id: '4',
    title: 'History Quiz',
    date: '2023-10-02',
    type: 'completed',
    icon: 'history_edu',
    colorClass: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-100 dark:border-emerald-800/50'
    }
  },
  {
    id: '5',
    title: 'Physics Lab',
    date: '2023-10-15',
    type: 'missed',
    icon: 'science',
    colorClass: {
      bg: 'bg-red-50 dark:bg-red-900/30',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-100 dark:border-red-800/50'
    }
  }
];

export const calendarDays = [
  // October 2023 Calendar Structure
  { date: new Date(2023, 9, 1), dayOfMonth: 1, isCurrentMonth: true, isToday: false },
  { date: new Date(2023, 9, 2), dayOfMonth: 2, isCurrentMonth: true, isToday: false, events: [mockExams[3]] },
  // ... Add all calendar days
];

export const getEventsForDay = (date: Date): ExamEvent[] => {
  const dateStr = date.toISOString().split('T')[0];
  return mockExams.filter(exam => exam.date === dateStr);
};