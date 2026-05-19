import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, BookOpen, User, Home, Trash2, Save } from "lucide-react";
import { useUpsertTimetablePeriod, useDeleteTimetablePeriod } from "@/lib/api/hooks/useClasses";
import { useSchoolTeachers } from "@/lib/api/hooks/useSchool";
import { toast } from "react-toastify";

interface AddPeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  day: string;
  timeSlot: string;
  classData: any;
  periodToEdit?: {
    id: string;
    subjectId: string;
    teacherId: string;
    room?: string;
    startTime?: string;
    endTime?: string;
    isBreak?: boolean;
  } | null;
  termPeriodId?: string;
}

export default function AddPeriodModal({
  isOpen,
  onClose,
  classId,
  day,
  timeSlot,
  classData,
  periodToEdit,
  termPeriodId
}: AddPeriodModalProps) {
  const [subjectId, setSubjectId] = useState("");
  const [teacherId, setTeacherId] = useState("");
  const [room, setRoom] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isBreak, setIsBreak] = useState(false);
  const [breakLabel, setBreakLabel] = useState("Recess / Break");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const upsertMutation = useUpsertTimetablePeriod(classId);
  const deleteMutation = useDeleteTimetablePeriod(classId);

  // Fetch school teachers as a robust registry list fallback
  const schoolId = classData?.schoolId || "";
  const { data: schoolTeachers = [], isLoading: isTeachersLoading } = useSchoolTeachers(schoolId);

  // Extract subjects and teachers associated with class
  const classSubjects = classData?.subjects || [];
  const classTeachers = classData?.teachers || [];

  // Group class teachers at the top and remaining school teachers below them
  const teachersList = React.useMemo(() => {
    const assignedIds = new Set(classTeachers.map((ct: any) => ct.teacher?.id).filter(Boolean));
    
    const assigned = classTeachers
      .filter((ct: any) => ct.teacher)
      .map((ct: any) => ({
        id: ct.teacher.id,
        name: `${ct.teacher.name} ${ct.isLead ? "(Lead Class Teacher)" : "(Class Teacher)"}`
      }));
      
    const others = schoolTeachers
      .filter((t: any) => t && t.id && !assignedIds.has(t.id))
      .map((t: any) => ({
        id: t.id,
        name: t.name || "Unnamed Faculty Member"
      }));

    return [...assigned, ...others];
  }, [classTeachers, schoolTeachers]);

  const normalizeTime = (timeStr: string) => {
    if (!timeStr) return "";
    const cleanStr = timeStr.trim();
    const match = cleanStr.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
      const hours = match[1].padStart(2, "0");
      const minutes = match[2];
      return `${hours}:${minutes}`;
    }
    return "";
  };

  useEffect(() => {
    if (periodToEdit) {
      setSubjectId(periodToEdit.subjectId || "");
      setTeacherId(periodToEdit.teacherId || "");
      setRoom(periodToEdit.room || "");
      setStartTime(normalizeTime(periodToEdit.startTime || ""));
      setEndTime(normalizeTime(periodToEdit.endTime || ""));
      setIsBreak(!!periodToEdit.isBreak);
      setBreakLabel((periodToEdit as any).breakLabel || "Recess / Break");
    } else {
      setSubjectId("");
      setTeacherId("");
      setRoom("");
      setIsBreak(false);
      setBreakLabel("Recess / Break");
      if (timeSlot) {
        const [start, end] = timeSlot.split(" - ");
        setStartTime(normalizeTime(start || ""));
        setEndTime(normalizeTime(end || ""));
      } else {
        setStartTime("");
        setEndTime("");
      }
    }
  }, [periodToEdit, isOpen, timeSlot]);

  if (!isOpen) return null;

  if (isTeachersLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300" />
        
        {/* Dialog container */}
        <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-950 p-8 shadow-2xl border border-slate-100 dark:border-white/10 animate-pulse">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
            <div className="space-y-2">
              <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-md" />
              <div className="h-3 w-32 bg-slate-100 dark:bg-slate-900 rounded-md" />
            </div>
            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-900 rounded-xl" />
          </div>

          <div className="space-y-6">
            {/* Metadata skeleton */}
            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-1">
                  <div className="h-3 w-10 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/50">
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                </div>
              </div>
            </div>

            {/* Subject Selector skeleton */}
            <div className="space-y-2">
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>

            {/* Teacher Selector skeleton */}
            <div className="space-y-2">
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>

            {/* Room Location skeleton */}
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>

            {/* Actions skeleton */}
            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex-1 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="flex-2 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBreak) {
      if (!subjectId) {
        toast.error("Please select a subject");
        return;
      }
      if (!teacherId) {
        toast.error("Please select a teacher");
        return;
      }
    }
    if (!startTime || !endTime) {
      toast.error("Please enter both start and end times");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        day,
        startTime,
        endTime,
        subjectId: isBreak ? null : subjectId,
        teacherId: isBreak ? null : teacherId,
        room: isBreak ? null : (room || null),
        isBreak,
        breakLabel: isBreak ? breakLabel : null,
        termPeriodId: termPeriodId || null,
      };

      if (periodToEdit?.id) {
        payload.id = periodToEdit.id;
      }

      await upsertMutation.mutateAsync(payload);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!periodToEdit?.id) return;
    
    if (!confirm("Are you sure you want to remove this timetable entry?")) {
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteMutation.mutateAsync(periodToEdit.id);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Dialog container */}
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-950 p-8 shadow-2xl border border-slate-100 dark:border-white/10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {periodToEdit ? "Edit Scheduled Period" : "Schedule New Period"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set class agenda for {classData?.name}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Day & Time Inputs */}
          <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500">
                <Calendar size={16} />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Day</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">{day}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/50">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                  <Clock size={12} className="text-slate-400" /> Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block flex items-center gap-1">
                  <Clock size={12} className="text-slate-400" /> End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Break Period Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/10">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Break / Recess Slot</span>
              <span className="text-[10px] text-slate-400 font-bold block">Mark this slot as an intermission break (no teacher or subject required)</span>
            </div>
            <button
              type="button"
              onClick={() => setIsBreak(!isBreak)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                isBreak ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isBreak ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {isBreak && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={14} className="text-slate-400" />
                Break Label / Type
              </label>
              <select
                value={["Assembly", "Lunch Break", "Recess", "General Break"].includes(breakLabel) ? breakLabel : "Other"}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val !== "Other") {
                    setBreakLabel(val);
                  } else {
                    setBreakLabel("");
                  }
                }}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
              >
                <option value="Recess">Recess / Break</option>
                <option value="Assembly">Assembly</option>
                <option value="Lunch Break">Lunch Break</option>
                <option value="General Break">General Break</option>
                <option value="Other">Other / Custom...</option>
              </select>
              
              {!["Assembly", "Lunch Break", "Recess", "General Break"].includes(breakLabel) && (
                <input
                  type="text"
                  placeholder="Enter custom break name..."
                  value={breakLabel}
                  onChange={(e) => setBreakLabel(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none mt-2 animate-in slide-in-from-top-2 duration-200"
                  required
                />
              )}
            </div>
          )}

          {!isBreak && (
            <>
              {/* Subject Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen size={14} className="text-slate-400" />
                  Subject
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                  required={!isBreak}
                >
                  <option value="">Select a Subject...</option>
                  {classSubjects.map((s: any) => (
                    <option key={s.subject.id} value={s.subject.id}>
                      {s.subject.name} ({s.subject.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <User size={14} className="text-slate-400" />
                  Teacher
                </label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                  required={!isBreak}
                >
                  <option value="">Select a Teacher...</option>
                  {teachersList.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Location Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Home size={14} className="text-slate-400" />
                  Room / Classroom
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lab 3, Room 102"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
                />
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            {periodToEdit && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 h-12 px-5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
              >
                <Trash2 size={16} />
                <span>Remove</span>
              </button>
            )}
            
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 px-5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-350 rounded-xl text-sm font-bold transition-all"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-2 flex items-center justify-center gap-2 h-12 px-6 bg-primary hover:bg-primary/95 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50 shadow-lg shadow-blue-500/10"
            >
              <Save size={16} />
              <span>{isSubmitting ? "Saving..." : "Save Schedule"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
