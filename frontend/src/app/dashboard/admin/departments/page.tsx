'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  Building2, 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Archive, 
  ChevronRight,
  Filter,
  Zap,
  Layers,
  ArrowRight,
  LayoutGrid,
  List,
  Users,
  GraduationCap,
  Activity,
  History,
  ShieldCheck,
  TrendingUp,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { toast } from "react-toastify";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { departmentService, Department } from "./services/departmentService";
import { apiClient } from "@/lib/api/client";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
import DepartmentModal from "./components/DepartmentModal";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  const { user } = useAuthStore();
  const schoolIdFromStore = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const [schoolId, setSchoolId] = useState<string | null>(schoolIdFromStore || null);
  const { data: settings } = useSchoolSettings(schoolId || '');
  const primaryColor = settings?.themeColor || '#2563eb';

  const fetchSchoolId = useCallback(async () => {
    if (schoolId) return;
    if (!user?.email) return;
    try {
      const response = await apiClient.get(`/admin/admin-status/${user.email}`);
      const data = response.data;
      if (data.success && data.data.schoolAdmins?.[0]?.school?.id) {
        setSchoolId(data.data.schoolAdmins[0].school.id);
      }
    } catch (error) {
      console.error("Failed to fetch school ID:", error);
    }
  }, [user?.email, schoolId]);

  const fetchDepartments = useCallback(async () => {
    if (!schoolId) return;
    setLoading(true);
    try {
      const data = await departmentService.getDepartments(schoolId);
      setDepartments(data);
    } catch (error) {
      toast.error("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchSchoolId();
  }, [fetchSchoolId]);

  useEffect(() => {
    if (schoolId) {
      fetchDepartments();
    }
  }, [schoolId, fetchDepartments]);

  const handleSave = async (data: any) => {
    try {
      if (selectedDepartment) {
        await departmentService.updateDepartment(selectedDepartment.id, data);
        toast.success("Department updated successfully");
      } else {
        await departmentService.createDepartment(data);
        toast.success("Department created successfully");
      }
      fetchDepartments();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to save department");
    }
  };

  const handleArchive = async (id: string) => {
    if (confirm("Are you sure you want to archive this department?")) {
      try {
        await departmentService.archiveDepartment(id);
        toast.success("Department archived successfully");
        fetchDepartments();
      } catch (error) {
        toast.error("Failed to archive department");
      }
    }
  };

  const filteredDepartments = useMemo(() => {
    return departments.filter(dept => 
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [departments, searchQuery]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 lg:p-10 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto space-y-12">
        
        {/* Tactical Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
              <div className="size-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Organizational Protocol Hub</span>
            </div>
            <div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">
                Infrastructure<span style={{ color: primaryColor }}>.</span>
              </h1>
              <p className="mt-4 text-lg font-medium text-slate-500 max-w-xl">
                Advanced institutional node management and organizational architecture reconciliation.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={() => {
                setSelectedDepartment(null);
                setIsModalOpen(true);
              }}
              style={{ backgroundColor: primaryColor }}
              className="h-16 px-10 rounded-[2rem] text-white font-black uppercase tracking-widest gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={20} strokeWidth={3} />
              Deploy New Node
            </Button>
          </div>
        </div>

        {/* Pulse Operational Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-10 rounded-[3rem] bg-slate-900 text-white border border-slate-800 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <Building2 size={120} />
                </div>
                <div className="relative z-10 space-y-6">
                    <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary shadow-inner">
                        <Layers size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Active Clusters</p>
                        <h3 className="text-4xl font-black tracking-tighter uppercase">{departments.length}</h3>
                    </div>
                </div>
            </div>

            <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-[0.02] dark:opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <Users size={120} />
                </div>
                <div className="relative z-10 space-y-6">
                    <div className="size-14 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center text-primary">
                        <Users size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Personnel</p>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">124</h3>
                    </div>
                </div>
            </div>

            <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-[0.02] dark:opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <GraduationCap size={120} />
                </div>
                <div className="relative z-10 space-y-6">
                    <div className="size-14 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center text-emerald-600">
                        <Zap size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Module Capacity</p>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                            {departments.reduce((acc, dept) => acc + (dept.subjects?.length || 0), 0)}
                        </h3>
                    </div>
                </div>
            </div>

            <div className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xl relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-[0.02] dark:opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <Activity size={120} />
                </div>
                <div className="relative z-10 space-y-6">
                    <div className="size-14 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center text-rose-600">
                        <TrendingUp size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Health Index</p>
                        <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Optimal</h3>
                    </div>
                </div>
            </div>
        </div>

        {/* Operational Terminal Control */}
        <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="relative group flex-1 max-w-xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" size={22} />
                <input 
                    type="text" 
                    placeholder="Filter infrastructure nodes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-16 pl-16 pr-6 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-100 dark:border-white/5 rounded-3xl focus:outline-none focus:ring-4 transition-all font-bold text-slate-700 dark:text-slate-200"
                    style={{ '--tw-ring-color': `${primaryColor}20` } as any}
                />
            </div>
            <div className="flex items-center gap-4">
                 <div className="flex bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-1.5 shadow-inner">
                    <button 
                      onClick={() => setViewMode('grid')}
                      className={cn("size-12 rounded-xl flex items-center justify-center transition-all", viewMode === 'grid' ? "bg-white dark:bg-slate-900 shadow-xl" : "text-slate-400 hover:text-slate-600")}
                      style={{ color: viewMode === 'grid' ? primaryColor : undefined }}
                    >
                      <LayoutGrid size={20} strokeWidth={3} />
                    </button>
                    <button 
                      onClick={() => setViewMode('list')}
                      className={cn("size-12 rounded-xl flex items-center justify-center transition-all", viewMode === 'list' ? "bg-white dark:bg-slate-900 shadow-xl" : "text-slate-400 hover:text-slate-600")}
                      style={{ color: viewMode === 'list' ? primaryColor : undefined }}
                    >
                      <List size={20} strokeWidth={3} />
                    </button>
                 </div>
                 <Button variant="outline" className="h-16 px-8 rounded-3xl border-2 border-slate-100 dark:border-white/5 font-black uppercase tracking-widest gap-3 hidden sm:flex hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                    <Download size={18} strokeWidth={3} /> Export Data
                 </Button>
            </div>
        </div>

        {/* Dynamic Registry Terminal */}
        <AnimatePresence mode="wait">
            {viewMode === 'list' ? (
                <motion.div 
                    key="list"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-[4rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.08)]"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Infrastructure Node</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Code</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Modules</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Description</th>
                                    <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-40 text-center">
                                            <div className="flex flex-col items-center gap-6">
                                                <div className="size-16 rounded-full border-4 border-slate-100 dark:border-white/5 border-t-primary animate-spin" style={{ borderTopColor: primaryColor }} />
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing Institutional Map...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredDepartments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-10 py-40 text-center">
                                            <div className="flex flex-col items-center gap-6 opacity-30">
                                                <Layers size={80} strokeWidth={1} />
                                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">No Nodes Detected in Registry</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDepartments.map((dept, index) => (
                                        <motion.tr 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            key={dept.id} 
                                            className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all duration-300"
                                        >
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="size-16 rounded-3xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-all duration-500 border border-slate-100 dark:border-white/5" style={{ color: primaryColor }}>
                                                        <Building2 size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter group-hover:text-primary transition-colors" style={{ '--primary': primaryColor } as any}>
                                                            {dept.name}
                                                        </div>
                                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                                            Node ID: {dept.id.slice(0, 12)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="inline-flex px-4 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 font-mono text-xs font-black text-slate-500">
                                                    {dept.code}
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                                        <Zap size={14} />
                                                    </div>
                                                    <span className="text-lg font-black text-slate-900 dark:text-white">
                                                        {dept.subjects?.length || 0}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <p className="max-w-[340px] truncate text-sm font-medium text-slate-500 leading-relaxed italic">
                                                    "{dept.description || "No operational parameters defined."}"
                                                </p>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-4 group-hover:translate-x-0">
                                                    <Button 
                                                        onClick={() => {
                                                            setSelectedDepartment(dept);
                                                            setIsModalOpen(true);
                                                        }}
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="size-12 rounded-2xl hover:bg-white dark:hover:bg-slate-900 shadow-sm border border-transparent hover:border-slate-100 transition-all"
                                                    >
                                                        <Edit2 size={18} className="text-slate-400" />
                                                    </Button>
                                                    <Button 
                                                        onClick={() => handleArchive(dept.id)}
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="size-12 rounded-2xl hover:bg-rose-500 hover:text-white shadow-sm border border-transparent transition-all"
                                                    >
                                                        <Archive size={18} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            ) : (
                <motion.div 
                    key="grid"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {loading ? (
                         [1,2,3,4,5,6].map(i => <div key={i} className="h-64 rounded-[3.5rem] bg-white dark:bg-white/[0.02] animate-pulse border border-slate-100 dark:border-white/5" />)
                    ) : filteredDepartments.map((dept, index) => (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            key={dept.id} 
                            onClick={() => {
                                setSelectedDepartment(dept);
                                setIsModalOpen(true);
                            }}
                            className="group relative overflow-hidden bg-white dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-100 dark:border-white/5 rounded-[3.5rem] p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2 transition-all duration-500 cursor-pointer"
                        >
                             <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[80px] -mt-10 -mr-10 transition-colors duration-700" style={{ backgroundColor: `${primaryColor}10` }} />
                             
                             <div className="relative z-10 space-y-10">
                                <div className="flex justify-between items-start">
                                    <div className="size-16 rounded-[1.5rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:scale-110 transition-all duration-500 border border-slate-100 dark:border-white/5" style={{ color: primaryColor }}>
                                        <Building2 size={28} strokeWidth={2.5} />
                                    </div>
                                    <div className="px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        {dept.code}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-[1.1] uppercase tracking-tighter mb-4" style={{ '--primary': primaryColor } as any}>
                                        {dept.name}
                                    </h3>
                                    <p className="text-sm font-medium text-slate-500 line-clamp-2 italic">
                                        "{dept.description || "Operational parameters not initialized."}"
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-8 border-t border-slate-50 dark:border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Modules</span>
                                            <span className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{dept.subjects?.length || 0} Nodes</span>
                                        </div>
                                    </div>
                                    <div className="size-12 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:text-white text-slate-400 transition-all duration-500 shadow-sm" style={{ '--hover-bg': primaryColor } as any}>
                                        <ArrowRight size={20} strokeWidth={3} />
                                    </div>
                                </div>
                             </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>

        {/* Global Operational Security Badge */}
        <div className="flex justify-center pt-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                <ShieldCheck size={16} className="text-emerald-500" strokeWidth={3} /> Verified Organizational Schema
            </div>
        </div>
      </div>

      <DepartmentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        department={selectedDepartment}
        schoolId={schoolId}
      />
    </div>
  );
}

