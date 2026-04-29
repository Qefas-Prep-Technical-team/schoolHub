'use client';

import { useState, useMemo } from 'react';
import StatsCard from './components/StatsCard';
import SearchBar from './components/SearchBar';
import FilterChip from './components/FilterChip';
import ClassGrid from './components/ClassGrid';
import { Button } from './components/ui/Button';
import { ClassData } from './components/types';
import { classService, Class } from './services/classService';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useClasses } from '@/lib/api/hooks/useClasses';
import { toast } from 'react-toastify';
import ClassModal from './components/ClassModal';

export default function ClassesOverviewPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({
    grade: 'all',
    classArm: 'all',
    homeroomTeacher: 'all',
    sessionTerm: 'all',
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  
  const { user } = useAuthStore();
  const activeSchoolId = user?.schools?.[0]?.schoolId;

  const { data: fetchClassesData, isLoading: loading, refetch: fetchClasses } = useClasses(activeSchoolId);
  const classes = (fetchClassesData as Class[]) || [];

  // Map real Class to ClassData for the UI components
  const mappedClassData: ClassData[] = useMemo(() => {
    return classes.map((c: Class) => ({
      id: c.id,
      name: c.name,
      section: c.section || 'N/A',
      teacher: {
        name: c.teachers?.[0]?.teacher?.name || 'No Teacher Assigned',
        avatarUrl: c.teachers?.[0]?.teacher?.avatarUrl || '',
      },
      teachers: c.teachers,
      _count: c._count,
      studentCount: c._count?.enrollments ?? c.enrollments?.length ?? 0,
      subjectCount: c._count?.subjects ?? c.subjects?.length ?? 0,
      timetableStatus: c.status === 'ACTIVE' ? 'complete' : 'pending',
      classCode: c.classCode,
      departments: c.departments?.map((d: any) => ({
        id: d.department.id,
        name: d.department.name
      })),
      isLive: c.status === 'ACTIVE' && Math.random() > 0.3, // Simulate some classes being "Live" now
      currentActivity: c.status === 'ACTIVE' ? (c.subjects?.[0]?.subject?.name || 'Study Session') : undefined,
    }));
  }, [classes]);

  // Filter classes based on search and filters
  const filteredClasses = useMemo(() => {
    return mappedClassData.filter((classItem) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          classItem.name.toLowerCase().includes(query) ||
          (classItem.teachers?.some((t: any) => t.teacher.name.toLowerCase().includes(query)));
        
        if (!matchesSearch) return false;
      }

      if (filters.classArm !== 'all' && filters.classArm !== classItem.section) {
        return false;
      }

      if (filters.homeroomTeacher !== 'all' && 
          !classItem.teachers?.some((t: any) => t.teacher.name === filters.homeroomTeacher)) {
        return false;
      }

      return true;
    });
  }, [searchQuery, filters, mappedClassData]);

  // Stats calculation
  const stats = useMemo(() => {
    const totalClasses = classes.length;
    const teachersAssigned = classes.filter((c: Class) => c.teachers && c.teachers.length > 0).length;
    const studentsTotal = classes.reduce((sum: number, c: Class) => sum + (c._count?.enrollments ?? c.enrollments?.length ?? 0), 0);
    const completeTimetables = mappedClassData.filter(c => c.timetableStatus === 'complete').length;
    const completionRate = totalClasses > 0 ? Math.round((completeTimetables / totalClasses) * 100) : 0;

    return [
      { id: 'total-classes', title: 'Total Classes', value: totalClasses, change: 0, changeType: 'increase' as const },
      { id: 'teachers-assigned', title: 'Teachers Assigned', value: teachersAssigned, change: 0, changeType: 'increase' as const },
      { id: 'students-enrolled', title: 'Students Enrolled', value: studentsTotal, change: 0, changeType: 'increase' as const },
      { id: 'timetable-completion', title: 'Timetable Completion', value: `${completionRate}%`, change: 0, changeType: 'increase' as const },
    ];
  }, [classes, mappedClassData]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterSelect = (filterId: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const handleCreateClass = () => {
    setEditingClass(null);
    setIsModalOpen(true);
  };

  const handleEditClass = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    if (cls) {
      setEditingClass(cls);
      setIsModalOpen(true);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (confirm('Are you sure you want to archive this class?')) {
      try {
        await classService.archiveClass(classId);
        toast.success("Class archived successfully");
        fetchClasses();
      } catch (error) {
        toast.error("Failed to archive class");
      }
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      grade: 'all',
      classArm: 'all',
      homeroomTeacher: 'all',
      sessionTerm: 'all',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex-1 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Class Management</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your school's classes, teachers, and student enrollments</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleCreateClass}>
                Create New Class
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <StatsCard
                key={stat.id}
                title={stat.title}
                value={stat.value}
                change={stat.change}
                changeType={stat.changeType}
              />
            ))}
          </div>

          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <SearchBar
              placeholder="Search by class or teacher..."
              onSearch={handleSearch}
              className="flex-grow"
            />
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                All Classes ({filteredClasses.length})
              </h3>
            </div>
            
            <ClassGrid
              classes={filteredClasses}
              isLoading={loading}
              onEditClass={handleEditClass}
              onDeleteClass={handleDeleteClass}
              onCreateClass={handleCreateClass}
            />
          </div>
        </div>
      </main>

      <ClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchClasses}
        classItem={editingClass}
      />
    </div>
  );
}
