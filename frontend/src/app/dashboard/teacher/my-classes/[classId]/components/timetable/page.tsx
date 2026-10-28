'use client';

import React, { useState, useEffect } from 'react';
import { CalendarDays } from 'lucide-react';
import TeacherTimetableGrid from './TeacherTimetableGrid';
import { useClassTimetable } from '@/lib/api/hooks/useClasses';
import { useSessions } from '@/lib/api/hooks/useSessions';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useTeacherProfile, useTeacherSubjects } from '@/lib/api/hooks/useTeacher';
import { useQuery } from '@tanstack/react-query';
import { teacherService } from '@/lib/api/services/teacherService';
import { Period } from '@/app/dashboard/admin/classes/[id]/components/timetable/components/types';
import { useParams } from 'next/navigation';

interface TimetablePageProps {
  classData?: any;
}

import FilterButton from '@/app/dashboard/admin/classes/[id]/components/timetable/components/FilterButton';
import { TabSkeleton } from '../TabSkeleton';

export default function TimetablePage({ classData }: TimetablePageProps) {
    const params = useParams();
    const classId = params.classId as string;
    const { user } = useAuthStore();
    const schoolId = (user as any)?.school?.id || user?.schools?.[0]?.schoolId || classData?.schoolId || "";
    
    // Teacher Profile & Assigned Subjects
    const { data: teacherProfile } = useTeacherProfile();
    const { data: teacherSubjectsList = [] } = useTeacherSubjects(schoolId);
    const { data: classDetailData } = useQuery({
        queryKey: ['class-detail', classId],
        queryFn: () => teacherService.getClassDetail(classId),
        staleTime: 1000 * 60 * 10,
        enabled: !!classId,
    });

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
    const termPeriodId = selectedSessionObj?.termPeriods?.find((tp: any) => tp.term === selectedTerm)?.id;

    // Fetch timetable for specific term, and general fallback
    const { data: rawPeriods = [], isLoading: isTermLoading } = useClassTimetable(classId, termPeriodId);
    const { data: fallbackPeriods = [], isLoading: isFallbackLoading } = useClassTimetable(classId, undefined);

    const isLoading = isTermLoading && isFallbackLoading;
    const effectivePeriods = rawPeriods.length > 0 ? rawPeriods : fallbackPeriods;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    // Collect all subject IDs and names assigned to this teacher
    const teacherSubjectIdSet = React.useMemo(() => {
        const ids = new Set<string>();
        const fromClass = (classDetailData as any)?.classInfo?.teacherSubjectIds || (classDetailData as any)?.teacherSubjectIds || [];
        if (Array.isArray(fromClass)) {
            fromClass.forEach((id: string) => ids.add(id));
        }
        if (Array.isArray(teacherSubjectsList)) {
            teacherSubjectsList.forEach((s: any) => {
                if (s.id) ids.add(s.id);
                if (s.subjectId) ids.add(s.subjectId);
                if (s.subject?.id) ids.add(s.subject.id);
            });
        }
        if (classData?.subjects && Array.isArray(classData.subjects)) {
            classData.subjects.forEach((cs: any) => {
                const sub = cs.subject || cs;
                const tIds = [user?.id, teacherProfile?.id, (teacherProfile as any)?.userId].filter(Boolean);
                if (cs.teacherId && tIds.includes(cs.teacherId)) ids.add(sub.id);
                if (sub.teacherId && tIds.includes(sub.teacherId)) ids.add(sub.id);
            });
        }
        return ids;
    }, [classDetailData, teacherSubjectsList, classData, user?.id, teacherProfile?.id]);

    const teacherSubjectNamesSet = React.useMemo(() => {
        const names = new Set<string>();
        if (Array.isArray(teacherSubjectsList)) {
            teacherSubjectsList.forEach((s: any) => {
                const n = s.name || s.subject?.name;
                if (n) names.add(n.toLowerCase().trim());
            });
        }
        return names;
    }, [teacherSubjectsList]);

    const periods: Period[] = React.useMemo(() => {
        const defaultSlots = [
            '07:30 - 08:30', '08:30 - 09:30', '09:30 - 10:30', '10:30 - 11:30',
            '11:30 - 12:30', '12:30 - 13:30', '13:30 - 14:30', '14:30 - 15:30',
            '15:30 - 16:30'
        ];

        if (effectivePeriods.length === 0) {
            return defaultSlots.map(timeSlot => ({ id: timeSlot, timeSlot, subjects: {} }));
        }

        const uniqueSlotsMap = new Map<string, { startTime: string; endTime: string }>();
        effectivePeriods.forEach((rp: any) => {
            if (rp.startTime && rp.endTime) {
                const slot = `${rp.startTime} - ${rp.endTime}`;
                uniqueSlotsMap.set(slot, { startTime: rp.startTime, endTime: rp.endTime });
            }
        });

        const sortedSlots = Array.from(uniqueSlotsMap.values()).sort((a, b) => a.startTime.localeCompare(b.startTime));

        return sortedSlots.map(slot => {
            const timeSlot = `${slot.startTime} - ${slot.endTime}`;
            const slotSubjects: Record<string, any> = {};

            effectivePeriods.forEach((rp: any) => {
                if (rp.startTime === slot.startTime && rp.endTime === slot.endTime) {
                    const teacherName = rp.teacher?.name || rp.teacher?.user?.name || 'Staff';

                    const subName = (rp.subject?.name || '').toLowerCase().trim();
                    const isMySubject = Boolean(
                        (rp.subjectId && teacherSubjectIdSet.has(rp.subjectId)) ||
                        (rp.subject?.id && teacherSubjectIdSet.has(rp.subject.id)) ||
                        (subName && teacherSubjectNamesSet.has(subName))
                    );

                    const isMyTeacherRecord = Boolean(
                        (user?.id && (rp.teacher?.userId === user.id || rp.teacher?.id === user.id || rp.teacherId === user.id)) ||
                        (teacherProfile?.id && (rp.teacher?.id === teacherProfile.id || rp.teacherId === teacherProfile.id))
                    );

                    const isTeacherSubject = isMySubject || isMyTeacherRecord;

                    slotSubjects[rp.day] = {
                        id: rp.id,
                        name: rp.isBreak ? (rp.breakLabel || 'Recess / Break') : (rp.subject?.name || 'Subject Period'),
                        teacher: rp.isBreak ? '' : teacherName,
                        room: rp.isBreak ? '' : (rp.room || 'Classroom'),
                        isBreak: !!rp.isBreak,
                        isTeacherSubject: !rp.isBreak && isTeacherSubject
                    };
                }
            });

            return { id: timeSlot, timeSlot, subjects: slotSubjects };
        });
    }, [effectivePeriods, user?.id, teacherProfile?.id, teacherSubjectIdSet, teacherSubjectNamesSet]);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <CalendarDays className="text-emerald-600" />
                        My Class Schedule
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">
                        Active Term: {selectedSessionName} • {selectedTermName}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
                <TabSkeleton tabId="timetable" />
            ) : (
                <TeacherTimetableGrid periods={periods} days={days} />
            )}
        </div>
    );
}
