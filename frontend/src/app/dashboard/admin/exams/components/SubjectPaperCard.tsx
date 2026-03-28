'use client';

import { SubjectPaper } from '@/lib/api/services/examService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, User, Calendar, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface SubjectPaperCardProps {
  paper: SubjectPaper & { 
    subject?: { name: string }, 
    teacher?: { name: string },
    exam?: { title: string },
    _count?: { questions: number }
  };
  examId?: string;
}

export default function SubjectPaperCard({ paper, examId }: SubjectPaperCardProps) {
  const statusColor = {
    DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
    REVIEW: 'bg-amber-100 text-amber-700 border-amber-200',
    APPROVED: 'bg-green-100 text-green-700 border-green-200',
    REJECTED: 'bg-red-100 text-red-700 border-red-200',
    PUBLISHED: 'bg-blue-100 text-blue-700 border-blue-200',
  }[paper.status] || 'bg-slate-100 text-slate-700';

  const detailUrl = examId 
    ? `/dashboard/admin/exams/${examId}/papers/${paper.id}`
    : `/dashboard/admin/exams/papers/${paper.id}`;

  return (
    <Link href={detailUrl}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <Badge variant="outline" className={`${statusColor} font-medium`}>
              {paper.status}
            </Badge>
          </div>

          <h3 className="font-bold text-lg mb-1 truncate text-slate-900 dark:text-white">
            {paper.title || `${paper.subject?.name} Paper`}
          </h3>
          
          <div className="space-y-2 mt-4">
            <div className="flex items-center text-sm text-slate-500 gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{paper.subject?.name || 'Unknown Subject'}</span>
            </div>
            
            <div className="flex items-center text-sm text-slate-500 gap-2">
              <User className="h-4 w-4" />
              <span>{paper.teacher?.name || 'Unassigned'}</span>
            </div>

            {paper.exam && (
              <div className="flex items-center text-sm text-primary/80 gap-2 font-medium">
                <Calendar className="h-4 w-4" />
                <span className="truncate">Part of: {paper.exam.title}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="text-xs text-slate-400">
              {paper.durationMinutes || 0} mins • {paper.totalMarks || 0} marks
            </div>
            <div className="text-xs font-bold text-primary">
              View Details →
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
