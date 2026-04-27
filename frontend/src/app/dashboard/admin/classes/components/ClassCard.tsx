'use client';

import { ClassData } from './types';
import { Card } from './ui/Card';
import { Avatar } from './ui/Avatar';
import { IconButton } from './ui/IconButton';
import { Badge } from './ui/Badge';
import {
  Users,
  BookOpen,
  MoreVertical,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

interface ClassCardProps {
  classData: ClassData;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusConfig = {
  complete: {
    label: 'Timetable: Complete',
    icon: CheckCircle,
    className: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    dotColor: 'bg-green-500',
  },
  incomplete: {
    label: 'Timetable: Incomplete',
    icon: AlertCircle,
    className: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    dotColor: 'bg-orange-500',
  },
  pending: {
    label: 'Timetable: Pending',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
    dotColor: 'bg-yellow-500',
  },
};

export default function ClassCard({
  classData,
  onView,
  onEdit,
  onDelete,
}: ClassCardProps) {
  const StatusIcon = statusConfig[classData.timetableStatus].icon;
  const statusClassName = statusConfig[classData.timetableStatus].className;
  const dotColor = statusConfig[classData.timetableStatus].dotColor;

  const handleMenuClick = (action: 'view' | 'edit' | 'delete') => {
    switch (action) {
      case 'view':
        onView?.(classData.id);
        break;
      case 'edit':
        onEdit?.(classData.id);
        break;
      case 'delete':
        onDelete?.(classData.id);
        break;
    }
  };

  return (
    <Link href={`/dashboard/admin/classes/${classData.id}`}>
    <Card className="hover:shadow-lg transition-shadow group">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {classData.name}
              </h3>
              {classData.classCode && (
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-4 font-mono">
                  {classData.classCode}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Avatar
                src={classData.teachers?.[0]?.teacher?.avatarUrl}
                alt={classData.teachers?.[0]?.teacher?.name || "Teacher"}
                size="sm"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {classData.teachers?.[0]?.teacher?.name || "Not Assigned"}
                {classData.teachers && classData.teachers.length > 1 && ` +${classData.teachers.length - 1}`}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-1.5 mt-2">
              {classData.departments?.map((dept) => (
                <Badge 
                  key={dept.id} 
                  variant="custom" 
                  className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] py-0 px-2 border-emerald-100 dark:border-emerald-800"
                >
                  {dept.name}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <IconButton
              variant="ghost"
              size="sm"
              className="h-8 w-8"
              onClick={() => {}} // Will implement dropdown
            >
              <MoreVertical className="h-4 w-4" />
            </IconButton>
            
            {/* Dropdown menu (can be implemented with Radix UI or similar) */}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300 mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span>{classData._count?.enrollments ?? classData.studentCount ?? 0} Students</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-gray-400" />
            <span>{classData._count?.subjects ?? classData.subjectCount ?? 0} Subjects</span>
          </div>
        </div>

        {/* Footer with Status & Live Activity */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Badge
              variant="custom"
              className={`inline-flex items-center gap-2 ${statusClassName}`}
            >
              <div className={`w-2 h-2 rounded-full ${dotColor}`} />
              <span className="text-sm font-medium">
                {statusConfig[classData.timetableStatus].label}
              </span>
            </Badge>

            {classData.isLive && (
              <Badge
                variant="custom"
                className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-100 dark:border-red-800 animate-pulse flex items-center gap-1.5"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
              </Badge>
            )}
          </div>

          {classData.currentActivity && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg border border-gray-100 dark:border-gray-700/50">
              <Clock className="h-3.5 w-3.5 text-primary/70" />
              <span className="font-medium truncate">
                Current: <span className="text-gray-900 dark:text-white">{classData.currentActivity}</span>
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons (Visible on Hover) */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 opacity-0 hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleMenuClick('view')}
            className="flex-1 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded transition-colors"
          >
            View Details
          </button>
          <button
            onClick={() => handleMenuClick('edit')}
            className="flex-1 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    </Card>
    </Link>
  );
}
