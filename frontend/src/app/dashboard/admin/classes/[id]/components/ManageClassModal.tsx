'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, BookOpen, Check, Search } from 'lucide-react';
import { useUpdateClass, useAllTeachers } from '@/lib/api/hooks/useClasses';

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
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: allTeachers, isLoading: loadingTeachers } = useAllTeachers();
  const updateClassMutation = useUpdateClass(classData?.id);

  // Initialize selected teachers from classData
  useEffect(() => {
    if (classData?.teachers) {
      setSelectedTeacherIds(classData.teachers.map((t: any) => t.teacherId));
    }
  }, [classData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateClassMutation.mutateAsync({
      name,
      section,
      teacherIds: selectedTeacherIds
    });
    onClose();
  };

  const toggleTeacher = (teacherId: string) => {
    setSelectedTeacherIds(prev => 
      prev.includes(teacherId) 
        ? prev.filter(id => id !== teacherId)
        : [...prev, teacherId]
    );
  };

  if (!isOpen) return null;

  const filteredTeachers = allTeachers?.filter((t: any) => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.teacherCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
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
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <Users size={18} className="text-primary" />
                Assigned Teachers ({selectedTeacherIds.length})
              </label>
              
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search teachers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                />
              </div>

              <div className="max-h-[240px] overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                {loadingTeachers ? (
                  <div className="py-4 text-center text-gray-500">Loading teachers...</div>
                ) : filteredTeachers?.length === 0 ? (
                  <div className="py-4 text-center text-gray-500">No teachers found</div>
                ) : (
                  filteredTeachers?.map((teacher: any) => (
                    <div 
                      key={teacher.id}
                      onClick={() => toggleTeacher(teacher.id)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                        selectedTeacherIds.includes(teacher.id)
                          ? 'bg-primary/10 border-primary/20 border'
                          : 'hover:bg-gray-50 dark:hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                          {teacher.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {teacher.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {teacher.teacherCode}
                          </p>
                        </div>
                      </div>
                      {selectedTeacherIds.includes(teacher.id) && (
                        <Check size={18} className="text-primary" />
                      )}
                    </div>
                  ))
                )}
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
