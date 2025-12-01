export type BehaviourType = 'positive' | 'negative' | 'neutral';
export type NoteCategory = 'Leadership' | 'Helping Others' | 'Task Completion' | 'Class Disruption' | 'Punctuality' | 'Other';

export interface BehaviourNote {
  id: number;
  type: BehaviourType;
  category: NoteCategory;
  date: string;
  description: string;
  icon: string;
}

export interface PositiveNote {
  id: number;
  category: NoteCategory;
  date: string;
  icon: string;
}

export interface BehaviourScore {
  score: number;
  feedback: string;
}