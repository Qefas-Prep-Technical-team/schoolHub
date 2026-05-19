import React from 'react';
import { X, Calendar, Clock, BookOpen, User, Home, Edit, Trash2, CheckSquare } from 'lucide-react';

interface SlotDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: string;
  timeSlot: string;
  period: {
    id: string;
    subjectId: string;
    subjectName: string;
    teacherId: string;
    teacherName: string;
    room: string;
    startTime: string;
    endTime: string;
    isBreak: boolean;
    breakLabel: string;
  } | null;
  onEdit: () => void;
  onDelete: () => void;
  onMarkAttendance: () => void;
  onAdd: () => void;
}

export default function SlotDetailsModal({
  isOpen,
  onClose,
  day,
  timeSlot,
  period,
  onEdit,
  onDelete,
  onMarkAttendance,
  onAdd
}: SlotDetailsModalProps) {
  if (!isOpen) return null;

  const formatTo12Hour = (timeStr: string): string => {
    if (!timeStr) return "";
    const cleanStr = timeStr.trim();
    const match = cleanStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return timeStr;
    const hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayHours}:${minutes} ${ampm}`;
  };

  const formatSlotTo12Hour = (slotStr: string): string => {
    if (!slotStr || !slotStr.includes(" - ")) return slotStr;
    const [start, end] = slotStr.split(" - ");
    return `${formatTo12Hour(start)} - ${formatTo12Hour(end)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-[#1b2232] border border-gray-200 dark:border-[#364563] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden transition-all duration-300 transform scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#364563] bg-slate-50/50 dark:bg-slate-900/10">
          <h3 className="text-lg font-bold text-gray-950 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary" />
            Timetable Slot Details
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-650 hover:bg-gray-105 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Day and Time Block */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-[#364563]/40 bg-gray-50/50 dark:bg-slate-900/10">
              <Calendar className="text-primary mt-0.5" size={18} />
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Day</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{day}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 dark:border-[#364563]/40 bg-gray-50/50 dark:bg-slate-900/10">
              <Clock className="text-primary mt-0.5" size={18} />
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Time Slot</p>
                <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{formatSlotTo12Hour(timeSlot)}</p>
              </div>
            </div>
          </div>

          {period ? (
            period.isBreak ? (
              /* Break Details */
              <div className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/20 text-center space-y-2">
                <p className="text-xs text-amber-500 dark:text-amber-400 font-bold uppercase tracking-wider">Scheduled Intermission</p>
                <p className="text-xl font-black text-amber-700 dark:text-amber-300">
                  {period.breakLabel || "Recess / Break"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  No classes or subject tasks scheduled during this slot.
                </p>
              </div>
            ) : (
              /* Subject Details */
              <div className="space-y-4">
                <div className="flex items-start gap-3.5 pb-4 border-b border-gray-100 dark:border-[#364563]/30">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 dark:bg-blue-400/10 dark:text-blue-400 mt-0.5">
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Subject Name</p>
                    <p className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">{period.subjectName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 pb-4 border-b border-gray-100 dark:border-[#364563]/30">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 dark:bg-emerald-400/10 dark:text-emerald-400 mt-0.5">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Subject Teacher</p>
                    <p className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">{period.teacherName || "No Teacher Assigned"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 pb-2">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 dark:bg-purple-400/10 dark:text-purple-400 mt-0.5">
                    <Home size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-wider">Classroom / Location</p>
                    <p className="text-base font-extrabold text-gray-900 dark:text-white mt-0.5">{period.room || "No Room Assigned"}</p>
                  </div>
                </div>
              </div>
            )
          ) : (
            /* Empty Slot Details */
            <div className="p-5 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-slate-50/30 dark:bg-slate-900/5 text-center space-y-3">
              <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                No timetable periods or breaks are scheduled for this slot yet.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-[#364563] bg-slate-50/50 dark:bg-slate-900/10 flex flex-wrap items-center justify-between gap-3">
          {period ? (
            <>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onDelete();
                  }}
                  className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-xs font-bold text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 border border-transparent hover:border-red-200 dark:hover:border-red-900/30 transition-all"
                  title="Remove period"
                >
                  <Trash2 size={15} />
                  <span>Delete</span>
                </button>
                
                <button
                  onClick={() => {
                    onClose();
                    onEdit();
                  }}
                  className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-all"
                  title="Modify details"
                >
                  <Edit size={15} />
                  <span>Edit</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {!period.isBreak && (
                  <button
                    onClick={() => {
                      onClose();
                      onMarkAttendance();
                    }}
                    className="flex items-center gap-1.5 h-10 px-4 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/95 transition-all shadow-sm active:scale-95"
                    title="Mark attendance session"
                  >
                    <CheckSquare size={15} />
                    <span>Attendance</span>
                  </button>
                )}
                
                <button
                  onClick={onClose}
                  className="h-10 px-4 rounded-xl text-xs font-bold bg-gray-105 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-750 dark:text-gray-250 transition-colors"
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="h-10 px-4 rounded-xl text-xs font-bold bg-gray-105 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-750 dark:text-gray-250 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={() => {
                  onClose();
                  onAdd();
                }}
                className="flex items-center gap-1.5 h-10 px-5 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/95 transition-all shadow-sm active:scale-95"
              >
                <span>Schedule Period</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
