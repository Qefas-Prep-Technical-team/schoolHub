'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  BookOpen, 
  Calendar, 
  User, 
  Check, 
  School,
  Save,
  HelpCircle,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, ClassSubjectItem, SubjectAttendanceItem, getStudentApplicableSubjects } from './types';

interface StudentAttendanceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AttendanceRecord | null;
  classSubjects: ClassSubjectItem[];
  classNameLabel?: string;
  onSave?: (updatedRecord: AttendanceRecord) => void;
  isSaving?: boolean;
  readOnly?: boolean;
}

export const StudentAttendanceDetailModal: React.FC<StudentAttendanceDetailModalProps> = ({
  isOpen,
  onClose,
  record,
  classSubjects = [],
  classNameLabel = "Class",
  onSave,
  isSaving = false,
  readOnly: readOnlyProp = false,
}) => {
  const readOnly = readOnlyProp || !onSave;
  const [currentStatus, setCurrentStatus] = useState<AttendanceStatus>('present');
  const [comment, setComment] = useState<string>('');
  const [subjectStates, setSubjectStates] = useState<Record<string, AttendanceStatus | 'unrecorded'>>({});
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [showAllSubjects, setShowAllSubjects] = useState<boolean>(false);

  useEffect(() => {
    if (record) {
      setCurrentStatus(record.status || 'present');
      setComment(record.comment || record.note || '');
      setShowAllSubjects(false);
      
      const initialSubjects: Record<string, AttendanceStatus | 'unrecorded'> = {};
      classSubjects.forEach((sub) => {
        const existingSub = record.subjects?.[sub.id];
        if (existingSub && existingSub.status) {
          initialSubjects[sub.id] = existingSub.status as AttendanceStatus;
        } else {
          initialSubjects[sub.id] = 'unrecorded';
        }
      });
      setSubjectStates(initialSubjects);
      setHasChanges(false);
    }
  }, [record, classSubjects]);

  const studentName = record?.studentName || record?.student?.name || "Student";
  const studentCode = record?.studentCode || record?.student?.studentCode || "-";
  const studentDeptId = record?.student?.departmentId || (record as any)?.student?.department?.id || record?.departmentId || (record as any)?.departmentId;
  const studentDeptName = record?.student?.department?.name || record?.department?.name || (record as any)?.departmentName;

  // Filter applicable subjects based on student's department
  const applicableSubjects = useMemo(() => {
    return getStudentApplicableSubjects(studentDeptId, classSubjects);
  }, [studentDeptId, classSubjects]);

  const displayedSubjects = useMemo(() => {
    return showAllSubjects ? classSubjects : applicableSubjects;
  }, [showAllSubjects, classSubjects, applicableSubjects]);

  // Format attendance log timestamps
  const formattedDate = useMemo(() => {
    if (!record?.date) return "";
    const d = new Date(record.date);
    return isNaN(d.getTime()) ? record.date : d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }, [record?.date]);

  const formattedLogTime = useMemo(() => {
    const timeVal = record?.createdAt || record?.submittedAt;
    if (!timeVal) return "Not recorded";
    const d = new Date(timeVal);
    if (isNaN(d.getTime())) return timeVal;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [record?.createdAt, record?.submittedAt]);

  const formattedUpdateTime = useMemo(() => {
    const timeVal = record?.updatedAt;
    if (!timeVal) return null;
    const d = new Date(timeVal);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [record?.updatedAt]);

  const recordedByInfo = useMemo(() => {
    const name = record?.recordedByName || record?.submittedBy || "System";
    const role = record?.recordedByRole ? `(${record.recordedByRole})` : "";
    return `${name} ${role}`.trim();
  }, [record?.recordedByName, record?.submittedBy, record?.recordedByRole]);

  // Count how many subjects present vs total for the student's applicable subjects
  const subjectStats = useMemo(() => {
    const total = displayedSubjects.length;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let unrecordedCount = 0;

    displayedSubjects.forEach((sub) => {
      const st = subjectStates[sub.id];
      if (st === 'present') presentCount++;
      else if (st === 'absent') absentCount++;
      else if (st === 'late') lateCount++;
      else unrecordedCount++;
    });

    return { total, presentCount, absentCount, lateCount, unrecordedCount };
  }, [displayedSubjects, subjectStates]);

  if (!isOpen || !record) return null;

  const handleStatusChange = (status: AttendanceStatus) => {
    if (readOnly) return;
    setCurrentStatus(status);
    setHasChanges(true);
  };

  const handleSubjectStatusChange = (subjectId: string, status: AttendanceStatus | 'unrecorded') => {
    if (readOnly) return;
    setSubjectStates((prev) => ({
      ...prev,
      [subjectId]: status,
    }));
    setHasChanges(true);
  };

  const handleMarkAllSubjects = (status: AttendanceStatus | 'unrecorded') => {
    if (readOnly) return;
    const updated: Record<string, AttendanceStatus | 'unrecorded'> = { ...subjectStates };
    displayedSubjects.forEach((sub) => {
      updated[sub.id] = status;
    });
    setSubjectStates(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!onSave || !record) return;

    const updatedSubjects: Record<string, SubjectAttendanceItem> = {
      ...(record.subjects || {}),
    };

    classSubjects.forEach((sub) => {
      const st = subjectStates[sub.id];
      if (st && st !== 'unrecorded') {
        updatedSubjects[sub.id] = {
          subjectId: sub.id,
          subjectName: sub.name,
          subjectCode: sub.code,
          status: st,
          recordedAt: new Date().toISOString(),
          recordedByName: record.recordedByName,
          recordedByRole: record.recordedByRole,
        };
      } else if (st === 'unrecorded') {
        delete updatedSubjects[sub.id];
      }
    });

    const updatedRecord: AttendanceRecord = {
      ...record,
      status: currentStatus,
      comment: comment,
      note: comment,
      subjects: updatedSubjects,
    };

    onSave(updatedRecord);
  };

  const getStatusBadgeConfig = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800',
          dot: 'bg-emerald-500',
          icon: <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />,
          label: 'Present in School',
          desc: 'Student was marked present and attended school for this date.',
        };
      case 'late':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800',
          dot: 'bg-amber-500',
          icon: <Clock size={16} className="text-amber-600 dark:text-amber-400" />,
          label: 'Arrived Late',
          desc: 'Student arrived late to school for this date.',
        };
      case 'excused':
        return {
          bg: 'bg-sky-500/10 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-300 dark:border-sky-800',
          dot: 'bg-sky-500',
          icon: <AlertCircle size={16} className="text-sky-600 dark:text-sky-400" />,
          label: 'Excused Absence',
          desc: 'Student was authorized and excused from attending.',
        };
      case 'absent':
      default:
        return {
          bg: 'bg-rose-500/10 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800',
          dot: 'bg-rose-500',
          icon: <XCircle size={16} className="text-rose-600 dark:text-rose-400" />,
          label: 'Absent from School',
          desc: 'Student did not come to school on this date.',
        };
    }
  };

  const statusConfig = getStatusBadgeConfig(currentStatus);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-150 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold shadow-xs">
              <School size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                Attendance Record & Subject Breakdown
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {formattedDate || record.date} &bull; Class: <span className="font-semibold text-slate-700 dark:text-slate-300">{classNameLabel}</span>
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Student Profile Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-3.5">
              <div className="size-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-black text-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
                {studentName.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                  {studentName}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                  <span>ID: {studentCode}</span>
                  <span>&bull;</span>
                  <span>Class: {classNameLabel}</span>
                  {studentDeptName && (
                    <>
                      <span>&bull;</span>
                      <span className="font-sans font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/80 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <GraduationCap size={12} />
                        <span>Dept: {studentDeptName}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Status Pill Bar */}
            {!readOnly ? (
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                {(['present', 'late', 'absent', 'excused'] as AttendanceStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                      currentStatus === st
                        ? st === 'present'
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : st === 'late'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : st === 'excused'
                          ? 'bg-sky-500 text-white shadow-xs'
                          : 'bg-rose-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Verified Status:</span>
                <span className={`text-xs font-black capitalize px-2.5 py-0.5 rounded-md ${
                  currentStatus === 'present' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50' :
                  currentStatus === 'late' ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50' :
                  currentStatus === 'excused' ? 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50' :
                  'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50'
                }`}>
                  {currentStatus}
                </span>
              </div>
            )}
          </div>

          {/* Section 1: School Arrival Status & Verification */}
          <div className={`p-4 rounded-2xl border ${statusConfig.bg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-xs">
                  {statusConfig.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm sm:text-base">
                      {statusConfig.label}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/80 dark:bg-slate-900/80 font-bold uppercase tracking-wider">
                      School Entry
                    </span>
                  </div>
                  <p className="text-xs opacity-90 mt-0.5">
                    {statusConfig.desc}
                  </p>
                </div>
              </div>

              {/* Timestamp & Recorder Info */}
              <div className="flex flex-col sm:items-end text-xs opacity-80 pl-12 sm:pl-0 font-medium">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> Logged: {formattedLogTime}
                </span>
                {formattedUpdateTime && (
                  <span className="text-[11px] opacity-75">
                    Updated: {formattedUpdateTime}
                  </span>
                )}
                <span className="flex items-center gap-1 text-[11px] mt-0.5">
                  <ShieldCheck size={12} /> By: {recordedByInfo}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Subject Attendance Breakdown */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen size={16} className="text-indigo-500" />
                  Subject Attendance Availability
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {studentDeptName && !showAllSubjects
                    ? `Showing ${applicableSubjects.length} subjects enrolled in student's department (${studentDeptName}) on ${formattedDate || "this date"}.`
                    : `Attendance records for subjects attached to this class on ${formattedDate || "this date"}.`
                  }
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  {subjectStats.presentCount} of {subjectStats.total} Present
                </span>
                {applicableSubjects.length < classSubjects.length && (
                  <button
                    type="button"
                    onClick={() => setShowAllSubjects(!showAllSubjects)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    {showAllSubjects 
                      ? `Show Department Only (${applicableSubjects.length})` 
                      : `Show All Class Subjects (${classSubjects.length})`}
                  </button>
                )}
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleMarkAllSubjects('present')}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Mark All Present
                  </button>
                )}
              </div>
            </div>

            {displayedSubjects.length === 0 ? (
              <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                No subjects are currently applicable to this student.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {displayedSubjects.map((subject) => {
                  const subStatus = subjectStates[subject.id] || 'unrecorded';
                  const recordMeta = record.subjects?.[subject.id];
                  const recordedAtTime = recordMeta?.recordedAt
                    ? new Date(recordMeta.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : null;

                  return (
                    <div
                      key={subject.id}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 shadow-xs flex flex-col justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h5 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {subject.name}
                          </h5>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                            <span>Code: {subject.code || "-"}</span>
                            {subject.departmentNames && subject.departmentNames.length > 0 ? (
                              <>
                                <span>&bull;</span>
                                <span className="font-sans text-[10px] text-indigo-600 dark:text-indigo-400 font-medium truncate max-w-[120px]" title={subject.departmentNames.join(', ')}>
                                  {subject.departmentNames.join(', ')}
                                </span>
                              </>
                            ) : null}
                            {recordedAtTime && (
                              <>
                                <span>&bull;</span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-sans font-medium">
                                  {recordedAtTime}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Current Status Pill */}
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                            subStatus === 'present'
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                              : subStatus === 'absent'
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                              : subStatus === 'late'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {subStatus === 'unrecorded' ? 'Not Logged' : subStatus}
                        </span>
                      </div>

                      {/* Interactive Subject Status Toggles */}
                      {!readOnly && (
                        <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                          <button
                            type="button"
                            onClick={() => handleSubjectStatusChange(subject.id, 'present')}
                            className={`py-1 text-xs font-bold rounded-lg transition-all ${
                              subStatus === 'present'
                                ? 'bg-emerald-500 text-white shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubjectStatusChange(subject.id, 'absent')}
                            className={`py-1 text-xs font-bold rounded-lg transition-all ${
                              subStatus === 'absent'
                                ? 'bg-rose-500 text-white shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubjectStatusChange(subject.id, 'late')}
                            className={`py-1 text-xs font-bold rounded-lg transition-all ${
                              subStatus === 'late'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSubjectStatusChange(subject.id, 'unrecorded')}
                            className={`py-1 text-xs font-bold rounded-lg transition-all ${
                              subStatus === 'unrecorded'
                                ? 'bg-slate-600 text-white shadow-xs'
                                : 'bg-slate-50 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: Remark / Comment */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Observation / Teacher's Note
            </label>
            {!readOnly ? (
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  setHasChanges(true);
                }}
                placeholder="e.g. Arrived late due to heavy morning rain; excused from early assembly."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            ) : (
              <div className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 min-h-[44px] flex items-center">
                {comment ? (
                  <span className="italic font-medium">"{comment}"</span>
                ) : (
                  <span className="text-slate-400 italic">No specific teacher remark or note recorded for this session.</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-150 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <HelpCircle size={14} className="text-slate-400" />
            <span>
              {readOnly 
                ? "Verified attendance record and subject breakdown preview." 
                : "Click any subject to toggle status for this specific student."}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Close
            </button>
            {!readOnly && (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer
                bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25
                dark:bg-emerald-500 dark:hover:bg-emerald-400 dark:text-slate-950 dark:font-black dark:shadow-[0_0_20px_rgba(16,185,129,0.35)] dark:border dark:border-emerald-300/40"
              >
                <Save size={16} className="text-white dark:text-slate-950" />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceDetailModal;
