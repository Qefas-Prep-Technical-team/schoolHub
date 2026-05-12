"use client"

import { useState, use } from "react"
import { useParams, useRouter } from "next/navigation"
import { 
    usePlatformParentDetails,
    useUpdateParentPlan,
    PlatformParentDetails
} from "@/lib/api/hooks/usePlatformSchools"
import { useResetParentSubscription } from "@/lib/api/hooks/usePlatformBilling"
import { 
    UserCircle as UserIcon,
    Mail as MailIcon,
    Phone as PhoneIcon,
    MapPin as MapPinIcon,
    Calendar as CalendarIcon,
    Baby as BabyIcon,
    CreditCard as CreditCardIcon,
    ShieldCheck as ShieldCheckIcon,
    Clock as ClockIcon,
    ArrowLeft as ArrowLeftIcon,
    AlertCircle as AlertCircleIcon,
    CheckCircle2 as CheckCircleIcon,
    Zap as ZapIcon,
    Hash as HashIcon,
    Globe as GlobeIcon,
    Building as SchoolIcon,
    School as ClassIcon,
    Filter as FilterIcon,
    RefreshCw as ResetIcon,
    ShieldAlert as SuspendIcon
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function PlatformParentDetailsPage() {
    const params = useParams()
    const id = params?.id
    const router = useRouter()
    const [activeTab, setActiveTab] = useState("overview")

    const { data: parent, isLoading } = usePlatformParentDetails(id as string)
    const updatePlan = useUpdateParentPlan()
    const resetSubscription = useResetParentSubscription()

    if (isLoading) return <LoadingSkeleton />

    if (!parent) return (
        <div className="flex flex-col items-center justify-center h-screen space-y-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Parent not found</h1>
            <Button onClick={() => router.push("/console/parents")}>Return to Registry</Button>
        </div>
    )

    const stats = [
        { label: "Children", value: parent._count?.children || 0, icon: BabyIcon, color: "text-blue-400" },
        { label: "Payments", value: parent._count?.payments || 0, icon: CreditCardIcon, color: "text-emerald-400" },
        { label: "Alerts", value: 0, icon: ShieldCheckIcon, color: "text-red-400" },
        { label: "Joined", value: format(new Date(parent.createdAt), 'MMM yyyy'), icon: CalendarIcon, color: "text-orange-400" },
    ]

    const handleUpdateStatus = (status: string) => {
        updatePlan.mutate({ 
            id: parent.id, 
            planData: { subscriptionStatus: status } 
        })
    }

    const handleResetSubscription = () => {
        if (confirm("Are you sure you want to reset this parent's subscription to FREE? This will clear all institution overrides.")) {
            resetSubscription.mutate({ id: parent.id })
        }
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                <div className="flex items-center gap-6">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="rounded-full h-12 w-12 bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800"
                        onClick={() => router.back()}
                    >
                        <ArrowLeftIcon size={20} />
                    </Button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white">{parent.fullName}</h1>
                            <Badge className="bg-indigo-500/10 text-indigo-500 border-none font-black px-3 py-1 uppercase tracking-widest text-[10px]">
                                {parent.parentCode}
                            </Badge>
                        </div>
                        <p className="text-slate-500 font-medium flex items-center gap-2">
                           <MailIcon size={14} /> {parent.email}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3">
                    {parent.subscriptionStatus === 'ACTIVE' ? (
                        <Button 
                            variant="outline" 
                            className="rounded-2xl border-red-500/20 text-red-500 hover:bg-red-500/10"
                            onClick={() => handleUpdateStatus('SUSPENDED')}
                            disabled={updatePlan.isPending}
                        >
                            <SuspendIcon size={18} className="mr-2" /> Suspend Account
                        </Button>
                    ) : (
                        <Button 
                            variant="outline" 
                            className="rounded-2xl border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10"
                            onClick={() => handleUpdateStatus('ACTIVE')}
                            disabled={updatePlan.isPending}
                        >
                            <CheckCircleIcon size={18} className="mr-2" /> Restore Access
                        </Button>
                    )}
                    <Button 
                        variant="destructive" 
                        className="rounded-2xl"
                        onClick={handleResetSubscription}
                        disabled={resetSubscription.isPending}
                    >
                        <ResetIcon size={18} className="mr-2" /> Reset Sub
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="p-6 bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm relative overflow-hidden group">
                        <div className="relative z-10 space-y-4">
                            <div className={cn("h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-transform group-hover:scale-110 duration-300", stat.color)}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 leading-none">{stat.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <Card className="lg:col-span-1 p-8 bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8 h-fit">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="h-24 w-24 rounded-[2rem] bg-indigo-500/10 flex items-center justify-center text-indigo-500 border-4 border-white dark:border-slate-900 shadow-xl">
                            <UserIcon size={48} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white">{parent.fullName}</h3>
                            <div className="flex items-center gap-2 justify-center">
                                <Badge className={cn(
                                    "rounded-full px-3 py-1 font-black text-[9px] uppercase tracking-widest border-none",
                                    parent.subscriptionStatus === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                                )}>
                                    Account {parent.subscriptionStatus}
                                </Badge>
                                <Badge className="bg-slate-500/10 text-slate-500 border-none font-black uppercase tracking-widest text-[9px]">{parent.role}</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Contact Information</h4>
                            <div className="space-y-2">
                                <ContactInfo icon={MailIcon} label="Primary Email" value={parent.email} />
                                <ContactInfo icon={PhoneIcon} label="Phone Number" value={parent.phone || "Not provided"} />
                                <ContactInfo icon={MapPinIcon} label="Location" value="N/A" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Security & Access</h4>
                            <div className="space-y-2 font-bold text-sm">
                                <div className="flex justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Verified</span>
                                    <span className={parent.verified ? "text-emerald-500" : "text-amber-500"}>{parent.verified ? "Yes" : "No"}</span>
                                </div>
                                <div className="flex justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-slate-500">Last Active</span>
                                    <span className="text-slate-900 dark:text-white">Active</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Right Column: Dynamic Content Tabs */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="bg-white dark:bg-slate-900 p-1.5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm h-16 w-full flex">
                            <TabsTrigger value="overview" className="flex-1 rounded-2xl data-[state=active]:bg-indigo-500 data-[state=active]:text-white transition-all font-black uppercase tracking-widest text-[10px] gap-2">
                                <GlobeIcon size={14} /> Overview
                            </TabsTrigger>
                            <TabsTrigger value="children" className="flex-1 rounded-2xl data-[state=active]:bg-indigo-500 data-[state=active]:text-white transition-all font-black uppercase tracking-widest text-[10px] gap-2">
                                <BabyIcon size={14} /> Children
                            </TabsTrigger>
                            <TabsTrigger value="subscription" className="flex-1 rounded-2xl data-[state=active]:bg-indigo-500 data-[state=active]:text-white transition-all font-black uppercase tracking-widest text-[10px] gap-2">
                                <ZapIcon size={14} /> Subscription
                            </TabsTrigger>
                        </TabsList>

                        <div className="mt-8">
                            <TabsContent value="overview">
                                <Card className="p-8 bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                               <FilterIcon size={12} /> Account Summary
                                            </h4>
                                            <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4 font-bold">
                                                <div className="h-16 w-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                                    <Badge className="text-xl">P</Badge>
                                                </div>
                                                <div>
                                                   <p className="text-slate-900 dark:text-white text-lg font-black">{parent.fullName}</p>
                                                   <p className="text-slate-500 text-sm">Parent Profile Active</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                               <ZapIcon size={12} /> Plan Details
                                            </h4>
                                            <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
                                                <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-none font-black text-lg py-1 px-4">{parent.plan}</Badge>
                                                <p className="text-slate-500 text-sm font-bold">Current Tier Plan</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent value="children">
                                <div className="space-y-4">
                                    {(parent.children?.length ?? 0) > 0 ? (
                                        parent.children!.map((link) => (
                                            <Card key={link.id} className="p-6 bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm hover:border-indigo-500/30 transition-all group">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                   <div className="flex items-center gap-5">
                                                        <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300">
                                                            <UserIcon size={24} />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg leading-none">{link.student?.name}</h4>
                                                                <Badge className="bg-slate-100 dark:bg-slate-800 border-none text-[10px] font-black uppercase tracking-widest text-slate-500">{link.student?.studentCode}</Badge>
                                                            </div>
                                                            <p className="text-slate-500 font-bold text-sm flex items-center gap-2">
                                                                <SchoolIcon size={14} className="text-indigo-500" />
                                                                {link.student?.school?.name || "Independent"}
                                                            </p>
                                                        </div>
                                                   </div>
                                                   <Button 
                                                       variant="ghost" 
                                                       className="group font-black text-[11px] uppercase tracking-[0.15em] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl px-6"
                                                       onClick={() => router.push(`/console/students/${link.studentId}`)}
                                                   >
                                                       View Profile
                                                   </Button>
                                                </div>
                                            </Card>
                                        ))
                                    ) : (
                                        <Card className="p-16 flex flex-col items-center justify-center text-center opacity-30 grayscale rounded-[2.5rem] bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
                                            <BabyIcon size={48} className="mb-4" />
                                            <p className="text-lg font-bold">No linked children found</p>
                                        </Card>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="subscription">
                                <SubscriptionPanel parent={parent} onUpdate={updatePlan} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}

function ContactInfo({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) {
    return (
        <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-indigo-500/30 transition-all">
            <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors shadow-sm">
                <Icon size={18} />
            </div>
            <div className="space-y-0.5 min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate lg:max-w-[200px]">{value}</p>
            </div>
        </div>
    )
}

function SubscriptionPanel({ parent, onUpdate }: { parent: PlatformParentDetails, onUpdate: any }) {
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({
        plan: parent.plan,
        subscriptionStatus: parent.subscriptionStatus,
        trialEndsAt: parent.trialEndsAt ? format(new Date(parent.trialEndsAt), "yyyy-MM-dd'T'HH:mm") : '',
        subscriptionEnd: parent.subscriptionEnd ? format(new Date(parent.subscriptionEnd), "yyyy-MM-dd'T'HH:mm") : ''
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onUpdate.mutate({ 
            id: parent.id, 
            planData: {
                ...formData,
                trialEndsAt: formData.trialEndsAt || null,
                subscriptionEnd: formData.subscriptionEnd || null
            } 
        }, {
            onSuccess: () => setIsEditing(false)
        })
    }

    return (
        <Card className="p-8 bg-white dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                    <h4 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Plan Governance</h4>
                    <p className="text-slate-500 text-sm font-medium">Control institutional access and subscription tiers.</p>
                </div>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} variant="outline" className="rounded-2xl font-black text-[10px] uppercase tracking-widest px-8">Edit Plan</Button>
                )}
            </div>

            {isEditing ? (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Subscription Tier</label>
                        <select 
                            value={formData.plan}
                            onChange={(e) => setFormData(prev => ({ ...prev, plan: e.target.value }))}
                            className="w-full h-14 bg-slate-100 dark:bg-slate-950 border-none rounded-3xl px-6 font-bold text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        >
                            <option value="FREE">FREE</option>
                            <option value="BASIC">BASIC</option>
                            <option value="PRO">PRO</option>
                            <option value="INSTITUTIONAL">INSTITUTIONAL</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Active Status</label>
                        <select 
                            value={formData.subscriptionStatus}
                            onChange={(e) => setFormData(prev => ({ ...prev, subscriptionStatus: e.target.value }))}
                            className="w-full h-14 bg-slate-100 dark:bg-slate-950 border-none rounded-3xl px-6 font-bold text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                            <option value="SUSPENDED">SUSPENDED</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Trial Ends At</label>
                        <input 
                            type="datetime-local"
                            value={formData.trialEndsAt}
                            onChange={(e) => setFormData(prev => ({ ...prev, trialEndsAt: e.target.value }))}
                            className="w-full h-14 bg-slate-100 dark:bg-slate-950 border-none rounded-3xl px-6 font-bold text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Subscription Ends At</label>
                        <input 
                            type="datetime-local"
                            value={formData.subscriptionEnd}
                            onChange={(e) => setFormData(prev => ({ ...prev, subscriptionEnd: e.target.value }))}
                            className="w-full h-14 bg-slate-100 dark:bg-slate-950 border-none rounded-3xl px-6 font-bold text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                        />
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)} className="rounded-2xl px-8 font-black uppercase text-[10px] tracking-widest">Cancel</Button>
                        <Button type="submit" disabled={onUpdate.isPending} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-12 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-500/25">Save Changes</Button>
                    </div>
                </form>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <InfoBlock label="Tier Plan" value={parent.plan} color="text-indigo-600" />
                    <InfoBlock label="Status" value={parent.subscriptionStatus} color={parent.subscriptionStatus === 'ACTIVE' ? "text-emerald-500" : "text-red-500"} />
                    <InfoBlock 
                        label="Trial Expiry" 
                        value={parent.trialEndsAt ? format(new Date(parent.trialEndsAt), 'MMM dd, yyyy') : "No Active Trial"} 
                        secondary={parent.trialEndsAt ? format(new Date(parent.trialEndsAt), 'hh:mm a') : ""}
                    />
                    <InfoBlock 
                        label="Plan Expiry" 
                        value={parent.subscriptionEnd ? format(new Date(parent.subscriptionEnd), 'MMM dd, yyyy') : "Lifetime/Manual"} 
                        secondary={parent.subscriptionEnd ? format(new Date(parent.subscriptionEnd), 'hh:mm a') : ""}
                    />
                </div>
            )}
        </Card>
    )
}

function InfoBlock({ label, value, secondary, color }: { label: string, value: string, secondary?: string, color?: string }) {
    return (
        <div className="space-y-1.5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none px-1">{label}</p>
            <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-[1.5rem] border border-slate-100 dark:border-slate-800">
                <p className={cn("text-base font-black leading-tight", color || "text-slate-900 dark:text-white")}>{value}</p>
                {secondary && <p className="text-[10px] font-bold text-slate-400 mt-1">{secondary}</p>}
            </div>
        </div>
    )
}

function LoadingSkeleton() {
    return (
        <div className="max-w-[1600px] mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-6">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-3">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-5 w-48" />
                </div>
            </div>
            <div className="grid grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-[2rem]" />)}
            </div>
            <div className="grid grid-cols-3 gap-8">
                <Skeleton className="col-span-1 h-[600px] rounded-[2.5rem]" />
                <Skeleton className="col-span-2 h-[600px] rounded-[2.5rem]" />
            </div>
        </div>
    )
}
