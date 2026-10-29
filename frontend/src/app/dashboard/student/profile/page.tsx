'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    User, 
    Mail, 
    Calendar, 
    Hash, 
    GraduationCap, 
    School, 
    Edit3, 
    CheckCircle2, 
    Save,
    X,
    ChevronRight,
    Briefcase,
    Fingerprint,
    ShieldCheck,
    MapPin,
    Loader2,
    Phone,
    Image as ImageIcon,
    Cake,
    Activity,
    Award,
    Sparkles,
    Building2,
    BookOpen,
    Lock,
    AlertTriangle
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { 
    useStudentProfile, 
    useUpdateStudentProfile, 
    useRequestEmailUpdate, 
    useVerifyEmailUpdate,
    studentKeys
} from '@/lib/api/hooks/useStudent';
import { StudentProfile, studentService } from '@/lib/api/services/studentService';
import { schoolService } from '@/lib/api/services/schoolService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ImageUpload from '@/components/reusable/ImageUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeaderTooltip } from '@/app/dashboard/student/components/dashboard/HeaderTooltip';
import { toast } from 'react-toastify';

interface DepartmentItem {
    id: string;
    name: string;
    code?: string;
    departmentId?: string;
}

interface EnrolledClassItem {
    class: {
        id: string;
        name: string;
        section?: string;
    };
}

interface ExtendedStudentProfile extends StudentProfile {
    twoFactorEnabled?: boolean;
    is2FAEnabled?: boolean;
}

