

export interface Document {
  id: number;
  title: string;
  type: string;
  thumbnailUrl: string;
  modifiedDate: string;
  description?: string;
}

export type ViewMode = 'grid' | 'list';

export interface FilterOption {
  label: string;
  icon: string;
}
