import { useState, useEffect } from "react";
import { X, Check, Search, AlertCircle, ChevronDown, Calendar as CalendarIcon, Layers, List, Clock, X as XIcon } from "lucide-react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { teacherService } from "@/lib/api/services/teacherService";
import { toast } from "react-toastify";
import { useDashboardStore } from "@/lib/api/hooks/useDashboardStore";

interface QuickAttendanceModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

interface Student {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
  studentCode: string;
}

export default function QuickAttendanceModal({ onClose, onSuccess }: QuickAttendanceModalProps) {
  const { selectedSchoolId } = useDashboardStore();
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: string; note: string }>>({});
  
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [viewMode, setViewMode] = useState<"list" | "swipe">("list");
  const [swipeIndex, setSwipeIndex] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  // Fetch teacher's classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      if (!selectedSchoolId) return;
      try {
        const response = await teacherService.getClasses();
        console.log("QuickAttendance classes response:", response);
        const classesList = Array.isArray(response) ? response : (response.classes || response.data || []);
        setClasses(classesList);
        if (classesList.length > 0) {
          setSelectedClass(classesList[0].id);
        }
      } catch (error) {
        console.error("Failed to load classes", error);
        toast.error("Failed to load your classes");
      } finally {
        setLoadingClasses(false);
      }
    };
    fetchClasses();
  }, [selectedSchoolId]);

  // Fetch students when a class is selected
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClass) return;
      setLoadingStudents(true);
      try {
        const studentsData = await teacherService.getStudents({ classId: selectedClass, limit: 100 });
        const studentsList = studentsData.students || (Array.isArray(studentsData) ? studentsData : []);
        setStudents(studentsList);
        console.log("Students loaded:", studentsList);
        
        // Initialize attendance data
        const initialData: Record<string, { status: string; note: string }> = {};
        studentsList.forEach((s: Student) => {
          initialData[s.id] = { status: "PRESENT", note: "" };
        });
        setAttendanceData(initialData);
      } catch (error) {
        console.error("Failed to load students", error);
        toast.error("Failed to load students for this class");
      } finally {
        setLoadingStudents(false);
      }
    };
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass, selectedSchoolId]);

  const handleMarkAll = (status: "PRESENT" | "ABSENT" | "LATE" | "EXCUSED") => {
    const newData = { ...attendanceData };
    students.forEach((s) => {
      newData[s.id] = { ...newData[s.id], status };
    });
    setAttendanceData(newData);
  };

  const handleSave = async () => {
    if (!selectedSchoolId || !selectedClass) return;
    
    const records = Object.entries(attendanceData).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      note: data.note,
    }));

    if (records.length === 0) {
      toast.error("No students to mark attendance for");
      return;
    }

    setSaving(true);
    try {
      await teacherService.saveClassAttendance(
        selectedSchoolId,
        selectedClass,
        new Date(date).toISOString(),
        records
      );
      toast.success("Attendance saved successfully");
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Failed to save attendance", error);
      toast.error(error.response?.data?.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Quick Attendance</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Record attendance securely for your classes</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Controls */}
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap gap-6 items-end bg-white dark:bg-slate-900">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
              Select Class
            </label>
            <div className="relative">
              <select 
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                disabled={loadingClasses}
                className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              >
                {loadingClasses ? (
                  <option>Loading classes...</option>
                ) : classes.length === 0 ? (
                  <option>No classes assigned</option>
                ) : (
                  classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))
                )}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
              Date
            </label>
            <div className="relative">
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full appearance-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold rounded-xl px-4 py-3 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0 justify-between">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode("list")} 
                className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <List size={14} /> List
              </button>
              <button 
                onClick={() => {
                  setViewMode("swipe");
                  setSwipeIndex(0);
                  setShowSummary(false);
                }} 
                className={`px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold transition-all ${viewMode === 'swipe' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <Layers size={14} /> Cards
              </button>
            </div>
            {viewMode === "list" && (
              <div className="flex items-center gap-2">
                <button onClick={() => handleMarkAll("PRESENT")} className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors">
                  All Present
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Student List or Swipe View */}
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 dark:bg-slate-900/50 flex flex-col">
          {loadingStudents ? (
            <div className="flex flex-col items-center justify-center h-40">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
              <p className="text-sm font-bold text-slate-500">Loading students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <AlertCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-4" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">No Students Found</p>
              <p className="text-xs text-slate-500 mt-1">This class does not have any enrolled students yet.</p>
            </div>
          ) : viewMode === "swipe" ? (
            <div className="flex-1 w-full flex flex-col items-center justify-center">
              {!showSummary && students[swipeIndex] && (
                <>
                  <div className="relative w-full h-[320px] max-w-[300px]">
                    <AnimatePresence>
                      {students.slice(swipeIndex, swipeIndex + 3).reverse().map((student) => {
                        const index = students.indexOf(student);
                        const isTop = index === swipeIndex;
                        const offset = index - swipeIndex;
                        return (
                          <SwipeCard 
                            key={student.id}
                            student={{ name: student.name, code: student.studentCode }}
                            isTop={isTop}
                            offset={offset}
                            onSwipe={(status) => {
                              setAttendanceData(prev => ({
                                ...prev,
                                [student.id]: { status: status.toUpperCase(), note: "" }
                              }));
                              if (swipeIndex < students.length - 1) {
                                setSwipeIndex(prev => prev + 1);
                              } else {
                                setShowSummary(true);
                              }
                            }}
                          />
                        );
                      })}
                    </AnimatePresence>
                  </div>
                  <div className="mt-8 flex gap-3 w-full justify-center max-w-[300px]">
                    <button onClick={() => {
                        setAttendanceData(prev => ({ ...prev, [students[swipeIndex].id]: { status: "ABSENT", note: "" } }));
                        if (swipeIndex < students.length - 1) setSwipeIndex(prev => prev + 1); else setShowSummary(true);
                      }} className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-red-100 dark:border-red-900/30 text-red-500 flex items-center justify-center hover:scale-105 transition-transform"><XIcon size={24} strokeWidth={3} /></button>
                    <button onClick={() => {
                        setAttendanceData(prev => ({ ...prev, [students[swipeIndex].id]: { status: "LATE", note: "" } }));
                        if (swipeIndex < students.length - 1) setSwipeIndex(prev => prev + 1); else setShowSummary(true);
                      }} className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-amber-100 dark:border-amber-900/30 text-amber-500 flex items-center justify-center hover:scale-105 transition-transform"><Clock size={24} strokeWidth={3} /></button>
                    <button onClick={() => {
                        setAttendanceData(prev => ({ ...prev, [students[swipeIndex].id]: { status: "EXCUSED", note: "" } }));
                        if (swipeIndex < students.length - 1) setSwipeIndex(prev => prev + 1); else setShowSummary(true);
                      }} className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-blue-100 dark:border-blue-900/30 text-blue-500 flex items-center justify-center hover:scale-105 transition-transform"><AlertCircle size={24} strokeWidth={3} /></button>
                    <button onClick={() => {
                        setAttendanceData(prev => ({ ...prev, [students[swipeIndex].id]: { status: "PRESENT", note: "" } }));
                        if (swipeIndex < students.length - 1) setSwipeIndex(prev => prev + 1); else setShowSummary(true);
                      }} className="w-14 h-14 rounded-full bg-white dark:bg-slate-800 shadow-lg border border-green-100 dark:border-green-900/30 text-green-500 flex items-center justify-center hover:scale-105 transition-transform"><Check size={24} strokeWidth={3} /></button>
                  </div>
                </>
              )}
              {showSummary && (
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check size={32} strokeWidth={3} />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">All Swiped!</h4>
                  <p className="text-sm text-slate-500 mt-1 mb-6">Review using the List view or Save Attendance below.</p>
                  <button onClick={() => setViewMode("list")} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800">
                    Review List
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student) => {
                const data = attendanceData[student.id] || { status: "PRESENT", note: "" };
                
                return (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black uppercase">
                        {student.name ? student.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2) : '?'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{student.name}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{student.studentCode}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                        {["PRESENT", "LATE", "ABSENT", "EXCUSED"].map((status) => {
                          const isActive = data.status === status;
                          return (
                            <button
                              key={status}
                              onClick={() => setAttendanceData(prev => ({ ...prev, [student.id]: { ...prev[student.id], status } }))}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                isActive 
                                  ? status === "PRESENT" ? "bg-emerald-500 text-white shadow-md"
                                  : status === "ABSENT" ? "bg-red-500 text-white shadow-md"
                                  : status === "LATE" ? "bg-amber-500 text-white shadow-md"
                                  : "bg-blue-500 text-white shadow-md"
                                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                              }`}
                            >
                              {status === "PRESENT" ? "P" : status === "ABSENT" ? "A" : status === "LATE" ? "L" : "E"}
                            </button>
                          );
                        })}
                      </div>
                      <input
                        type="text"
                        placeholder="Add note..."
                        value={data.note}
                        onChange={(e) => setAttendanceData(prev => ({ ...prev, [student.id]: { ...prev[student.id], note: e.target.value } }))}
                        className="w-32 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-emerald-500 dark:text-white"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving || students.length === 0 || !selectedClass}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-emerald-500/20"
          >
            {saving ? "Saving..." : "Save Attendance"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-component for the swipeable card
const SwipeCard = ({ 
  student, 
  onSwipe,
  isTop = true,
  offset = 0
}: { 
  student: { name: string, code: string }, 
  onSwipe: (status: "present" | "absent" | "late" | "excused") => void,
  isTop?: boolean,
  offset?: number
}) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Map position to rotation
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  
  // Opacities for the indicator overlays
  const presentOpacity = useTransform(x, [50, 150], [0, 1]);
  const absentOpacity = useTransform(x, [-50, -150], [0, 1]);
  const lateOpacity = useTransform(y, [-50, -150], [0, 1]); // Swipe up
  const excusedOpacity = useTransform(y, [50, 150], [0, 1]); // Swipe down

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 100;
    
    // Check horizontal swipe first
    if (info.offset.x > swipeThreshold) {
      onSwipe('present');
    } else if (info.offset.x < -swipeThreshold) {
      onSwipe('absent');
    } 
    // Then check vertical swipe
    else if (info.offset.y < -swipeThreshold) {
      onSwipe('late');
    } else if (info.offset.y > swipeThreshold) {
      onSwipe('excused');
    }
  };

  // Extract initials
  const initials = student.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <motion.div
      style={isTop ? { x, y, rotate } : {}}
      drag={isTop}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={isTop ? 0.8 : 0}
      onDragEnd={handleDragEnd}
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ 
        scale: isTop ? 1 : 1 - offset * 0.05, 
        opacity: isTop ? 1 : 1 - offset * 0.2, 
        y: isTop ? 0 : offset * 15,
        zIndex: 10 - offset
      }}
      exit={{ x: x.get() * 1.5, y: y.get() * 1.5, opacity: 0, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`absolute inset-0 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden ${isTop ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
    >
      {/* Dynamic Overlays */}
      <motion.div style={{ opacity: presentOpacity }} className="absolute inset-0 bg-emerald-500/20 z-10 flex items-center justify-center">
        <span className="text-4xl font-black text-emerald-500 border-4 border-emerald-500 rounded-xl px-4 py-2 rotate-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">PRESENT</span>
      </motion.div>
      <motion.div style={{ opacity: absentOpacity }} className="absolute inset-0 bg-red-500/20 z-10 flex items-center justify-center">
        <span className="text-4xl font-black text-red-500 border-4 border-red-500 rounded-xl px-4 py-2 -rotate-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">ABSENT</span>
      </motion.div>
      <motion.div style={{ opacity: lateOpacity }} className="absolute inset-0 bg-amber-500/20 z-10 flex items-center justify-center">
        <span className="text-4xl font-black text-amber-500 border-4 border-amber-500 rounded-xl px-4 py-2 -rotate-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">LATE</span>
      </motion.div>
      <motion.div style={{ opacity: excusedOpacity }} className="absolute inset-0 bg-blue-500/20 z-10 flex items-center justify-center">
        <span className="text-4xl font-black text-blue-500 border-4 border-blue-500 rounded-xl px-4 py-2 rotate-12 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">EXCUSED</span>
      </motion.div>

      {/* Card Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-0 pointer-events-none">
        <div className="w-24 h-24 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-3xl font-black mb-6">
          {initials}
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
          {student.name}
        </h2>
        <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">
          ID: {student.code}
        </p>
      </div>
      
      {/* Instructions hint */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/50 text-center border-t border-slate-100 dark:border-slate-800 pointer-events-none">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Swipe → Present | ← Absent | ↑ Late | ↓ Excused
        </p>
      </div>
    </motion.div>
  );
};
