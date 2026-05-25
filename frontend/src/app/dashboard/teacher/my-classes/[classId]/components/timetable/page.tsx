'use client';

import React, { useState, useEffect } from 'react';
import { CalendarDays } from 'lucide-react';
import TeacherTimetableGrid from './TeacherTimetableGrid';
import { useClassTimetable } from '@/lib/api/hooks/useClasses';
import { useSessions } from '@/lib/api/hooks/useSessions';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { Period } from '@/app/dashboard/admin/classes/[id]/components/timetable/components/types';
import { useParams } from 'next/navigation';

interface TimetablePageProps {
  classData?: any;
}

import FilterButton from '@/app/dashboard/admin/classes/[id]/components/timetable/components/FilterButton';

export default function TimetablePage({ classData }: TimetablePageProps) {
    const params = useParams();
    const classId = params.classId as string;
    const { user } = useAuthStore();
    const schoolId = (user as any)?.school?.id || user?.schools?.[0]?.schoolId || classData?.schoolId || "";
    
    // Sessions and Term logic
    const { data: sessionsData } = useSessions(schoolId);
    const sessions = sessionsData?.data || [];
    const [selectedSessionName, setSelectedSessionName] = useState("");
    const [selectedTermName, setSelectedTermName] = useState("First Term");

    useEffect(() => {
        if (sessions && sessions.length > 0 && !selectedSessionName) {
            const activeSession = sessions.find((s: any) => s.isActive) || sessions[0];
            setSelectedSessionName(activeSession.name);
            setSelectedTermName(
                activeSession.currentTerm === 'FIRST' ? 'First Term' :
                activeSession.currentTerm === 'SECOND' ? 'Second Term' : 'Third Term'
            );
        }
    }, [sessions, selectedSessionName]);

    const selectedSessionObj = sessions.find((s: any) => s.name === selectedSessionName);
    const selectedTerm = selectedTermName === 'First Term' ? 'FIRST' : selectedTermName === 'Second Term' ? 'SECOND' : 'THIRD';
    const termPeriodId = selectedSessionObj?.termPeriods?.find((tp: any) => tp.term === selectedTerm)?.id || "";

    // Fetch timetable
    const { data: rawPeriods = [], isLoading } = useClassTimetable(classId, termPeriodId || 'NONE');

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    const periods: Period[] = React.useMemo(() => {
        const defaultSlots = [
            '07:30 - 08:30', '08:30 - 09:30', '09:30 - 10:30', '10:30 - 11:30',
            '11:30 - 12:30', '12:30 - 13:30', '13:30 - 14:30', '14:30 - 15:30',
            '15:30 - 16:30'
        ];

        if (rawPeriods.length === 0) {
            return defaultSlots.map(timeSlot => ({ id: timeSlot, timeSlot, subjects: {} }));
        }

        const uniqueSlotsMap = new Map<string, { startTime: string; endTime: string }>();
        rawPeriods.forEach((rp: any) => {
            if (rp.startTime && rp.endTime) {
                const slot = `${rp.startTime} - ${rp.endTime}`;
                uniqueSlotsMap.set(slot, { startTime: rp.startTime, endTime: rp.endTime });
            }
        });

        const sortedSlots = Array.from(uniqueSlotsMap.values()).sort((a, b) => a.startTime.localeCompare(b.startTime));

        // IDs we can use to detect the teacher's own periods
        const teacherSubjectIds: string[] = classData?.teacherSubjectIds || [];
        const teacherIdFromClass: string = classData?.teacherId || "";

        return sortedSlots.map(slot => {
            const timeSlot = `${slot.startTime} - ${slot.endTime}`;
            const slotSubjects: Record<string, any> = {};

            rawPeriods.forEach((rp: any) => {
                if (rp.startTime === slot.startTime && rp.endTime === slot.endTime) {
                    const teacherName = rp.teacher?.name || rp.teacher?.user?.name || 'Staff';

                    // Match by teacher.id, teacherId field, OR subjectId in teacherSubjectIds
                    const byTeacherId = user?.id && rp.teacher?.id === user.id;
                    const byTeacherIdField = teacherIdFromClass && rp.teacherId === teacherIdFromClass;
                    const bySubjectId = teacherSubjectIds.length > 0 && rp.subjectId && teacherSubjectIds.includes(rp.subjectId);
                    const isTeacherSubject = !!(byTeacherId || byTeacherIdField || bySubjectId);

                    slotSubjects[rp.day] = {
                        id: rp.id,
                        name: rp.isBreak ? 'Recess / Break' : (rp.subject?.name || 'Unknown'),
                        teacher: rp.isBreak ? '' : teacherName,
                        room: rp.isBreak ? '' : (rp.room || 'TBD'),
                        isBreak: !!rp.isBreak,
                        isTeacherSubject: !rp.isBreak && isTeacherSubject
                    };
                }
            });

            return { id: timeSlot, timeSlot, subjects: slotSubjects };
        });
    }, [rawPeriods, user?.id, classData?.teacherSubjectIds, classData?.teacherId]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <CalendarDays className="text-primary" />
                        My Class Schedule
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">
                        Active Term: {selectedSessionName} • {selectedTermName}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {sessions.length > 0 && (
                        <FilterButton
                            label="Session"
                            value={selectedSessionName}
                            options={sessions.map((s: any) => s.name)}
                            onChange={(value) => setSelectedSessionName(value)}
                        />
                    )}
                    
                    <FilterButton
                        label="Term"
                        value={selectedTermName}
                        options={['First Term', 'Second Term', 'Third Term']}
                        onChange={(value) => setSelectedTermName(value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="h-[400px] w-full rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 animate-pulse flex items-center justify-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Schedule...</span>
                </div>
            ) : (
                <TeacherTimetableGrid periods={periods} days={days} />
            )}
        </div>
    );
}
