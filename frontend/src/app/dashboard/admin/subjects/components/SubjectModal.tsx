"use client"

import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Subject, SchemeOfWork, subjectService } from "../services/subjectService"
import { departmentService, Department } from "../../departments/services/departmentService"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { apiClient } from "@/lib/api/client"
import { toast } from "react-toastify"
import { useSchoolTeachers } from "@/lib/api/hooks/useSchool"
import { Plus, Trash2, BookOpen, Settings, Target, Link2, Hash, Type, Sparkles } from "lucide-react"

interface SubjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  subject?: Subject | null
}

const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  subject,
}) => {
  const [loading, setLoading] = useState(false)
  const [departments, setDepartments] = useState<Department[]>([])
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    description?: string;
    departmentIds: string[];
    teacherIds: string[];
    scope: "SCHOOL";
  }>({
    name: "",
    code: "",
    description: "",
    departmentIds: [],
    teacherIds: [],
    scope: "SCHOOL",
  })

  const [schemes, setSchemes] = useState<Partial<SchemeOfWork>[]>([])

  const { user } = useAuthStore()
  const [schoolId, setSchoolId] = useState<string>("");
  
  useEffect(() => {
    const checkStatus = async () => {
      if (user?.email) {
        try {
            const res = await apiClient.get(`/admin/admin-status/${user.email}`);
            setSchoolId(res.data.data.schoolAdmins?.[0]?.schoolId || "");
        } catch (err) {
            console.error("Auth check failed", err);
        }
      }
    };
    checkStatus();
  }, [user?.email]);

  const { data: schoolTeachers = [] } = useSchoolTeachers(schoolId);

  useEffect(() => {
    if (isOpen) {
      fetchDepartments()
      if (subject?.id) {
        setFormData({
          name: subject.name,
          code: subject.code,
          description: subject.description || "",
          departmentIds: subject.departments?.map((d: any) => d.departmentId) || [],
          teacherIds: (subject as any).teacherSubjects?.map((ts: any) => ts.teacherId) || [],
          scope: "SCHOOL",
        })
        fetchScheme(subject.id)
      } else {
        setFormData({
          name: "",
          code: "",
          description: "",
          departmentIds: [],
          teacherIds: [],
          scope: "SCHOOL",
        })
        setSchemes([{ week: 1, topic: "", term: 1 }])
      }
    }
  }, [isOpen, subject, schoolId])

  const fetchDepartments = async () => {
    try {
        if (schoolId) {
            const deps = await departmentService.getDepartments(schoolId);
            setDepartments(deps);
        }
    } catch (error) {
        console.error("Failed to fetch departments", error);
    }
  }

  const fetchScheme = async (subjectId: string) => {
      try {
          const data = await subjectService.getScheme(subjectId);
          setSchemes(data.length > 0 ? data : [{ week: 1, topic: "", term: 1 }]);
      } catch (err) {
          console.error("Failed to fetch scheme", err);
      }
  }

  const addSchemeRow = () => {
      const nextWeek = schemes.length > 0 ? (Math.max(...schemes.map(s => s.week || 0)) + 1) : 1;
      setSchemes([...schemes, { week: nextWeek, topic: "", term: 1 }]);
  }

  const removeSchemeRow = (index: number) => {
      setSchemes(schemes.filter((_, i) => i !== index));
  }

  const updateSchemeRow = (index: number, data: Partial<SchemeOfWork>) => {
      const newSchemes = [...schemes];
      newSchemes[index] = { ...newSchemes[index], ...data };
      setSchemes(newSchemes);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!schoolId) {
        toast.error("School context not found. Please try logging in again.");
        return;
      }

      let savedSubject;
      const { departmentIds, ...subjectData } = formData;

      if (subject?.id) {
        const response = await apiClient.patch(`/academic/subjects/${subject.id}`, {
          ...subjectData,
          scope: "SCHOOL",
        });
        savedSubject = response.data.data;
      } else {
        const response = await apiClient.post("/academic/subjects", {
          ...subjectData,
          schoolId,
          scope: "SCHOOL",
        });
        savedSubject = response.data.data;
      }

      // Link departments
      if (savedSubject?.id) {
          await apiClient.post(`/academic/subjects/${savedSubject.id}/departments`, {
              departmentIds: formData.departmentIds,
          });

          await apiClient.post(`/academic/subjects/${savedSubject.id}/teachers`, {
              teacherIds: formData.teacherIds,
              schoolId,
          });

          // Sync Scheme of Work
          const validSchemes = schemes.filter(s => s.topic?.trim());
          if (validSchemes.length > 0) {
              await subjectService.syncScheme(savedSubject.id, validSchemes);
          }
      }

      toast.success(subject?.id ? "Subject updated!" : "Subject created!");
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("Failed to save subject", error)
      toast.error(error.response?.data?.message || "Failed to save subject");
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[850px] max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900 flex flex-col">
        <DialogHeader className="p-8 border-b dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900 flex-shrink-0">
          <DialogTitle className="text-3xl font-black font-headline text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
             <div className="p-2 bg-blue-600 rounded-xl"><BookOpen className="h-6 w-6 text-white" /></div>
             {subject?.id ? "Edit Subject Profile" : "Initialize New Subject"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <Tabs defaultValue="settings" className="w-full flex-1 flex flex-col min-h-0">
            <div className="px-8 border-b dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
                <TabsList className="bg-transparent border-none p-0 h-14 gap-8">
                    <TabsTrigger 
                        value="settings" 
                        className="data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-blue-600 rounded-none h-full px-1 text-sm font-black uppercase tracking-widest gap-2.5 transition-all"
                    >
                        <Settings className="h-4 w-4" />
                        Base Settings
                    </TabsTrigger>
                    <TabsTrigger 
                        value="curriculum" 
                        className="data-[state=active]:bg-transparent data-[state=active]:border-b-4 data-[state=active]:border-blue-600 rounded-none h-full px-1 text-sm font-black uppercase tracking-widest gap-2.5 transition-all"
                    >
                        <Sparkles className="h-4 w-4" />
                        Curriculum
                    </TabsTrigger>
                </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30 dark:bg-slate-900/50 min-h-0">
                <TabsContent value="settings" className="space-y-8 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Type className="h-3 w-3" /> Subject Name
                            </Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl h-12 px-5 font-bold shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                                placeholder="e.g. Mathematics"
                                required
                            />
                        </div>
                        <div className="space-y-3">
                            <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Hash className="h-3 w-3" /> Subject Code
                            </Label>
                            <Input
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl h-12 px-5 font-bold shadow-sm focus:ring-2 focus:ring-blue-500/20 transition-all"
                                placeholder="e.g. MATH-101"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Departments */}
                        <div className="space-y-4">
                            <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Target Departments</Label>
                            <div className="space-y-2 max-h-[250px] overflow-y-auto p-3 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                {departments.map(dep => (
                                    <div 
                                        key={dep.id}
                                        onClick={() => {
                                            const isSelected = formData.departmentIds.includes(dep.id);
                                            const newIds = isSelected 
                                                ? formData.departmentIds.filter(id => id !== dep.id)
                                                : [...formData.departmentIds, dep.id];
                                            setFormData({ ...formData, departmentIds: newIds });
                                        }}
                                        className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border ${
                                            formData.departmentIds.includes(dep.id) 
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20 translate-x-1' 
                                                : 'bg-slate-50 dark:bg-slate-900 border-transparent hover:border-blue-500/30'
                                        }`}
                                    >
                                        <span className="text-xs font-black uppercase tracking-tight">{dep.name}</span>
                                        {formData.departmentIds.includes(dep.id) && <Plus className="h-3 w-3 ml-auto rotate-45" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Teachers */}
                        <div className="space-y-4">
                            <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Faculty Assignment</Label>
                            <div className="space-y-2 max-h-[250px] overflow-y-auto p-3 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                                {schoolTeachers.map((teacher: any) => (
                                    <div 
                                        key={teacher.id}
                                        onClick={() => {
                                            const isSelected = formData.teacherIds.includes(teacher.id);
                                            const newIds = isSelected 
                                                ? formData.teacherIds.filter(id => id !== teacher.id)
                                                : [...formData.teacherIds, teacher.id];
                                            setFormData({ ...formData, teacherIds: newIds });
                                        }}
                                        className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border ${
                                            formData.teacherIds.includes(teacher.id) 
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20 translate-x-1' 
                                                : 'bg-slate-50 dark:bg-slate-900 border-transparent hover:border-blue-500/30'
                                        }`}
                                    >
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black ${formData.teacherIds.includes(teacher.id) ? 'bg-white/20' : 'bg-blue-100 text-blue-600'}`}>
                                            {teacher.name.charAt(0)}
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-xs font-black uppercase tracking-tight">{teacher.name}</span>
                                            <span className={`text-[10px] font-bold ${formData.teacherIds.includes(teacher.id) ? 'text-blue-100' : 'text-slate-500 uppercase'}`}>{teacher.teacherCode}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Subject Description</Label>
                        <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-sm font-medium shadow-sm"
                            rows={3}
                            placeholder="Provide a high-level overview of this academic course..."
                        />
                    </div>
                </TabsContent>

                <TabsContent value="curriculum" className="space-y-8 mt-0">
                    <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="text-left">
                            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Curriculum Roadmap</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Plan your teaching milestones week-by-week</p>
                        </div>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={addSchemeRow}
                            className="rounded-2xl border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-black uppercase tracking-widest text-[10px] px-6 h-11 transition-all active:scale-95"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Entry
                        </Button>
                    </div>

                    <div className="space-y-4 pb-4">
                        {schemes.length > 0 ? schemes.map((scheme, idx) => (
                            <div key={idx} className="group p-8 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:shadow-blue-600/5 transition-all relative">
                                <div className="grid grid-cols-12 gap-8">
                                    <div className="col-span-12 md:col-span-3 lg:col-span-2 space-y-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Hash className="h-3 w-3 text-blue-600" />
                                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Week</Label>
                                        </div>
                                        <Input 
                                            type="number"
                                            value={scheme.week} 
                                            onChange={(e) => updateSchemeRow(idx, { week: parseInt(e.target.value) })}
                                            className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl h-12 px-4 text-center font-black text-blue-600 text-lg shadow-inner"
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-9 lg:col-span-10 space-y-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <BookOpen className="h-3 w-3 text-blue-600" />
                                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Topic Title</Label>
                                        </div>
                                        <Input 
                                            value={scheme.topic} 
                                            onChange={(e) => updateSchemeRow(idx, { topic: e.target.value })}
                                            className="bg-slate-50 dark:bg-slate-900 border-none rounded-xl h-12 px-5 font-black text-slate-900 dark:text-white shadow-inner"
                                            placeholder="e.g. Introduction to Organic Chemistry"
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-6 space-y-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Target className="h-3 w-3 text-indigo-600" />
                                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Main Objectives</Label>
                                        </div>
                                        <Textarea 
                                            value={scheme.objectives} 
                                            onChange={(e) => updateSchemeRow(idx, { objectives: e.target.value })}
                                            className="bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-xs font-medium min-h-[100px] p-4 shadow-inner"
                                            placeholder="Outline what students will achieve this week..."
                                        />
                                    </div>
                                    <div className="col-span-12 md:col-span-6 space-y-3">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Link2 className="h-3 w-3 text-green-600" />
                                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recommended Resources</Label>
                                        </div>
                                        <Textarea 
                                            value={scheme.resources} 
                                            onChange={(e) => updateSchemeRow(idx, { resources: e.target.value })}
                                            className="bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-xs font-medium min-h-[100px] p-4 shadow-inner"
                                            placeholder="List textbooks, online links, or physical tools..."
                                        />
                                    </div>
                                </div>
                                
                                <button 
                                    type="button"
                                    onClick={() => removeSchemeRow(idx)}
                                    className="absolute -top-3 -right-3 h-10 w-10 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-500 shadow-lg transition-all opacity-0 group-hover:opacity-100 active:scale-90"
                                >
                                    <Plus className="h-5 w-5 rotate-45" />
                                </button>
                            </div>
                        )) : (
                            <div className="py-20 bg-white dark:bg-slate-800 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-6">
                                <div className="h-20 w-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center">
                                    <Sparkles className="h-10 w-10 text-slate-300" />
                                </div>
                                <div className="max-w-xs">
                                    <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">No roadmap initialized</h5>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Start by adding your first week of teaching topics and objectives.</p>
                                </div>
                                <Button 
                                    type="button"
                                    onClick={addSchemeRow}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] px-8 rounded-full h-11"
                                >
                                    Start Planning
                                </Button>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </div>

            <DialogFooter className="p-8 border-t dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
                <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClose();
                    }} 
                    className="font-black text-xs uppercase tracking-widest mr-auto hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                    Discard Changes
                </Button>
                <div className="flex gap-4">
                    <Button 
                        type="submit" 
                        disabled={loading} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 rounded-full h-12 shadow-2xl shadow-blue-600/30 active:scale-95 transition-all text-xs uppercase tracking-widest"
                    >
                        {loading ? (subject?.id ? "Saving..." : "Publishing...") : (subject?.id ? "Save Changes" : "Create Subject")}
                    </Button>
                </div>
            </DialogFooter>
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default SubjectModal
