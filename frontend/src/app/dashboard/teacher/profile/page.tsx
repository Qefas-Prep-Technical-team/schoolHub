'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
    ShieldCheck,
    MapPin,
    Loader2,
    Image as ImageIcon
} from 'lucide-react';
import Image from 'next/image';
import { 
    useTeacherProfile, 
    useUpdateTeacherProfile, 
    useRequestTeacherEmailUpdate, 
    useVerifyTeacherEmailUpdate 
} from '@/lib/api/hooks/useTeacher';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ImageUpload from '@/components/reusable/ImageUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeaderTooltip } from '@/app/dashboard/teacher/components/dashboard/HeaderTooltip';

interface TeacherProfile {
    id?: string;
    name?: string;
    email?: string;
    gender?: string;
    phone?: string;
    department?: string;
    highestQualification?: string;
    yearsOfExperience?: number;
    address?: string;
    profileImage?: string;
    bannerImage?: string;
    teacherCode?: string;
    createdAt?: string;
    twoFactorEnabled?: boolean;
    is2FAEnabled?: boolean;
    school?: {
        id?: string;
        name?: string;
    };
}

export default function TeacherProfilePage() {
    const router = useRouter();
    const { data: rawProfile, isLoading } = useTeacherProfile();
    const profile = rawProfile as TeacherProfile | undefined;
    const updateProfile = useUpdateTeacherProfile();
    const requestEmailUpdate = useRequestTeacherEmailUpdate();
    const verifyEmailUpdate = useVerifyTeacherEmailUpdate();

    // editingTab controls which tab is open in the modal, null means modal is closed
    const [editingTab, setEditingTab] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        gender: '',
        phone: '',
        department: '',
        highestQualification: '',
        yearsOfExperience: '',
        address: '',
        profileImage: '',
        bannerImage: ''
    });

    const [emailStep, setEmailStep] = useState<'input' | 'verify'>('input');
    const [verificationCode, setVerificationCode] = useState('');

    useEffect(() => {
        if (profile && editingTab === null) {
            setFormData({
                name: profile.name || '',
                email: profile.email || '',
                gender: profile.gender || '',
                phone: profile.phone || '',
                department: profile.department || '',
                highestQualification: profile.highestQualification || '',
                yearsOfExperience: profile.yearsOfExperience ? String(profile.yearsOfExperience) : '',
                address: profile.address || '',
                profileImage: profile.profileImage || '',
                bannerImage: profile.bannerImage || ''
            });
        }
    }, [profile, editingTab]);

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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { email, yearsOfExperience, ...rest } = formData;
        // Parse yearsOfExperience back to number if provided
        const parsedExperience = yearsOfExperience ? parseInt(yearsOfExperience, 10) : undefined;
        
        await updateProfile.mutateAsync({
            ...rest,
            ...(parsedExperience !== undefined ? { yearsOfExperience: parsedExperience } : {})
        });
        setEditingTab(null);
    };

    if (isLoading) {
        return (
            <div className="p-3.5 sm:p-6 md:p-8 w-full max-w-[1600px] mx-auto min-h-screen bg-slate-50/50 dark:bg-black font-sans space-y-6 md:space-y-8 animate-pulse">
                {/* Header Skeleton */}
                <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
                    <div className="h-40 sm:h-52 md:h-64 w-full bg-slate-200 dark:bg-zinc-900" />
                    <div className="relative -mt-14 sm:-mt-16 md:-mt-20 px-4 sm:px-6 md:px-10 flex flex-col md:flex-row items-center md:items-end gap-4 sm:gap-6 pb-6 sm:pb-8">
                        <div className="h-28 w-28 sm:h-36 sm:w-36 md:h-40 md:w-40 rounded-2xl bg-white dark:bg-black p-1.5 shadow-md border border-slate-200/80 dark:border-zinc-800 shrink-0">
                            <div className="w-full h-full rounded-xl bg-slate-200 dark:bg-zinc-900" />
                        </div>
                        <div className="flex-1 text-center md:text-left mb-2 md:mb-4 space-y-3 w-full">
                            <div className="h-8 w-48 bg-slate-200 dark:bg-zinc-900 rounded-lg mx-auto md:mx-0" />
                            <div className="h-4 w-64 bg-slate-200 dark:bg-zinc-900 rounded mx-auto md:mx-0" />
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-28 bg-slate-200 dark:bg-zinc-900 rounded-xl" />
                            <div className="h-10 w-28 bg-slate-200 dark:bg-zinc-900 rounded-xl" />
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 rounded-2xl bg-white dark:bg-black border border-slate-200/80 dark:border-zinc-800 shadow-sm p-4 sm:p-5 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-zinc-900 shrink-0" />
                            <div className="space-y-2 w-full">
                                <div className="h-3 w-16 bg-slate-200 dark:bg-zinc-900 rounded" />
                                <div className="h-5 w-24 bg-slate-200 dark:bg-zinc-900 rounded" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grids Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
                    <div className="lg:col-span-2 space-y-5 sm:space-y-6">
                        <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden min-h-[300px]">
                            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800 flex justify-between items-center">
                                <div className="h-6 w-32 bg-slate-200 dark:bg-zinc-900 rounded" />
                                <div className="h-8 w-8 bg-slate-200 dark:bg-zinc-900 rounded-md" />
                            </div>
                            <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-3 w-20 bg-slate-200 dark:bg-zinc-900 rounded" />
                                        <div className="h-5 w-40 bg-slate-200 dark:bg-zinc-900 rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-1 space-y-5 sm:space-y-6">
                        <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden min-h-[300px]">
                            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800">
                                <div className="h-6 w-32 bg-slate-200 dark:bg-zinc-900 rounded" />
                            </div>
                            <div className="p-5 sm:p-6 space-y-5 sm:space-y-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-3 w-24 bg-slate-200 dark:bg-zinc-900 rounded" />
                                        <div className="h-10 w-full bg-slate-200 dark:bg-zinc-900 rounded-xl" />
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

    const initials = (profile.name || 'T').split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);
    const has2FA = profile.twoFactorEnabled || profile.is2FAEnabled;

    return (
        <div className="p-3.5 sm:p-6 md:p-8 w-full max-w-[1600px] mx-auto min-h-screen bg-slate-50/50 dark:bg-black font-sans space-y-6 md:space-y-8 animate-in fade-in duration-500">
            
            {/* Header / Hero Section */}
            <div className="bg-white dark:bg-black rounded-2xl shadow-sm border border-slate-200/80 dark:border-zinc-800 overflow-hidden">
                {/* Cover Photo / Banner */}
                <div className="h-40 sm:h-52 md:h-64 w-full relative bg-emerald-600 flex items-center justify-center overflow-hidden group">
                    {profile.bannerImage ? (
                        <Image
                            src={profile.bannerImage}
                            alt="Teacher Profile Banner"
                            fill
                            priority
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 opacity-95" />
                    )}
                    
                    {/* Banner Edit Trigger (accessible on mobile without hover) */}
                    <button 
                        onClick={() => handleEdit('visuals')}
                        type="button"
                        className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/50 hover:bg-black/75 sm:bg-white/85 sm:hover:bg-white text-white sm:text-emerald-700 text-xs font-semibold backdrop-blur-md shadow-sm transition-all sm:opacity-0 sm:group-hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        aria-label="Change banner image"
                    >
                        <ImageIcon size={14} />
                        <span>Edit Banner</span>
                    </button>
                </div>

                {/* Profile Identity */}
                <div className="relative -mt-14 sm:-mt-16 md:-mt-20 px-4 sm:px-6 md:px-10 flex flex-col md:flex-row items-center md:items-end gap-4 sm:gap-6 pb-6 sm:pb-8">
                    {/* Avatar with Verified Badge */}
                    <div className="relative shrink-0 group">
                        <div 
                            className="h-28 w-28 sm:h-36 sm:w-36 md:h-40 md:w-40 rounded-2xl bg-white dark:bg-black p-1.5 shadow-md border border-slate-200/80 dark:border-zinc-800 flex items-center justify-center text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-600 dark:text-emerald-400 cursor-pointer overflow-hidden relative"
                            onClick={() => handleEdit('visuals')}
                            title="Click to change avatar"
                        >
                            {profile.profileImage ? (
                                <div className="w-full h-full relative rounded-xl overflow-hidden">
                                    <Image
                                        src={profile.profileImage}
                                        alt={profile.name || 'Teacher Avatar'}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-full rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                                    {initials}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                <Edit3 size={22} className="text-white" />
                            </div>
                        </div>
                        <div className="absolute -bottom-1.5 -right-1.5 h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-teal-500 border-2 sm:border-3 border-white dark:border-black flex items-center justify-center shadow-sm" title="Verified Educator Identity">
                            <CheckCircle2 size={14} className="text-white" />
                        </div>
                    </div>

                    {/* Name & Title */}
                    <div className="flex-1 text-center md:text-left mb-2">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                {profile.name}
                            </h1>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-500/20 uppercase tracking-widest">
                                {profile.teacherCode || 'TEACHER'}
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-zinc-400 mt-1 flex items-center justify-center md:justify-start gap-1.5">
                            <Briefcase size={14} className="text-emerald-600 dark:text-emerald-400" /> Official Educator Identity
                        </p>
                    </div>

                    {/* Action Buttons (responsive wrap) */}
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 sm:gap-3 w-full md:w-auto mb-2">
                        <Button
                            onClick={() => handleEdit('personal')}
                            className="h-10 px-4 rounded-xl font-semibold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
                        >
                            <Edit3 size={15} />
                            <span>Edit Profile</span>
                        </Button>
                        <Button 
                            variant="outline" 
                            title="Indicates your Two-Factor Authentication security standing"
                            className={cn(
                                "h-10 px-3.5 rounded-xl font-semibold text-xs sm:text-sm transition-all",
                                has2FA 
                                    ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-500/10 dark:border-green-500/50 hover:bg-green-100 dark:hover:bg-green-500/20" 
                                    : "border-slate-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900"
                            )}
                            onClick={() => router.push('/dashboard/teacher/settings?tab=security')}
                        >
                            <ShieldCheck size={15} className="mr-1.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Security</span>
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => window.location.href = 'mailto:admin@qefashub.com'}
                            className="h-10 px-3.5 rounded-xl border-slate-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-900 font-semibold text-xs sm:text-sm transition-all"
                        >
                            <Mail size={15} className="mr-1.5 text-slate-500" />
                            <span>Support</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-6">
                <StatCard 
                    icon={<Hash size={20} />} 
                    label="Educator ID" 
                    value={profile.teacherCode || 'N/A'} 
                    color="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10" 
                    tooltip="Your official institutional identifier assigned by school administration. Used to associate your grading records, attendance logs, and class roster assignments across all school terms."
                />
                <StatCard 
                    icon={<GraduationCap size={20} />} 
                    label="Pedagogical Role" 
                    value="Senior Educator" 
                    color="text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10" 
                    tooltip="Defines your pedagogical permission level within the school portal. Grants access to curriculum creation, exam grading, continuous assessment management, and report card finalization."
                />
                <StatCard 
                    icon={<CheckCircle2 size={20} />} 
                    label="Account Status" 
                    value="Active" 
                    color="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10" 
                    tooltip="Active status verifies that your teaching credentials are in good standing with school administration and your portal access is enabled for real-time grade entry and student monitoring."
                />
            </div>

            {/* Main Content Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
                <div className="lg:col-span-2 space-y-5 sm:space-y-6">
                    {/* Personal Data */}
                    <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-black overflow-hidden relative group">
                        <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-black flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <User className="text-emerald-500 h-5 w-5" /> 
                                    Personal Data
                                </CardTitle>
                                <HeaderTooltip 
                                    content="Core personal identity information registered with the institution. Keep this information up-to-date to ensure timely communication regarding staff briefings, emergency contacts, and administrative updates."
                                />
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEdit('personal')}
                                className="h-8 w-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg"
                                aria-label="Edit personal data"
                            >
                                <Edit3 size={16} />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-5 sm:p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                                <InfoItem label="Legal Name" value={profile.name || 'Not Specified'} />
                                <InfoItem label="Email Address" value={profile.email || 'Not Specified'} />
                                <InfoItem label="Gender" value={profile.gender || 'Not Specified'} />
                                <InfoItem label="Phone Number" value={profile.phone || 'N/A'} />
                                <div className="sm:col-span-2">
                                    <InfoItem label="Home Address" value={profile.address || 'Not Provided'} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Professional Details */}
                    <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-black overflow-hidden relative group">
                        <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-black flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <Briefcase className="text-emerald-500 h-5 w-5" /> 
                                    Professional Details
                                </CardTitle>
                                <HeaderTooltip 
                                    content="Official academic qualifications, department affiliations, and accredited years of teaching experience. This data assists administrators in class scheduling and subject allocation."
                                />
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEdit('professional')}
                                className="h-8 w-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg"
                                aria-label="Edit professional details"
                            >
                                <Edit3 size={16} />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-5 sm:p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                                <InfoItem label="Department" value={profile.department || 'General'} />
                                <InfoItem label="Qualification" value={profile.highestQualification || 'Not specified'} />
                                <InfoItem label="Experience" value={profile.yearsOfExperience ? `${profile.yearsOfExperience} Years` : 'Not specified'} />
                                <InfoItem label="Teacher ID" value={profile.teacherCode || 'N/A'} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-5 sm:space-y-6">
                    {/* Academic Institution Card */}
                    <Card 
                        className="rounded-2xl border-emerald-200/70 dark:border-emerald-500/20 shadow-sm bg-emerald-50/50 dark:bg-emerald-950/10 overflow-hidden cursor-pointer hover:shadow-md transition-shadow hover:border-emerald-300 dark:hover:border-emerald-500/40"
                        onClick={() => router.push('/dashboard/teacher/school-profile')}
                    >
                        <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 bg-emerald-100/50 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-500/20 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-base sm:text-lg font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-2">
                                    <School className="text-emerald-600 dark:text-emerald-400 h-5 w-5" /> Primary Academy
                                </CardTitle>
                                <HeaderTooltip 
                                    content="Your primary affiliated school campus and enrollment timestamp. All your classroom rosters, subject syllabi, and grade registries are synchronized under this institution."
                                />
                            </div>
                            <ChevronRight size={18} className="text-emerald-600 dark:text-emerald-400" />
                        </CardHeader>
                        <CardContent className="p-5 sm:p-6 space-y-5">
                            <div className="space-y-3.5">
                                <div>
                                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Campus Name</p>
                                    <p className="text-base font-bold text-emerald-950 dark:text-emerald-100">{profile.school?.name || 'Qefas-Prep Academy'}</p>
                                </div>
                                <div>
                                    <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Joined Date</p>
                                    <p className="text-base font-bold text-emerald-950 dark:text-emerald-100">{profile.createdAt ? format(new Date(profile.createdAt), 'MMMM yyyy') : 'N/A'}</p>
                                </div>
                            </div>
                            <div className="p-3.5 rounded-xl bg-white dark:bg-black/60 border border-emerald-100 dark:border-emerald-500/20 flex gap-3 shadow-xs">
                                <div className="h-8 w-8 shrink-0 rounded-lg bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
                                    <ShieldCheck size={18} />
                                </div>
                                <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium leading-relaxed">Your educator account is fully verified and compliant with institutional security standards.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Services */}
                    <Card className="rounded-2xl border-slate-200/80 dark:border-zinc-800 shadow-sm bg-white dark:bg-black overflow-hidden">
                        <CardHeader className="px-5 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-black flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <CardTitle className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">Services & Shortcuts</CardTitle>
                                <HeaderTooltip 
                                    content="Direct portal shortcuts to configure your physical address, inspect institutional school calendars, and review multi-factor authentication security safeguards."
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-3 sm:p-4 space-y-1.5">
                            <QuickActionItem icon={<MapPin size={18} />} label="Home Address" status={profile.address ? "Configured" : "Set Location"} onClick={() => handleEdit('personal')} />
                            <QuickActionItem icon={<Calendar size={18} />} label="Academic Calendar" status="View Schedule" onClick={() => router.push('/dashboard/teacher/school-profile')} />
                            <QuickActionItem icon={<ShieldCheck size={18} />} label="Security Settings" status={has2FA ? "Protected (2FA)" : "Basic Protection"} onClick={() => handleEdit('security')} />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Modal (Mobile-Optimized & Pure Black Dark Mode) */}
            {editingTab !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-6 md:p-10">
                    <div className="absolute inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setEditingTab(null)} />
                    
                    <Card className="relative z-10 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden flex flex-col h-full max-h-[90vh] sm:max-h-[85vh] animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="px-5 sm:px-6 py-4 sm:py-5 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 shrink-0 bg-slate-50/50 dark:bg-zinc-900/50">
                            <div className="space-y-0.5">
                                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Edit Profile Details</h2>
                                <p className="text-xs text-slate-500 dark:text-zinc-400">Update your teacher credentials, visuals, and preferences.</p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => setEditingTab(null)} 
                                className="rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200 h-8 w-8"
                                aria-label="Close dialog"
                            >
                                <X size={18} />
                            </Button>
                        </div>
                        
                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                            <Tabs value={editingTab} onValueChange={setEditingTab} className="w-full">
                                <TabsList className="w-full flex mb-5 bg-slate-100 dark:bg-zinc-900 rounded-xl p-1 overflow-x-auto scrollbar-hide">
                                    <TabsTrigger value="personal" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xs">Personal</TabsTrigger>
                                    <TabsTrigger value="professional" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xs">Professional</TabsTrigger>
                                    <TabsTrigger value="visuals" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xs">Visuals</TabsTrigger>
                                    <TabsTrigger value="security" className="flex-1 rounded-lg text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-black data-[state=active]:text-emerald-700 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-xs">Security</TabsTrigger>
                                </TabsList>

                                <TabsContent value="personal" className="space-y-4 sm:space-y-5 mt-0 outline-none">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-600 dark:text-zinc-300">Full Legal Name</Label>
                                        <Input 
                                            value={formData.name} 
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="h-11 sm:h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60"
                                            placeholder="Enter full legal name"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-600 dark:text-zinc-300">Gender</Label>
                                            <Select value={formData.gender} onValueChange={(val) => setFormData({...formData, gender: val})}>
                                                <SelectTrigger className="h-11 sm:h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60">
                                                    <SelectValue placeholder="Select Gender" />
                                                </SelectTrigger>
                                                <SelectContent className="dark:bg-black dark:border-zinc-800">
                                                    <SelectItem value="MALE">Male</SelectItem>
                                                    <SelectItem value="FEMALE">Female</SelectItem>
                                                    <SelectItem value="OTHER">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-600 dark:text-zinc-300">Phone Number</Label>
                                            <Input 
                                                type="tel"
                                                value={formData.phone} 
                                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                                placeholder="+1 (555) 000-0000"
                                                className="h-11 sm:h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-600 dark:text-zinc-300">Home Address</Label>
                                        <Input 
                                            value={formData.address} 
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            className="h-11 sm:h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60"
                                            placeholder="Enter your residential address"
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="professional" className="space-y-4 sm:space-y-5 mt-0 outline-none">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-600 dark:text-zinc-300">Department</Label>
                                        <Input 
                                            value={formData.department} 
                                            onChange={(e) => setFormData({...formData, department: e.target.value})}
                                            className="h-11 sm:h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60"
                                            placeholder="e.g. Science, Mathematics, Humanities"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-600 dark:text-zinc-300">Highest Qualification</Label>
                                            <Input 
                                                value={formData.highestQualification} 
                                                onChange={(e) => setFormData({...formData, highestQualification: e.target.value})}
                                                className="h-11 sm:h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60"
                                                placeholder="e.g. M.Sc. Physics, B.Ed."
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-600 dark:text-zinc-300">Years of Experience</Label>
                                            <Input 
                                                type="number"
                                                value={formData.yearsOfExperience} 
                                                onChange={(e) => setFormData({...formData, yearsOfExperience: e.target.value})}
                                                placeholder="e.g. 5"
                                                className="h-11 sm:h-10 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60"
                                            />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="visuals" className="space-y-4 sm:space-y-5 mt-0 outline-none">
                                    <div className="p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                                        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700 dark:text-zinc-300">
                                            <User size={16} className="text-emerald-500" /> Profile Avatar
                                        </div>
                                        <ImageUpload 
                                            label="Upload Avatar" 
                                            value={formData.profileImage} 
                                            onChange={(url) => setFormData({...formData, profileImage: url})} 
                                            description="Recommended 400x400px (1:1)"
                                            aspectRatio="square"
                                        />
                                    </div>
                                    <div className="p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
                                        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700 dark:text-zinc-300">
                                            <ImageIcon size={16} className="text-emerald-500" /> Profile Banner
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
                                        <Label className="text-xs font-semibold text-slate-600 dark:text-zinc-300">Registered Email Address</Label>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Input 
                                                value={formData.email} 
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                disabled={emailStep !== 'input'}
                                                className="h-11 sm:h-10 rounded-xl border-slate-200 dark:border-zinc-800 disabled:bg-slate-100 dark:disabled:bg-zinc-900 disabled:text-slate-500 bg-white dark:bg-zinc-900/60 flex-1"
                                            />
                                            {formData.email !== profile.email && emailStep === 'input' && (
                                                <Button 
                                                    type="button"
                                                    onClick={handleRequestEmailChange}
                                                    disabled={requestEmailUpdate.isPending}
                                                    className="h-11 sm:h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm"
                                                >
                                                    {requestEmailUpdate.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Verify Code"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {emailStep === 'verify' && (
                                        <div className="p-4 sm:p-5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/40 space-y-3.5">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Verification Required</h4>
                                                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">We sent a 6-digit confirmation code to {formData.email}</p>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={() => setEmailStep('input')} className="text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900 h-8 px-2.5 rounded-lg text-xs">
                                                    Cancel
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Input 
                                                    placeholder="Enter 6-digit code"
                                                    value={verificationCode}
                                                    onChange={(e) => setVerificationCode(e.target.value)}
                                                    className="h-11 sm:h-10 border-emerald-200 dark:border-emerald-700 bg-white dark:bg-black text-center tracking-widest font-semibold flex-1 rounded-xl"
                                                    maxLength={6}
                                                />
                                                <Button 
                                                    type="button"
                                                    onClick={handleVerifyEmail}
                                                    disabled={verifyEmailUpdate.isPending}
                                                    className="h-11 sm:h-10 px-5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-xs sm:text-sm shadow-sm"
                                                >
                                                    {verifyEmailUpdate.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Confirm"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => router.push('/dashboard/teacher/settings?tab=security')}
                                            className="w-full h-11 rounded-xl border-slate-200 dark:border-zinc-800 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2"
                                        >
                                            <ShieldCheck size={16} className="text-emerald-600" />
                                            <span>Manage Two-Factor Authentication (2FA) & Password</span>
                                        </Button>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-t border-slate-100 dark:border-zinc-800 shrink-0 flex flex-wrap sm:flex-nowrap justify-end gap-2.5 sm:gap-3 bg-slate-50/50 dark:bg-zinc-900/50">
                            <Button 
                                variant="outline" 
                                onClick={() => setEditingTab(null)} 
                                className="h-11 sm:h-10 px-4 rounded-xl border-slate-200 dark:border-zinc-800 font-semibold text-xs sm:text-sm"
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
                                className="h-11 sm:h-10 px-5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-xs sm:text-sm shadow-sm flex items-center gap-1.5"
                            >
                                {updateProfile.isPending ? <Loader2 className="animate-spin h-4 w-4 mr-1.5" /> : <Save size={15} />} 
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
        <div className="bg-white dark:bg-black rounded-2xl border border-slate-200/80 dark:border-zinc-800 p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={cn("h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shrink-0", color)}>
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider truncate">{label}</p>
                    {tooltip && <HeaderTooltip content={tooltip} size={12} />}
                </div>
                <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate">{value}</p>
            </div>
        </div>
    );
}

function InfoItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">{label}</span>
            <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-zinc-200 truncate">{value}</span>
        </div>
    );
}

function QuickActionItem({ 
    icon, 
    label, 
    status, 
    onClick 
}: { 
    icon: React.ReactNode; 
    label: string; 
    status: string; 
    onClick?: () => void; 
}) {
    return (
        <button 
            type="button"
            onClick={onClick} 
            className="w-full flex items-center justify-between p-2.5 sm:p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900/60 transition-colors group text-left border border-transparent hover:border-slate-100 dark:hover:border-zinc-800 focus:outline-none"
        >
            <div className="flex items-center gap-3">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-slate-100 dark:bg-zinc-900 text-slate-500 flex items-center justify-center group-hover:bg-emerald-50 dark:group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    {icon}
                </div>
                <div>
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-zinc-200">{label}</p>
                    <p className="text-[11px] font-medium text-gray-500 dark:text-zinc-400">{status}</p>
                </div>
            </div>
            <ChevronRight size={16} className="text-gray-300 dark:text-zinc-600 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
        </button>
    );
}
