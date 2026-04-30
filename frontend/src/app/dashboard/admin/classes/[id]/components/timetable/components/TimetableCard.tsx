'use client';

import React from 'react';
import { Edit2, Trash2, CheckSquare, User, MapPin, MoreVertical } from 'lucide-react';
import { useSchoolSettings } from '@/lib/api/hooks/useSchool';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';

interface TimetableCardProps {
  subject: {
    id: string;
    name: string;
    teacher: string;
    room: string;
    color?: string;
  };
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMarkAttendance?: (id: string) => void;
}

const TimetableCard: React.FC<TimetableCardProps> = ({ 
  subject, 
  onEdit, 
  onDelete, 
  onMarkAttendance 
}) => {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#ea580c';

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className="group relative h-full rounded-2xl p-4 transition-all overflow-hidden border border-slate-100 dark:border-white/5 shadow-sm hover:shadow-xl bg-white dark:bg-slate-900"
    >
      {/* Dynamic Color Accent */}
      <div 
        className="absolute top-0 left-0 w-1.5 h-full opacity-80"
        style={{ backgroundColor: primaryColor }}
      />
      
      <div className="flex flex-col h-full justify-between gap-4">
        <div className="space-y-1">
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none group-hover:text-orange-600 transition-colors">
              {subject.name}
            </h4>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-6 -mr-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl p-1">
                <DropdownMenuItem onClick={() => onEdit?.(subject.id)} className="rounded-lg gap-2 text-xs font-bold py-2">
                  <Edit2 size={12} /> Edit Period
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onMarkAttendance?.(subject.id)} className="rounded-lg gap-2 text-xs font-bold py-2">
                  <CheckSquare size={12} /> Attendance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete?.(subject.id)} className="rounded-lg gap-2 text-xs font-bold py-2 text-red-500">
                  <Trash2 size={12} /> Purge Node
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <User size={10} />
            <span className="truncate">{subject.teacher}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 dark:bg-white/5 w-fit">
          <MapPin size={10} className="text-slate-400" />
          <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            {subject.room}
          </span>
        </div>
      </div>

      {/* Background Decor */}
      <div 
        className="absolute -bottom-4 -right-4 size-16 blur-2xl opacity-0 group-hover:opacity-10 transition-opacity rounded-full"
        style={{ backgroundColor: primaryColor }}
      />
    </motion.div>
  );
};

export default TimetableCard;