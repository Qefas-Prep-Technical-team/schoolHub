/* eslint-disable @typescript-eslint/no-explicit-any */
// Exam status types
export type ExamStatus = 'upcoming' | 'completed' | 'missed';

// Event type for calendar
export interface ExamEvent {
  id: string;
  title: string;
  subject?: string;
  date: string; // Format: YYYY-MM-DD
  time?: string; // Format: "09:00 AM - 11:00 AM"
  type: ExamStatus;
  description?: string;
  icon: string; // Material icon name
  colorClass: {
    bg: string; // Tailwind background class
    text: string; // Tailwind text color class
    border: string; // Tailwind border class
  };
  teacher?: string;
  location?: string;
  duration?: number; // Duration in minutes
  score?: number; // For completed exams
  maxScore?: number; // For completed exams
}

// Calendar day interface
export interface CalendarDay {
  date: Date;
  dayOfMonth: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events?: ExamEvent[];
  hasEvents: boolean;
}

// Statistics card interface
export interface StatCard {
  id: string;
  title: string;
  count: number;
  icon: string;
  color: {
    bg: string;
    text: string;
    iconBg: string;
    iconText: string;
  };
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  description?: string;
}

// Navigation item interface
export interface NavItem {
  id: string;
  icon: string;
  label: string;
  href: string;
  badge?: number;
  isActive?: boolean;
  onClick?: () => void;
}

// User profile interface
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  children?: ChildProfile[];
}

// Child student profile
export interface ChildProfile {
  id: string;
  name: string;
  grade: string;
  age: number;
  avatar?: string;
  studentId: string;
  school: string;
}

// Calendar view mode
export type CalendarView = 'month' | 'week' | 'day';

// Filter options for exams
export interface ExamFilters {
  status?: ExamStatus;
  subject?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  childId?: string;
}

// Pagination interface
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: Pagination;
}

// Notification interface
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// School/Subject interface
export interface Subject {
  id: string;
  name: string;
  code?: string;
  teacher: string;
  color: string;
  icon: string;
}

// Calendar month data
export interface CalendarMonth {
  year: number;
  month: number; // 0-indexed (0 = January)
  days: CalendarDay[];
  examCount: {
    upcoming: number;
    completed: number;
    missed: number;
  };
}

// Upcoming exam card
export interface UpcomingExam {
  id: string;
  title: string;
  subject: string;
  date: Date;
  time: string;
  daysUntil: number;
  priority: 'high' | 'medium' | 'low';
  preparationStatus: 'not-started' | 'in-progress' | 'completed';
  notes?: string;
}

// Search result interface
export interface SearchResult {
  exams: ExamEvent[];
  subjects: Subject[];
  dates: Date[];
}

// Calendar event click handler
export type CalendarEventClickHandler = (event: ExamEvent, date: Date) => void;

// Date range for filtering
export interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

// Calendar state
export interface CalendarState {
  currentDate: Date;
  viewMode: CalendarView;
  selectedDate?: Date;
  selectedEvent?: ExamEvent;
  filters: ExamFilters;
}

// Exam preparation checklist item
export interface PreparationItem {
  id: string;
  examId: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
  notes?: string;
}

// Grade/Score interface
export interface Grade {
  id: string;
  examId: string;
  score: number;
  maxScore: number;
  percentage: number;
  letterGrade: string;
  weight: number; // Weight in overall grade calculation
  feedback?: string;
  published: boolean;
}

// Attendance record
export interface Attendance {
  id: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  subjectId: string;
  notes?: string;
}

// Calendar export options
export interface ExportOptions {
  format: 'pdf' | 'csv' | 'ical';
  dateRange: DateRange;
  includeDetails: boolean;
  includeGrades: boolean;
  includeComments: boolean;
}

// Sync provider
export interface SyncProvider {
  id: string;
  name: 'google' | 'outlook' | 'apple' | 'other';
  connected: boolean;
  lastSync?: Date;
}

// Theme settings
export interface ThemeSettings {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColor: string;
  fontSize: 'small' | 'medium' | 'large';
  density: 'compact' | 'comfortable' | 'spacious';
}

// User preferences
export interface UserPreferences {
  theme: ThemeSettings;
  notifications: {
    examReminders: boolean;
    gradeUpdates: boolean;
    attendanceAlerts: boolean;
    dailyDigest: boolean;
  };
  calendar: {
    defaultView: CalendarView;
    weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
    showWeekends: boolean;
    showEventTimes: boolean;
  };
  academic: {
    gradingScale: 'letter' | 'percentage' | 'points';
    showWeightedAverage: boolean;
    hideMissedExams: boolean;
  };
}

// Breadcrumb item
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
}

// Action button
export interface ActionButton {
  label: string;
  icon: string;
  onClick: () => void;
  variant: 'primary' | 'secondary' | 'outline' | 'ghost';
  disabled?: boolean;
}

// Modal/dialog state
export interface ModalState {
  isOpen: boolean;
  title: string;
  content: React.ReactNode;
  onClose?: () => void;
  onConfirm?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Toast notification
export interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Validation error
export interface ValidationError {
  field: string;
  message: string;
}

// Form state
export interface FormState<T> {
  values: T;
  errors: ValidationError[];
  touched: Record<string, boolean>;
  submitting: boolean;
}

// Dropdown option
export interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

// Tab interface
export interface Tab {
  id: string;
  label: string;
  icon?: string;
  content: React.ReactNode;
  badge?: number;
}

// Data table column
export interface TableColumn<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T) => React.ReactNode;
}

// Paginated data
export interface PaginatedData<T> {
  data: T[];
  pagination: Pagination;
}

// API error
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Loading state
export interface LoadingState {
  isLoading: boolean;
  error?: string;
  data?: any;
}

// Context menu item
export interface ContextMenuItem {
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}

// Drag and drop item
export interface DragItem {
  id: string;
  type: string;
  data: any;
}

// Resize handler
export interface ResizeHandler {
  onResizeStart?: () => void;
  onResize?: (width: number, height: number) => void;
  onResizeEnd?: (width: number, height: number) => void;
}

// Keyboard shortcut
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

// Chart data point
export interface ChartDataPoint {
  x: string | number | Date;
  y: number;
  label?: string;
  color?: string;
}

// Chart series
export interface ChartSeries {
  name: string;
  data: ChartDataPoint[];
  color: string;
}

// Dashboard widget
export interface DashboardWidget {
  id: string;
  title: string;
  type: 'stats' | 'chart' | 'calendar' | 'list' | 'custom';
  size: 'small' | 'medium' | 'large' | 'full';
  data: any;
  refreshInterval?: number;
}