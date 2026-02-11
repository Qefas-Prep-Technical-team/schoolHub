export type DocumentType = 'PDF' | 'Slides' | 'Worksheet' | 'Notes' | 'Past Questions' | 'Other';

export interface Document {
  id: number;
  title: string;
  type: DocumentType;
  thumbnailUrl: string;
  modifiedDate: string;
  description?: string;
}

export type ViewMode = 'grid' | 'list';

export interface FilterOption {
  label: string;
  icon: string;
}