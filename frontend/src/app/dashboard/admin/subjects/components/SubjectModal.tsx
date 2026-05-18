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
  const [isSaving, setIsSaving] = useState(false)
  const [isFetchingData, setIsFetchingData] = useState(false)
  const [deptSearch, setDeptSearch] = useState("")
  const [teacherSearch, setTeacherSearch] = useState("")
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
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";

  const { data: schoolTeachers = [], isLoading: teachersLoading } = useSchoolTeachers(schoolId);

  useEffect(() => {
    if (isOpen) {
      setIsSaving(false)
      const loadAllData = async () => {
        setIsFetchingData(true)
        setDeptSearch("")
        setTeacherSearch("")
        await fetchDepartments()
        if (subject?.id) {
          setFormData({
            name: subject.name,
            code: subject.code,
            description: subject.description || "",
            departmentIds: subject.departments?.map((d: any) => d.departmentId) || [],
            teacherIds: (subject as any).teacherSubjects?.map((ts: any) => ts.teacherId) || [],
            scope: "SCHOOL",
          })
          await fetchScheme(subject.id)
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
        setIsFetchingData(false)
      }
      loadAllData()
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
    setIsSaving(true)
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
      setIsSaving(false)
    }
  }

  const filteredDepartments = departments.filter(dep => 
    dep.name.toLowerCase().includes(deptSearch.toLowerCase())
  );

  const filteredTeachers = schoolTeachers.filter((teacher: any) => 
    teacher.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
    teacher.teacherCode?.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  const isModalLoading = isFetchingData || teachersLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[850px] max-h-[90vh] p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-900 flex flex-col">
        <DialogHeader className="p-8 border-b dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900 flex-shrink-0">
          <DialogTitle className="text-3xl font-black font-headline text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
             <div className="p-2 bg-blue-600 rounded-xl"><BookOpen className="h-6 w-6 text-white" /></div>
             {subject?.id ? "Edit Subject" : "Add New Subject"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          {isModalLoading ? (
            <div className="flex-1 p-8 space-y-8 animate-pulse bg-slate-50/30 dark:bg-slate-900/50">
              <div className="flex gap-8 h-12 border-b dark:border-slate-800">
                <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="w-32 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  <div className="w-full h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                </div>
                <div className="space-y-3">
                  <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  <div className="w-full h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  <div className="w-full h-11 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                  <div className="space-y-2 h-[200px] bg-slate-100 dark:bg-slate-800/40 rounded-3xl p-3 border border-slate-100 dark:border-slate-700" />
                </div>
                <div className="space-y-4">
                  <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                  <div className="w-full h-11 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                  <div className="space-y-2 h-[200px] bg-slate-100 dark:bg-slate-800/40 rounded-3xl p-3 border border-slate-100 dark:border-slate-700" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="w-36 h-4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="w-full h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              </div>
            </div>
          ) : (
            <Tabs defaultValue="settings" className="w-full flex-1 flex flex-col min-h-0">
            <div className="px-8 py-4 border-b dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-center flex-shrink-0">
                <TabsList className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl gap-1.5 h-12 flex items-center justify-center max-w-sm w-full border border-slate-200/55 dark:border-white/5 shadow-inner">
                    <TabsTrigger 
                        value="settings" 
                        className="flex-1 rounded-lg h-full text-[10px] font-black uppercase tracking-wider gap-2 transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                        <Settings className="h-3.5 w-3.5" />
                        General Settings
                    </TabsTrigger>
                    <TabsTrigger 
                        value="curriculum" 
                        className="flex-1 rounded-lg h-full text-[10px] font-black uppercase tracking-wider gap-2 transition-all duration-300 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-950 data-[state=active]:text-blue-600 data-[state=active]:text-blue-400 data-[state=active]:shadow-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        Curriculum Plan
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
                            <Input 
                                type="text"
                                placeholder="Search departments..."
                                value={deptSearch}
                                onChange={(e) => setDeptSearch(e.target.value)}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl h-11 px-4 font-bold shadow-sm"
                            />
                            <div className="space-y-2 max-h-[300px] overflow-y-auto p-3 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm scrollbar-thin">
                                {filteredDepartments.length > 0 ? (
                                    filteredDepartments.map(dep => (
                                        <div 
                                            key={dep.id}
                                            onClick={() => {
                                                const targetId = dep.departmentId || dep.id;
                                                const isSelected = formData.departmentIds.includes(targetId);
                                                const newIds = isSelected 
                                                    ? formData.departmentIds.filter(id => id !== targetId)
                                                    : [...formData.departmentIds, targetId];
                                                setFormData({ ...formData, departmentIds: newIds });
                                            }}
                                            className={`flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-all border ${
                                                formData.departmentIds.includes(dep.departmentId || dep.id) 
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20 translate-x-1' 
                                                    : 'bg-slate-50 dark:bg-slate-900 border-transparent hover:border-blue-500/30'
                                            }`}
                                        >
                                            <span className="text-xs font-black uppercase tracking-tight">{dep.name}</span>
                                            {formData.departmentIds.includes(dep.departmentId || dep.id) && <Plus className="h-3 w-3 ml-auto rotate-45" />}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-xs font-black uppercase text-slate-400">No departments found</div>
                                )}
                            </div>
                        </div>

                        {/* Teachers */}
                        <div className="space-y-4">
                            <Label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Assign Teachers</Label>
                            <Input 
                                type="text"
                                placeholder="Search teachers..."
                                value={teacherSearch}
                                onChange={(e) => setTeacherSearch(e.target.value)}
                                className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-2xl h-11 px-4 font-bold shadow-sm"
                            />
                            <div className="space-y-2 max-h-[300px] overflow-y-auto p-3 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm scrollbar-thin">
                                {filteredTeachers.length > 0 ? (
                                    filteredTeachers.map((teacher: any) => (
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
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-xs font-black uppercase text-slate-400">No teachers found</div>
                                )}
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
                            placeholder="Provide a brief overview of this subject..."
                        />
                    </div>
                </TabsContent>

                <TabsContent value="curriculum" className="space-y-8 mt-0">
                    <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="text-left">
                            <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Curriculum Plan</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Plan your weekly topics and objectives</p>
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
                                            <Target className="h-3 w-3 text-primary" />
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
                                    <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">No curriculum plan added</h5>
                                    <p className="text-xs text-slate-500 font-medium mt-1">Start by adding weekly topics and objectives.</p>
                                </div>
                                <Button 
                                    type="button"
                                    onClick={addSchemeRow}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] px-8 rounded-full h-11"
                                >
                                    Add Week 1
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
                    Cancel
                </Button>
                <div className="flex gap-4">
                    <Button 
                        type="submit" 
                        disabled={isSaving} 
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 rounded-full h-12 shadow-2xl shadow-blue-600/30 active:scale-95 transition-all text-xs uppercase tracking-widest"
                    >
                        {isSaving ? "Saving..." : (subject?.id ? "Save Changes" : "Create Subject")}
                    </Button>
                </div>
            </DialogFooter>
          </Tabs>
        )}
      </form>
      </DialogContent>
    </Dialog>
  )
}

export default SubjectModal

