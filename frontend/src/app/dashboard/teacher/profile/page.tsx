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
    Cake,
    ShieldCheck,
    MapPin,
    Loader2
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ImageUpload from '@/components/reusable/ImageUpload';

export default function TeacherProfilePage() {
    const { data: profile, isLoading } = useTeacherProfile();
    const updateProfile = useUpdateTeacherProfile();
    const requestEmailUpdate = useRequestTeacherEmailUpdate();
    const verifyEmailUpdate = useVerifyTeacherEmailUpdate();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        gender: '',
        dateOfBirth: '',
        profileImage: '',
        bannerImage: ''
    });

    const [emailStep, setEmailStep] = useState<'input' | 'verify'>('input');
    const [verificationCode, setVerificationCode] = useState('');

    useEffect(() => {
        if (profile) {
            console.log("DEBUG: Teacher Profile Loaded:", profile);
            setFormData({
                name: profile.name || '',
                email: profile.email || '',
                gender: profile.gender || '',
                dateOfBirth: profile.dateOfBirth ? format(new Date(profile.dateOfBirth), 'yyyy-MM-dd') : '',
                profileImage: profile.profileImage || '',
                bannerImage: profile.bannerImage || ''
            });
        }
    }, [profile]);

    const handleEdit = () => {
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
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { email, ...rest } = formData;
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

    const initials = (profile.name || 'T').split(' ').map((n: string) => n[0]).join('').toUpperCase();

    return (
        <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-700 space-y-6 md:space-y-10 px-0 md:px-4">
            {/* Header / Hero Section (Social Style) */}
            <div className="relative group/hero">
                {/* Cover Photo / Pattern */}
                <div className="h-48 md:h-80 w-full overflow-hidden bg-slate-950 md:rounded-[3rem] relative shadow-2xl">
                    {profile.bannerImage ? (
                        <Image
                          src={profile.bannerImage}
                          alt="Banner"
                          fill
                          className="w-full h-full object-cover"
                        />
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
                                <Image
                                  src={profile.profileImage}
                                  alt={profile.name}
                                  width={176}
                                  height={176}
                                  className="w-full h-full object-cover"
                                />
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
                                    {profile.teacherCode || 'TEACHER'}
                                </Badge>
                            </div>
                            <p className="text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2 italic">
                                <Fingerprint size={14} className="text-primary/50" /> Official Educator Identity
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
                    <StatCard icon={<Hash size={24} />} label="Educator ID" value={profile.teacherCode || 'N/A'} color="text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10" />
                    <StatCard icon={<GraduationCap size={24} />} label="Role" value="Senior Educator" color="text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10" />
                    <StatCard icon={<Briefcase size={24} />} label="Status" value="Active" color="text-amber-600 bg-amber-50 dark:bg-amber-500/10" />
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
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Primary Academy</p>
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
                                <p className="text-xs text-white/70 font-medium italic">Your educator account is fully verified and compliant with institutional standards.</p>
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
                            <MobileQuickAction icon={<MapPin size={22} />} label="Home Address" status="Set Location" color="text-rose-500 bg-rose-50 dark:bg-rose-500/10" />
                            <MobileQuickAction icon={<Calendar size={22} />} label="Academic Calendar" status="View Schedule" color="text-primary bg-indigo-50 dark:bg-primary/10" />
                            <MobileQuickAction icon={<ShieldCheck size={22} />} label="Security Settings" status="Strong" color="text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Drawer / Overlay */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center md:items-end md:justify-end p-4 md:p-10 pointer-events-none">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm pointer-events-auto" onClick={() => setIsEditing(false)} />
                    
                    <Card className="relative z-10 w-full max-w-5xl rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border-slate-200/50 dark:border-slate-800/50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-3xl pointer-events-auto transform animate-in slide-in-from-bottom-10 duration-700 max-h-[92vh] overflow-y-auto scrollbar-hide">
                        <CardHeader className="p-8 md:p-12 pb-8 flex flex-row items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-50 border-b border-slate-100 dark:border-slate-800/50">
                            <div className="flex items-center gap-6">
                                <div className="h-14 w-14 md:h-16 md:w-16 rounded-[1.5rem] bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                    <Edit3 className="text-white h-7 w-7 md:h-8 md:w-8" />
                                </div>
                                <div className="space-y-1">
                                    <CardTitle className="text-2xl md:text-4xl font-black italic tracking-tight uppercase text-slate-900 dark:text-white">
                                        Refine Identity
                                    </CardTitle>
                                    <CardDescription className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Secure Profile Management</CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button 
                                    type="button"
                                    onClick={handleSave}
                                    disabled={
                                        updateProfile.isPending || 
                                        (formData.email !== profile.email && emailStep !== 'input') || 
                                        emailStep === 'verify' ||
                                        (formData.name === profile.name && 
                                         formData.gender === profile.gender && 
                                         formData.dateOfBirth === (profile.dateOfBirth ? format(new Date(profile.dateOfBirth), 'yyyy-MM-dd') : '') &&
                                         formData.profileImage === profile.profileImage &&
                                         formData.bannerImage === profile.bannerImage &&
                                         formData.email === profile.email)
                                    }
                                    className="rounded-2xl h-12 md:h-14 px-8 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase tracking-widest gap-3 shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                                >
                                    {updateProfile.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={18} />} 
                                    <span className="hidden sm:inline">Save Changes</span>
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} className="rounded-2xl h-12 w-12 md:h-14 md:w-14 hover:bg-rose-500/10 hover:text-rose-500 transition-colors">
                                    <X size={28} />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 md:p-12 pt-10 space-y-12">
                            {/* Visual Identity Section */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Visual Assets</span>
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                    <div className="p-8 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50 hover:border-primary/20 transition-colors group">
                                        <ImageUpload 
                                            label="Profile Avatar" 
                                            value={formData.profileImage} 
                                            onChange={(url) => setFormData({...formData, profileImage: url})} 
                                            description="Your official digital portrait."
                                            aspectRatio="square"
                                            className="group-hover:scale-[1.01] transition-transform duration-500"
                                        />
                                    </div>
                                    <div className="p-8 rounded-[2.5rem] bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/50 hover:border-primary/20 transition-colors group">
                                        <ImageUpload 
                                            label="Profile Banner" 
                                            value={formData.bannerImage} 
                                            onChange={(url) => setFormData({...formData, bannerImage: url})} 
                                            description="Custom background for your header."
                                            aspectRatio="video"
                                            className="group-hover:scale-[1.01] transition-transform duration-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Core Details Section */}
                            <div className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Identity Records</span>
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Full Legal Name</Label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 w-16 flex items-center justify-center text-slate-400 group-focus-within:text-primary transition-colors border-r border-slate-100 dark:border-slate-800/50 my-3">
                                                <User size={22} />
                                            </div>
                                            <Input 
                                                value={formData.name} 
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                className="h-16 pl-20 rounded-[1.5rem] bg-slate-50 dark:bg-slate-900/50 border-none ring-1 ring-slate-200 dark:ring-slate-800 font-bold text-lg focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                                placeholder="Enter full name..."
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Contact Email</Label>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="relative group flex-1">
                                                <div className="absolute inset-y-0 left-0 w-16 flex items-center justify-center text-slate-400 group-focus-within:text-primary transition-colors border-r border-slate-100 dark:border-slate-800/50 my-3">
                                                    <Mail size={22} />
                                                </div>
                                                <Input 
                                                    value={formData.email} 
                                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                    disabled={emailStep !== 'input'}
                                                    className="h-16 pl-20 rounded-[1.5rem] bg-slate-50 dark:bg-slate-900/50 border-none ring-1 ring-slate-200 dark:ring-slate-800 font-bold text-lg focus:ring-4 focus:ring-primary/10 transition-all shadow-inner disabled:opacity-40"
                                                />
                                            </div>
                                            {formData.email !== profile.email && emailStep === 'input' && (
                                                <Button 
                                                    type="button"
                                                    onClick={handleRequestEmailChange}
                                                    disabled={requestEmailUpdate.isPending}
                                                    className="h-16 rounded-[1.5rem] px-10 bg-indigo-600 text-white hover:bg-indigo-700 font-black uppercase text-xs tracking-widest shadow-xl shadow-indigo-500/20"
                                                >
                                                    {requestEmailUpdate.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : "Verify Identity"}
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {emailStep === 'verify' && (
                                        <div className="md:col-span-2 p-10 rounded-[3rem] bg-gradient-to-br from-indigo-500 to-primary text-white space-y-8 animate-in zoom-in-95 duration-500 shadow-2xl shadow-indigo-500/30">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-[11px] font-black uppercase tracking-widest text-white/70">Protocol Alpha</p>
                                                    <h3 className="text-2xl font-black italic">Verification Required</h3>
                                                </div>
                                                <Button variant="ghost" onClick={() => setEmailStep('input')} className="text-white hover:bg-white/10 rounded-2xl h-12 w-12 p-0">
                                                    <X size={24} />
                                                </Button>
                                            </div>
                                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                                <div className="relative flex-1 w-full">
                                                    <Input 
                                                        placeholder="ENTER CODE"
                                                        value={verificationCode}
                                                        onChange={(e) => setVerificationCode(e.target.value)}
                                                        className="h-20 rounded-[2rem] bg-white/10 border-white/20 text-center text-3xl font-black tracking-[0.5em] focus:ring-8 focus:ring-white/5 transition-all text-white placeholder:text-white/20"
                                                        maxLength={6}
                                                    />
                                                </div>
                                                <Button 
                                                    type="button"
                                                    onClick={handleVerifyEmail}
                                                    disabled={verifyEmailUpdate.isPending}
                                                    className="h-20 w-full md:w-auto px-12 rounded-[2rem] bg-white text-indigo-600 hover:bg-white/90 font-black text-xs uppercase tracking-widest shadow-2xl"
                                                >
                                                    {verifyEmailUpdate.isPending ? <Loader2 className="animate-spin" /> : "Submit Code"}
                                                </Button>
                                            </div>
                                            <p className="text-xs font-bold text-white/60 text-center">We&apos;ve dispatched a security token to <b>{formData.email}</b></p>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Gender Identification</Label>
                                        <Select 
                                            value={formData.gender} 
                                            onValueChange={(val) => setFormData({...formData, gender: val})}
                                        >
                                            <SelectTrigger className="h-16 rounded-[1.5rem] bg-slate-50 dark:bg-slate-900/50 ring-1 ring-slate-200 dark:ring-slate-800 border-none font-bold text-lg">
                                                <SelectValue placeholder="Select Gender" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
                                                <SelectItem value="MALE" className="rounded-xl font-bold">Male</SelectItem>
                                                <SelectItem value="FEMALE" className="rounded-xl font-bold">Female</SelectItem>
                                                <SelectItem value="OTHER" className="rounded-xl font-bold">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-2">Official Date of Birth</Label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 w-16 flex items-center justify-center text-slate-400 group-focus-within:text-primary transition-colors border-r border-slate-100 dark:border-slate-800/50 my-3">
                                                <Calendar size={22} />
                                            </div>
                                            <Input 
                                                type="date"
                                                value={formData.dateOfBirth} 
                                                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                                                className="h-16 pl-20 rounded-[1.5rem] bg-slate-50 dark:bg-slate-900/50 border-none ring-1 ring-slate-200 dark:ring-slate-800 font-bold text-lg focus:ring-4 focus:ring-primary/10 transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </div>
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

function MobileQuickAction({ icon, label, status, color }: { icon: React.ReactNode, label: string, status: string, color: string }) {
    return (
        <button className="w-full flex items-center justify-between p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-all group overflow-hidden relative">
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
        </button>
    );
}
