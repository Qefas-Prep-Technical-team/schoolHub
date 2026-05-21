'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, BookOpen, Check, Search } from 'lucide-react';
import { useUpdateClass, useAllTeachers } from '@/lib/api/hooks/useClasses';
import { classService } from '../../services/classService';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { apiClient } from '@/lib/api/client';
import { useSchoolProfile } from '@/lib/api/hooks/useSchool';
import { useSessions } from '@/lib/api/hooks/useSessions';

interface ManageClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: any;
}

const ManageClassModal: React.FC<ManageClassModalProps> = ({ 
  isOpen, 
  onClose, 
  classData 
}) => {
  const [name, setName] = useState(classData?.name || '');
  const [section, setSection] = useState(classData?.section || '');
  const [term, setTerm] = useState(classData?.term || '');
  const [session, setSession] = useState(classData?.session || '');
  const [level, setLevel] = useState(classData?.level || '');
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teacherSearchTerm, setTeacherSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [loadingInitial, setLoadingInitial] = useState(true);

  const { user } = useAuthStore();
  const updateClassMutation = useUpdateClass(classData?.id);
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const { data: schoolProfile } = useSchoolProfile(schoolId);
  const { data: sessionsResponse } = useSessions(schoolId);
  const availableLevels = schoolProfile?.levels || [];
  const schoolSessions = sessionsResponse?.data || [];

  // Initialize from classData
  useEffect(() => {
    if (classData) {
      setName(classData.name || '');
      setSection(classData.section || '');
      setTerm(classData.term || '');
      setSession(classData.session || '');
      setLevel(classData.level || '');
      if (classData.teachers) {
        setSelectedTeacherIds((classData.teachers || []).map((t: any) => t.teacherId).filter(Boolean));
      }
      if (classData.enrollments) {
        setSelectedStudentIds((classData.enrollments || []).map((e: any) => e.studentId || e.student?.id).filter(Boolean));
      }
    }
  }, [classData]);

  // Fetch school data (teachers and students)
  useEffect(() => {
    const fetchSchoolData = async () => {
      if (!isOpen || !user?.email) return;
      
      setLoadingInitial(true);
      try {
        const statusRes = await apiClient.get(`/admin/admin-status/${user.email}`);
        const schoolId = statusRes.data.data.schoolAdmins?.[0]?.schoolId;
        
        if (schoolId) {
          const [teachersData, studentsData] = await Promise.all([
            classService.getSchoolTeachers(schoolId),
            classService.getSchoolStudents(schoolId)
          ]);
          setTeachers(teachersData || []);
          setStudents(studentsData || []);
        }
      } catch (error: any) {
        console.error("Failed to fetch school data:", error);
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchSchoolData();
  }, [isOpen, user?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateClassMutation.mutateAsync({
      name,
      section,
      term,
      session,
      level: level || undefined,
      teacherIds: selectedTeacherIds.filter(Boolean),
      studentIds: selectedStudentIds.filter(Boolean),
    });
    onClose();
  };

  const toggleTeacher = (teacherId: string) => {
    if (!teacherId) return;
    setSelectedTeacherIds(prev => 
      prev.includes(teacherId) 
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  const toggleStudent = (studentId: string) => {
    if (!studentId) return;
    setSelectedStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  if (!isOpen) return null;

  const filteredTeachers = (teachers || []).filter((t: any) => 
    t?.name?.toLowerCase().includes(teacherSearchTerm.toLowerCase()) ||
    t?.teacherCode?.toLowerCase().includes(teacherSearchTerm.toLowerCase())
  );

  const filteredStudents = (students || []).filter((s: any) => 
    s?.name?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    (s?.studentCode && s.studentCode.toLowerCase().includes(studentSearchTerm.toLowerCase())) ||
    (s?.email && s.email.toLowerCase().includes(studentSearchTerm.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Manage Class
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Update details and teacher assignments for {classData?.classCode}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Class Name
                </label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Class Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">No Level Assigned</option>
                  {availableLevels.map((lvl: string, idx: number) => (
                    <option key={idx} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Section / Room
                </label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="e.g., Room 101"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Term
                </label>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">Select Term</option>
                  <option value="First Term">First Term</option>
                  <option value="Second Term">Second Term</option>
                  <option value="Third Term">Third Term</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Session (Academic Year)
                </label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                >
                  <option value="">Select Session</option>
                  {schoolSessions.map((s: any) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Teachers Column */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Users size={18} className="text-primary" />
                  Assigned Teachers ({selectedTeacherIds.length})
                </label>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search teachers..."
                    value={teacherSearchTerm}
                    onChange={(e) => setTeacherSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                  />
                </div>

                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                  {loadingInitial ? (
                    <div className="py-4 text-center text-gray-500 text-sm">Loading teachers...</div>
                  ) : teachers.length === 0 ? (
                    <div className="py-4 text-center text-gray-500 text-sm italic">No teachers found</div>
                  ) : filteredTeachers.length === 0 ? (
                    <div className="py-4 text-center text-gray-500 text-sm italic">No matches</div>
                  ) : (
                    filteredTeachers.map((teacher: any) => (
                      <div 
                        key={teacher.id}
                        onClick={() => toggleTeacher(teacher.id)}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                          selectedTeacherIds.includes(teacher.id)
                            ? 'bg-primary/10 border-primary/20'
                            : 'hover:bg-gray-50 dark:hover:bg-white/5 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
                            {teacher.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                              {teacher.name}
                            </p>
                            <p className="text-[10px] text-gray-500 uppercase">
                              {teacher.teacherCode}
                            </p>
                          </div>
                        </div>
                        {selectedTeacherIds.includes(teacher.id) && (
                          <Check size={16} className="text-primary" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Students Column */}
              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Users size={18} className="text-blue-500" />
                  Assign Students ({selectedStudentIds.length})
                </label>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                  />
                </div>

                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                  {loadingInitial ? (
                    <div className="py-4 text-center text-gray-500 text-sm">Loading students...</div>
                  ) : students.length === 0 ? (
                    <div className="py-4 text-center text-gray-500 text-sm italic">No connected students</div>
                  ) : filteredStudents.length === 0 ? (
                    <div className="py-4 text-center text-gray-500 text-sm italic">No matches</div>
                  ) : (
                    filteredStudents.map((student: any) => (
                      <div 
                        key={student.id}
                        onClick={() => toggleStudent(student.id)}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                          selectedStudentIds.includes(student.id)
                            ? 'bg-blue-500/10 border-blue-500/20'
                            : 'hover:bg-gray-50 dark:hover:bg-white/5 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                            {student.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                              {student.name}
                            </p>
                            <p className="text-[10px] text-gray-500 truncate max-w-[120px]">
                              {student.studentCode} • {student.email}
                            </p>
                          </div>
                        </div>
                        {selectedStudentIds.includes(student.id) && (
                          <Check size={16} className="text-blue-500" />
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl font-medium transition-colors"
                disabled={updateClassMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 font-medium transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                disabled={updateClassMutation.isPending}
              >
                {updateClassMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ManageClassModal;
