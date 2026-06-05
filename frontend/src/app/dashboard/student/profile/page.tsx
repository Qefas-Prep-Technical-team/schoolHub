'use client';

import { useState } from 'react';
import { 
    User, 
    Mail, 
    Calendar, 
    Hash, 
    GraduationCap, 
    School, 
    MapPin, 
    Edit3,
    CheckCircle2,
    Save,
    X,
    ChevronRight,
    Briefcase,
    Fingerprint,
    Cake,
    ShieldCheck,
    Phone
} from 'lucide-react';
import Link from 'next/link';
import { useStudentProfile, useUpdateStudentProfile, useRequestEmailUpdate, useVerifyEmailUpdate } from '@/lib/api/hooks/useStudent';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import NextImage from 'next/image';
import ImageUpload from '@/components/reusable/ImageUpload';

export default function StudentProfilePage() {
    const { data: profile, isLoading } = useStudentProfile();
    const updateProfile = useUpdateStudentProfile();
    const requestEmailUpdate = useRequestEmailUpdate();
    const verifyEmailUpdate = useVerifyEmailUpdate();

    const [isEditing, setIsEditing] = useState(false);
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
        guardianPhone: ''
    });

    const [emailStep, setEmailStep] = useState<'input' | 'verify'>('input');
    const [verificationCode, setVerificationCode] = useState('');

    const handleEdit = () => {
        if (!profile) return;
        setFormData({
            name: profile.name,
            email: profile.email,
            gender: profile.gender || '',
            dateOfBirth: profile.dateOfBirth ? format(new Date(profile.dateOfBirth), 'yyyy-MM-dd') : '',
            profileImage: profile.profileImage || '',
            bannerImage: profile.bannerImage || '',
            height: profile.height?.toString() || '',
            weight: profile.weight?.toString() || '',
            club: profile.club || '',
            favouriteColour: profile.favouriteColour || '',
            guardianName: profile.guardianName || '',
            guardianPhone: profile.guardianPhone || profile.parentLinks?.[0]?.parent?.phone || ''
        });
        setEmailStep('input');
        setVerificationCode('');
        setIsEditing(true);
    };

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
        const { email: _email, ...rest } = formData;
        await updateProfile.mutateAsync(rest);
        setIsEditing(false);
    };

    if (isLoading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
            </div>
        );
    }

    if (!profile) return null;

    const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase();

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-700 space-y-6 md:space-y-10 px-0 md:px-4">
            {/* Header / Hero Section (Social Style) */}
            <div className="relative group/hero">
                {/* Cover Photo / Pattern */}
                <div className="h-48 md:h-80 w-full overflow-hidden bg-slate-950 md:rounded-[3rem] relative shadow-2xl">
                    {profile.bannerImage ? (
                        <NextImage src={profile.bannerImage} alt="Banner" fill className="object-cover" />
                    ) : (
                        <div className="absolute inset-0 opacity-30">
                            <div className="absolute top-0 -left-20 w-80 h-80 bg-primary blur-[120px] rounded-full animate-pulse" />
                            <div className="absolute bottom-0 -right-20 w-80 h-80 bg-indigo-500 blur-[120px] rounded-full animate-pulse delay-700" />
                        </div>
                    )}
                </div>

                {/* Profile Identity (Overlapping) */}
                <div className="relative -mt-20 md:-mt-24 px-6 md:px-12 flex flex-col items-center md:items-end md:flex-row gap-6 md:gap-10">
                    <div className="relative shrink-0">
                        <div className="h-32 w-32 md:h-44 md:w-44 rounded-[2.5rem] md:rounded-[3rem] bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-4xl md:text-6xl font-black text-white shadow-2xl border-4 border-white dark:border-slate-950 hover:scale-105 transition-transform duration-500 overflow-hidden">
                            {profile.profileImage ? (
                                <NextImage src={profile.profileImage} alt={profile.name} fill className="object-cover" />
                            ) : (
                                initials
                            )}
                        </div>
                        <Badge className="absolute -top-1 -right-1 md:-top-3 md:-right-3 h-8 w-8 md:h-10 md:w-10 rounded-xl md:rounded-2xl bg-emerald-500 border-4 border-white dark:border-slate-950 flex items-center justify-center">
                            <CheckCircle2 size={16} className="text-white" />
                        </Badge>
                    </div>

                    <div className="flex-1 text-center md:text-left pt-2 md:pt-10 space-y-4">
                        <div className="space-y-1">
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 justify-center md:justify-start">
                                <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">
                                    {profile.name}
                                </h1>
                                <Badge variant="secondary" className="w-fit mx-auto md:mx-0 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-[10px] uppercase tracking-widest py-1 border-none px-3">
                                    {profile.studentCode}
                                </Badge>
                            </div>
                            <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2 italic">
                                <Fingerprint size={14} className="text-primary/50" /> Official Academic Identity
                            </p>
                        </div>

                        <div className="flex items-center justify-center md:justify-start gap-3">
                            <Button 
                                onClick={handleEdit}
                                className="rounded-2xl h-11 md:h-12 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-none hover:scale-105 active:scale-95 transition-all font-black text-xs uppercase tracking-widest shadow-xl"
                            >
                                <Edit3 size={16} className="mr-2" /> Edit Profile
                            </Button>
                            <Button 
                                variant="outline" 
                                className="rounded-2xl h-11 md:h-12 w-11 md:w-auto px-0 md:px-6 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900 font-bold transition-all"
                            >
                                <Mail size={18} className="md:mr-2" />
                                <span className="hidden md:inline">Support</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Overlay (Mobile Horizontal Scroll) */}
            <div className="px-6 md:px-0 overflow-hidden">
                <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-6 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                    <StatCard icon={<Hash size={24} />} label="Reg ID" value={profile.studentCode} color="text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10" />
                    <StatCard icon={<GraduationCap size={24} />} label="Level" value={profile.gradeLevel || 'Standard'} color="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" />
                    <StatCard icon={<Briefcase size={24} />} label="Dept" value={profile.department?.name || 'General'} color="text-amber-600 bg-amber-50 dark:bg-amber-500/10" />
                </div>
            </div>

            {/* Main Content Sections */}
            <div className="px-6 md:px-0 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
                <div className="lg:col-span-2 space-y-6 md:space-y-10">
                    <Card className="rounded-[2.5rem] md:rounded-[3rem] border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden bg-white dark:bg-slate-950">
                        <CardHeader className="p-8 md:p-10 pb-0">
                            <CardTitle className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-4 italic uppercase">
                                <User className="text-primary h-6 w-6 md:h-8 md:w-8" /> 
                                Personal Data
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 md:p-10 space-y-8 md:space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                                <InfoItem icon={<User size={20} />} label="Legal Name" value={profile.name} description="Verified registration name." />
                                <InfoItem icon={<Mail size={20} />} label="Email" value={profile.email} description="Primary contact address." />
                                <InfoItem icon={<ShieldCheck size={20} />} label="Gender" value={profile.gender || 'Not Specified'} description="Biological gender." />
                                <InfoItem icon={<Cake size={20} />} label="Birth Date" value={profile.dateOfBirth ? format(new Date(profile.dateOfBirth), 'PPP') : 'N/A'} description="Official date of birth." />
                                <InfoItem icon={<User size={20} />} label="Guardian Name" value={profile.guardianName || profile.parentLinks?.[0]?.parent?.name || 'Not Linked'} description="Primary emergency contact." />
                                <InfoItem icon={<Phone size={20} />} label="Guardian Phone" value={profile.guardianPhone || profile.parentLinks?.[0]?.parent?.phone || 'Not Linked'} description="Emergency contact number." />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Academic Institution Card */}
                    <Card className="rounded-[2.5rem] md:rounded-[3rem] border-none shadow-2xl overflow-hidden bg-slate-950 text-white">
                        <CardHeader className="p-8 md:p-10 pb-6">
                            <CardTitle className="text-xl md:text-2xl font-black italic uppercase flex items-center gap-3">
                                <School className="text-indigo-400" /> Institution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 md:p-10 pt-0 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Academy</p>
                                    <p className="text-lg md:text-xl font-black italic">{profile.school?.name || 'Qefas-Prep Academy'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Joined</p>
                                    <p className="text-lg md:text-xl font-black italic">{profile.createdAt ? format(new Date(profile.createdAt), 'MMMM yyyy') : 'N/A'}</p>
                                </div>
                            </div>
                            <Separator className="bg-white/10" />
                            <div className="p-5 md:p-6 rounded-[2rem] bg-white/5 border border-white/10 flex items-center gap-4">
                                <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                    <CheckCircle2 size={20} />
                                </div>
                                <p className="text-xs text-white/70 font-medium italic">Your account is fully verified and compliant with institutional standards.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6 md:space-y-10">
                    <div className="p-8 pb-10 rounded-[2.5rem] md:rounded-[3rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black italic uppercase text-slate-900 dark:text-white tracking-tight">Quick Actions</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Institutional Services</p>
                        </div>
                        <div className="space-y-4">
                            <MobileQuickAction href="/dashboard/student/settings" icon={<MapPin size={22} />} label="Home Address" status="Set Location" color="text-rose-500 bg-rose-50 dark:bg-rose-500/10" />
                            <MobileQuickAction href="/dashboard/student/my-classes" icon={<Calendar size={22} />} label="Academic Calendar" status="View Schedule" color="text-primary bg-indigo-50 dark:bg-primary/10" />
                            <MobileQuickAction href="/dashboard/student/settings" icon={<ShieldCheck size={22} />} label="Security Settings" status="Strong" color="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" />
                        </div>
                    </div>

                    {/* Bio Attributes */}
                    <div className="p-8 pb-10 rounded-[2.5rem] md:rounded-[3rem] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner space-y-8">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black italic uppercase text-slate-900 dark:text-white tracking-tight">Extracurricular & Bio</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Student Attributes</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Club</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{profile.club || 'None'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Fav Colour</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{profile.favouriteColour || 'None'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Height</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{profile.height ? `${profile.height} cm` : 'N/A'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Weight</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{profile.weight ? `${profile.weight} kg` : 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Drawer / Overlay */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center md:items-end md:justify-end p-4 md:p-10 pointer-events-none">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm pointer-events-auto" onClick={() => setIsEditing(false)} />
                    
                    <Card className="relative z-10 w-full max-w-xl rounded-[2.5rem] md:rounded-[3rem] shadow-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 pointer-events-auto transform animate-in slide-in-from-bottom-10 duration-500 max-h-[90vh] overflow-y-auto">
                        <CardHeader className="p-8 md:p-10 pb-6 flex flex-row items-center justify-between sticky top-0 bg-white dark:bg-slate-950 z-20">
                            <div className="space-y-1">
                                <CardTitle className="text-2xl md:text-3xl font-black italic tracking-tight uppercase flex items-center gap-3">
                                    <Edit3 className="text-primary" />
                                    Refine Profile
                                </CardTitle>
                                <CardDescription className="text-xs md:text-sm">Update your institutional identity records.</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} className="rounded-2xl">
                                <X size={24} />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-8 md:p-10 pt-0 space-y-8">
                            <div className="grid grid-cols-1 gap-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <ImageUpload 
                                        label="Profile Picture" 
                                        value={formData.profileImage} 
                                        onChange={(url) => setFormData({...formData, profileImage: url})} 
                                        description="Shown on your ID and rankings."
                                        aspectRatio="square"
                                    />
                                    <ImageUpload 
                                        label="Profile Banner" 
                                        value={formData.bannerImage} 
                                        onChange={(url) => setFormData({...formData, bannerImage: url})} 
                                        description="Background for your profile header."
                                        aspectRatio="video"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Legal Name</Label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                        <Input 
                                            value={formData.name} 
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-bold focus:ring-4 focus:ring-primary/10 transition-all border-none ring-1 ring-slate-200 dark:ring-slate-800"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Communication Email</Label>
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="relative group flex-1">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                            <Input 
                                                value={formData.email} 
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                disabled={emailStep !== 'input'}
                                                className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 font-bold focus:ring-4 focus:ring-primary/10 transition-all border-none ring-1 ring-slate-200 dark:ring-slate-800 disabled:opacity-50"
                                            />
                                        </div>
                                        {formData.email !== profile.email && emailStep === 'input' && (
                                            <div className="flex gap-2">
                                                <Button 
                                                    type="button"
                                                    onClick={handleRequestEmailChange}
                                                    disabled={requestEmailUpdate.isPending}
                                                    className="h-14 flex-1 sm:flex-none rounded-2xl px-6 bg-primary text-white hover:bg-primary/90 font-black uppercase text-xs tracking-widest"
                                                >
                                                    {requestEmailUpdate.isPending ? <Loader2 className="animate-spin" /> : "Verify"}
                                                </Button>
                                                <Button 
                                                    type="button"
                                                    onClick={() => setFormData({...formData, email: profile.email})}
                                                    variant="outline"
                                                    className="h-14 w-14 p-0 rounded-2xl border-slate-200"
                                                >
                                                    <X size={18} />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {emailStep === 'verify' && (
                                        <div className="mt-6 p-6 md:p-8 rounded-[2.5rem] bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/20 backdrop-blur-xl space-y-6 animate-in zoom-in-95 duration-500 shadow-2xl shadow-indigo-500/5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-3 w-3 rounded-full bg-indigo-500 animate-pulse" />
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Institutional Protocol</p>
                                                        <p className="text-xs font-bold text-slate-500">Identity Verification Required</p>
                                                    </div>
                                                </div>
                                                <Button 
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEmailStep('input')}
                                                    className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>

                                            <div className="relative group">
                                                <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-400/50" size={24} />
                                                <Input 
                                                    placeholder="Code"
                                                    value={verificationCode}
                                                    onChange={(e) => setVerificationCode(e.target.value)}
                                                    className="h-16 md:h-20 pl-16 rounded-3xl bg-white dark:bg-slate-950 border-indigo-200 dark:border-indigo-800 text-center text-2xl md:text-3xl font-black tracking-[0.4em] focus:ring-8 focus:ring-indigo-500/5 transition-all placeholder:text-slate-300 placeholder:text-sm placeholder:font-bold placeholder:tracking-normal"
                                                    maxLength={6}
                                                />
                                            </div>

                                            <div className="flex flex-col gap-4">
                                                <Button 
                                                    type="button"
                                                    onClick={handleVerifyEmail}
                                                    disabled={verifyEmailUpdate.isPending}
                                                    className="h-14 md:h-16 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                                                >
                                                    {verifyEmailUpdate.isPending ? <Loader2 className="animate-spin" /> : "Verify Identity"}
                                                </Button>
                                                
                                                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/50 dark:bg-white/5 border border-indigo-50/50 dark:border-indigo-900/10">
                                                    <p className="text-[10px] font-bold text-slate-500 italic text-center sm:text-left">
                                                        Code sent to <b>{formData.email}</b>
                                                    </p>
                                                    <Separator orientation="vertical" className="hidden sm:block h-4 bg-slate-200" />
                                                    <button 
                                                        type="button"
                                                        onClick={handleRequestEmailChange} 
                                                        disabled={requestEmailUpdate.isPending}
                                                        className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 cursor-pointer disabled:opacity-50 transition-colors"
                                                    >
                                                        {requestEmailUpdate.isPending ? "Syncing..." : "Resend Code"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gender</Label>
                                        <Select 
                                            value={formData.gender} 
                                            onValueChange={(val) => setFormData({...formData, gender: val})}
                                        >
                                            <SelectTrigger className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 ring-1 ring-slate-200 dark:ring-slate-800 border-none font-bold">
                                                <SelectValue placeholder="Gender" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl">
                                                <SelectItem value="MALE">Male</SelectItem>
                                                <SelectItem value="FEMALE">Female</SelectItem>
                                                <SelectItem value="OTHER">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date of Birth</Label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
                                            <Input 
                                                type="date"
                                                value={formData.dateOfBirth} 
                                                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                                                className="h-14 pl-12 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-800 font-bold focus:ring-4 focus:ring-primary/10 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Height (cm)</Label>
                                        <Input 
                                            type="number"
                                            placeholder="170"
                                            value={formData.height} 
                                            onChange={(e) => setFormData({...formData, height: e.target.value})}
                                            className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-800 font-bold focus:ring-4 focus:ring-primary/10 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weight (kg)</Label>
                                        <Input 
                                            type="number"
                                            placeholder="60"
                                            value={formData.weight} 
                                            onChange={(e) => setFormData({...formData, weight: e.target.value})}
                                            className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-800 font-bold focus:ring-4 focus:ring-primary/10 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Club / Activities</Label>
                                        <Input 
                                            placeholder="E.g. Science Club"
                                            value={formData.club} 
                                            onChange={(e) => setFormData({...formData, club: e.target.value})}
                                            className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-800 font-bold focus:ring-4 focus:ring-primary/10 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Favourite Colour</Label>
                                        <Input 
                                            placeholder="E.g. Blue"
                                            value={formData.favouriteColour} 
                                            onChange={(e) => setFormData({...formData, favouriteColour: e.target.value})}
                                            className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-800 font-bold focus:ring-4 focus:ring-primary/10 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 rounded-[2rem] bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100/50 dark:border-indigo-800/50">
                                    <div className="space-y-3 sm:col-span-2">
                                        <h4 className="text-sm font-black italic uppercase text-indigo-900 dark:text-indigo-400 flex items-center gap-2">
                                            <ShieldCheck size={18} /> Emergency / Guardian Contact
                                        </h4>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Guardian Name</Label>
                                        <Input 
                                            placeholder="Full Name"
                                            value={formData.guardianName} 
                                            onChange={(e) => setFormData({...formData, guardianName: e.target.value})}
                                            className="h-14 rounded-2xl bg-white dark:bg-slate-950 border-none ring-1 ring-indigo-200/50 dark:ring-indigo-800/50 font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Guardian Phone</Label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                            <Input 
                                                placeholder="+1 (555) 000-0000"
                                                value={formData.guardianPhone} 
                                                onChange={(e) => setFormData({...formData, guardianPhone: e.target.value})}
                                                className="h-14 pl-12 rounded-2xl bg-white dark:bg-slate-950 border-none ring-1 ring-indigo-200/50 dark:ring-indigo-800/50 font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <Button 
                                    type="button"
                                    onClick={handleSave}
                                    disabled={updateProfile.isPending || formData.email !== profile.email || emailStep === 'verify'}
                                    className="w-full rounded-[2rem] h-16 font-black text-lg gap-3 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all disabled:opacity-50 disabled:grayscale"
                                >
                                    {updateProfile.isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />} 
                                    Synchronize Records
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
    return (
        <div className="shrink-0 w-[240px] md:w-auto p-6 md:p-8 rounded-[2.5rem] bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4 transition-all hover:shadow-xl hover:scale-[1.02]">
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", color)}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-tight">{label}</p>
                <p className="text-lg font-black truncate">{value}</p>
            </div>
        </div>
    );
}

function InfoItem({ icon, label, value, description }: { icon: React.ReactNode, label: string, value: string, description: string }) {
    return (
        <div className="group flex gap-4 md:gap-6 p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800">
            <div className="h-12 w-12 md:h-14 md:w-14 shrink-0 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/5 transition-all shadow-sm">
                {icon}
            </div>
            <div className="space-y-1 min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <div className="flex items-center gap-2">
                    <p className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight truncate">{value}</p>
                    <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity hidden md:block" />
                </div>
                <p className="text-[10px] font-bold text-slate-500 italic leading-none truncate">{description}</p>
            </div>
        </div>
    );
}

function MobileQuickAction({ href, icon, label, status, color }: { href?: string, icon: React.ReactNode, label: string, status: string, color: string }) {
    const Component = href ? Link : 'button';
    const props = href ? { href } : {};

    return (
        <Component {...props as any} className="w-full flex items-center justify-between p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-all group overflow-hidden relative">
            <div className="flex items-center gap-4 relative z-10">
                <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", color)}>
                    {icon}
                </div>
                <div className="text-left">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white italic">{status}</p>
                </div>
            </div>
            <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-colors relative z-10" />
            <div className="absolute top-0 right-0 h-full w-1/2 bg-gradient-to-l from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Component>
    );
}
