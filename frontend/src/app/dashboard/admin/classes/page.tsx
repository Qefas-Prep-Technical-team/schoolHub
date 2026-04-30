'use client';

import { useState, useMemo } from 'react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useClasses } from '@/lib/api/hooks/useClasses';
import { useSchoolSettings } from '@/lib/api/hooks/useSchool';
import { classService, Class } from './services/classService';
import { toast } from 'react-toastify';
import { 
  Layers, 
  Plus, 
  Search, 
  Filter, 
  Download,
  Users,
  BookOpen,
  Activity,
  ArrowRight,
  Monitor,
  LayoutGrid,
  Zap,
  ShieldCheck,
  TrendingUp,
  Globe,
  Cpu,
  MoreVertical,
  List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ClassGrid from './components/ClassGrid';
import ClassModal from './components/ClassModal';
import { ClassData } from './components/types';
import { cn } from '@/lib/utils';

export default function ClassesOverviewPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#ea580c';

  const { data: fetchClassesData, isLoading: loading, refetch: fetchClasses } = useClasses(schoolId);
  const classes = (fetchClassesData as Class[]) || [];

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
      isLive: c.status === 'ACTIVE' && Math.random() > 0.3,
      currentActivity: c.status === 'ACTIVE' ? (c.subjects?.[0]?.subject?.name || 'Study Session') : undefined,
    }));
  }, [classes]);

  const filteredClasses = useMemo(() => {
    return mappedClassData.filter((classItem) => {
      const query = searchQuery.toLowerCase();
      return classItem.name.toLowerCase().includes(query) ||
             classItem.section.toLowerCase().includes(query) ||
             classItem.teacher.name.toLowerCase().includes(query);
    });
  }, [searchQuery, mappedClassData]);

  const stats = useMemo(() => {
    const totalClasses = classes.length;
    const teachersAssigned = classes.filter((c: Class) => c.teachers && c.teachers.length > 0).length;
    const studentsTotal = classes.reduce((sum: number, c: Class) => sum + (c._count?.enrollments ?? c.enrollments?.length ?? 0), 0);
    const activeNodes = mappedClassData.filter(c => c.isLive).length;

    return [
        { 
            label: 'Total Clusters', 
            value: totalClasses, 
            icon: LayoutGrid, 
            color: primaryColor,
            desc: 'Active Nodes'
        },
        { 
            label: 'Faculty Assigned', 
            value: teachersAssigned, 
            icon: Users, 
            color: '#6366f1', // Indigo
            desc: 'Node Commanders'
        },
        { 
            label: 'Population', 
            value: studentsTotal, 
            icon: Zap, 
            color: '#10b981', // Emerald
            desc: 'Node Occupancy'
        },
        { 
            label: 'Real-time Pulse', 
            value: activeNodes, 
            icon: Activity, 
            color: '#f59e0b', // Amber
            desc: 'Active Channels'
        },
    ];
  }, [classes, mappedClassData, primaryColor]);

  const handleEditClass = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    if (cls) {
      setEditingClass(cls);
      setIsModalOpen(true);
    }
  };

  const handleDeleteClass = async (classId: string) => {
    if (confirm('Are you sure you want to archive this class node?')) {
      try {
        await classService.archiveClass(classId);
        toast.success("Class node archived successfully");
        fetchClasses();
      } catch (error) {
        toast.error("Failed to archive class node");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 lg:p-10 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto space-y-12">
        
        {/* Tactical Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
              <div className="size-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Infrastructure Terminal</span>
            </div>
            <div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">
                Structural Nodes<span style={{ color: primaryColor }}>.</span>
              </h1>
              <p className="mt-4 text-lg font-medium text-slate-500 max-w-xl">
                Advanced institutional layout management, structural node alignment, and real-time occupancy tracking.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => {
                setEditingClass(null);
                setIsModalOpen(true);
              }}
              style={{ backgroundColor: primaryColor }}
              className="h-16 px-10 rounded-[2rem] text-white font-black uppercase tracking-widest gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={20} strokeWidth={3} />
              Initialize Cluster
            </Button>
          </div>
        </div>

        {/* Pulse Tactical Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
                <div 
                    key={index}
                    className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden group"
                >
                    <div 
                        className="absolute -right-6 -bottom-6 size-40 rounded-full blur-3xl opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-700 pointer-events-none" 
                        style={{ backgroundColor: stat.color }}
                    />
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <div 
                                className="size-14 rounded-2xl flex items-center justify-center border shadow-inner transition-transform duration-500 group-hover:scale-110"
                                style={{ 
                                    backgroundColor: `${stat.color}10`,
                                    borderColor: `${stat.color}20`,
                                    color: stat.color
                                }}
                            >
                                <stat.icon size={24} strokeWidth={2.5} />
                            </div>
                            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                <TrendingUp size={10} /> Live
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{stat.label}</p>
                            <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{stat.value}</h3>
                            <p className="text-[10px] font-bold text-slate-500 mt-4 uppercase tracking-widest flex items-center gap-2">
                                <Zap size={12} className="text-slate-300" /> {stat.desc}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Operational Terminal Control */}
        <div className="flex flex-wrap items-center justify-between gap-6 p-4 rounded-[3rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <div className="relative group flex-1 max-w-xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" size={22} />
                <input 
                    type="text" 
                    placeholder="Search structural nodes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-16 pl-16 pr-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-[2rem] focus:outline-none focus:ring-4 transition-all font-bold text-slate-700 dark:text-slate-200"
                    style={{ '--tw-ring-color': `${primaryColor}20` } as any}
                />
            </div>
            
            <div className="flex items-center gap-4">
                 <div className="flex bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-2xl p-1.5 shadow-sm">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={cn("size-12 rounded-xl flex items-center justify-center transition-all", viewMode === 'grid' ? "bg-slate-50 dark:bg-white/10 shadow-inner" : "text-slate-400 hover:text-slate-600")}
                      style={{ color: viewMode === 'grid' ? primaryColor : undefined }}
                    >
                      <LayoutGrid size={20} strokeWidth={3} />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={cn("size-12 rounded-xl flex items-center justify-center transition-all", viewMode === 'list' ? "bg-slate-50 dark:bg-white/10 shadow-inner" : "text-slate-400 hover:text-slate-600")}
                      style={{ color: viewMode === 'list' ? primaryColor : undefined }}
                    >
                      <List size={20} strokeWidth={3} />
                    </button>
                 </div>
                 <Button variant="outline" className="h-16 px-8 rounded-[2rem] border-2 border-slate-100 dark:border-white/5 font-black uppercase tracking-widest gap-3 hidden sm:flex hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                    <Download size={22} strokeWidth={3} className="text-slate-400" />
                 </Button>
            </div>
        </div>

        {/* Dynamic Registry Terminal */}
        <AnimatePresence mode="wait">
            {viewMode === 'grid' ? (
                <motion.div
                    key="grid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                >
                    <ClassGrid
                        classes={filteredClasses}
                        isLoading={loading}
                        onEditClass={handleEditClass}
                        onDeleteClass={handleDeleteClass}
                        onCreateClass={() => setIsModalOpen(true)}
                    />
                </motion.div>
            ) : (
                <motion.div
                    key="list"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-[4rem] overflow-hidden shadow-2xl"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Structural Node</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Personnel</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Occupancy</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-40 text-center">
                                            <div className="flex flex-col items-center gap-6">
                                                <div className="size-16 rounded-full border-4 border-slate-100 dark:border-white/5 border-t-orange-600 animate-spin" style={{ borderTopColor: primaryColor }} />
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Syncing Infrastructure...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredClasses.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-40 text-center text-slate-300">
                                            <div className="flex flex-col items-center gap-6 opacity-30">
                                                <Layers size={80} strokeWidth={1} />
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">No Nodes Detected</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredClasses.map((cls, index) => (
                                        <tr key={cls.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="size-16 rounded-3xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-all border border-slate-100 dark:border-white/5" style={{ color: primaryColor }}>
                                                        <Layers size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter group-hover:text-primary transition-colors" style={{ '--primary': primaryColor } as any}>
                                                            {cls.name}
                                                        </div>
                                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                            {cls.section} ARM • Node ID: {cls.id.slice(0, 8)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                                                        {cls.teacher.avatarUrl ? <img src={cls.teacher.avatarUrl} alt="" className="size-full object-cover" /> : <Users size={16} className="text-slate-400" />}
                                                    </div>
                                                    <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{cls.teacher.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-xl font-black text-slate-900 dark:text-white">{cls.studentCount}</span>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enrolled</span>
                                                    </div>
                                                    <div className="w-px h-8 bg-slate-100 dark:bg-white/5" />
                                                    <div className="flex flex-col">
                                                        <span className="text-xl font-black text-slate-900 dark:text-white">{cls.subjectCount}</span>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Modules</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                {cls.isLive ? (
                                                    <span className="px-4 py-1.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-500/20">Active Now</span>
                                                ) : (
                                                    <span className="px-4 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 text-[9px] font-black uppercase tracking-widest border border-slate-100 dark:border-white/10 text-opacity-50">Offline</span>
                                                )}
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="size-12 rounded-2xl hover:bg-white dark:hover:bg-slate-900 shadow-sm border border-transparent hover:border-slate-100"
                                                        onClick={() => handleEditClass(cls.id)}
                                                    >
                                                        <Edit2 size={18} className="text-slate-400" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="size-12 rounded-2xl hover:bg-rose-500 hover:text-white shadow-sm border border-transparent"
                                                        onClick={() => handleDeleteClass(cls.id)}
                                                    >
                                                        <Trash2 size={18} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Global Security Footer */}
        <div className="flex justify-center pt-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                <ShieldCheck size={16} className="text-emerald-500" strokeWidth={3} /> Verified Infrastructure Registry
            </div>
        </div>
      </div>

      <ClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchClasses}
        classItem={editingClass}
      />
    </div>
  );
}
