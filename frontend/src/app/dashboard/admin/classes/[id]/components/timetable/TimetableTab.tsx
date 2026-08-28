'use client';
 
import React, { useState } from 'react';

import HeaderActions from './components/HeaderActions';
import FilterButton from './components/FilterButton';
import TimetableGrid from './components/TimetableGrid';
import AddPeriodModal from './components/AddPeriodModal';
import ReplicateModal from './components/ReplicateModal';
import ConfirmModal from './components/ConfirmModal';
import SlotDetailsModal from './components/SlotDetailsModal';
import { Period } from './components/types';

import { useClassTimetable, useAutoGenerateTimetable, useDeleteTimetablePeriod } from '@/lib/api/hooks/useClasses';
import { useSessions } from '@/lib/api/hooks/useSessions';
import { useSchoolSettings } from '@/lib/api/hooks/useSchool';
import { useParams } from 'next/navigation';
import { toast } from 'react-toastify';

interface TimetablePageProps {
  classData?: any;
  onNavigateToAttendance?: () => void;
}

export default function TimetablePage({ classData, onNavigateToAttendance }: TimetablePageProps) {
  const params = useParams();
  const classId = params.id as string;
  const schoolId = classData?.schoolId || "";
  const { data: settings } = useSchoolSettings(schoolId);

  // Sessions and Term Filters
  const { data: sessionsData } = useSessions(schoolId);
  const sessions = sessionsData?.data || [];
  const [selectedSessionName, setSelectedSessionName] = useState("");
  const [selectedTermName, setSelectedTermName] = useState("First Term");

  React.useEffect(() => {
    if (sessions && sessions.length > 0 && !selectedSessionName) {
      const now = new Date();
      let foundSession = null;
      let foundTerm = null;

      // Try to find the session and term that contains the current date
      for (const session of sessions) {
        if (session.termPeriods && session.termPeriods.length > 0) {
          const currentTermPeriod = session.termPeriods.find((tp: any) => {
            if (!tp.startDate || !tp.endDate) return false;
            const start = new Date(tp.startDate);
            const end = new Date(tp.endDate);
            return now >= start && now <= end;
          });
          
          if (currentTermPeriod) {
            foundSession = session;
            foundTerm = currentTermPeriod.term;
            break;
          }
        }
      }

      if (foundSession && foundTerm) {
        setSelectedSessionName(foundSession.name);
        setSelectedTermName(
          foundTerm === 'FIRST' ? 'First Term' :
          foundTerm === 'SECOND' ? 'Second Term' : 'Third Term'
        );
      } else {
        // Fallback to the active session and its currentTerm
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
    }
  }, [sessions, selectedSessionName]);

  const selectedSessionObj = sessions.find((s: any) => s.name === selectedSessionName);
  const selectedTerm = selectedTermName === 'First Term' ? 'FIRST' : selectedTermName === 'Second Term' ? 'SECOND' : 'THIRD';
  const termPeriodId = selectedSessionObj?.termPeriods?.find((tp: any) => tp.term === selectedTerm)?.id || "";

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Modal Scheduler states
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('07:30 - 08:30');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReplicateModalOpen, setIsReplicateModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [periodToEdit, setPeriodToEdit] = useState<any>(null);

  // Delete Confirmation states
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [periodIdToDelete, setPeriodIdToDelete] = useState<string | null>(null);

  // Read-only Details states
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPeriodDetails, setSelectedPeriodDetails] = useState<any>(null);

  // Real Data Hook using termPeriodId
  const { data: rawPeriods = [], isLoading: isTimetableLoading } = useClassTimetable(classId, termPeriodId);
  const autoGenerateMutation = useAutoGenerateTimetable(classId);
  const deleteMutation = useDeleteTimetablePeriod(classId);

  // Transform flat backend periods to a structured timetable grid
  const periods: Period[] = React.useMemo(() => {
    const defaultSlots = [
      '07:30 - 08:30',
      '08:30 - 09:30',
      '09:30 - 10:30',
      '10:30 - 11:30',
      '11:30 - 12:30', // Break slot
      '12:30 - 13:30',
      '13:30 - 14:30',
      '14:30 - 15:30',
      '15:30 - 16:30',
      '16:30 - 17:30',
      '17:30 - 18:00',
    ];

    if (rawPeriods.length === 0) {
      return defaultSlots.map(timeSlot => ({
        id: timeSlot,
        timeSlot,
        subjects: {}
      }));
    }

    // Group and sort unique time slots from existing periods
    const uniqueSlotsMap = new Map<string, { startTime: string; endTime: string }>();
    rawPeriods.forEach((rp: any) => {
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
      const slotSubjects: Record<string, any> = {};

      rawPeriods.forEach((rp: any) => {
        if (rp.startTime === slot.startTime && rp.endTime === slot.endTime) {
          slotSubjects[rp.day] = {
            id: rp.id,
            name: rp.isBreak ? 'Recess / Break' : (rp.subject?.name || 'Unknown'),
            teacher: rp.isBreak ? '' : (rp.teacher?.name || 'Staff'),
            room: rp.isBreak ? '' : (rp.room || 'TBD'),
            isBreak: !!rp.isBreak
          };
        }
      });

      return {
        id: timeSlot,
        timeSlot,
        subjects: slotSubjects
      };
    });
  }, [rawPeriods]);

  const handleAutoGenerateClick = () => {
    if (!termPeriodId) {
      toast.error('Please select a session and term first');
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirmAutoGenerate = async () => {
    try {
      await autoGenerateMutation.mutateAsync(termPeriodId);
      toast.success('Timetable periods auto-generated successfully!');
      setIsConfirmOpen(false);
    } catch (e) {
      console.error(e);
      toast.error('Failed to auto-generate timetable');
    }
  };

  const handleReplicate = () => {
    if (!termPeriodId) {
      toast.error('Please select a session and term to replicate from');
      return;
    }
    setIsReplicateModalOpen(true);
  };

  const handleAddPeriod = () => {
    setSelectedDay('Monday');
    setSelectedTimeSlot('07:30 - 08:30');
    setPeriodToEdit(null);
    setIsModalOpen(true);
  };

  const handleDownload = () => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.width = "0px";
    iframe.style.height = "0px";
    iframe.style.border = "none";
    iframe.style.opacity = "0";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      toast.error("Failed to generate PDF export.");
      return;
    }

    const classNameVal = classData?.name || "Class Timetable";
    const termVal = selectedTermName;
    const sessionVal = selectedSessionName;

    // Helper functions for formatting time inside the PDF
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

    const htmlContent = `
      <html>
        <head>
          <title>${classNameVal} - Timetable</title>
          <style>
            @page {
              size: A4 landscape;
              margin: 10mm;
            }
            body {
              font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
              color: #1e293b;
              margin: 0;
              padding: 10px;
              line-height: 1.3;
              background-color: #ffffff;
            }
            .header-container {
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 12px;
              margin-bottom: 20px;
            }
            .school-branding {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .school-logo {
              height: 48px;
              width: 48px;
              object-fit: contain;
              border-radius: 8px;
              border: 1px solid #cbd5e1;
            }
            .school-info h2 {
              font-size: 16px;
              font-weight: 800;
              margin: 0;
              color: #1e293b;
              text-transform: uppercase;
              letter-spacing: -0.3px;
            }
            .school-info p {
              font-size: 11px;
              color: #4b5563;
              margin: 2px 0 0 0;
              font-weight: 600;
            }
            .title-section {
              text-align: center;
            }
            .title-section h1 {
              font-size: 20px;
              font-weight: 800;
              margin: 0;
              color: #1e3a8a;
              text-transform: uppercase;
              letter-spacing: -0.5px;
            }
            .title-section p {
              font-size: 11px;
              color: #64748b;
              margin: 2px 0 0 0;
              font-weight: 600;
            }
            .meta-section {
              text-align: right;
            }
            .meta-badge {
              display: inline-block;
              background-color: #eff6ff;
              color: #1e40af;
              font-size: 11px;
              font-weight: 800;
              padding: 6px 12px;
              border-radius: 8px;
              border: 1px solid #bfdbfe;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: fixed;
            }
            th {
              background-color: #f8fafc !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              border: 1.5px solid #cbd5e1;
              text-align: center;
              padding: 10px 8px;
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              color: #334155;
              letter-spacing: 0.5px;
            }
            td {
              border: 1.5px solid #cbd5e1;
              padding: 8px;
              text-align: center;
              vertical-align: middle;
              height: 70px;
              font-size: 11px;
              word-wrap: break-word;
            }
            .time-cell {
              font-weight: 700;
              background-color: #f1f5f9 !important;
              color: #475569;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              width: 110px;
              font-size: 10px;
            }
            .subject-name {
              font-weight: 800;
              color: #0f172a;
              font-size: 12px;
              margin-bottom: 2px;
              text-transform: uppercase;
            }
            .teacher-name {
              font-weight: 600;
              color: #4b5563;
              font-size: 10px;
            }
            .room-name {
              font-weight: 700;
              color: #2563eb;
              font-size: 9px;
              background-color: #eff6ff !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              display: inline-block;
              padding: 2px 6px;
              border-radius: 4px;
              margin-top: 4px;
            }
            .break-cell {
              background-color: #fffbeb !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              font-weight: 800;
              color: #b45309;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .empty-cell {
              color: #94a3b8;
              font-style: italic;
              font-size: 10px;
            }
            .footer {
              margin-top: 20px;
              text-align: center;
              font-size: 9px;
              color: #94a3b8;
              border-top: 1px dashed #cbd5e1;
              padding-top: 10px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="school-branding">
              ${settings?.logo ? `<img class="school-logo" src="${settings.logo}" alt="School Logo" />` : ''}
              <div class="school-info">
                <h2>${settings?.schoolName || classData?.school?.name || 'Academic Institution'}</h2>
                <p>Class: ${classNameVal}</p>
              </div>
            </div>
            <div class="title-section">
              <h1>Weekly Timetable</h1>
              <p>Academic Year Schedule | Term period calendar</p>
            </div>
            <div class="meta-section">
              <span class="meta-badge">${sessionVal} &bull; ${termVal}</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 120px;">Time / Period</th>
                ${days.map(day => `<th>${day}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${periods.map(period => `
                <tr>
                  <td class="time-cell">${formatSlotTo12Hour(period.timeSlot)}</td>
                  ${days.map(day => {
                    const subject = period.subjects[day];
                    if (subject) {
                      if (subject.isBreak) {
                        return `<td class="break-cell">${subject.name || 'Recess / Break'}</td>`;
                      } else {
                        return `
                          <td>
                            <div class="subject-name">${subject.name}</div>
                            <div class="teacher-name">${subject.teacher || 'Staff'}</div>
                            <div class="room-name">Room: ${subject.room || 'TBD'}</div>
                          </td>
                        `;
                      }
                    } else {
                      return `<td class="empty-cell">-</td>`;
                    }
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            Generated via Qefas Prep Hub Calendar Suite on ${new Date().toLocaleDateString()}
          </div>
        </body>
      </html>
    `;

    doc.write(htmlContent);
    doc.close();

    // Trigger printing once iframe document loading finishes and image loads
    const triggerPrint = () => {
      if (iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };

    const img = doc.querySelector('.school-logo') as HTMLImageElement | null;
    if (img && !img.complete) {
      img.onload = triggerPrint;
      img.onerror = triggerPrint;
      // Safety timeout in case image loading hangs
      setTimeout(triggerPrint, 3000);
    } else {
      setTimeout(triggerPrint, 1000);
    }
  };


  const handleCellClick = (day: string, timeSlot: string) => {
    setSelectedDay(day);
    setSelectedTimeSlot(timeSlot);

    // Check if there is an existing period in the clicked slot to show details for
    const [start, end] = timeSlot.split(' - ');
    const matchedPeriod = rawPeriods.find((rp: any) => 
      rp.day === day && 
      rp.startTime === start && 
      rp.endTime === end
    );

    if (matchedPeriod) {
      setSelectedPeriodDetails({
        id: matchedPeriod.id,
        subjectId: matchedPeriod.subjectId || '',
        subjectName: matchedPeriod.isBreak ? 'Recess / Break' : (matchedPeriod.subject?.name || 'Unknown Subject'),
        teacherId: matchedPeriod.teacherId || '',
        teacherName: matchedPeriod.isBreak ? '' : (matchedPeriod.teacher?.name || 'Staff'),
        room: matchedPeriod.room || '',
        startTime: matchedPeriod.startTime,
        endTime: matchedPeriod.endTime,
        isBreak: !!matchedPeriod.isBreak,
        breakLabel: matchedPeriod.breakLabel || 'Recess / Break'
      });
    } else {
      setSelectedPeriodDetails(null);
    }
    
    setIsDetailsModalOpen(true);
  };

  const handleEditSubject = (periodId: string) => {
    const matchedPeriod = rawPeriods.find((rp: any) => rp.id === periodId);
    if (matchedPeriod) {
      setSelectedDay(matchedPeriod.day);
      setSelectedTimeSlot(`${matchedPeriod.startTime} - ${matchedPeriod.endTime}`);
      setPeriodToEdit({
        id: matchedPeriod.id,
        subjectId: matchedPeriod.subjectId || '',
        teacherId: matchedPeriod.teacherId || '',
        room: matchedPeriod.room || '',
        startTime: matchedPeriod.startTime,
        endTime: matchedPeriod.endTime,
        isBreak: !!matchedPeriod.isBreak,
        breakLabel: matchedPeriod.breakLabel || 'Recess / Break'
      });
      setIsModalOpen(true);
    }
  };

  const handleDeleteSubject = (periodId: string) => {
    setPeriodIdToDelete(periodId);
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!periodIdToDelete) return;
    try {
      await deleteMutation.mutateAsync(periodIdToDelete);
      setIsDeleteConfirmOpen(false);
      setPeriodIdToDelete(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAttendance = (periodId: string) => {
    onNavigateToAttendance?.();
  };

  return (
    <div className="w-full mt-6">
      {/* Header Section */}
      <header className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-gray-900 dark:text-white text-xl font-bold">
            Class Timetable
          </h2>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Configure classes schedules and hourly slot intervals
          </p>
        </div>
        
        <HeaderActions
          onAutoGenerate={handleAutoGenerateClick}
          onAddPeriod={handleAddPeriod}
          onDownload={handleDownload}
          onReplicate={handleReplicate}
        />
      </header>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
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

      {/* Timetable Grid */}
      <div className="w-full">
        {isTimetableLoading ? (
          <div className="overflow-x-auto rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 animate-pulse">
            <div className="grid" style={{ 
              gridTemplateColumns: `minmax(120px, 1fr) repeat(${days.length}, minmax(200px, 1fr))` 
            }}>
              {/* Headers */}
              <div className="p-4 border-b border-r border-gray-200 dark:border-[#364563] bg-slate-50 dark:bg-slate-900/50">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 animate-pulse" />
              </div>
              {days.map((day) => (
                <div key={day} className="p-4 border-b border-r border-gray-200 dark:border-[#364563] last:border-r-0 bg-slate-50 dark:bg-slate-900/50">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20 animate-pulse" />
                </div>
              ))}
              
              {/* Rows */}
              {[1, 2, 3, 4, 5].map((rowIdx) => (
                <React.Fragment key={rowIdx}>
                  <div className="p-4 flex items-center justify-center border-b border-r border-gray-200 dark:border-[#364563] bg-slate-50/50 dark:bg-slate-900/10">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24 animate-pulse" />
                  </div>
                  {days.map((day, dayIdx) => (
                    <div key={dayIdx} className="p-4 border-b border-r border-gray-200 dark:border-[#364563] last:border-r-0">
                      <div className="h-16 rounded-lg border-2 border-dashed border-slate-100 dark:border-slate-800/50 bg-slate-50/20 dark:bg-slate-900/10 animate-pulse" />
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        ) : (
          <TimetableGrid
            periods={periods}
            days={days}
            onCellClick={handleCellClick}
            onEdit={handleEditSubject}
            onDelete={handleDeleteSubject}
            onMarkAttendance={handleMarkAttendance}
          />
        )}
      </div>

      {/* Popup Scheduler Modal */}
      <AddPeriodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        classId={classId}
        day={selectedDay}
        timeSlot={selectedTimeSlot}
        classData={classData}
        periodToEdit={periodToEdit}
        termPeriodId={termPeriodId}
      />

      {/* Replicate Timetable Modal */}
      <ReplicateModal
        isOpen={isReplicateModalOpen}
        onClose={() => setIsReplicateModalOpen(false)}
        classId={classId}
        sourceTermPeriodId={termPeriodId}
        sourceSessionName={selectedSessionName}
        sourceTermName={selectedTermName}
        sessions={sessions}
      />

      {/* Custom Confirmation Modal for Auto-Generate */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmAutoGenerate}
        title="Auto-Generate Timetable"
        message="Are you sure you want to auto-generate the timetable for this term? Any existing timetable periods scheduled for this term will be permanently replaced."
        confirmText="Generate"
        cancelText="Cancel"
        isDanger={true}
        isLoading={autoGenerateMutation.isPending}
      />

      {/* Custom Confirmation Modal for Deleting Period */}
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setPeriodIdToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Timetable Period"
        message="Are you sure you want to remove this period from the timetable? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        isLoading={deleteMutation.isPending}
      />

      {/* Read-only Slot Details Modal */}
      <SlotDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedPeriodDetails(null);
        }}
        day={selectedDay}
        timeSlot={selectedTimeSlot}
        period={selectedPeriodDetails}
        onEdit={() => {
          if (selectedPeriodDetails) {
            setPeriodToEdit({
              id: selectedPeriodDetails.id,
              subjectId: selectedPeriodDetails.subjectId,
              teacherId: selectedPeriodDetails.teacherId,
              room: selectedPeriodDetails.room,
              startTime: selectedPeriodDetails.startTime,
              endTime: selectedPeriodDetails.endTime,
              isBreak: selectedPeriodDetails.isBreak,
              breakLabel: selectedPeriodDetails.breakLabel
            });
            setIsModalOpen(true);
          }
        }}
        onDelete={() => {
          if (selectedPeriodDetails) {
            handleDeleteSubject(selectedPeriodDetails.id);
          }
        }}
        onMarkAttendance={() => {
          if (selectedPeriodDetails) {
            handleMarkAttendance(selectedPeriodDetails.id);
          }
        }}
        onAdd={() => {
          setPeriodToEdit(null);
          setIsModalOpen(true);
        }}
      />
    </div>
  );
}