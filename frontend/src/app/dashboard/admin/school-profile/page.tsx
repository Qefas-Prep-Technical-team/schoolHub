'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolProfile, useSchoolStats, useSchoolSettings } from '@/lib/api/hooks/useSchool';
import { 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Calendar, 
  User as UserIcon,
  ShieldCheck,
  Edit3,
  Users,
  GraduationCap,
  BookOpen,
  Trophy,
  ExternalLink,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Clock,
  Navigation,
  Zap,
  Target,
  Award,
  Fingerprint,
  Info,
  History,
  Link as LinkIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function SchoolProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  
  const { data: school, isLoading: schoolLoading, isError: schoolError, refetch } = useSchoolProfile(schoolId);
  const { data: stats, isLoading: statsLoading, isError: statsError } = useSchoolStats(schoolId);
  const { data: settings } = useSchoolSettings(schoolId);

  const primaryColor = settings?.themeColor || '#2563eb';

  const handleEditProfile = () => {
    router.push('/dashboard/admin/school-profile/edit');
  };

  const socialLinks = React.useMemo(() => {
    if (!school?.socialLinks) return null;
    try {
      return typeof school.socialLinks === 'string' 
        ? JSON.parse(school.socialLinks) 
        : school.socialLinks;
    } catch (e) {
      return null;
    }
  }, [school?.socialLinks]);

  if (schoolLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8 space-y-8">
        <div className="h-64 w-full bg-slate-200 dark:bg-slate-800 rounded-[2rem] animate-pulse" />
        <div className="flex gap-8 px-12">
           <div className="size-40 -mt-20 rounded-[2.5rem] bg-white dark:bg-slate-900 border-8 border-slate-50 dark:border-slate-950 animate-pulse shadow-xl" />
           <div className="flex-1 space-y-4 pt-4">
              <div className="h-10 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-4 w-1/4 bg-slate-100 dark:bg-slate-900 rounded-full animate-pulse" />
           </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-12">
           <div className="lg:col-span-2 space-y-8">
              <div className="h-64 bg-white dark:bg-slate-900 rounded-[2.5rem] animate-pulse" />
              <div className="h-96 bg-white dark:bg-slate-900 rounded-[2.5rem] animate-pulse" />
           </div>
           <div className="space-y-8">
              <div className="h-80 bg-white dark:bg-slate-900 rounded-[2.5rem] animate-pulse" />
           </div>
        </div>
      </div>
    );
  }

  if (schoolError || statsError) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="size-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mx-auto text-red-500">
             <Info size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Profile Sync Failed</h2>
          <p className="text-slate-500">We couldn't retrieve your institutional data. Please check your connection.</p>
          <Button onClick={() => refetch()} className="w-full h-14 rounded-2xl" style={{ backgroundColor: primaryColor }}>Retry Synchronization</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      
      {/* Hero Section - LinkedIn Style Banner & Logo */}
      <section className="relative">
        <div className="h-64 md:h-80 w-full relative overflow-hidden">
          {school?.bannerImage ? (
            <Image 
              src={school.bannerImage} 
              alt="School Banner" 
              fill 
              className="object-cover" 
              priority
            />
          ) : (
            <div className="w-full h-full bg-slate-900 relative">
               <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(45deg, ${primaryColor}, transparent)` }} />
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
            </div>
          )}
          <div className="absolute top-6 right-6 flex gap-3">
             <Button 
                onClick={handleEditProfile}
                variant="secondary"
                className="bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 backdrop-blur-md rounded-xl h-10 px-4 font-bold text-xs uppercase tracking-wider shadow-lg"
             >
                <Edit3 size={14} className="mr-2" /> Edit Cover
             </Button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative">
          <div className="flex flex-col md:flex-row gap-4 md:gap-10 -mt-12 md:-mt-24 relative z-20 px-2 sm:px-0">
             {/* Logo Container */}
             <div className="size-32 md:size-56 rounded-3xl md:rounded-[2.5rem] bg-white dark:bg-slate-900 p-1.5 md:p-2 shadow-2xl border-[4px] md:border-[6px] border-slate-50 dark:border-slate-950 flex items-center justify-center shrink-0">
                {school?.logo ? (
                  <div className="relative w-full h-full rounded-[1.5rem] md:rounded-[2rem] overflow-hidden">
                    <Image src={school.logo} alt={school.name} fill className="object-cover" />
                  </div>
                ) : (
                  <Building2 size={48} className="text-slate-200" />
                )}
             </div>

             {/* Profile Header Info */}
             <div className="flex-1 pt-2 md:pt-24 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                   <div className="space-y-1">
                      <h1 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-tight">
                        {school?.name}
                      </h1>
                      <p className="text-sm md:text-xl font-medium text-slate-600 dark:text-slate-400">
                        {school?.motto || "Empowering minds for a better tomorrow."}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] md:text-sm text-slate-500 font-bold uppercase tracking-wider mt-3">
                         <span className="flex items-center gap-1.5"><MapPin size={14} style={{ color: primaryColor }} /> {school?.address || "Location Pending"}</span>
                         <span className="hidden md:block h-1 w-1 rounded-full bg-slate-300" />
                         <span className="flex items-center gap-1.5" style={{ color: primaryColor }}><LinkIcon size={14} /> Contact info</span>
                      </div>
                   </div>

                   <div className="flex flex-col sm:flex-row gap-3 pt-2 md:pt-0">
                      <Button 
                        onClick={handleEditProfile}
                        className="h-11 md:h-12 w-full sm:w-auto px-8 rounded-full font-black uppercase tracking-widest text-[10px] md:text-[11px] shadow-lg"
                        style={{ backgroundColor: primaryColor }}
                      >
                         Edit Profile
                      </Button>
                      <Button 
                        variant="outline"
                        className="h-11 md:h-12 w-full sm:w-auto px-6 rounded-full border-2 border-slate-200 dark:border-slate-800 font-black uppercase tracking-widest text-[10px] md:text-[11px]"
                      >
                         View Portal
                      </Button>
                   </div>
                </div>

                <div className="flex items-center gap-4 md:gap-6 pt-1 md:pt-2">
                   <p className="text-xs md:text-sm font-bold text-slate-600 dark:text-slate-400">
                     <span className="text-slate-900 dark:text-white font-black">{stats?.students || 0}</span> Students
                   </p>
                   <p className="text-xs md:text-sm font-bold text-slate-600 dark:text-slate-400">
                     <span className="text-slate-900 dark:text-white font-black">{stats?.teachers || 0}</span> Teachers
                   </p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-0 md:px-12 mt-6 md:mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left/Main Column */}
        <div className="lg:col-span-2 space-y-4 md:space-y-8">
          
          {/* About Section */}
          <Card className="rounded-none md:rounded-[2.5rem] border-x-0 md:border-x border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-6 md:p-10 space-y-4 md:space-y-6">
               <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">About Institution</h2>
               <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                 {school?.description || "A premier educational institution focused on excellence and holistic development. Committed to nurturing future leaders through innovative teaching methodologies and a balanced approach to academic and extracurricular growth."}
               </p>
            </CardContent>
          </Card>

          {/* Academic Leadership */}
          <Card className="rounded-none md:rounded-[2.5rem] border-x-0 md:border-x border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-6 md:p-10 space-y-6 md:space-y-8">
               <div className="flex items-center justify-between">
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Leadership Protocol</h2>
                  <Button variant="ghost" className="rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-400">View All</Button>
               </div>
               
               <div className="space-y-6 md:space-y-8">
                  {school?.admins?.length > 0 ? (
                    school.admins.map((sa: any, idx: number) => (
                      <div key={idx} className="flex gap-4 md:gap-6 items-start">
                         <div className="size-12 md:size-16 rounded-xl md:rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xl md:text-2xl text-slate-400 shrink-0 shadow-inner">
                            {sa.admin?.name?.charAt(0)}
                         </div>
                         <div className="flex-1 space-y-0.5 md:space-y-1">
                            <p className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-tight">{sa.admin?.name}</p>
                            <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">{sa.role || 'Administrator'}</p>
                            <p className="text-xs md:text-sm text-slate-400 font-medium pt-1 line-clamp-2 md:line-clamp-none">Managing institutional operations and academic excellence since participation.</p>
                         </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-400 italic font-bold text-xs md:text-sm">No leadership data detected.</p>
                  )}
               </div>
            </CardContent>
          </Card>

          {/* System Architecture */}
          <Card className="rounded-none md:rounded-[2.5rem] border-x-0 md:border-x border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-6 md:p-10 space-y-6 md:space-y-8">
               <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Digital Capabilities</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="p-5 md:p-6 rounded-2xl md:rounded-[2rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1 md:space-y-2">
                     <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Institutional Hash</p>
                     <p className="text-xl md:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-widest select-all">{school?.schoolCode || '---'}</p>
                  </div>
                  <div className="p-5 md:p-6 rounded-2xl md:rounded-[2rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1 md:space-y-2">
                     <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Subdomain</p>
                     <p className="text-base md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter truncate" style={{ color: primaryColor }}>
                        {school?.subdomain ? `${school.subdomain}.qefashub.com` : 'OFFLINE'}
                     </p>
                  </div>
               </div>

               <div className="flex flex-wrap gap-2 md:gap-3 pt-2 md:pt-4">
                  {school?.subscriptionPlan?.features?.map((feature: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="rounded-full px-3 md:px-4 py-1 md:py-1.5 text-[8px] md:text-[10px] font-black uppercase tracking-widest border-slate-200 dark:border-slate-800 text-slate-500">
                       <div className="size-1 rounded-full mr-1.5 md:mr-2" style={{ backgroundColor: primaryColor }} />
                       {feature}
                    </Badge>
                  ))}
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right/Sidebar Column */}
        <div className="space-y-4 md:space-y-8">
          
          {/* Contact Details Card */}
          <Card className="rounded-none md:rounded-[2.5rem] border-x-0 md:border-x border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-6 md:p-10 space-y-8 md:space-y-10">
               <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Connectivity</h2>
               
               <div className="space-y-6 md:space-y-8">
                  <SidebarInfoItem icon={Mail} label="Academic Dispatch" value={school?.schoolEmail} themeColor={primaryColor} />
                  <SidebarInfoItem icon={Phone} label="Voice Frequency" value={school?.phone} themeColor={primaryColor} />
                  <SidebarInfoItem icon={Globe} label="Institutional Portal" value={school?.website} themeColor={primaryColor} />
                  <SidebarInfoItem icon={Navigation} label="Physical Coordinate" value={school?.address} themeColor={primaryColor} />
               </div>

               <div className="pt-6 flex justify-center gap-6 border-t border-slate-100 dark:border-slate-800">
                  {socialLinks && Object.entries(socialLinks).map(([platform, url]) => (
                    url ? (
                      <a 
                        key={platform} 
                        href={url as string} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        <SocialIcon platform={platform} size={20} />
                      </a>
                    ) : null
                  ))}
               </div>
            </CardContent>
          </Card>

          {/* Operational Insights */}
          <Card className="rounded-none md:rounded-[2.5rem] border-x-0 md:border-x border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
            <CardContent className="p-6 md:p-10 space-y-6 md:space-y-8">
               <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Institutional Stats</h2>
               
               <div className="space-y-5 md:space-y-6">
                  <StatRow label="Founded Year" value={school?.foundedYear || '---'} icon={Trophy} color="text-amber-500" />
                  <StatRow label="Education Type" value={school?.schoolType || 'General'} icon={BookOpen} color="text-blue-500" />
                  <StatRow label="Active Classes" value={stats?.classes || 0} icon={Users} color="text-emerald-500" />
                  <StatRow label="Verification Status" value="Verified" icon={ShieldCheck} color="text-emerald-500" />
               </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <div className="p-8 md:p-10 rounded-none md:rounded-[2.5rem] bg-slate-900 dark:bg-slate-800 text-white space-y-6 relative overflow-hidden shadow-2xl">
             <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Zap size={90} style={{ color: primaryColor }} />
             </div>
             <div className="space-y-2 relative z-10">
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Service Status</p>
                <h3 className="text-2xl md:text-3xl font-black tracking-tighter uppercase leading-none">System <br />Operational</h3>
             </div>
             <div className="flex items-center gap-3 relative z-10">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Session Secure</span>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function SidebarInfoItem({ icon: Icon, label, value, themeColor }: { icon: any, label: string, value?: string, themeColor: string }) {
  if (!value) return null;
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
        <Icon size={14} style={{ color: themeColor }} /> {label}
      </p>
      <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight break-words">{value}</p>
    </div>
  );
}

function StatRow({ label, value, icon: Icon, color }: { label: string, value: any, icon: any, color: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className={cn("size-8 rounded-lg flex items-center justify-center bg-slate-50 dark:bg-slate-950 shadow-inner", color)}>
           <Icon size={16} />
        </div>
        <p className="text-xs font-black text-slate-500 uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">{value}</p>
    </div>
  );
}

function SocialIcon({ platform, size }: { platform: string, size: number }) {
  switch (platform) {
    case 'facebook': return <Facebook size={size} />;
    case 'twitter': return <Twitter size={size} />;
    case 'instagram': return <Instagram size={size} />;
    case 'linkedin': return <Linkedin size={size} />;
    case 'youtube': return <Youtube size={size} />;
    default: return <Globe size={size} />;
  }
}

