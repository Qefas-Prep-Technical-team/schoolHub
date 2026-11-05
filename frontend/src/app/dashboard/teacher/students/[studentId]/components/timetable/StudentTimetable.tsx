"use client"

import { useMemo, useState } from 'react'
import { BookOpen, Clock, Coffee, Loader2, Mail, MapPin, CalendarX2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useClassTimetable } from '@/lib/api/hooks/useClasses'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'

export interface StudentTimetablePeriod {
    id: string
    day: string
    startTime: string
    endTime: string
    room?: string | null
    isBreak?: boolean
    breakLabel?: string | null
    subject?: { id: string; name: string; code?: string | null } | null
    teacher?: { id: string; name?: string | null; email?: string | null; profileImage?: string | null } | null
}

interface StudentTimetableProps {
    classId: string
    classNameLabel: string
    schoolName: string
    themeColor: string
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
const PALETTE = ['#10b981', '#6366f1', '#06b6d4', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#ef4444']

const toMinutes = (t: string) => {
    const [h, m] = (t || '0:0').split(':').map((v) => parseInt(v, 10))
    return (h || 0) * 60 + (m || 0)
}

const formatTime = (t: string) => {
    const mins = toMinutes(t)
    const h = Math.floor(mins / 60)
    const m = mins % 60
    const suffix = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 === 0 ? 12 : h % 12
    return `${h12}:${String(m).padStart(2, '0')} ${suffix}`
}

const normalizeDay = (d: string) => (d || '').toUpperCase()

export function StudentTimetable({ classId, classNameLabel, schoolName, themeColor }: StudentTimetableProps) {
    const { data, isLoading, isError } = useClassTimetable(classId)
    const [selected, setSelected] = useState<StudentTimetablePeriod | null>(null)
    const [mobileDay, setMobileDay] = useState(0)

    const periods = useMemo<StudentTimetablePeriod[]>(
        () => (Array.isArray(data) ? (data as StudentTimetablePeriod[]) : []),
        [data]
    )

    // Unique time slots derived from the class's real configured periods.
    const slots = useMemo(() => {
        const map = new Map<string, { startTime: string; endTime: string }>()
        periods.forEach((p) => map.set(`${p.startTime}-${p.endTime}`, { startTime: p.startTime, endTime: p.endTime }))
        return Array.from(map.values()).sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))
    }, [periods])

    const lookup = useMemo(() => {
        const m = new Map<string, StudentTimetablePeriod>()
        periods.forEach((p) => m.set(`${normalizeDay(p.day)}|${p.startTime}-${p.endTime}`, p))
        return m
    }, [periods])

    const subjectColor = useMemo(() => {
        const m = new Map<string, string>()
        periods.forEach((p) => {
            const key = p.subject?.id
            if (key && !m.has(key)) m.set(key, PALETTE[m.size % PALETTE.length])
        })
        return m
    }, [periods])

    const colorFor = (p: StudentTimetablePeriod) => (p.subject?.id ? subjectColor.get(p.subject.id) : undefined) || themeColor

