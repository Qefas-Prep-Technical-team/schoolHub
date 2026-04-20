"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { subjectService, Subject, SchemeOfWork } from "../services/subjectService"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Edit, Users, BookOpen, Clock, BarChart3, GraduationCap, Building2, Layers, CheckCircle2, Circle, AlertCircle } from "lucide-react"
import SubjectModal from "../components/SubjectModal"
import { apiClient } from "@/lib/api/client"
import { useAuthStore } from "@/app/(auth)/login/services/auth-store"
import { toast } from "react-toastify"
import { Progress } from "@/components/ui/progress"

const SubjectDetailPage = () => {
  const { id } = useParams()
  const router = useRouter()
  const { user } = useAuthStore()
  
  const [subject, setSubject] = useState<Subject | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [schoolId, setSchoolId] = useState<string>("");
  const [schemes, setSchemes] = useState<SchemeOfWork[]>([])

  const fetchSubject = async () => {
    setLoading(true)
    try {
      const data = await subjectService.getSubject(id as string)
      setSubject(data)
      const schemeData = await subjectService.getScheme(id as string)
      setSchemes(schemeData)
    } catch (error) {
      console.error("Failed to fetch subject details", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSchoolId = async () => {
      if (user?.email) {
          try {
              const res = await apiClient.get(`/admin/admin-status/${user.email}`);
              setSchoolId(res.data.data.schoolAdmins?.[0]?.schoolId || "");
          } catch (err) {
              console.error("Failed to fetch school context", err);
          }
      }
  };

  useEffect(() => {
    fetchSubject()
    fetchSchoolId()
  }, [id, user?.email])

  const handleToggleCompletion = async (schemeId: string, currentStatus: boolean) => {
    try {
        await subjectService.updateSchemeEntry(schemeId, { isCompleted: !currentStatus });
        setSchemes(schemes.map(s => s.id === schemeId ? { ...s, isCompleted: !currentStatus } : s));
        toast.success(currentStatus ? "Topic marked as pending" : "Topic marked as completed");
    } catch (error) {
        console.error("Failed to update status", error);
        toast.error("Failed to update topic status");
    }
  };

  const completedCount = schemes.filter(s => s.isCompleted).length;
  const progressPercent = schemes.length > 0 ? Math.round((completedCount / schemes.length) * 100) : 0;

  const handleRemoveTeacher = async (teacherId: string) => {
    if (!subject || !schoolId) return;
    const confirmRemove = window.confirm("Are you sure you want to remove this teacher from the subject?");
    if (!confirmRemove) return;

    try {
        const currentTeacherIds = (subject as any).teacherSubjects?.map((ts: any) => ts.teacherId) || [];
        const newTeacherIds = currentTeacherIds.filter((tid: string) => tid !== teacherId);
        await apiClient.post(`/academic/subjects/${subject.id}/teachers`, {
            teacherIds: newTeacherIds,
            schoolId,
        });
        toast.success("Teacher removed successfully");
        fetchSubject();
    } catch (error) {
        toast.error("Failed to remove teacher");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-blue-600">
        <span className="material-symbols-outlined text-5xl animate-spin">cyclone</span>
      </div>
    )
  }

  if (!subject) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <AlertCircle className="h-16 w-16 text-slate-300 dark:text-slate-800 mb-4" />
        <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Subject Not Found</h1>
        <Button variant="link" onClick={() => router.push("/dashboard/admin/subjects")} className="mt-4 text-blue-600 font-bold">Back to curriculum</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <main className="pt-24 pb-12 px-4 sm:px-8 max-w-7xl mx-auto">
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <button onClick={() => router.push("/dashboard/admin/subjects")} className="flex items-center gap-2 text-sm font-black text-slate-500 hover:text-blue-600 transition-all uppercase tracking-widest group">
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1" /> Back to Subjects
          </button>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="rounded-xl font-bold border-slate-200 dark:border-slate-800" onClick={() => window.print()}>Print</Button>
            <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl px-6 gap-2">
              <Edit className="h-4 w-4" /> Edit Subject
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="px-4 py-1.5 bg-blue-600 text-white font-black text-xs rounded-full uppercase tracking-widest">{subject.code}</span>
                <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${subject.scope === 'SCHOOL' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
                   <span className="material-symbols-outlined text-[14px]">{subject.scope === 'SCHOOL' ? 'domain' : 'person'}</span> {subject.scope}
                </div>
              </div>
              <h1 className="text-5xl sm:text-6xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{subject.name}</h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl">{subject.description || "No description provided."}</p>
              <div className="flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-blue-600"><Users className="h-6 w-6" /></div>
                  <div><p className="text-xs font-bold text-slate-400 uppercase">Teachers</p><p className="text-lg font-black text-slate-900 dark:text-white leading-none">{subject.teachersCount || 0}</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-600"><BookOpen className="h-6 w-6" /></div>
                  <div><p className="text-xs font-bold text-slate-400 uppercase">Classes</p><p className="text-lg font-black text-slate-900 dark:text-white leading-none">{subject.classesCount || 0}</p></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl space-y-4">
                   <div className="h-10 w-10 bg-blue-600 text-white rounded-xl flex items-center justify-center"><BarChart3 className="h-5 w-5" /></div>
                   <h4 className="text-sm font-black uppercase tracking-tight">Curriculum Completion</h4>
                   <div className="space-y-1">
                        <p className="text-2xl font-black text-blue-600">{progressPercent}%</p>
                        <Progress value={progressPercent} className="h-1.5 bg-blue-100 dark:bg-blue-900/30" />
                   </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl space-y-4">
                   <div className="h-10 w-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center"><Clock className="h-5 w-5" /></div>
                   <h4 className="text-sm font-black uppercase tracking-tight">Timeline</h4>
                   <p className="text-2xl font-black text-indigo-600">{schemes.length} Weeks</p>
                </div>
                <div className="col-span-2 bg-slate-900 dark:bg-slate-800 p-8 rounded-3xl text-white flex justify-between items-center group cursor-pointer hover:bg-slate-800 transition-all">
                    <div>
                        <h3 className="text-xl font-black uppercase tracking-tighter">View Lesson Plans</h3>
                        <p className="text-slate-400 text-sm font-medium">Access detailed pedagogical notes for this subject</p>
                    </div>
                    <span className="material-symbols-outlined text-3xl group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </div>
            </div>
          </div>
        </div>

        {/* Content Tabs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Column: Depts & Classes */}
            <div className="lg:col-span-1 space-y-8">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase">Departments</h2>
                    </div>
                    <div className="space-y-2">
                        {subject.departments?.map((d: any) => (
                            <div key={d.departmentId} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300">
                                {d.department.name}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <Layers className="h-5 w-5 text-indigo-600" />
                        <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase">Active Classes</h2>
                    </div>
                    <div className="space-y-2">
                        {subject.classes?.map((c: any) => (
                            <div key={c.classId} onClick={() => router.push(`/dashboard/admin/classes/${c.classId}`)} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-center justify-between cursor-pointer group hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100">
                                <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">{c.class.name}</span>
                                <span className="material-symbols-outlined text-transparent group-hover:text-indigo-600 text-sm">open_in_new</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content: Scheme of Work & Teachers */}
            <div className="lg:col-span-3 space-y-8">
                {/* Scheme of Work Section */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Scheme of Work</h2>
                        </div>
                    </div>

                    <div className="space-y-1">
                        {schemes.length > 0 ? schemes.map((scheme, idx) => (
                            <div key={scheme.id} className={`p-6 flex items-start gap-6 border-b dark:border-slate-800 last:border-none transition-all group ${scheme.isCompleted ? 'bg-blue-50/20 dark:bg-blue-900/5' : ''}`}>
                                <div className="pt-1 flex flex-col items-center">
                                    <button 
                                        onClick={() => handleToggleCompletion(scheme.id, scheme.isCompleted)}
                                        className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${scheme.isCompleted ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 hover:text-blue-600'}`}
                                    >
                                        {scheme.isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                                    </button>
                                    <div className="w-0.5 h-full bg-slate-100 dark:bg-slate-800 mt-2"></div>
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">Week {scheme.week}</span>
                                        <h3 className={`text-lg font-black uppercase tracking-tight ${scheme.isCompleted ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>{scheme.topic}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Learning Objectives</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{scheme.objectives || "Not specified."}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resources</p>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{scheme.resources || "None."}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="py-20 text-center space-y-4">
                                <span className="material-symbols-outlined text-5xl text-slate-200">event_note</span>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Curriculum Roadmap Defined</p>
                                <Button onClick={() => setIsModalOpen(true)} variant="link" className="text-blue-600 font-bold">Initialize Scheme of Work</Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Teachers Section */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <GraduationCap className="h-6 w-6 text-indigo-600" />
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Subject Teachers</h2>
                        </div>
                        <Button onClick={() => setIsModalOpen(true)} variant="ghost" className="text-blue-600 font-bold uppercase text-xs tracking-widest hover:bg-blue-50">Assign More</Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(subject as any).teacherSubjects?.map((ts: any) => (
                            <div key={ts.teacherId} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-indigo-500/20 transition-all flex items-center gap-4 group">
                                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black uppercase shadow-sm">{ts.teacher.name.charAt(0)}</div>
                                <div className="cursor-pointer" onClick={() => router.push(`/dashboard/admin/teachers/${ts.teacherId}`)}>
                                    <h4 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors uppercase">{ts.teacher.name}</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase">{ts.teacher.teacherCode}</p>
                                </div>
                                <button onClick={() => handleRemoveTeacher(ts.teacherId)} className="ml-auto text-slate-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"><span className="material-symbols-outlined text-[20px]">person_remove</span></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </main>

      <SubjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchSubject} subject={subject} />
    </div>
  )
}

export default SubjectDetailPage
