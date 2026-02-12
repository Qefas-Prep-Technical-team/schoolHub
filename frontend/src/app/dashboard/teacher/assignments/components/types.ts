import { Attachment } from "../create-assignment/components/types";

export type AssignmentStatus = "published" | "overdue" | "due-soon" | "draft";

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  className?: string;
  status: AssignmentStatus;
  dueDate: string;
  submitted?: number;
  totalStudents?: number;
  progress?: number;
  classes?:string[];
  instructions?:string;
attachments?: Attachment[];
teacher?: {id: string; name: string; avatarUrl: string; };
}

export interface AssignmentCardProps {
  assignment: Assignment;
  onEdit?: (id: string) => void;
  onGrade?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}