    if (!classId) {
        return <EmptyState title="No class assigned" message="This student is not enrolled in a class at this school, so no timetable is available." />
    }
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-16 text-slate-400 gap-2">
                <Loader2 className="animate-spin" size={18} /> <span className="text-sm font-medium">Loading class timetable…</span>
            </div>
        )
    }
    if (isError) {
        return <EmptyState title="Unable to load timetable" message="The class timetable could not be retrieved. Please try again later." />
    }
    if (periods.length === 0) {
        return <EmptyState title="No timetable configured" message={`${classNameLabel} at ${schoolName} has no timetable periods set up yet.`} />
    }

    const renderCell = (p: StudentTimetablePeriod | undefined, compact: boolean) => {
        if (!p) return compact ? null : <p className="text-[11px] font-medium text-slate-400 italic">Free period</p>
        if (p.isBreak) {
            return (
                <div className="flex items-center gap-1.5 text-amber-600">
                    <Coffee size={compact ? 12 : 14} />
                    <span className={cn('font-black uppercase tracking-wider', compact ? 'text-[9px]' : 'text-xs')}>{p.breakLabel || 'Break'}</span>
                </div>
            )
        }
        return (
            <div className={cn(compact ? 'text-center px-1' : 'min-w-0')}>
                <p className={cn('font-black uppercase tracking-tight leading-tight truncate', compact ? 'text-[10px]' : 'text-xs')} style={{ color: colorFor(p) }}>
                    {p.subject?.name || 'Subject'}
                </p>
                <p className={cn('font-bold text-slate-400 uppercase mt-0.5 truncate', compact ? 'text-[8px]' : 'text-[10px] tracking-wider')}>
                    {[p.room, compact ? null : p.teacher?.name].filter(Boolean).join(' · ') || (compact ? '' : 'Unassigned teacher')}
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">{schoolName}</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5">{classNameLabel}</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5">{periods.filter((p) => !p.isBreak).length} periods / week</span>
            </div>

            {/* Mobile daily view */}
            <div className="md:hidden space-y-3">
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
                    {DAYS.map((d, idx) => (
                        <button
                            key={d}
                            type="button"
                            onClick={() => setMobileDay(idx)}
                            className={cn(
                                'flex-1 min-w-[60px] py-2 rounded-xl text-[11px] font-bold uppercase border transition-all',
                                mobileDay === idx
                                    ? 'bg-emerald-600 text-white border-emerald-600'
                                    : 'bg-slate-50 dark:bg-emerald-950/40 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'
                            )}
                        >
                            {d.slice(0, 3)}
                        </button>
                    ))}
                </div>
                {slots.map((s) => {
                    const p = lookup.get(`${DAYS[mobileDay]}|${s.startTime}-${s.endTime}`)
                    return (
                        <div
                            key={`m-${s.startTime}-${s.endTime}`}
                            onClick={() => p && !p.isBreak && setSelected(p)}
                            className={cn(
                                'p-3.5 rounded-xl border flex items-center gap-3 shadow-xs',
                                p && !p.isBreak ? 'cursor-pointer bg-white dark:bg-emerald-950/60 border-slate-200 dark:border-emerald-800/60 hover:border-emerald-500' : 'bg-slate-50/60 dark:bg-white/[0.01] border-slate-100 dark:border-white/5'
                            )}
                        >
                            <div className="w-20 text-center py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-[10px] font-bold font-mono text-slate-600 dark:text-slate-300 shrink-0">
                                {formatTime(s.startTime)}
                            </div>
                            {renderCell(p, false)}
                        </div>
                    )
                })}
            </div>

            {/* Desktop matrix */}
            <div className="hidden md:block overflow-x-auto custom-scrollbar pb-4">
                <div className="grid gap-2 sm:gap-3" style={{ gridTemplateColumns: `140px repeat(${slots.length}, minmax(110px, 1fr))` }}>
                    <div className="h-12" />
                    {slots.map((s) => (
                        <div key={`h-${s.startTime}-${s.endTime}`} className="h-12 flex flex-col items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-white/5">
                            <span>{formatTime(s.startTime)}</span>
                            <span className="text-[8px] opacity-70">{formatTime(s.endTime)}</span>
                        </div>
                    ))}
                    {DAYS.map((d) => (
                        <div key={d} className="contents">
                            <div className="h-20 flex items-center px-5 bg-slate-50/50 dark:bg-white/[0.01] rounded-2xl">
                                <span className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{d.slice(0, 3)}</span>
                            </div>
                            {slots.map((s) => {
                                const p = lookup.get(`${d}|${s.startTime}-${s.endTime}`)
                                return (
                                    <div
                                        key={`${d}-${s.startTime}-${s.endTime}`}
                                        onClick={() => p && !p.isBreak && setSelected(p)}
                                        className={cn(
                                            'h-20 rounded-2xl border flex items-center justify-center transition-all',
                                            p?.isBreak
                                                ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/40'
                                                : 'bg-white dark:bg-emerald-950/60 border-slate-100 dark:border-white/5',
                                            p && !p.isBreak && 'cursor-pointer hover:border-emerald-500/40 hover:shadow-md hover:-translate-y-0.5'
                                        )}
                                    >
                                        {renderCell(p, true)}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>

            <PeriodDialog period={selected} onClose={() => setSelected(null)} themeColor={themeColor} classNameLabel={classNameLabel} schoolName={schoolName} />
        </div>
    )
}

function EmptyState({ title, message }: { title: string; message: string }) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-16 gap-3">
            <div className="size-14 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                <CalendarX2 size={26} />
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{title}</p>
            <p className="text-xs text-slate-500 max-w-sm">{message}</p>
        </div>
    )
}

function PeriodDialog({ period, onClose, themeColor, classNameLabel, schoolName }: {
    period: StudentTimetablePeriod | null
    onClose: () => void
    themeColor: string
    classNameLabel: string
    schoolName: string
}) {
    const duration = period ? toMinutes(period.endTime) - toMinutes(period.startTime) : 0
    const day = period ? normalizeDay(period.day) : ''
    return (
        <Dialog open={!!period} onOpenChange={(o) => !o && onClose()}>
            <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 bg-white dark:bg-emerald-950/90 border border-slate-200 dark:border-emerald-800/60">
                <DialogHeader>
                    <div className="flex items-center gap-4">
                        <div className="size-14 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${themeColor}12`, color: themeColor }}>
                            <BookOpen size={28} />
                        </div>
                        <div className="text-left">
                            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Class Session</DialogTitle>
                            <DialogDescription className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                {day.charAt(0) + day.slice(1).toLowerCase()} · {period && `${formatTime(period.startTime)} – ${formatTime(period.endTime)}`}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {period && (
                    <div className="mt-6 space-y-4">
                        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: themeColor }}>{classNameLabel}</p>
                                {period.subject?.code && (
                                    <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest" style={{ color: themeColor, backgroundColor: `${themeColor}15` }}>
                                        {period.subject.code}
                                    </span>
                                )}
                            </div>
                            <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{period.subject?.name || 'Subject'}</h4>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                    <MapPin size={14} className="text-slate-400" /> {period.room || 'Room not set'}
                                </div>
                                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500">
                                    <Clock size={14} className="text-slate-400" /> {duration > 0 ? `${duration} Minutes` : '—'}
                                </div>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{schoolName}</p>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                            <div className="size-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-sm shrink-0 overflow-hidden">
                                {period.teacher?.profileImage
                                    // eslint-disable-next-line @next/next/no-img-element
                                    ? <img src={period.teacher.profileImage} alt={period.teacher.name || 'Teacher'} className="size-full object-cover" />
                                    : (period.teacher?.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{period.teacher?.name || 'No teacher assigned'}</p>
                                <p className="text-[10px] font-bold text-slate-400 truncate">{period.teacher?.email || 'Subject Teacher'}</p>
                            </div>
                            {period.teacher?.email && (
                                <a href={`mailto:${period.teacher.email}`} className="size-10 rounded-xl bg-white dark:bg-emerald-900/40 shadow-sm flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-colors">
                                    <Mail size={16} />
                                </a>
                            )}
                        </div>
                    </div>
                )}

                <button
                    type="button"
                    onClick={onClose}
                    className="mt-6 w-full h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all"
                >
                    Close
                </button>
            </DialogContent>
        </Dialog>
    )
}

