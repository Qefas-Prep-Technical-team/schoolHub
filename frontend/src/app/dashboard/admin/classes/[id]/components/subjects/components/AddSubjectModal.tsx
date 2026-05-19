'use client';

import React, { useState } from 'react';
import { X, BookOpen, Clock, Calendar, Hash, Search, Check } from 'lucide-react';
import { Subject } from './types';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolTeachers } from '@/lib/api/hooks/useSchool';
import { useQueryClient } from '@tanstack/react-query';
import { classQueryKeys } from '@/lib/api/hooks/useClasses';
import { toast } from 'react-toastify';

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subjectData: Partial<Subject>) => void;
  classId: string;
}
type Semester = Subject["semester"];

const AddSubjectModal: React.FC<AddSubjectModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave,
  classId 
}) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'existing' | 'new'>('existing');
  const [schoolId, setSchoolId] = useState<string>("");
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    description: string;
    credits: number;
    semester: Semester;
    academicYear: string;
  }>({
    name: '',
    code: '',
    description: '',
    credits: 3,
    semester: 'fall',
    academicYear: '2024-2025'
  });

  React.useEffect(() => {
    if (isOpen && user?.email) {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          const statusRes = await apiClient.get(`/admin/admin-status/${user.email}`);
          const sId = statusRes.data.data.schoolAdmins?.[0]?.schoolId;
          setSchoolId(sId || "");

          if (sId) {
            const subsRes = await apiClient.get('/academic/subjects', { params: { schoolId: sId } });
            setAllSubjects(subsRes.data.data || []);
          }
        } catch (err) {
          console.error("Failed to fetch subjects", err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [isOpen, user?.email]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'existing') {
      if (selectedSubjectIds.length === 0) {
        toast.error("Please select at least one subject");
        return;
      }

      setIsLoading(true);
      try {
        await apiClient.post('/classes/subjects/attach', {
          classId,
          subjectIds: selectedSubjectIds,
        });
        toast.success("Subjects linked successfully");
        queryClient.invalidateQueries({ queryKey: classQueryKeys.detail(classId) });
        onSave({}); // Trigger refresh if needed
        onClose();
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to link subjects");
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsLoading(true);
      try {
        if (!schoolId) {
          toast.error("School context not established. Please try again.");
          setIsLoading(false);
          return;
        }

        // 1. Create the new subject in the school
        const createRes = await apiClient.post('/academic/subjects', {
          name: formData.name,
          code: formData.code,
          description: formData.description,
          schoolId,
          scope: 'SCHOOL',
        });
        
        const newSubjectId = createRes.data.data.id;

        // 2. Attach the subject to the class
        await apiClient.post('/classes/subjects/attach', {
          classId,
          subjectIds: [newSubjectId],
        });

        toast.success("Subject created and linked successfully");
        queryClient.invalidateQueries({ queryKey: classQueryKeys.detail(classId) });
        onSave({}); // Trigger refresh in parent if needed
        onClose();
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to create and link subject");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Add Subject
                </h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Manage Class Curriculum
                </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500"
              aria-label="Close"
              disabled={isLoading}
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('existing')}
              disabled={isLoading}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'existing' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'} disabled:opacity-50`}
            >
              Select Existing
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('new')}
              disabled={isLoading}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'new' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'} disabled:opacity-50`}
            >
              Create New
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'existing' ? (
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text"
                            placeholder="Search school subjects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={isLoading}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {isLoading && allSubjects.length === 0 ? (
                            <div className="flex justify-center py-10">
                                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : allSubjects
                            .filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map((subject) => {
                                const isSelected = selectedSubjectIds.includes(subject.id);
                                return (
                                    <div 
                                        key={subject.id}
                                        onClick={() => {
                                            if (isLoading) return;
                                            setSelectedSubjectIds(prev => 
                                                isSelected ? prev.filter(id => id !== subject.id) : [...prev, subject.id]
                                            );
                                        }}
                                        className={`
                                            flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border
                                            ${isSelected 
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 shadow-sm' 
                                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-800'}
                                            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                                        `}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                                                {subject.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className={`text-sm font-bold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                                                    {subject.name}
                                                </p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{subject.code}</p>
                                            </div>
                                        </div>
                                        {isSelected && <Check size={18} className="text-blue-600" />}
                                    </div>
                                );
                            })
                        }
                        {!isLoading && allSubjects.length === 0 && (
                            <div className="text-center py-10 text-slate-400 text-sm italic">
                                No subjects available in this school.
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1 shadow-none">
                    Subject Name
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Algebra II"
                      disabled={isLoading}
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                    Subject Code
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="e.g., MATH-201"
                      disabled={isLoading}
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all font-mono disabled:opacity-50"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      Credits
                    </label>
                    <select
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                      disabled={isLoading}
                      className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all appearance-none disabled:opacity-50"
                    >
                      {[1, 2, 3, 4, 5].map((credit) => (
                        <option key={credit} value={credit}>{credit} Credits</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                      Semester
                    </label>
                    <select
                      value={formData.semester}
                    onChange={(e) =>
                      setFormData({ ...formData, semester: e.target.value as Semester })
                    }
                    disabled={isLoading}
                    className="w-full px-3 py-3 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all appearance-none disabled:opacity-50"
                    >
                      <option value="fall">Fall Semester</option>
                      <option value="spring">Spring Semester</option>
                      <option value="summer">Summer Term</option>
                    </select>
                  </div>
                </div>
                </>
            )}
            
            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all text-sm font-bold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  activeTab === 'existing' ? `Link ${selectedSubjectIds.length > 0 ? selectedSubjectIds.length : ''} Subject(s)` : 'Create & Add'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSubjectModal;