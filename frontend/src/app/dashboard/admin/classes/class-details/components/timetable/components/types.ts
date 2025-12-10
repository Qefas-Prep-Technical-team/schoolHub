export interface Period {
  id: string;
  timeSlot: string;
  subjects: {
    [key: string]: Subject | null;
  };
}

export interface Subject {
  id: string;
  name: string;
  teacher: string;
  room: string;
  color?: string;
}

export interface Day {
  id: string;
  name: string;
  abbreviation: string;
}

export interface TimetableFilters {
  term: string;
  week: string;
  classId: string;
}