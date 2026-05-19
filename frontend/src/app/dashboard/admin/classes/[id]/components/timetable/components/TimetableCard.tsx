import React, { useState } from 'react';
import { Edit2, Trash2, CheckSquare } from 'lucide-react';

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
  const [showActions, setShowActions] = useState(false);

  return (
    <div 
      className="relative flex flex-col justify-between h-full cursor-pointer rounded-xl p-3 bg-primary/20 dark:bg-primary/30 border border-primary text-gray-800 dark:text-white"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div>
        <p className="font-bold">{subject.name}</p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {subject.teacher}
        </p>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        {subject.room}
      </p>
      
      <div className={`absolute top-2 right-2 flex items-center gap-1 transition-opacity ${
        showActions ? 'opacity-100' : 'opacity-0'
      }`}>
        {onEdit && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(subject.id);
            }}
            className="p-1 rounded-full bg-white/50 dark:bg-black/20 hover:bg-white/70 dark:hover:bg-black/40"
            aria-label="Edit"
          >
            <Edit2 size={14} />
          </button>
        )}
        {onDelete && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete(subject.id);
            }}
            className="p-1 rounded-full bg-white/50 dark:bg-black/20 hover:bg-white/70 dark:hover:bg-black/40"
            aria-label="Delete"
          >
            <Trash2 size={14} />
          </button>
        )}
        {onMarkAttendance && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onMarkAttendance(subject.id);
            }}
            className="p-1 rounded-full bg-white/50 dark:bg-black/20 hover:bg-white/70 dark:hover:bg-black/40"
            aria-label="Mark Attendance"
          >
            <CheckSquare size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default TimetableCard;