export interface PeriodFormData {
  id?: string;
  subject: string;
  teacher: string;
  day: string;
  startTime: string;
  endTime: string;
  classroom: string;
  priority: string;
  notes: string;
  status: 'scheduled' | 'conflict' | 'available';
}

export interface Conflict {
  type: 'teacher' | 'classroom';
  message: string;
  conflictingId?: string;
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  availability: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
}

export interface Classroom {
  id: string;
  name: string;
  type: string;
  capacity: number;
  equipment: string[];
}