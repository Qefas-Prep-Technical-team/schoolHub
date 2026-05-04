'use client';

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  BookOpen, 
  Layers, 
  Zap, 
  MoreVertical, 
  ShieldCheck, 
  ArrowRight,
  Filter,
  Download,
  BookMarked,
  Cpu,
  Globe,
  Lock
} from "lucide-react";
import SubjectCard from "./components/SubjectCard";
import SubjectModal from "./components/SubjectModal";
import { subjectService, Subject } from "./services/subjectService";
import { departmentService, Department } from "../departments/services/departmentService";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { apiClient } from "@/lib/api/client";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const SubjectsPage = () => {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedScope, setSelectedScope] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#2563eb';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statusRes = await apiClient.get(`/admin/admin-status/${user?.email}`);
      const fetchedSchoolId = statusRes.data.data.schoolAdmins?.[0]?.schoolId;
      
      const [subjectsData, departmentsData] = await Promise.all([
        subjectService.getSubjects(fetchedSchoolId),
        departmentService.getDepartments(fetchedSchoolId)
      ]);
      
      setSubjects(subjectsData);
      setDepartments(departmentsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const matchesSearch = 
          subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          subject.code.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = selectedDepartment === "all" || 
          subject.departments?.some(d => d.departmentId === selectedDepartment);
      const matchesScope = selectedScope === "all" || subject.scope === selectedScope;
      
      return matchesSearch && matchesDepartment && matchesScope;
    });
  }, [subjects, searchQuery, selectedDepartment, selectedScope]);

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleView = (subject: Subject) => {
    router.push(`/dashboard/admin/subjects/${subject.id}`);
  };

  const handleCreate = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 lg:p-10 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
              <div className="size-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Curriculum Management</span>
            </div>
            <div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">
                Subjects<span style={{ color: primaryColor }}>.</span>
              </h1>
              <p className="mt-4 text-lg font-medium text-slate-500 max-w-xl">
                Manage your school curriculum, departmental alignment, and academic subject planning.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleCreate}
              style={{ backgroundColor: primaryColor, boxShadow: `0 20px 25px -5px ${primaryColor}4D` }}
              className="h-16 px-10 rounded-[2rem] text-white font-black uppercase tracking-widest gap-3 hover:scale-105 active:scale-95 transition-all border-0"
            >
              <Plus size={20} strokeWidth={3} />
              Add New Subject
            </Button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div 
                className="p-8 rounded-[3rem] bg-slate-900 text-white border border-slate-800 relative overflow-hidden group transition-all"
                style={{ boxShadow: `0 25px 50px -12px ${primaryColor}4D` }}
            >
                 <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <BookMarked size={120} />
                </div>
                <div className="relative z-10 flex items-center gap-8">
                    <div className="size-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-primary">
                        <BookOpen size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Academic Scope</p>
                        <h3 className="text-5xl font-black tracking-tighter uppercase">{subjects.length} Subjects</h3>
                    </div>
                </div>
            </div>

            <div 
                className="p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 relative overflow-hidden group transition-all"
                style={{ boxShadow: `0 25px 50px -12px ${primaryColor}15` }}
            >
                 <div className="absolute top-0 right-0 p-8 opacity-[0.02] dark:opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <Layers size={120} />
                </div>
                <div className="relative z-10 flex items-center gap-8">
                    <div className="size-20 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center text-primary">
                        <Layers size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Department Alignment</p>
                        <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{departments.length} Units</h3>
                    </div>
                </div>
            </div>

            <div 
                className="p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 relative overflow-hidden group transition-all"
                style={{ boxShadow: `0 25px 50px -12px ${primaryColor}15` }}
            >
                 <div className="absolute top-0 right-0 p-8 opacity-[0.02] dark:opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                    <Globe size={120} />
                </div>
                <div className="relative z-10 flex items-center gap-8">
                    <div className="size-20 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center text-emerald-600">
                        <ShieldCheck size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Status</p>
                        <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Active</h3>
                    </div>
                </div>
            </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-6 p-4 rounded-[3rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
            <div className="relative group flex-1 max-w-xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" size={22} />
                <input 
                    type="text" 
                    placeholder="Search subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-16 pl-16 pr-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-[2rem] focus:outline-none focus:ring-4 transition-all font-bold text-slate-700 dark:text-slate-200"
                    style={{ '--tw-ring-color': `${primaryColor}20` } as any}
                />
            </div>
            
            <div className="flex items-center gap-4">
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="h-16 w-[240px] rounded-[2rem] bg-white dark:bg-slate-950 border-slate-100 dark:border-white/5 text-[10px] font-black uppercase tracking-widest px-8 shadow-sm">
                        <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent className="rounded-3xl border-2 border-slate-100 dark:border-white/5 p-2">
                        <SelectItem value="all" className="rounded-xl py-3 text-[10px] font-black uppercase tracking-widest">All Departments</SelectItem>
                        {departments.map(dep => (
                            <SelectItem key={dep.id} value={dep.id} className="rounded-xl py-3 text-[10px] font-black uppercase tracking-widest">{dep.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={selectedScope} onValueChange={setSelectedScope}>
                    <SelectTrigger className="h-16 w-[200px] rounded-[2rem] bg-white dark:bg-slate-950 border-slate-100 dark:border-white/5 text-[10px] font-black uppercase tracking-widest px-8 shadow-sm">
                        <SelectValue placeholder="Global Scope" />
                        <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent className="rounded-3xl border-2 border-slate-100 dark:border-white/5 p-2">
                        <SelectItem value="all" className="rounded-xl py-3 text-[10px] font-black uppercase tracking-widest">All Types</SelectItem>
                        <SelectItem value="SCHOOL" className="rounded-xl py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Globe size={12} className="inline mr-2" /> School-wide
                        </SelectItem>
                        <SelectItem value="PERSONAL" className="rounded-xl py-3 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                            <Lock size={12} className="inline mr-2" /> Private
                        </SelectItem>
                    </SelectContent>
                </Select>

                <Button variant="outline" className="size-16 rounded-3xl border-2 border-slate-100 dark:border-white/5 flex items-center justify-center p-0 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                    <Download size={22} strokeWidth={3} className="text-slate-400" />
                </Button>
            </div>
        </div>

        {/* Subjects Registry */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[1,2,3,4,5,6].map(i => <div key={i} className="h-80 rounded-[4rem] bg-white dark:bg-white/[0.02] animate-pulse border border-slate-100 dark:border-white/5" />)}
            </div>
          ) : filteredSubjects.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredSubjects.map((subject, index) => (
                <SubjectCard 
                  key={subject.id} 
                  subject={subject} 
                  onEdit={handleEdit}
                  onView={handleView}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-48 bg-slate-50 dark:bg-white/[0.02] rounded-[5rem] border-2 border-dashed border-slate-100 dark:border-white/5 flex flex-col items-center justify-center gap-8"
            >
              <div className="size-32 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-slate-200 dark:text-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                <BookOpen size={64} strokeWidth={1} />
              </div>
              <div className="space-y-3">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Registry Depleted</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto text-lg leading-relaxed">
                  {searchQuery ? "No subjects discovered matching your current search." : "Add your school's first subject to get started."}
                </p>
              </div>
              {!searchQuery && (
                <Button onClick={handleCreate} style={{ backgroundColor: primaryColor }} className="h-14 px-8 rounded-2xl text-white font-black uppercase tracking-widest gap-3 shadow-xl">
                    <Plus size={20} strokeWidth={3} /> Add Your First Subject
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Operational Security Footer */}
        <div className="flex justify-center pt-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                <ShieldCheck size={16} className="text-emerald-500" strokeWidth={3} /> Verified Subject Registry
            </div>
        </div>
      </div>

      <SubjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        subject={editingSubject}
      />
    </div>
  );
};

export default SubjectsPage;