export default function StudentProfilePage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { data: rawProfile, isLoading } = useStudentProfile();
    const profile = rawProfile as ExtendedStudentProfile | undefined;
    const updateProfile = useUpdateStudentProfile();
    const requestEmailUpdate = useRequestEmailUpdate();
    const verifyEmailUpdate = useVerifyEmailUpdate();

    // Department & Level state (synced with settings page)
    const [selectedDept, setSelectedDept] = useState<string>('');
    const [selectedLevel, setSelectedLevel] = useState<string>('');

    const { data: departments = [], isLoading: isDeptsLoading } = useQuery<DepartmentItem[]>({
        queryKey: ['schoolDepartments', profile?.schoolId],
        queryFn: () => schoolService.getDepartments(profile?.schoolId!),
        enabled: !!profile?.schoolId,
        staleTime: 1000 * 60 * 10,
    });

    const updateDeptMutation = useMutation({
        mutationFn: (deptId: string) => studentService.updateDepartment(deptId),
        onSuccess: () => {
            toast.success('Department locked in successfully!');
            queryClient.invalidateQueries({ queryKey: studentKeys.profile() });
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || 'Failed to update department');
        },
    });

    const updateLevelMutation = useMutation({
        mutationFn: (level: string) => studentService.updateLevel(level),
        onSuccess: () => {
            toast.success('Grade level locked in successfully!');
            queryClient.invalidateQueries({ queryKey: studentKeys.profile() });
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || 'Failed to update level');
        },
    });

    const isLocked = Boolean(profile?.departmentId || profile?.department?.id || profile?.department?.name);
    const isLevelLocked = Boolean(profile?.level);
    const hasSchool = Boolean(profile?.schoolId || profile?.school?.id);
    const schoolLevels: string[] = (profile as any)?.school?.levels || [];

    const enrolledDeptName =
        profile?.department?.name ||
        departments.find((d: DepartmentItem) => d.id === (profile?.departmentId || selectedDept) || d.departmentId === (profile?.departmentId || selectedDept))?.name ||
        'Assigned Department';

    const enrolledDeptCode =
        profile?.department?.code ||
        departments.find((d: DepartmentItem) => d.id === (profile?.departmentId || selectedDept) || d.departmentId === (profile?.departmentId || selectedDept))?.code;

    // editingTab controls which tab is open in the modal, null means modal is closed
    const [editingTab, setEditingTab] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        gender: '',
        dateOfBirth: '',
        profileImage: '',
        bannerImage: '',
        height: '',
        weight: '',
        club: '',
        favouriteColour: '',
        guardianName: '',
        guardianPhone: '',
        address: ''
    });

    const [emailStep, setEmailStep] = useState<'input' | 'verify'>('input');
    const [verificationCode, setVerificationCode] = useState('');

    useEffect(() => {
        if (profile && editingTab === null) {
            setFormData({
                name: profile.name || '',
                email: profile.email || '',
                gender: profile.gender || '',
                dateOfBirth: profile.dateOfBirth ? format(new Date(profile.dateOfBirth), 'yyyy-MM-dd') : '',
                profileImage: profile.profileImage || '',
                bannerImage: profile.bannerImage || '',
                height: profile.height?.toString() || '',
                weight: profile.weight?.toString() || '',
                club: profile.club || '',
                favouriteColour: profile.favouriteColour || '',
                guardianName: profile.guardianName || '',
                guardianPhone: profile.guardianPhone || profile.parentLinks?.[0]?.parent?.phone || '',
                address: profile.address || ''
            });
        }
    }, [profile, editingTab]);

    useEffect(() => {
        const deptId = profile?.departmentId || profile?.department?.id;
        if (deptId) setSelectedDept(deptId);
        if (profile?.level) setSelectedLevel(profile.level);
    }, [profile]);

    const handleEdit = (tab: string = 'personal') => setEditingTab(tab);

    const handleRequestEmailChange = async () => {
        await requestEmailUpdate.mutateAsync(formData.email);
        setEmailStep('verify');
    };

    const handleVerifyEmail = async () => {
        await verifyEmailUpdate.mutateAsync(verificationCode);
        setEmailStep('input');
        setVerificationCode('');
    };

    const handleSave = async () => {
        const { email: _email, height, weight, ...rest } = formData;
        
        await updateProfile.mutateAsync({
            ...rest,
            height: height ? parseInt(height) : undefined,
            weight: weight ? parseInt(weight) : undefined
        });
        setEditingTab(null);
    };

    const has2FA = Boolean(profile?.twoFactorEnabled || profile?.is2FAEnabled);

    if (isLoading) {
        return (
            <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-pulse">
                {/* Header Skeleton */}
                <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
                    <div className="h-40 sm:h-52 md:h-64 w-full bg-slate-200 dark:bg-zinc-800/60" />
                    <div className="relative -mt-14 sm:-mt-16 md:-mt-20 px-4 sm:px-6 md:px-10 flex flex-col md:flex-row items-center md:items-end gap-4 sm:gap-6 pb-6 sm:pb-8">
                        <div className="h-28 w-28 sm:h-36 sm:w-36 md:h-40 md:w-40 rounded-2xl bg-white dark:bg-zinc-900 p-1.5 shadow-xl border border-slate-100 dark:border-zinc-800 shrink-0">
                            <div className="w-full h-full rounded-xl bg-slate-200 dark:bg-zinc-800/80" />
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-2 sm:space-y-3">
                            <div className="h-7 sm:h-8 w-44 sm:w-56 bg-slate-200 dark:bg-zinc-800/80 rounded-lg mx-auto md:mx-0" />
                            <div className="h-4 w-52 sm:w-64 bg-slate-200 dark:bg-zinc-800/80 rounded mx-auto md:mx-0" />
                        </div>
                        <div className="flex items-center gap-2.5 sm:gap-3">
                            <div className="h-9 sm:h-10 w-24 sm:w-28 bg-slate-200 dark:bg-zinc-800/80 rounded-xl" />
                            <div className="h-9 sm:h-10 w-24 sm:w-28 bg-slate-200 dark:bg-zinc-800/80 rounded-xl" />
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 shadow-sm p-4 sm:p-5 flex items-center gap-4">
                            <div className="h-11 w-11 rounded-xl bg-slate-200 dark:bg-zinc-800 shrink-0" />
                            <div className="space-y-2 w-full">
                                <div className="h-3 w-16 bg-slate-200 dark:bg-zinc-800 rounded" />
                                <div className="h-5 w-24 bg-slate-200 dark:bg-zinc-800 rounded" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grids Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
                    <div className="lg:col-span-2 space-y-5 sm:space-y-6">
                        <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden min-h-[300px]">
                            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between">
                                <div className="h-6 w-32 bg-slate-200 dark:bg-zinc-800 rounded" />
                                <div className="h-8 w-8 bg-slate-200 dark:bg-zinc-800 rounded-md" />
                            </div>
                            <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-3 w-20 bg-slate-200 dark:bg-zinc-800 rounded" />
                                        <div className="h-5 w-40 bg-slate-200 dark:bg-zinc-800 rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-1 space-y-5 sm:space-y-6">
                        <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden min-h-[300px]">
                            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800">
                                <div className="h-6 w-32 bg-slate-200 dark:bg-zinc-800 rounded" />
                            </div>
                            <div className="p-5 sm:p-6 space-y-5 sm:space-y-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-3 w-24 bg-slate-200 dark:bg-zinc-800 rounded" />
                                        <div className="h-10 w-full bg-slate-200 dark:bg-zinc-800 rounded-lg" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    const initials = (profile.name || 'S')
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

    return (
        <div className="w-full max-w-[1600px] mx-auto space-y-6 sm:space-y-8 font-sans pb-16 md:pb-6 animate-in fade-in duration-500">
            
            {/* Header / Hero Section */}
            <div className="bg-white dark:bg-zinc-950 rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
                {/* Cover Photo / Banner */}
                <div className="h-40 sm:h-52 md:h-64 w-full relative bg-pink-600 flex items-center justify-center overflow-hidden group">
                    {profile.bannerImage ? (
                        <Image
                            src={profile.bannerImage}
                            alt="Student Profile Banner"
                            fill
                            priority
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 opacity-95">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2),transparent_70%)]" />
                        </div>
                    )}
                    
                    {/* Banner Edit Trigger */}
                    <button 
                        onClick={() => handleEdit('visuals')}
                        aria-label="Edit Profile Banner"
                        className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-95 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity rounded-full bg-white/90 hover:bg-white text-pink-700 shadow-md backdrop-blur-sm flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
                    >
                        <Edit3 size={14} />
                        <span className="hidden sm:inline">Change Banner</span>
                    </button>
                </div>

                {/* Profile Identity Bar */}
                <div className="relative -mt-14 sm:-mt-16 md:-mt-20 px-4 sm:px-6 md:px-10 flex flex-col md:flex-row items-center md:items-end gap-4 sm:gap-6 pb-6 sm:pb-8">
                    {/* Avatar with Badges */}
                    <div className="relative shrink-0 group">
                        <div 
                            className="h-28 w-28 sm:h-36 sm:w-36 md:h-40 md:w-40 rounded-2xl bg-white dark:bg-zinc-900 p-1.5 shadow-xl border border-slate-200/80 dark:border-zinc-800 flex items-center justify-center text-3xl sm:text-4xl md:text-5xl font-bold text-pink-600 dark:text-pink-400 cursor-pointer overflow-hidden relative"
                            onClick={() => handleEdit('visuals')}
                            title="Click to change profile avatar"
                        >
                            {profile.profileImage ? (
                                <div className="w-full h-full relative rounded-xl overflow-hidden">
                                    <Image
                                        src={profile.profileImage}
                                        alt={profile.name || 'Student Profile'}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-full rounded-xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center tracking-wider">
                                    {initials}
                                </div>
                            )}
                            
                            {/* Desktop hover overlay */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                <Edit3 size={22} className="text-white" />
                            </div>
                        </div>

                        {/* Mobile tap cue */}
                        <div 
                            onClick={() => handleEdit('visuals')}
                            className="sm:hidden absolute -top-1 -right-1 h-7 w-7 rounded-full bg-pink-600 text-white shadow-md flex items-center justify-center border-2 border-white dark:border-zinc-950"
                            title="Change photo"
                        >
                            <Edit3 size={13} />
                        </div>

                        {/* Verified Student Badge */}
                        <div 
                            className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-pink-600 border-2 sm:border-4 border-white dark:border-zinc-950 flex items-center justify-center text-white shadow-md"
                            title="Verified Enrolled Student"
                        >
                            <CheckCircle2 size={15} />
                        </div>
                    </div>

                    {/* Student Info & Academic Tags */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-2.5">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight break-words">
                                {profile.name}
                            </h1>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400 border border-pink-200/50 dark:border-pink-500/20 uppercase tracking-wider">
                                {profile.studentCode || 'STUDENT'}
                            </span>
                            {profile.prefectRole && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20 uppercase tracking-wider">
                                    <Award size={12} />
                                    {profile.prefectRole}
                                </span>
                            )}
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20 uppercase tracking-wider">
                                Active Scholar
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1.5 flex items-center justify-center md:justify-start gap-1.5">
                            <Fingerprint size={14} className="text-pink-500 shrink-0" /> Official Academic Identity & Records
                        </p>
                    </div>

                    {/* Action Triggers */}
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-2.5 mt-2 md:mt-0">
                        <Button 
                            onClick={() => handleEdit('personal')}
                            className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl font-semibold text-xs sm:text-sm bg-pink-600 hover:bg-pink-700 text-white shadow-sm transition-all focus:ring-2 focus:ring-pink-500/50"
                        >
                            <Edit3 size={15} className="mr-1.5" />
                            <span>Edit Profile</span>
                        </Button>
                        <Button 
                            variant="outline" 
                            title={has2FA ? "Two-Factor Authentication is active and protecting your account" : "Two-Factor Authentication setup recommended"}
                            className={cn(
                                "h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl font-semibold text-xs sm:text-sm transition-all border",
                                has2FA 
                                    ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-500/10 dark:border-green-500/50 hover:bg-green-100 dark:hover:bg-green-500/20" 
                                    : "border-slate-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900"
                            )}
                            onClick={() => router.push('/dashboard/student/settings?tab=security')}
                        >
                            <ShieldCheck size={15} className={cn("mr-1.5", has2FA ? "text-green-600 dark:text-green-400" : "text-pink-500")} />
                            <span>Security</span>
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => window.location.href = 'mailto:admin@qefashub.com'}
                            className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 font-semibold text-xs sm:text-sm transition-all"
                        >
                            <Mail size={15} className="mr-1.5 text-zinc-400" />
                            <span>Support</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-6">
                <StatCard 
                    icon={<Hash size={20} />} 
                    label="Reg ID" 
                    value={profile.studentCode || 'N/A'} 
                    color="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10"
                    tooltip="Official institutional identification code assigned to your academic profile. Used to index your official transcripts, examination papers, and library credentials."
                />
                <StatCard 
                    icon={<GraduationCap size={20} />} 
                    label="Cohort Level" 
                    value={profile.gradeLevel || profile.level || 'Standard'} 
                    color="text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-500/10"
                    tooltip="Your current enrolled cohort or academic grade level for this school term. Curriculum syllabi, class assignments, and grading metrics are mapped to this cohort."
                />
                <StatCard 
                    icon={<Briefcase size={20} />} 
                    label="Department" 
                    value={profile.department?.name || 'General Studies'} 
                    color="text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10"
                    tooltip="Academic department coordinating your curriculum focus (e.g. Science, Arts, Commercial, or General Studies)."
                />
            </div>

            {/* Main Content Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
                <div className="lg:col-span-2 space-y-5 sm:space-y-6">
                    {/* Personal Data */}
                    <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden relative group">
                        <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    <User className="text-pink-500 h-5 w-5" /> 
                                    Personal Data
                                </CardTitle>
                                <HeaderTooltip 
                                    content="Core personal identity information registered with the institution. Keep this information accurate for graduation diplomas, student identity cards, and parental correspondence."
                                />
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEdit('personal')}
                                className="h-8 w-8 text-zinc-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-500/10 rounded-lg"
                                aria-label="Edit personal data"
                            >
                                <Edit3 size={16} />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-5 sm:p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <InfoItem label="Legal Name" value={profile.name || 'Not Specified'} />
                                <InfoItem label="Email Address" value={profile.email || 'Not Specified'} />
                                <InfoItem label="Gender" value={profile.gender || 'Not Specified'} />
                                <InfoItem label="Birth Date" value={profile.dateOfBirth ? format(new Date(profile.dateOfBirth), 'PPP') : 'Not Specified'} />
                                <div className="sm:col-span-2">
                                    <InfoItem label="Home Address" value={profile.address || 'Not Provided'} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Extracurricular & Bio Details */}
                    <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden relative group">
                        <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    <Activity className="text-pink-500 h-5 w-5" /> 
                                    Extracurricular & Bio
                                </CardTitle>
                                <HeaderTooltip 
                                    content="Student attributes including extracurricular school clubs, sports involvement, and physical attributes recorded for sports team eligibility and health monitoring."
                                />
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEdit('attributes')}
                                className="h-8 w-8 text-zinc-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-500/10 rounded-lg"
                                aria-label="Edit extracurricular and bio details"
                            >
                                <Edit3 size={16} />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-5 sm:p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <InfoItem label="Club / Activities" value={profile.club || 'None'} />
                                <InfoItem label="Favourite Colour" value={profile.favouriteColour || 'None'} />
                                <InfoItem label="Height" value={profile.height ? `${profile.height} cm` : 'N/A'} />
                                <InfoItem label="Weight" value={profile.weight ? `${profile.weight} kg` : 'N/A'} />
                                
                                <div className="sm:col-span-2 pt-4 sm:pt-5 border-t border-slate-100 dark:border-zinc-800">
                                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                            <ShieldCheck size={14} className="text-pink-500" /> Emergency Contact
                                        </p>
                                        <HeaderTooltip 
                                            content="Primary parent or guardian contact information registered with school administration for urgent notifications, health emergencies, and academic progress reports."
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                        <InfoItem label="Guardian Name" value={profile.guardianName || profile.parentLinks?.[0]?.parent?.name || 'Not Linked'} />
                                        <InfoItem label="Guardian Phone" value={profile.guardianPhone || profile.parentLinks?.[0]?.parent?.phone || 'Not Linked'} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column Cards */}
                <div className="space-y-5 sm:space-y-6">
                    {/* Academic Institution Card */}
                    <Card className="rounded-2xl border-pink-200/70 dark:border-pink-500/20 shadow-sm bg-pink-50/30 dark:bg-pink-950/10 overflow-hidden">
                        <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 bg-pink-100/40 dark:bg-pink-950/20 border-b border-pink-100 dark:border-pink-500/20 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-base sm:text-lg font-bold text-pink-950 dark:text-pink-300 flex items-center gap-2">
                                    <School className="text-pink-600 dark:text-pink-400 h-5 w-5" /> Academy Institution
                                </CardTitle>
                                <HeaderTooltip 
                                    content="Your primary affiliated school campus and registration timestamp. All your classroom rosters, subject syllabi, and grade registries are synchronized under this institution."
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-5 sm:p-6 space-y-5">
                            <div className="space-y-3.5">
                                <div>
                                    <p className="text-[11px] font-semibold text-pink-600 dark:text-pink-400/80 uppercase tracking-wider mb-1">Primary Academy</p>
                                    <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">{profile.school?.name || 'Independent / Not Enrolled'}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold text-pink-600 dark:text-pink-400/80 uppercase tracking-wider mb-1">Joined Date</p>
                                    <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">{profile.createdAt ? format(new Date(profile.createdAt), 'MMMM yyyy') : 'N/A'}</p>
                                </div>
                            </div>
                            <div className="p-3.5 sm:p-4 rounded-xl bg-white/80 dark:bg-zinc-900/60 border border-pink-100 dark:border-pink-500/20 flex gap-3 shadow-sm">
                                <div className="h-8 w-8 shrink-0 rounded-lg bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center text-pink-500 dark:text-pink-400">
                                    <CheckCircle2 size={18} />
                                </div>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                                    Your student account is fully verified and compliant with institutional academic standards.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Academic Setup Card */}
                    <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
                        <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    <GraduationCap className="text-pink-500 h-5 w-5" /> Academic Setup
                                </CardTitle>
                                <HeaderTooltip 
                                    content="Your department (academic faculty or division) and grade level. These are one-time selections that get permanently locked into your student records once confirmed."
                                />
                            </div>
                            {(!isLocked || !isLevelLocked) && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit('academic')}
                                    className="h-8 w-8 text-zinc-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-500/10 rounded-lg"
                                    aria-label="Set up academic division"
                                >
                                    <Edit3 size={16} />
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="p-5 sm:p-6 space-y-4">
                            {/* Department row */}
                            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800">
                                <div className="h-9 w-9 rounded-xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center shrink-0 text-pink-600 dark:text-pink-400">
                                    <Building2 size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Department</p>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                            {isLocked ? enrolledDeptName : 'Not Set'}
                                        </p>
                                        {isLocked && enrolledDeptCode && (
                                            <Badge className="bg-pink-100/70 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 border-none font-bold text-[10px] px-2 py-0.5">
                                                {enrolledDeptCode}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                {isLocked ? (
                                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                ) : (
                                    <button
                                        onClick={() => handleEdit('academic')}
                                        className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline shrink-0"
                                    >
                                        Set up
                                    </button>
                                )}
                            </div>

                            {/* Level row */}
                            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800">
                                <div className="h-9 w-9 rounded-xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center shrink-0 text-pink-600 dark:text-pink-400">
                                    <BookOpen size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Grade Level</p>
                                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                                        {isLevelLocked ? profile.level : 'Not Set'}
                                    </p>
                                </div>
                                {isLevelLocked ? (
                                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                ) : (
                                    <button
                                        onClick={() => handleEdit('academic')}
                                        className="text-xs font-semibold text-pink-600 dark:text-pink-400 hover:underline shrink-0"
                                    >
                                        Set up
                                    </button>
                                )}
                            </div>

                            {(isLocked || isLevelLocked) && (
                                <div className="flex gap-2 items-start px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                    <Lock size={13} className="text-zinc-400 shrink-0 mt-0.5" />
                                    <span>Locked academic records. Contact administration to request changes.</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Actions / Services */}
                    <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden">
                        <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">Services & Shortcuts</CardTitle>
                                <HeaderTooltip 
                                    content="Direct navigation links to review your academic transcripts, monitor attendance registries, or update verified contact records."
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 space-y-1.5">
                            <QuickActionItem 
                                onClick={() => handleEdit('personal')} 
                                icon={<MapPin size={18} />} 
                                label="Home Address" 
                                status={profile.address ? "Configured" : "Set Location"} 
                                hoverColor="hover:bg-pink-50 dark:hover:bg-pink-500/10 text-pink-600 dark:text-pink-400" 
                            />
                            <QuickActionItem 
                                onClick={() => handleEdit('attributes')} 
                                icon={<Phone size={18} />} 
                                label="Emergency Contact" 
                                status={profile.guardianPhone ? "Configured" : "Update Info"} 
                                hoverColor="hover:bg-pink-50 dark:hover:bg-pink-500/10 text-pink-600 dark:text-pink-400" 
                            />
                            <QuickActionItem 
                                href="/dashboard/student/grades" 
                                icon={<Calendar size={18} />} 
                                label="Grades & Results" 
                                status="View Transcript" 
                                hoverColor="hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                            />
                            <QuickActionItem 
                                href="/dashboard/student/attendance" 
                                icon={<ShieldCheck size={18} />} 
                                label="Attendance Log" 
                                status="View Records" 
                                hoverColor="hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Modal (SaaS Style) */}
            {editingTab !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-12">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setEditingTab(null)} />
                    
                    <Card className="relative z-10 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden flex flex-col h-full max-h-[88vh] animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 shrink-0 bg-slate-50/80 dark:bg-zinc-900/60">
                            <div className="space-y-0.5">
                                <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">Edit Scholar Profile</h2>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">Update your verified personal details and visual appearance.</p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setEditingTab(null)} 
                                className="rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-slate-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
                                aria-label="Close dialog"
                            >
                                <X size={20} />
                            </Button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                            <Tabs value={editingTab} onValueChange={setEditingTab} className="w-full">
                                <TabsList className="w-full flex mb-5 sm:mb-6 bg-slate-100 dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800 rounded-xl p-1 overflow-x-auto scrollbar-hide">
                                    <TabsTrigger value="personal" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400 data-[state=active]:shadow-sm">Personal</TabsTrigger>
                                    <TabsTrigger value="attributes" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400 data-[state=active]:shadow-sm">Attributes</TabsTrigger>
                                    <TabsTrigger value="academic" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400 data-[state=active]:shadow-sm">Academic</TabsTrigger>
                                    <TabsTrigger value="visuals" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400 data-[state=active]:shadow-sm">Visuals</TabsTrigger>
                                    <TabsTrigger value="security" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:text-pink-600 dark:data-[state=active]:text-pink-400 data-[state=active]:shadow-sm">Security</TabsTrigger>
                                </TabsList>

                                <TabsContent value="personal" className="space-y-4 sm:space-y-5 mt-0 outline-none">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Full Legal Name</Label>
                                        <Input 
                                            value={formData.name} 
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-transparent focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500"
                                            placeholder="Enter full legal name"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Gender</Label>
                                            <Select value={formData.gender} onValueChange={(val) => setFormData({...formData, gender: val})}>
                                                <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-transparent">
                                                    <SelectValue placeholder="Select Gender" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="MALE">Male</SelectItem>
                                                    <SelectItem value="FEMALE">Female</SelectItem>
                                                    <SelectItem value="OTHER">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Date of Birth</Label>
                                            <Input 
                                                type="date"
                                                value={formData.dateOfBirth} 
                                                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                                                className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-transparent"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Home Address</Label>
                                        <Input 
                                            value={formData.address} 
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-transparent"
                                            placeholder="Enter your residential address"
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="attributes" className="space-y-4 sm:space-y-5 mt-0 outline-none">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Height (cm)</Label>
                                            <Input 
                                                type="number"
                                                value={formData.height} 
                                                onChange={(e) => setFormData({...formData, height: e.target.value})}
                                                className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-transparent"
                                                placeholder="e.g. 170"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Weight (kg)</Label>
                                            <Input 
                                                type="number"
                                                value={formData.weight} 
                                                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                                                placeholder="e.g. 60"
                                                className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-transparent"
                                            />
                                        </div>
                                        
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Club / Activities</Label>
                                            <Input 
                                                value={formData.club} 
                                                onChange={(e) => setFormData({...formData, club: e.target.value})}
                                                className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-transparent"
                                                placeholder="e.g. Robotics Club, Debate Society"
                                            />
                                        </div>
                                        
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Favourite Colour</Label>
                                            <Input 
                                                value={formData.favouriteColour} 
                                                onChange={(e) => setFormData({...formData, favouriteColour: e.target.value})}
                                                className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-transparent"
                                                placeholder="e.g. Navy Blue"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 space-y-4">
                                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                                            <ShieldCheck size={16} className="text-pink-500" /> Emergency Contact Details
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Guardian Name</Label>
                                                <Input 
                                                    value={formData.guardianName} 
                                                    onChange={(e) => setFormData({...formData, guardianName: e.target.value})}
                                                    className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-transparent"
                                                    placeholder="Parent or Guardian Name"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Guardian Phone</Label>
                                                <Input 
                                                    value={formData.guardianPhone} 
                                                    onChange={(e) => setFormData({...formData, guardianPhone: e.target.value})}
                                                    className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-transparent"
                                                    placeholder="+234..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Academic Tab */}
                                <TabsContent value="academic" className="space-y-5 mt-0 outline-none">
                                    {!hasSchool ? (
                                        <div className="flex gap-2.5 items-start px-4 py-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 text-xs font-medium text-amber-800 dark:text-amber-300">
                                            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={15} />
                                            <span>You are not currently linked to a school. Connect with a school join code first to set your academic department and grade level.</span>
                                        </div>
                                    ) : null}

                                    {/* Department section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Building2 size={16} className="text-pink-500" />
                                            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Department / Faculty</h4>
                                            {isLocked && (
                                                <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0 font-black text-[10px] uppercase tracking-wider">
                                                    <CheckCircle2 size={10} className="mr-1" /> Locked In
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Your academic division or major study branch.</p>

                                        {isLocked ? (
                                            <div className="flex items-center gap-3 p-4 rounded-xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-200/80 dark:border-pink-900/30">
                                                <div className="h-9 w-9 rounded-xl bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center shrink-0 text-pink-600 dark:text-pink-400">
                                                    <Building2 size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Enrolled Department</p>
                                                    <div className="flex items-center gap-1.5">
                                                        <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">{enrolledDeptName}</p>
                                                        {enrolledDeptCode && (
                                                            <Badge className="bg-pink-100/70 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 border-none font-bold text-[10px] px-2 py-0.5">
                                                                {enrolledDeptCode}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Department selection is a one-time choice. Please choose carefully.</p>
                                                <div className="flex flex-col sm:flex-row gap-2.5">
                                                    <div className="flex-1">
                                                        <Select value={selectedDept} onValueChange={setSelectedDept} disabled={!hasSchool || isDeptsLoading}>
                                                            <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                                                <SelectValue placeholder={!hasSchool ? 'No School Connected' : (isDeptsLoading ? 'Loading...' : 'Choose Department')} />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                                                                {departments.map((dept) => {
                                                                    const deptValue = dept.id || dept.departmentId || '';
                                                                    return (
                                                                        <SelectItem key={deptValue} value={deptValue} className="text-xs font-medium">
                                                                            {dept.name} {dept.code ? `(${dept.code})` : ''}
                                                                        </SelectItem>
                                                                    );
                                                                })}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <Button
                                                        onClick={() => {
                                                            if (!selectedDept) { toast.warn('Please select a department first'); return; }
                                                            updateDeptMutation.mutate(selectedDept);
                                                        }}
                                                        disabled={!hasSchool || updateDeptMutation.isPending || !selectedDept}
                                                        className="h-10 px-5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md shadow-pink-500/20 cursor-pointer disabled:opacity-50"
                                                    >
                                                        {updateDeptMutation.isPending && <Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5" />}
                                                        Lock In
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <div className="border-t border-slate-100 dark:border-zinc-800 pt-4 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <GraduationCap size={16} className="text-pink-500" />
                                            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Academic Grade Level</h4>
                                            {isLevelLocked && (
                                                <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0 font-black text-[10px] uppercase tracking-wider">
                                                    <CheckCircle2 size={10} className="mr-1" /> Locked In
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">Your current grade or academic standing level.</p>

                                        {isLevelLocked ? (
                                            <div className="flex items-center gap-3 p-4 rounded-xl bg-pink-50/60 dark:bg-pink-950/20 border border-pink-200/80 dark:border-pink-900/30">
                                                <div className="h-9 w-9 rounded-xl bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center shrink-0 text-pink-600 dark:text-pink-400">
                                                    <BookOpen size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Enrolled Level</p>
                                                    <p className="text-base font-bold text-zinc-900 dark:text-zinc-100">{profile?.level}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">Level selection is permanent once confirmed.</p>
                                                <div className="flex flex-col sm:flex-row gap-2.5">
                                                    <div className="flex-1">
                                                        <Select value={selectedLevel} onValueChange={setSelectedLevel} disabled={!hasSchool}>
                                                            <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                                                <SelectValue placeholder={!hasSchool ? 'No School Connected' : 'Choose Level'} />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                                                                {schoolLevels.map((lvl) => (
                                                                    <SelectItem key={lvl} value={lvl} className="text-xs font-medium">{lvl}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <Button
                                                        onClick={() => {
                                                            if (!selectedLevel) { toast.warn('Please select a level first'); return; }
                                                            updateLevelMutation.mutate(selectedLevel);
                                                        }}
                                                        disabled={!hasSchool || updateLevelMutation.isPending || !selectedLevel}
                                                        className="h-10 px-5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md shadow-pink-500/20 cursor-pointer disabled:opacity-50"
                                                    >
                                                        {updateLevelMutation.isPending && <Loader2 className="animate-spin h-3.5 w-3.5 mr-1.5" />}
                                                        Lock In
                                                    </Button>
                                                </div>
                                            </>
                                        )}

                                        {(isLocked || isLevelLocked) && (
                                            <div className="flex gap-2 items-start px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 text-xs font-medium text-zinc-500 dark:text-zinc-400">
                                                <Lock size={13} className="text-zinc-400 shrink-0 mt-0.5" />
                                                <span>Locked fields are permanent in your student records. Contact administration if changes are required.</span>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="visuals" className="space-y-4 sm:space-y-5 mt-0 outline-none">
                                    <div className="p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
                                        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                            <User size={16} className="text-pink-500" /> Profile Avatar
                                        </div>
                                        <ImageUpload 
                                            label="Upload Avatar" 
                                            value={formData.profileImage} 
                                            onChange={(url) => setFormData({...formData, profileImage: url})} 
                                            description="Recommended 400x400px (1:1)"
                                            aspectRatio="square"
                                        />
                                    </div>
                                    <div className="p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
                                        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                                            <ImageIcon size={16} className="text-pink-500" /> Profile Banner
                                        </div>
                                        <ImageUpload 
                                            label="Upload Banner" 
                                            value={formData.bannerImage} 
                                            onChange={(url) => setFormData({...formData, bannerImage: url})} 
                                            description="Recommended 1200x400px (3:1)"
                                            aspectRatio="video"
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="security" className="space-y-4 sm:space-y-5 mt-0 outline-none">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Contact Email</Label>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Input 
                                                value={formData.email} 
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                disabled={emailStep !== 'input'}
                                                className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 disabled:bg-slate-50 dark:disabled:bg-zinc-900 disabled:text-zinc-500 bg-transparent flex-1"
                                            />
                                            {formData.email !== profile.email && emailStep === 'input' && (
                                                <Button 
                                                    type="button"
                                                    onClick={handleRequestEmailChange}
                                                    disabled={requestEmailUpdate.isPending}
                                                    className="h-10 px-5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-semibold text-sm shadow-sm"
                                                >
                                                    {requestEmailUpdate.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Verify Email"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {emailStep === 'verify' && (
                                        <div className="p-4 sm:p-5 rounded-xl border border-pink-200 dark:border-pink-900 bg-pink-50/60 dark:bg-pink-950/40 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-sm font-bold text-pink-900 dark:text-pink-100">Verification Required</h4>
                                                    <p className="text-xs text-pink-700 dark:text-pink-400 mt-0.5">We sent a confirmation code to {formData.email}</p>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={() => setEmailStep('input')} className="text-pink-600 hover:bg-pink-100 dark:hover:bg-pink-900/50 h-8 px-2 rounded-md">
                                                    Cancel
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Input 
                                                    placeholder="Enter code"
                                                    value={verificationCode}
                                                    onChange={(e) => setVerificationCode(e.target.value)}
                                                    className="h-10 border-pink-200 dark:border-pink-800 bg-white dark:bg-zinc-900 text-center tracking-widest font-semibold flex-1 rounded-xl"
                                                    maxLength={6}
                                                />
                                                <Button 
                                                    type="button"
                                                    onClick={handleVerifyEmail}
                                                    disabled={verifyEmailUpdate.isPending}
                                                    className="h-10 px-5 rounded-xl bg-pink-600 text-white hover:bg-pink-700 font-semibold text-sm shadow-sm"
                                                >
                                                    {verifyEmailUpdate.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Confirm"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>

                        <div className="px-5 sm:px-6 py-4 sm:py-5 border-t border-slate-100 dark:border-zinc-800 shrink-0 flex justify-end gap-2.5 sm:gap-3 bg-slate-50/80 dark:bg-zinc-900/60">
                            <Button 
                                variant="outline" 
                                onClick={() => setEditingTab(null)} 
                                className="h-10 rounded-xl border-slate-200 dark:border-zinc-800 font-semibold text-zinc-700 dark:text-zinc-300"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleSave}
                                disabled={
                                    updateProfile.isPending || 
                                    (formData.email !== profile.email && emailStep !== 'input') || 
                                    emailStep === 'verify'
                                }
                                className="h-10 px-5 sm:px-6 rounded-xl bg-pink-600 text-white hover:bg-pink-700 font-semibold shadow-sm focus:ring-2 focus:ring-pink-500/50"
                            >
                                {updateProfile.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save size={16} className="mr-2" />} 
                                Save Changes
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

function StatCard({ 
    icon, 
    label, 
    value, 
    color, 
    tooltip 
}: { 
    icon: React.ReactNode; 
    label: string; 
    value: string; 
    color: string; 
    tooltip?: string; 
}) {
    return (
        <div className="bg-white dark:bg-zinc-950 rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                <div className={cn("h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shrink-0", color)}>
                    {icon}
                </div>
                <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-0.5 truncate">{label}</p>
                    <p className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 truncate">{value}</p>
                </div>
            </div>
            {tooltip && (
                <div className="shrink-0 pl-2">
                    <HeaderTooltip content={tooltip} size={13} />
                </div>
            )}
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">{label}</span>
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200 truncate">{value}</span>
        </div>
    );
}

function QuickActionItem({ 
    href, 
    icon, 
    label, 
    status, 
    onClick, 
    hoverColor 
}: { 
    href?: string; 
    icon: React.ReactNode; 
    label: string; 
    status: string; 
    onClick?: () => void; 
    hoverColor?: string; 
}) {
    const Component = href ? Link : 'button';
    const props = href ? { href } : {};
    
    return (
        <Component 
            {...props as any} 
            onClick={onClick} 
            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors group text-left border border-transparent hover:border-slate-100 dark:hover:border-zinc-800"
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className={cn("h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-slate-50 dark:bg-zinc-900 text-zinc-500 flex items-center justify-center transition-all group-hover:scale-105 shrink-0", hoverColor)}>
                    {icon}
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-200 truncate">{label}</p>
                    <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 truncate">{status}</p>
                </div>
            </div>
            <ChevronRight size={16} className="text-zinc-400 dark:text-zinc-600 group-hover:text-pink-500 transition-colors shrink-0 ml-2" />
        </Component>
    );
}
