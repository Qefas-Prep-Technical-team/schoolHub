"use client"
import { useState, useMemo } from 'react'
import TimetableToolbar from './TimetableToolbar'
import TeacherTimetableGrid, { TeacherPeriod } from './TeacherTimetableGrid'
import AddScheduleModal from './AddScheduleModal'
import { useTeacherTimetable } from '@/lib/api/hooks/useAdmin'
import { useSessions } from '@/lib/api/hooks/useSessions'
import { useSchoolProfile } from '@/lib/api/hooks/useSchool'
import FilterButton from '../../../classes/[id]/components/timetable/components/FilterButton'
import { CalendarDays, Loader2 } from 'lucide-react'
import { format, addWeeks, startOfWeek, endOfWeek } from 'date-fns'
import React from 'react'

interface SchedulePageProps {
  teacher: any
  teacherId: string
  primaryColor: string
  schoolId: string
}

export default function SchedulePage({ teacher, teacherId, primaryColor, schoolId }: SchedulePageProps) {
  
  // Sessions and Term Filters
  const { data: sessionsData } = useSessions(schoolId);
  const { data: schoolRes } = useSchoolProfile(schoolId);
  const school = schoolRes?.data || schoolRes || {};
  
  const sessions = sessionsData?.data || [];
  const [selectedSessionName, setSelectedSessionName] = useState("");
  const [selectedTermName, setSelectedTermName] = useState("First Term");

  React.useEffect(() => {
    if (sessions && sessions.length > 0 && !selectedSessionName) {
      const activeSession = sessions.find((s: any) => s.isActive);
      if (activeSession) {
        setSelectedSessionName(activeSession.name);
        setSelectedTermName(
          activeSession.currentTerm === 'FIRST' ? 'First Term' :
          activeSession.currentTerm === 'SECOND' ? 'Second Term' : 'Third Term'
        );
      } else {
        setSelectedSessionName(sessions[0].name);
        setSelectedTermName('First Term');
      }
    }
  }, [sessions, selectedSessionName]);

  const selectedSessionObj = sessions.find((s: any) => s.name === selectedSessionName);
  const selectedTerm = selectedTermName === 'First Term' ? 'FIRST' : selectedTermName === 'Second Term' ? 'SECOND' : 'THIRD';
  const termPeriodId = selectedSessionObj?.termPeriods?.find((tp: any) => tp.term === selectedTerm)?.id || "";

  const { data: timetableData, isLoading } = useTeacherTimetable(teacherId, termPeriodId, schoolId)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<any>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 })
  
  const currentWeekLabel = `${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd, yyyy')}`

  // Transform flat array into TeacherPeriod array
  const periods = useMemo(() => {
    const defaultSlots = [
      '07:30 - 08:30',
      '08:30 - 09:30',
      '09:30 - 10:30',
      '10:30 - 11:30',
      '11:30 - 12:30',
      '12:30 - 13:30',
      '13:30 - 14:30',
      '14:30 - 15:30',
      '15:30 - 16:30',
    ];

    if (!timetableData || timetableData.length === 0) {
      return defaultSlots.map(timeSlot => ({
        id: timeSlot,
        timeSlot,
        subjects: {}
      }));
    }

    // Group unique time slots
    const uniqueSlotsMap = new Map<string, { startTime: string; endTime: string }>();
    timetableData.forEach((rp: any) => {
      if (rp.startTime && rp.endTime) {
        const slot = `${rp.startTime} - ${rp.endTime}`;
        uniqueSlotsMap.set(slot, { startTime: rp.startTime, endTime: rp.endTime });
      }
    });

    const sortedSlots = Array.from(uniqueSlotsMap.values()).sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });

    return sortedSlots.map(slot => {
      const timeSlot = `${slot.startTime} - ${slot.endTime}`;
      const slotSubjects: Record<string, any[]> = {};

      timetableData.forEach((rp: any) => {
        if (rp.startTime === slot.startTime && rp.endTime === slot.endTime) {
          if (!slotSubjects[rp.day]) {
            slotSubjects[rp.day] = [];
          }
          
          if (rp.isBreak) {
            // Prevent duplicate breaks causing false clashes
            const existingBreak = slotSubjects[rp.day].find(s => s.isBreak && s.breakLabel === rp.breakLabel);
            if (!existingBreak) {
              slotSubjects[rp.day].push({
                id: rp.id,
                name: 'Recess / Break',
                className: '',
                room: '',
                isAssigned: true, // Breaks are universal
                isBreak: true,
                breakLabel: rp.breakLabel || 'Recess / Break'
              });
            }
          } else {
            slotSubjects[rp.day].push({
              id: rp.id,
              name: rp.subject?.name || 'Unknown',
              className: rp.class?.name || 'Unknown Class',
              room: rp.room || 'TBD',
              isAssigned: rp.teacherId === teacherId,
              isBreak: false,
              breakLabel: null
            });
          }
        }
      });

      return {
        id: timeSlot,
        timeSlot,
        subjects: slotSubjects
      };
    });
  }, [timetableData, teacherId]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-slate-500 font-medium">Loading schedule...</p>
      </div>
    )
  }

  const handlePreviousWeek = () => {
    setCurrentDate(addWeeks(currentDate, -1))
  }

  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1))
  }

  const handleAddClass = () => {
    setSelectedPeriod(null)
    setIsModalOpen(true)
  }

  const handlePrint = async () => {
    try {
      setIsExporting(true)
      const jsPDF = (await import('jspdf')).default
      const autoTable = (await import('jspdf-autotable')).default

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: 'a4'
      })

      // Try to load school logo
      let logoImg: HTMLImageElement | null = null;
      if (school?.logo) {
        try {
          logoImg = new Image();
          logoImg.crossOrigin = 'Anonymous';
          logoImg.src = school.logo;
          await new Promise((resolve, reject) => {
            if (!logoImg) return reject();
            logoImg.onload = resolve;
            logoImg.onerror = reject;
            setTimeout(reject, 3000); // 3s timeout
          });
        } catch (e) {
          console.warn('Could not load school logo for PDF', e);
          logoImg = null;
        }
      }

      // Add Headers
      const startX = 40;
      let textX = startX;
      
      if (logoImg) {
         // Draw logo 40x40
         pdf.addImage(logoImg, 'PNG', startX, 30, 40, 40);
         textX = startX + 50;
      }

      // School Name
      pdf.setFontSize(18)
      pdf.setTextColor(15, 23, 42) // slate-900
      pdf.text(school?.name || 'School Name', textX, 45)
      
      // School Motto & Phone
      pdf.setFontSize(10)
      pdf.setTextColor(100, 116, 139) // slate-500
      const mottoText = school?.motto ? `"${school.motto}"` : '';
      const phoneText = school?.phone ? `Tel: ${school.phone}` : '';
      const subHeaderText = [mottoText, phoneText].filter(Boolean).join(' | ');
      if (subHeaderText) pdf.text(subHeaderText, textX, 58)

      // Timetable Title
      pdf.setFontSize(14)
      pdf.setTextColor(15, 23, 42) // slate-900
      pdf.text(`Timetable - ${teacher?.name || 'Teacher'}`, textX, 75)
      
      // Session and Term
      pdf.setFontSize(10)
      pdf.setTextColor(100, 116, 139) // slate-500
      pdf.text(`${selectedSessionName} | ${selectedTermName}`, textX, 88)

      // Add Generation Date
      pdf.setFontSize(9)
      const dateStr = `Generated: ${new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}`
      const pageWidth = pdf.internal.pageSize.getWidth()
      pdf.text(dateStr, pageWidth - 40 - pdf.getTextWidth(dateStr), 40)

      // Map Data to Table
      const tableData = periods.map((p: any) => {
        return [
          p.timeSlot,
          ...days.map(day => {
            const slots = p.subjects[day];
            if (!slots || slots.length === 0) return '';
            const realClasses = slots.filter((s: any) => !s.isBreak);
            const isClash = realClasses.length > 1;
            
            return slots.map((s: any) => {
              if (s.isBreak) return s.breakLabel || 'Break';
              if (isClash) return `(Clash)\n${s.name}\n[${s.className}]`;
              if (!s.isAssigned) return `(Unassigned)\n${s.name}\n[${s.className}]\nRoom: ${s.room}`;
              return `${s.name}\n[${s.className}]\nRoom: ${s.room}`;
            }).join('\n\n---\n\n');
          })
        ]
      })

      // Generate Table
      autoTable(pdf, {
        startY: 105,
        head: [['Time', ...days]],
        body: tableData,
        theme: 'grid',
        styles: {
          fontSize: 9,
          valign: 'middle',
          halign: 'center',
          cellPadding: 10,
          minCellHeight: 45,
          lineColor: [226, 232, 240], // slate-200
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: [30, 41, 59], // slate-800
          textColor: 255,
          fontStyle: 'bold',
          fontSize: 10,
        },
        columnStyles: {
          0: { cellWidth: 80, fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [71, 85, 105] }, // Time col
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // slate-50
        },
        didParseCell: function(data: any) {
          if (data.section === 'body' && data.column.index > 0) {
            const val = data.cell.raw as string;
            if (val === 'Recess / Break' || val === 'Break' || val.includes('Break')) {
              data.cell.styles.fillColor = [254, 243, 199]; // amber-100
              data.cell.styles.textColor = [180, 83, 9]; // amber-700
              data.cell.styles.fontStyle = 'bold';
            } else if (val.includes('(Clash)')) {
              data.cell.styles.fillColor = [254, 226, 226]; // red-100
              data.cell.styles.textColor = [153, 27, 27]; // red-800
            } else if (val.includes('(Unassigned)')) {
              data.cell.styles.fillColor = [241, 245, 249]; // slate-100
              data.cell.styles.textColor = [100, 116, 139]; // slate-500
              data.cell.styles.fontStyle = 'italic';
            } else if (val !== '') {
              data.cell.styles.fillColor = [240, 249, 255]; // sky-50
              data.cell.styles.textColor = [3, 105, 161]; // sky-700
              data.cell.styles.fontStyle = 'bold';
            }
          }
        }
      })

      pdf.save(`timetable_${teacher?.name?.replace(/\s+/g, '_') || 'teacher'}.pdf`)
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleClassClick = (periodId: string) => {
    const period = timetableData.find((p: any) => p.id === periodId)
    if (period) {
      setSelectedPeriod({
        id: period.id,
        classId: period.classId,
        subjectId: period.subjectId,
        day: period.day,
        startTime: period.startTime,
        endTime: period.endTime,
        room: period.room,
      })
      setIsModalOpen(true)
    }
  }

  const handleEmptySlotClick = (day: string, timeSlot: string) => {
    const [start, end] = timeSlot.split(' - ')
    setSelectedPeriod({
      day,
      startTime: start || '',
      endTime: end || ''
    })
    setIsModalOpen(true)
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <TimetableToolbar
        currentWeek={currentWeekLabel}
        onPreviousWeek={handlePreviousWeek}
        onNextWeek={handleNextWeek}
        onAddClass={handleAddClass}
        onPrint={handlePrint}
        isExporting={isExporting}
      />

      <div className="flex items-center gap-3 mt-4 mb-2 relative z-50">
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
      
      <div className="mt-6" id="timetable-grid">
        <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Header Section */}
          <div className="px-6 py-6 bg-gradient-to-br from-blue-50 to-white dark:from-slate-900 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <CalendarDays size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {teacher?.name || 'Teacher'}'s Timetable
                </h2>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
                  <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded shadow-sm border border-slate-100 dark:border-slate-700">
                    {selectedSessionName}
                  </span>
                  <span>•</span>
                  <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded shadow-sm border border-slate-100 dark:border-slate-700">
                    {selectedTermName}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Generated On</p>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
          
          {/* Grid Section */}
          <div className="p-4 bg-slate-50/50 dark:bg-slate-900/20">
            <TeacherTimetableGrid
              periods={periods}
              days={days}
              onPeriodClick={handleClassClick}
              onEmptySlotClick={handleEmptySlotClick}
            />
          </div>
          
          {/* Footer Section */}
          <div className="px-6 py-4 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-xs font-semibold text-slate-400">
              Generated by SchoolHub System • Official Teacher Schedule
            </p>
          </div>
        </div>
      </div>

      <AddScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        teacherId={teacherId}
        teacherSubjects={teacher.professionalInfo?.subjects || []}
        teacherClasses={teacher.professionalInfo?.assignedClasses || []}
        initialData={selectedPeriod}
        schoolId={schoolId}
        termPeriodId={termPeriodId}
      />
    </div>
  )
}
