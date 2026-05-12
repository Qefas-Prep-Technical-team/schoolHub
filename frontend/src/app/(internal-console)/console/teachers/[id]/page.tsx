"use client"

import { useParams, useRouter } from "next/navigation"
import { 
    usePlatformTeacherDetails,
    useUpdateTeacherPlan,
    useAllPlatformPlans,
    PlatformTeacherDetails
} from "@/lib/api/hooks/usePlatformSchools"
import { useResetTeacherSubscription } from "@/lib/api/hooks/usePlatformBilling"
import { 
    GraduationCap as TeacherIcon, 
    ChevronLeft as ChevronLeftIcon, 
    Mail as MailIcon, 
    User as UserIcon, 
    Calendar as CalendarIcon, 
    School as SchoolIcon,
    ShieldCheck as ShieldCheckIcon, 
    ExternalLink as ExternalLinkIcon,
    Users as UsersIcon,
    BookOpen as BookOpenIcon,
    FileText as FileTextIcon,
    Clock as ClockIcon,
    MapPin as MapPinIcon,
    Tag as TagIcon,
    CreditCard as CreditCardIcon,
    AlertTriangle as AlertTriangleIcon,
    CheckCircle as CheckCircleIcon,
    XCircle as XCircleIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { format } from "date-fns"
import Link from "next/link"

export default function TeacherDetailsPage() {
    const { id } = useParams()
    const router = useRouter()
    const { data: teacher, isLoading } = usePlatformTeacherDetails(id as string)
    const { data: plans } = useAllPlatformPlans()
    const updatePlanMutation = useUpdateTeacherPlan()
    const resetSubscriptionMutation = useResetTeacherSubscription()
    
    const [activeTab, setActiveTab] = useState("overview")
    const [isEditingPlan, setIsEditingPlan] = useState(false)
    const [editData, setEditData] = useState({
        plan: "",
        subscriptionPlanId: "",
        subscriptionStatus: "",
        subscriptionEnd: "",
        isTrialActive: false
    })

    if (isLoading) {
        return (
            <div className="space-y-8 animate-pulse p-8">
                <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem]"></div>
                        <div className="h-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem]"></div>
                    </div>
                    <div className="space-y-8">
                        <div className="h-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem]"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!teacher) return (
        <div className="flex flex-col items-center justify-center h-screen space-y-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Teacher not found</h1>
            <Button onClick={() => router.push("/console/teachers")}>Return to Index</Button>
        </div>
    )

    const stats = [
        { label: "Subjects", value: teacher._count?.teacherSubjects || 0, icon: BookOpenIcon, color: "text-blue-400" },
        { label: "Classes", value: teacher._count?.classTeachers || 0, icon: UsersIcon, color: "text-emerald-400" },
        { label: "Exams", value: teacher._count?.exams || 0, icon: FileTextIcon, color: "text-orange-400" },
        { label: "Alerts", value: 0, icon: ShieldCheckIcon, color: "text-red-400" }, // Placeholder as teachers don't have behaviour alerts
    ]

    const handleStartEdit = () => {
        setEditData({
            plan: teacher.plan || "FREE",
            subscriptionPlanId: teacher.subscriptionPlanId || "",
            subscriptionStatus: teacher.subscriptionStatus || "ACTIVE",
            subscriptionEnd: teacher.subscriptionEnd ? format(new Date(teacher.subscriptionEnd), "yyyy-MM-dd") : "",
            isTrialActive: teacher.isTrialActive || false
        })
        setIsEditingPlan(true)
    }

    const handleSavePlan = async () => {
        try {
            await updatePlanMutation.mutateAsync({
                id: teacher.id,
                planData: {
                    ...editData,
                    subscriptionEnd: editData.subscriptionEnd ? new Date(editData.subscriptionEnd).toISOString() : null
                }
            })
            setIsEditingPlan(false)
        } catch (error) {
            console.error("Failed to update plan:", error)
        }
    }

    const handleResetSubscription = async () => {
        if (!confirm("Are you sure you want to reset this teacher's subscription? This will clear all overrides and revert them to the FREE plan.")) return
        try {
            await resetSubscriptionMutation.mutateAsync({ teacherId: teacher.id })
        } catch (error) {
            console.error("Failed to reset subscription:", error)
        }
    }

    const handleToggleStatus = async () => {
        const newStatus = teacher.subscriptionStatus === "SUSPENDED" ? "ACTIVE" : "SUSPENDED"
        if (!confirm(`Are you sure you want to ${newStatus === "ACTIVE" ? "restore" : "suspend"} this teacher's access?`)) return
        
        try {
            await updatePlanMutation.mutateAsync({
                id: teacher.id,
                planData: {
                    subscriptionStatus: newStatus
                }
            })
        } catch (error) {
            console.error("Failed to toggle status:", error)
        }
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button 
                    variant="ghost" 
                    className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white -ml-4"
                    onClick={() => router.push("/console/teachers")}
                >
                    <ChevronLeftIcon size={20} className="mr-2" /> Back to Index
                </Button>
                <div className="flex gap-3">
                    {teacher.primarySchool && (
                        <Button 
                            variant="outline" 
                            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                            asChild
                        >
                            <Link href={`/console/schools/${teacher.primarySchool.id}`}>
                                <ExternalLinkIcon size={16} className="mr-2" /> View School
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Info & Stats */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Identity Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-sm">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <TeacherIcon size={120} className="text-slate-500" />
                        </div>
                        
                        <div className="flex items-start gap-6 relative z-10">
                            <div className="h-24 w-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center border border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden shrink-0">
                                {teacher.profileImage ? (
                                    <Image 
                                        src={teacher.profileImage} 
                                        alt={teacher.name} 
                                        fill
                                        className="object-cover" 
                                    />
                                ) : (
                                    <UserIcon size={40} className="text-indigo-500" />
                                )}
                            </div>
                            <div className="space-y-1 min-w-0">
                                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter truncate">{teacher.name}</h1>
                                <div className="flex flex-wrap items-center gap-3 mt-2">
                                    <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider">
                                        {teacher.teacherCode}
                                    </Badge>
                                    <code className="text-sm text-slate-500 font-mono bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-white/5">
                                        ID: {teacher.id}
                                    </code>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                <MailIcon size={18} className="text-indigo-500 shrink-0" />
                                <span className="text-sm font-medium truncate">{teacher.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                <TagIcon size={18} className="text-emerald-500 shrink-0" />
                                <span className="text-sm font-medium">{teacher.jobTitle || "Teacher"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors shadow-sm">
                                <stat.icon size={20} className={cn("mb-3", stat.color)} />
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Detailed Info Tabs */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
                         <div className="flex items-center gap-6 border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 sticky top-0 bg-white dark:bg-slate-900 z-10 overflow-x-auto no-scrollbar">
                            <button 
                                onClick={() => setActiveTab("overview")}
                                className={cn(
                                    "text-sm uppercase tracking-widest font-black pb-4 transition-all whitespace-nowrap border-b-2",
                                    activeTab === "overview" ? "text-indigo-600 border-indigo-500" : "text-slate-400 border-transparent hover:text-slate-600"
                                )}
                            >Overview</button>
                            <button 
                                onClick={() => setActiveTab("subjects")}
                                className={cn(
                                    "text-sm uppercase tracking-widest font-black pb-4 transition-all whitespace-nowrap border-b-2",
                                    activeTab === "subjects" ? "text-indigo-600 border-indigo-500" : "text-slate-400 border-transparent hover:text-slate-600"
                                )}
                            >Subjects</button>
                            <button 
                                onClick={() => setActiveTab("classes")}
                                className={cn(
                                    "text-sm uppercase tracking-widest font-black pb-4 transition-all whitespace-nowrap border-b-2",
                                    activeTab === "classes" ? "text-indigo-600 border-indigo-500" : "text-slate-400 border-transparent hover:text-slate-600"
                                )}
                            >Classes</button>
                            <button 
                                onClick={() => setActiveTab("subscription")}
                                className={cn(
                                    "text-sm uppercase tracking-widest font-black pb-4 transition-all whitespace-nowrap border-b-2",
                                    activeTab === "subscription" ? "text-indigo-600 border-indigo-500" : "text-slate-400 border-transparent hover:text-slate-600"
                                )}
                            >Subscription</button>
                         </div>
                         
                         {activeTab === "overview" && (
                              <div className="space-y-6">
                                <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Institutional Affiliation</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                                            <SchoolIcon size={24} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">{teacher.primarySchool?.name || "Independent Teacher"}</p>
                                            <p className="text-xs text-slate-500 font-medium">Tenant ID: {teacher.primarySchool?.tenantId || "N/A"}</p>
                                        </div>
                                        {teacher.primarySchool && (
                                            <Button variant="ghost" size="icon" className="ml-auto" asChild>
                                                <Link href={`/console/schools/${teacher.primarySchool.id}`}>
                                                    <ExternalLinkIcon size={18} />
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Professional Status</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-slate-500">Job Title</span>
                                                <span className="text-sm font-bold">{teacher.jobTitle || "Teacher"}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-slate-500">Gender</span>
                                                <span className="text-sm font-bold uppercase">{teacher.gender || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-slate-500">Bio</span>
                                                <span className="text-xs font-medium text-slate-400 italic max-w-[150px] truncate">{teacher.bio || "No bio"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Registration Details</h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-slate-500">Joined Platform</span>
                                                <span className="text-sm font-bold">{format(new Date(teacher.createdAt), "MMM dd, yyyy")}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-slate-500">Account Status</span>
                                                <Badge className={cn(
                                                    "rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-tighter border-none",
                                                    teacher.verified ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                                                )}>
                                                    {teacher.verified ? "Verified" : "Pending"}
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-slate-500">Auth Provider</span>
                                                <span className="text-sm font-bold uppercase">{teacher.authProvider}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                              </div>
                          )}

                          {activeTab === "subjects" && (
                              <div className="space-y-4">
                                  {(teacher.teacherSubjects?.length ?? 0) > 0 ? (
                                      teacher.teacherSubjects!.map((ts) => (
                                          <div key={ts.id} className="p-5 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                                              <div className="flex items-center gap-4">
                                                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                      <BookOpenIcon size={20} />
                                                  </div>
                                                  <div>
                                                      <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{ts.subject?.name}</p>
                                                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Added on {format(new Date(ts.createdAt), "MMM dd, yyyy")}</p>
                                                  </div>
                                              </div>
                                              <Badge className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none rounded-lg px-3 py-1 font-bold text-[10px] uppercase">
                                                  {ts.subject?.subjectCode || "N/A"}
                                              </Badge>
                                          </div>
                                      ))
                                  ) : (
                                      <div className="py-20 text-center">
                                          <BookOpenIcon size={40} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No subjects assigned</p>
                                      </div>
                                  )}
                              </div>
                          )}

                          {activeTab === "classes" && (
                              <div className="space-y-4">
                                  {(teacher.classTeachers?.length ?? 0) > 0 ? (
                                      teacher.classTeachers!.map((tc) => (
                                          <div key={tc.id} className="p-5 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                                              <div className="flex items-center gap-4">
                                                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                      <UsersIcon size={20} />
                                                  </div>
                                                  <div>
                                                      <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{tc.class?.name}</p>
                                                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Assigned on {format(new Date(tc.createdAt), "MMM dd, yyyy")}</p>
                                                  </div>
                                              </div>
                                              <div className="text-right">
                                                  <Badge className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-none rounded-lg px-3 py-1 font-bold text-[10px] uppercase mb-1">
                                                      {tc.class?.classCode}
                                                  </Badge>
                                                  <p className="text-[9px] text-slate-400 font-bold">{tc.class?.gradeLevel}</p>
                                              </div>
                                          </div>
                                      ))
                                  ) : (
                                      <div className="py-20 text-center">
                                          <UsersIcon size={40} className="mx-auto text-slate-200 dark:text-slate-800 mb-4" />
                                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No classes assigned</p>
                                      </div>
                                  )}
                              </div>
                          )}

                          {activeTab === "subscription" && (
                              <div className="space-y-8">
                                  <div className="flex items-center justify-between">
                                      <div>
                                          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Plan Management</h3>
                                          <p className="text-sm text-slate-500">Configure teacher billing tier and access duration</p>
                                      </div>
                                      {!isEditingPlan && (
                                          <Button onClick={handleStartEdit} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-6 h-11 font-bold">
                                              Edit Plan Details
                                          </Button>
                                      )}
                                  </div>

                                  {!isEditingPlan ? (
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800">
                                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">Current Subscription</p>
                                              <div className="space-y-4">
                                                  <div className="flex justify-between items-center">
                                                      <span className="text-sm text-slate-500">Tier</span>
                                                      <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-none font-black">{teacher.plan}</Badge>
                                                  </div>
                                                  <div className="flex justify-between items-center">
                                                      <span className="text-sm text-slate-500">Plan ID</span>
                                                      <span className="text-xs font-mono text-slate-400">{teacher.subscriptionPlanId || "None (Legacy/Free)"}</span>
                                                  </div>
                                                  <div className="flex justify-between items-center">
                                                      <span className="text-sm text-slate-500">Trial Period</span>
                                                      <span className="text-sm font-bold">{teacher.isTrialActive ? "Active" : "None"}</span>
                                                  </div>
                                              </div>
                                          </div>
                                          <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800">
                                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-4">Duration & Renewal</p>
                                              <div className="space-y-4">
                                                  <div className="flex justify-between items-center">
                                                      <span className="text-sm text-slate-500">Status</span>
                                                      <Badge className={cn(
                                                          "font-black uppercase tracking-tighter text-[10px] border-none",
                                                          teacher.subscriptionStatus === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                                                      )}>{teacher.subscriptionStatus}</Badge>
                                                  </div>
                                                  <div className="flex justify-between items-center">
                                                      <span className="text-sm text-slate-500">Expires On</span>
                                                      <span className="text-sm font-bold">{teacher.subscriptionEnd ? format(new Date(teacher.subscriptionEnd), "PPP") : "Never"}</span>
                                                  </div>
                                                  <div className="flex justify-between items-center">
                                                      <span className="text-sm text-slate-500">Last Payment</span>
                                                      <span className="text-sm font-bold">{teacher.lastPaymentDate ? format(new Date(teacher.lastPaymentDate), "MMM dd, yyyy") : "N/A"}</span>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  ) : (
                                      <div className="bg-slate-50 dark:bg-slate-950 rounded-[2rem] border border-indigo-500/20 p-8 space-y-6">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                              <div className="space-y-2">
                                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subscription Plan</label>
                                                  <select 
                                                      value={editData.subscriptionPlanId || editData.plan}
                                                      onChange={(e) => {
                                                          const val = e.target.value;
                                                          const selectedPlan = plans?.flatMap((c) => c.tabs).find((t) => t.id === val || t.type === val);
                                                          setEditData({
                                                              ...editData,
                                                              subscriptionPlanId: selectedPlan?.id || "",
                                                              plan: selectedPlan?.type?.toUpperCase() || val.toUpperCase()
                                                          });
                                                      }}
                                                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                                  >
                                                      <option value="FREE">FREE TIER</option>
                                                      {plans?.map((cat) => (
                                                          <optgroup key={cat.category} label={cat.category.toUpperCase()}>
                                                              {cat.tabs.map((plan: any) => (
                                                                  <option key={plan.id} value={plan.id}>
                                                                      {plan.name} ({plan.type.toUpperCase()})
                                                                  </option>
                                                              ))}
                                                          </optgroup>
                                                      ))}
                                                  </select>
                                              </div>

                                              <div className="space-y-2">
                                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subscription Status</label>
                                                  <select 
                                                      value={editData.subscriptionStatus}
                                                      onChange={(e) => setEditData({...editData, subscriptionStatus: e.target.value})}
                                                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                                                  >
                                                      <option value="ACTIVE">ACTIVE</option>
                                                      <option value="INACTIVE">INACTIVE</option>
                                                      <option value="SUSPENDED">SUSPENDED</option>
                                                      <option value="CANCELLED">CANCELLED</option>
                                                  </select>
                                              </div>

                                              <div className="space-y-2">
                                                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Expiration Date</label>
                                                  <input 
                                                      type="date"
                                                      value={editData.subscriptionEnd}
                                                      onChange={(e) => setEditData({...editData, subscriptionEnd: e.target.value})}
                                                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-11 px-4 text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none flex"
                                                  />
                                              </div>

                                              <div className="flex items-center gap-3 pt-6 ml-1">
                                                  <input 
                                                      type="checkbox"
                                                      id="isTrialActive"
                                                      checked={editData.isTrialActive}
                                                      onChange={(e) => setEditData({...editData, isTrialActive: e.target.checked})}
                                                      className="h-5 w-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                                  />
                                                  <label htmlFor="isTrialActive" className="text-sm font-bold text-slate-700 dark:text-slate-300">Active Free Trial</label>
                                              </div>
                                          </div>

                                          <div className="flex justify-end gap-3 pt-4">
                                              <Button variant="ghost" onClick={() => setIsEditingPlan(false)} className="rounded-xl font-bold h-11 px-6">Cancel</Button>
                                              <Button 
                                                  disabled={updatePlanMutation.isPending}
                                                  onClick={handleSavePlan} 
                                                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-11 px-8 font-bold shadow-lg shadow-indigo-500/20"
                                              >
                                                  {updatePlanMutation.isPending ? "Applying..." : "Save Plan Changes"}
                                              </Button>
                                          </div>
                                      </div>
                                  )}
                              </div>
                          )}
                    </div>
                </div>

                {/* Right Column: Platform Metadata & Billing */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <ShieldCheckIcon className="text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Access Control</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-white/5">
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Subscription Tier</p>
                                <div className="flex items-center justify-between">
                                    <span className={cn(
                                        "text-sm font-bold",
                                        teacher.subscriptionStatus === "ACTIVE" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                                    )}>{teacher.subscriptionStatus}</span>
                                    <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-none px-2 rounded font-black text-[9px] uppercase">{teacher.plan}</Badge>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500">
                                        <ClockIcon size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Last Billing Event</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                            {teacher.lastPaymentDate ? format(new Date(teacher.lastPaymentDate), "PPP") : "No payments"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <CalendarIcon size={16} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Renewal Date</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                            {teacher.subscriptionEnd ? format(new Date(teacher.subscriptionEnd), "PPP") : "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-4" />

                            <div className="space-y-4">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-1">Platform Operations</p>
                                <Button 
                                    variant="outline" 
                                    className="w-full border-slate-200 dark:border-slate-800 h-12 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800"
                                    onClick={handleResetSubscription}
                                    disabled={resetSubscriptionMutation.isPending}
                                >
                                    <AlertTriangleIcon size={16} className="mr-2 text-amber-500" />
                                    {resetSubscriptionMutation.isPending ? "Resetting..." : "Reset Subscription"}
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className={cn(
                                        "w-full h-12 rounded-2xl font-bold",
                                        teacher.subscriptionStatus === "SUSPENDED" 
                                            ? "border-emerald-500/10 text-emerald-500 hover:bg-emerald-500/5" 
                                            : "border-red-500/10 text-red-500 hover:bg-red-500/5"
                                    )}
                                    onClick={handleToggleStatus}
                                    disabled={updatePlanMutation.isPending}
                                >
                                    {teacher.subscriptionStatus === "SUSPENDED" ? (
                                        <><CheckCircleIcon size={16} className="mr-2" /> Restore Access</>
                                    ) : (
                                        <><XCircleIcon size={16} className="mr-2" /> Suspend Access</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 dark:bg-black rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform pointer-events-none">
                            <ClockIcon size={64} />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-60">System Log Summary</h4>
                        <div className="space-y-4 relative z-10">
                            <div className="flex justify-between items-center text-xs">
                                <span className="opacity-60">Last Login IP</span>
                                <span className="font-mono">N/A</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="opacity-60">Device fingerprint</span>
                                <span className="font-mono">N/A</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="opacity-60">Active Sessions</span>
                                <span className="font-bold">0</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
