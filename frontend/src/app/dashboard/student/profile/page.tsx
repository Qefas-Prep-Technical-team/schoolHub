'use client';

import { useState, useEffect } from 'react';
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
    Activity
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { 
    useStudentProfile, 
    useUpdateStudentProfile, 
    useRequestEmailUpdate, 
    useVerifyEmailUpdate 
} from '@/lib/api/hooks/useStudent';
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

export default function StudentProfilePage() {
    const { data: profile, isLoading } = useStudentProfile();
    const updateProfile = useUpdateStudentProfile();
    const requestEmailUpdate = useRequestEmailUpdate();
    const verifyEmailUpdate = useVerifyEmailUpdate();

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

    if (isLoading) {
        return (
            <div className="w-[95%] max-w-[1600px] mx-auto py-8 animate-pulse space-y-6 md:space-y-8 px-4 md:px-8">
                {/* Header Skeleton */}
                <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="h-48 md:h-64 w-full bg-slate-200 dark:bg-slate-800" />
                    <div className="relative -mt-16 px-6 md:px-10 flex flex-col md:flex-row items-center md:items-end gap-6 pb-8">
                        <div className="h-32 w-32 md:h-40 md:w-40 rounded-2xl bg-white dark:bg-slate-900 p-1.5 shadow-md border border-gray-50 dark:border-slate-800 shrink-0">
                            <div className="w-full h-full rounded-xl bg-slate-200 dark:bg-slate-800" />
                        </div>
                        <div className="flex-1 text-center md:text-left mb-2 md:mb-4 space-y-3">
                            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg mx-auto md:mx-0" />
                            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded mx-auto md:mx-0" />
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                            <div className="h-10 w-28 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 rounded-2xl bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 shadow-sm p-5 flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
                            <div className="space-y-2 w-full">
                                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
                                <div className="h-5 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grids Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden min-h-[300px]">
                            <div className="px-6 py-5 border-b border-gray-50 dark:border-slate-800/50 flex justify-between">
                                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-800 rounded-md" />
                            </div>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                                        <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden min-h-[300px]">
                            <div className="px-6 py-5 border-b border-gray-50 dark:border-slate-800/50">
                                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                            </div>
                            <div className="p-6 space-y-6">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded" />
                                        <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-lg" />
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

    const initials = (profile.name || 'S').split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2);

    return (
        <div className="w-[95%] max-w-[1600px] mx-auto py-8 animate-in fade-in duration-500 space-y-6 md:space-y-8 px-4 md:px-8">
            
            {/* Header / Hero Section (SaaS Style) */}
            <div className="bg-white dark:bg-slate-950 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                {/* Cover Photo / Banner */}
                <div className="h-48 md:h-64 w-full relative bg-pink-600 flex items-center justify-center overflow-hidden group">
                    {profile.bannerImage ? (
                        <Image
                            src={profile.bannerImage}
                            alt="Banner"
                            fill
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-600 opacity-90" />
                    )}
                    <Button 
                        onClick={() => handleEdit('visuals')}
                        variant="secondary"
                        size="icon"
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-white/80 hover:bg-white text-pink-700 shadow-sm"
                    >
                        <Edit3 size={16} />
                    </Button>
                </div>

                {/* Profile Identity */}
                <div className="relative -mt-16 px-6 md:px-10 flex flex-col md:flex-row items-center md:items-end gap-6 pb-8">
                    <div className="relative shrink-0 group">
                        <div className="h-32 w-32 md:h-40 md:w-40 rounded-2xl bg-white dark:bg-slate-900 p-1.5 shadow-md border border-gray-50 dark:border-slate-800 flex items-center justify-center text-4xl md:text-5xl font-bold text-pink-600 dark:text-pink-400 cursor-pointer overflow-hidden relative" onClick={() => handleEdit('visuals')}>
                            {profile.profileImage ? (
                                <div className="w-full h-full relative rounded-xl overflow-hidden">
                                    <Image
                                        src={profile.profileImage}
                                        alt={profile.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-full h-full rounded-xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center">
                                    {initials}
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                <Edit3 size={24} className="text-white" />
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-indigo-500 border-4 border-white dark:border-slate-950 flex items-center justify-center" title="Verified Student">
                            <CheckCircle2 size={14} className="text-white" />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left mb-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                                {profile.name}
                            </h1>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-semibold bg-pink-50 dark:bg-pink-500/10 text-pink-700 dark:text-pink-400 uppercase tracking-widest">
                                {profile.studentCode || 'STUDENT'}
                            </span>
                        </div>
                        <p className="text-sm font-medium text-gray-500 dark:text-slate-400 mt-1 flex items-center justify-center md:justify-start gap-1.5">
                            <Fingerprint size={14} /> Official Academic Identity
                        </p>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                        <Button 
                            variant="outline" 
                            title="This button turns green when Two-Factor Authentication is set up"
                            className={cn(
                                "h-10 px-4 rounded-lg font-semibold text-sm transition-all",
                                (profile as any).twoFactorEnabled || (profile as any).is2FAEnabled 
                                    ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-500/10 dark:border-green-500/50 hover:bg-green-100 dark:hover:bg-green-500/20" 
                                    : "border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-900"
                            )}
                            onClick={() => window.location.href = '/dashboard/student/settings?tab=security'}
                        >
                            <ShieldCheck size={16} className="md:mr-2" />
                            <span className="hidden md:inline">Security</span>
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => window.location.href = 'mailto:admin@qefashub.com'}
                            className="h-10 px-4 rounded-lg border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-900 font-semibold text-sm transition-all"
                        >
                            <Mail size={16} className="md:mr-2" />
                            <span className="hidden md:inline">Support</span>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<Hash size={20} />} label="Reg ID" value={profile.studentCode || 'N/A'} color="text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10" />
                <StatCard icon={<GraduationCap size={20} />} label="Level" value={profile.gradeLevel || 'Standard'} color="text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-500/10" />
                <StatCard icon={<Briefcase size={20} />} label="Dept" value={profile.department?.name || 'General'} color="text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10" />
            </div>

            {/* Main Content Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Data */}
                    <Card className="rounded-2xl border-gray-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden relative group">
                        <CardHeader className="px-6 py-5 border-b border-gray-50 dark:border-slate-800/50 bg-white dark:bg-slate-950 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <User className="text-pink-500 h-5 w-5" /> 
                                Personal Data
                            </CardTitle>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEdit('personal')}
                                className="h-8 w-8 text-gray-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-500/10"
                            >
                                <Edit3 size={16} />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <InfoItem label="Legal Name" value={profile.name} />
                                <InfoItem label="Email Address" value={profile.email} />
                                <InfoItem label="Gender" value={profile.gender || 'Not Specified'} />
                                <InfoItem label="Birth Date" value={profile.dateOfBirth ? format(new Date(profile.dateOfBirth), 'PPP') : 'Not Specified'} />
                                <div className="sm:col-span-2">
                                    <InfoItem label="Home Address" value={profile.address || 'Not Provided'} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Extracurricular & Bio Details */}
                    <Card className="rounded-2xl border-gray-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden relative group">
                        <CardHeader className="px-6 py-5 border-b border-gray-50 dark:border-slate-800/50 bg-white dark:bg-slate-950 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <Activity className="text-pink-500 h-5 w-5" /> 
                                Extracurricular & Bio
                            </CardTitle>
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEdit('attributes')}
                                className="h-8 w-8 text-gray-400 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-500/10"
                            >
                                <Edit3 size={16} />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <InfoItem label="Club / Activities" value={profile.club || 'None'} />
                                <InfoItem label="Favourite Colour" value={profile.favouriteColour || 'None'} />
                                <InfoItem label="Height" value={profile.height ? `${profile.height} cm` : 'N/A'} />
                                <InfoItem label="Weight" value={profile.weight ? `${profile.weight} kg` : 'N/A'} />
                                
                                <div className="sm:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"><ShieldCheck size={14} /> Emergency Contact</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <InfoItem label="Guardian Name" value={profile.guardianName || profile.parentLinks?.[0]?.parent?.name || 'Not Linked'} />
                                        <InfoItem label="Guardian Phone" value={profile.guardianPhone || profile.parentLinks?.[0]?.parent?.phone || 'Not Linked'} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Academic Institution Card */}
                    <Card className="rounded-2xl border-indigo-100 dark:border-indigo-500/20 shadow-sm bg-indigo-50/50 dark:bg-indigo-500/5 overflow-hidden">
                        <CardHeader className="px-6 py-5 bg-indigo-50/80 dark:bg-indigo-500/10 border-b border-indigo-100/50 dark:border-indigo-500/20 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-bold text-indigo-900 dark:text-indigo-400 flex items-center gap-2">
                                <School className="text-indigo-600 dark:text-indigo-400 h-5 w-5" /> Institution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-semibold text-indigo-500 dark:text-indigo-400/70 uppercase tracking-wider mb-1">Primary Academy</p>
                                    <p className="text-base font-bold text-indigo-950 dark:text-indigo-100">{profile.school?.name || 'Qefas-Prep Academy'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-indigo-500 dark:text-indigo-400/70 uppercase tracking-wider mb-1">Joined</p>
                                    <p className="text-base font-bold text-indigo-950 dark:text-indigo-100">{profile.createdAt ? format(new Date(profile.createdAt), 'MMMM yyyy') : 'N/A'}</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-white dark:bg-slate-900/50 border border-indigo-100 dark:border-indigo-500/20 flex gap-3 shadow-sm">
                                <div className="h-8 w-8 shrink-0 rounded-lg bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center text-teal-500 dark:text-teal-400">
                                    <CheckCircle2 size={18} />
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">Your student account is fully verified and compliant with institutional standards.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="rounded-2xl border-gray-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-950 overflow-hidden">
                        <CardHeader className="px-6 py-5 border-b border-gray-50 dark:border-slate-800/50 bg-white dark:bg-slate-950">
                            <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">Services</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                            <QuickActionItem onClick={() => handleEdit('personal')} icon={<MapPin size={18} />} label="Home Address" status={profile.address ? "Set" : "Set Location"} hoverColor="hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600" />
                            <QuickActionItem onClick={() => handleEdit('attributes')} icon={<Phone size={18} />} label="Emergency Contact" status={profile.guardianPhone ? "Set" : "Update Info"} hoverColor="hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600" />
                            <QuickActionItem href="/dashboard/student/grades" icon={<Calendar size={18} />} label="Grades & Results" status="View Results" hoverColor="hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-indigo-600" />
                            <QuickActionItem href="/dashboard/student/attendance" icon={<ShieldCheck size={18} />} label="Attendance" status="View Records" hoverColor="hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-emerald-600" />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Edit Modal (SaaS Style) */}
            {editingTab !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-12">
                    <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={() => setEditingTab(null)} />
                    
                    <Card className="relative z-10 w-full max-w-2xl rounded-2xl shadow-2xl border-0 bg-white dark:bg-slate-950 overflow-hidden flex flex-col h-full max-h-[85vh] animate-in zoom-in-95 duration-200">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="space-y-1">
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Edit Profile</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Update your details across different sections.</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setEditingTab(null)} className="rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300">
                                <X size={20} />
                            </Button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6">
                            <Tabs value={editingTab} onValueChange={setEditingTab} className="w-full">
                                <TabsList className="w-full flex mb-6 bg-slate-50 dark:bg-slate-900 rounded-lg p-1 overflow-x-auto scrollbar-hide">
                                    <TabsTrigger value="personal" className="flex-1 rounded-md text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm">Personal</TabsTrigger>
                                    <TabsTrigger value="attributes" className="flex-1 rounded-md text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm">Attributes</TabsTrigger>
                                    <TabsTrigger value="visuals" className="flex-1 rounded-md text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm">Visuals</TabsTrigger>
                                    <TabsTrigger value="security" className="flex-1 rounded-md text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm">Security</TabsTrigger>
                                </TabsList>

                                <TabsContent value="personal" className="space-y-5 mt-0 outline-none">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Full Legal Name</Label>
                                        <Input 
                                            value={formData.name} 
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-transparent"
                                            placeholder="Enter full name"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Gender</Label>
                                            <Select value={formData.gender} onValueChange={(val) => setFormData({...formData, gender: val})}>
                                                <SelectTrigger className="h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-transparent">
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
                                            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Date of Birth</Label>
                                            <Input 
                                                type="date"
                                                value={formData.dateOfBirth} 
                                                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                                                className="h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-transparent"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Home Address</Label>
                                        <Input 
                                            value={formData.address} 
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            className="h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-transparent"
                                            placeholder="Enter your full home address"
                                        />
                                    </div>
                                </TabsContent>

                                <TabsContent value="attributes" className="space-y-5 mt-0 outline-none">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Height (cm)</Label>
                                            <Input 
                                                type="number"
                                                value={formData.height} 
                                                onChange={(e) => setFormData({...formData, height: e.target.value})}
                                                className="h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-transparent"
                                                placeholder="e.g. 170"
                                            />
                                        </div>

                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Weight (kg)</Label>
                                            <Input 
                                                type="number"
                                                value={formData.weight} 
                                                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                                                placeholder="e.g. 60"
                                                className="h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-transparent"
                                            />
                                        </div>
                                        
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Club / Activities</Label>
                                            <Input 
                                                value={formData.club} 
                                                onChange={(e) => setFormData({...formData, club: e.target.value})}
                                                className="h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-transparent"
                                                placeholder="e.g. Science Club"
                                            />
                                        </div>
                                        
                                        <div className="space-y-1.5">
                                            <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Favourite Colour</Label>
                                            <Input 
                                                value={formData.favouriteColour} 
                                                onChange={(e) => setFormData({...formData, favouriteColour: e.target.value})}
                                                className="h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-transparent"
                                                placeholder="e.g. Blue"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-5">
                                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Emergency Contact</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Guardian Name</Label>
                                                <Input 
                                                    value={formData.guardianName} 
                                                    onChange={(e) => setFormData({...formData, guardianName: e.target.value})}
                                                    className="h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-transparent"
                                                    placeholder="Full Name"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Guardian Phone</Label>
                                                <Input 
                                                    value={formData.guardianPhone} 
                                                    onChange={(e) => setFormData({...formData, guardianPhone: e.target.value})}
                                                    className="h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-transparent"
                                                    placeholder="+1 555 000 0000"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="visuals" className="space-y-5 mt-0 outline-none">
                                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            <User size={16} className="text-slate-400" /> Profile Avatar
                                        </div>
                                        <ImageUpload 
                                            label="Upload Avatar" 
                                            value={formData.profileImage} 
                                            onChange={(url) => setFormData({...formData, profileImage: url})} 
                                            description="Recommended 400x400px (1:1)"
                                            aspectRatio="square"
                                        />
                                    </div>
                                    <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                        <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                            <ImageIcon size={16} className="text-slate-400" /> Profile Banner
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

                                <TabsContent value="security" className="space-y-5 mt-0 outline-none">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Contact Email</Label>
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <Input 
                                                value={formData.email} 
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                disabled={emailStep !== 'input'}
                                                className="h-10 rounded-lg border-slate-200 dark:border-slate-700 disabled:bg-slate-50 dark:disabled:bg-slate-900 disabled:text-slate-500 bg-transparent flex-1"
                                            />
                                            {formData.email !== profile.email && emailStep === 'input' && (
                                                <Button 
                                                    type="button"
                                                    onClick={handleRequestEmailChange}
                                                    disabled={requestEmailUpdate.isPending}
                                                    className="h-10 px-6 rounded-lg bg-pink-600 hover:bg-pink-700 text-white font-semibold text-sm shadow-sm"
                                                >
                                                    {requestEmailUpdate.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Verify"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {emailStep === 'verify' && (
                                        <div className="p-5 rounded-xl border border-pink-100 dark:border-pink-900 bg-pink-50 dark:bg-pink-950 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-sm font-bold text-pink-900 dark:text-pink-100">Verification Required</h4>
                                                    <p className="text-xs text-pink-700 dark:text-pink-400 mt-1">We sent a code to {formData.email}</p>
                                                </div>
                                                <Button variant="ghost" size="sm" onClick={() => setEmailStep('input')} className="text-pink-500 hover:bg-pink-100 dark:hover:bg-pink-900 h-8 px-2 rounded-md">
                                                    Cancel
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Input 
                                                    placeholder="Enter code"
                                                    value={verificationCode}
                                                    onChange={(e) => setVerificationCode(e.target.value)}
                                                    className="h-10 border-pink-200 dark:border-pink-700 bg-white dark:bg-slate-900 text-center tracking-widest font-semibold flex-1"
                                                    maxLength={6}
                                                />
                                                <Button 
                                                    type="button"
                                                    onClick={handleVerifyEmail}
                                                    disabled={verifyEmailUpdate.isPending}
                                                    className="h-10 px-6 rounded-lg bg-pink-600 text-white hover:bg-pink-700 font-semibold text-sm shadow-sm"
                                                >
                                                    {verifyEmailUpdate.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Confirm"}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>

                        <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 shrink-0 flex justify-end gap-3 bg-slate-50 dark:bg-slate-900/50">
                            <Button variant="outline" onClick={() => setEditingTab(null)} className="h-10 rounded-lg border-slate-200 dark:border-slate-700 font-semibold">
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleSave}
                                disabled={
                                    updateProfile.isPending || 
                                    (formData.email !== profile.email && emailStep !== 'input') || 
                                    emailStep === 'verify'
                                }
                                className="h-10 px-6 rounded-lg bg-pink-600 text-white hover:bg-pink-700 font-semibold shadow-sm"
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

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
    return (
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", color)}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1 truncate">{label}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white truncate">{value}</p>
            </div>
        </div>
    );
}

function InfoItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1">{label}</span>
            <span className="text-sm font-medium text-gray-900 dark:text-slate-200 truncate">{value}</span>
        </div>
    );
}

function QuickActionItem({ href, icon, label, status, onClick, hoverColor }: { href?: string, icon: React.ReactNode, label: string, status: string, onClick?: () => void, hoverColor?: string }) {
    const Component = href ? Link : 'button';
    const props = href ? { href } : {};
    
    return (
        <Component {...props as any} onClick={onClick} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors group text-left border border-transparent hover:border-slate-100 dark:hover:border-slate-800 block">
            <div className="flex items-center gap-3">
                <div className={cn("h-10 w-10 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-500 flex items-center justify-center transition-colors group-hover:scale-110", hoverColor)}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-slate-200">{label}</p>
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400">{status}</p>
                </div>
            </div>
            <ChevronRight size={16} className="text-gray-300 dark:text-slate-600 group-hover:text-pink-500 transition-colors" />
        </Component>
    );
}
