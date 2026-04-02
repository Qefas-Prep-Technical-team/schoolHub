'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useSchoolProfile, useSchoolStats } from '@/lib/api/hooks/useSchool';
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
  Navigation
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function SchoolProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.defaultTenantId || '';
  
  const { data: school, isLoading: schoolLoading } = useSchoolProfile(schoolId);
  const { data: stats, isLoading: statsLoading } = useSchoolStats(schoolId);

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
      <div className="p-8 space-y-8 animate-pulse bg-slate-50 dark:bg-slate-950 min-h-screen">
        <Skeleton className="h-[400px] w-full rounded-[4rem] bg-slate-200 dark:bg-slate-900" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <Skeleton className="h-44 rounded-[3rem] bg-slate-200 dark:bg-slate-900" />
          <Skeleton className="h-44 rounded-[3rem] bg-slate-200 dark:bg-slate-900" />
          <Skeleton className="h-44 rounded-[3rem] bg-slate-200 dark:bg-slate-900" />
          <Skeleton className="h-44 rounded-[3rem] bg-slate-200 dark:bg-slate-900" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 lg:p-12 space-y-16">
      
      {/* Premium Hero Section with Glassmorphism Overlay */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative h-[550px] rounded-[4.5rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
      >
        {/* Banner Image */}
        <div className="absolute inset-0">
           {school?.bannerImage ? (
             <img src={school.bannerImage} alt="Banner" className="w-full h-full object-cover" />
           ) : (
             <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-primary/20 blur-3xl" />
                <Building2 size={200} className="text-white/5" />
             </div>
           )}
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/10" />
        </div>

        {/* Header Overlay Content */}
        <div className="absolute inset-x-8 bottom-8 md:inset-x-12 md:bottom-12">
           <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl p-8 md:p-12 rounded-[3.5rem] border border-white/20 dark:border-slate-800 shadow-2xl flex flex-col lg:flex-row items-center gap-10">
              
              {/* Logo with sophisticated border */}
              <div className="h-44 w-44 rounded-[2.8rem] bg-white dark:bg-slate-800 p-2 shadow-2xl overflow-hidden flex items-center justify-center border-[6px] border-white/40 dark:border-slate-800/40 shrink-0 transform -translate-y-4 md:-translate-y-8 lg:translate-y-0 relative z-20">
                {school?.logo ? (
                  <img src={school.logo} alt={school.name} className="h-full w-full object-cover rounded-[2rem]" />
                ) : (
                  <Building2 size={80} className="text-primary" />
                )}
              </div>

              {/* Title and Metadata */}
              <div className="flex-1 text-center lg:text-left space-y-4 relative z-10">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-3">
                   <Badge className="bg-primary text-white border-none rounded-full px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-primary/30">
                      {school?.schoolType || 'Premier Institution'}
                   </Badge>
                   <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.25em] border border-emerald-500/10">
                      <ShieldCheck size={14} strokeWidth={3} /> Certified System
                   </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-2">
                  {school?.name}
                </h1>
                
                <div className="flex flex-col md:flex-row md:items-center justify-center lg:justify-start gap-4 lg:gap-6">
                   <p className="text-xl font-bold text-slate-600 dark:text-slate-400 font-serif italic max-w-xl truncate">
                     "{school?.motto || 'Empowering minds for a better tomorrow.'}"
                   </p>
                   <div className="hidden lg:block h-8 w-px bg-slate-200 dark:bg-slate-800" />
                   <span className="hidden md:flex items-center gap-2 text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                      <Navigation size={14} /> {school?.subdomain ? `${school.subdomain}.schoolhub.com` : 'Digital Presence Active'}
                   </span>
                </div>
              </div>

              {/* Action Control */}
              <div className="shrink-0 flex flex-col gap-4 w-full lg:w-auto">
                 <Button onClick={handleEditProfile} className="h-16 px-10 rounded-[2.2rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-[0.2em] text-[11px] hover:scale-105 active:scale-95 transition-all shadow-2xl dark:shadow-none gap-4">
                    <Edit3 size={18} strokeWidth={2.5} /> Modify Identity
                 </Button>
                 {school?.website && (
                   <a 
                    href={school.website.startsWith('http') ? school.website : `https://${school.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-all group"
                   >
                     View Public Portal <ExternalLink size={12} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                   </a>
                 )}
              </div>
           </div>
        </div>
      </motion.section>

      {/* Institutional Insights Carousel / Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
        {[
          { label: 'Students', value: stats?.students || 0, icon: GraduationCap, color: 'text-blue-500', bg: 'bg-blue-500/5' },
          { label: 'Faculty', value: stats?.teachers || 0, icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/5' },
          { label: 'Classes', value: stats?.classes || 0, icon: BookOpen, color: 'text-amber-500', bg: 'bg-amber-500/5' },
          { label: 'Founded', value: school?.foundedYear || '---', icon: Trophy, color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-[3.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group"
          >
            <div className={cn("h-16 w-16 rounded-[1.8rem] flex items-center justify-center mb-8 group-hover:rotate-12 transition-transform", stat.bg, stat.color)}>
              <stat.icon size={36} strokeWidth={2.5} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 mb-3">{stat.label}</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Core Institutional Intel Card */}
        <Card className="lg:col-span-2 rounded-[4.5rem] border-none shadow-2xl bg-white dark:bg-slate-900 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-24 opacity-[0.03] pointer-events-none">
             <Globe size={450} />
          </div>
          <CardContent className="p-12 md:p-16 space-y-16 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 border-b border-slate-100 dark:border-slate-800 pb-12">
              <div className="flex items-center gap-8">
                 <div className="h-20 w-20 rounded-[2.2rem] bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                    <Building2 size={40} strokeWidth={2} />
                 </div>
                 <div>
                    <h3 className="text-3xl font-black tracking-tight mb-1">Institutional Intel</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Operational Metrics & connectivity</p>
                 </div>
              </div>
              
              {/* Social Footprint Grid */}
              <div className="flex items-center gap-3">
                 {socialLinks && Object.entries(socialLinks).map(([platform, url]) => (
                   url ? (
                     <a 
                      key={platform} 
                      href={url as string} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-primary/5 hover:scale-110 transition-all border border-transparent hover:border-primary/10"
                      title={platform}
                     >
                       <SocialIcon platform={platform} size={20} />
                     </a>
                   ) : null
                 ))}
                 {!Object.values(socialLinks || {}).some(v => v) && (
                   <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Social Footprint Pending</span>
                 )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-x-24">
              <div className="space-y-12">
                <InfoItem icon={Mail} label="Academic Email" value={school?.schoolEmail} isLink href={`mailto:${school?.schoolEmail}`} />
                <InfoItem icon={Phone} label="General Inquiries" value={school?.phone} isLink href={`tel:${school?.phone}`} />
                <InfoItem icon={Globe} label="Digital Presence" value={school?.website} isLink href={school?.website?.startsWith('http') ? school.website : `https://${school?.website}`} />
                <InfoItem icon={Clock} label="Standard Operations" value={school?.operatingHours || 'Mon-Fri: 8:00 AM - 4:00 PM'} />
              </div>
              <div className="space-y-12">
                <InfoItem icon={MapPin} label="Global Campus Address" value={school?.address || "No address provided"} />
                <InfoItem icon={UserIcon} label="Executive Principal" value={school?.principal} />
                <InfoItem icon={Navigation} label="Institutional Identity" value={school?.schoolType} />
                <InfoItem icon={ShieldCheck} label="System Infrastructure" value={school?.schoolCode} />
              </div>
            </div>

            <div className="pt-12 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-8">
                 <div className="h-2 w-2 rounded-full bg-primary" />
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Mission Narrative</h4>
              </div>
              <p className="text-2xl font-medium text-slate-700 dark:text-slate-400 leading-relaxed font-serif italic">
                {school?.description || "A premier educational institution focused on excellence and holistic development. Committed to nurturing future leaders through innovative teaching methodologies."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Support Infrastructure Sidebars */}
        <div className="space-y-12">
          {/* Identity & Subdomain Status */}
          <Card className="rounded-[4.5rem] border-none shadow-2xl bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none">
              <ShieldCheck size={250} strokeWidth={1} />
            </div>
            <CardContent className="p-12 md:p-14 space-y-12 relative z-10">
              <div className="space-y-3">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Security & Core</h3>
                 <p className="text-3xl font-black tracking-tight">Institutional <br />Architecture</p>
              </div>

              <div className="space-y-6">
                <div className="p-10 bg-white/5 rounded-[3rem] backdrop-blur-3xl border border-white/5 group hover:bg-white/10 transition-all">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3">Primary School Identifier</p>
                  <p className="text-5xl font-black tracking-[0.1em] text-primary-foreground select-all">{school?.schoolCode || '---'}</p>
                </div>
                
                <div className="p-10 bg-white/5 rounded-[3rem] backdrop-blur-3xl border border-white/5 group hover:bg-white/10 transition-all">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-3">Digital Subdomain</p>
                  <div className="flex items-center justify-between gap-4">
                     <p className="text-xl font-bold truncate text-primary-foreground/90">{school?.subdomain ? `${school.subdomain}.schoolhub.com` : 'NOT PROVISIONED'}</p>
                     <Globe size={28} className="text-slate-400 shrink-0" />
                  </div>
                </div>
              </div>

              <div className="pt-8 flex flex-col gap-6">
                 <div className="flex items-center gap-4 bg-emerald-500/10 px-6 py-3 rounded-full w-fit">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Current Academic Term</span>
                 </div>
                 <p className="text-5xl font-black tracking-tighter leading-none italic text-white/90 truncate">{school?.sessions?.[0]?.name || '---'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Institutional Governance Profile */}
          <Card className="rounded-[4.5rem] border-none shadow-2xl bg-white dark:bg-slate-900 p-12 md:p-14">
             <div className="flex items-center justify-between mb-12">
                <div>
                   <h3 className="text-2xl font-black tracking-tight">Governance</h3>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Administrative Leadership</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center">
                   <Users size={28} />
                </div>
             </div>
             
             <div className="space-y-10">
               {school?.admins?.length > 0 ? (
                 school.admins.map((sa: any, idx: number) => (
                   <div key={idx} className="flex items-center gap-8 group">
                     <div className="h-20 w-20 rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-3xl text-primary border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform shadow-sm">
                       {sa.admin?.name?.charAt(0)}
                     </div>
                     <div className="flex-1 min-w-0">
                       <p className="font-black text-xl text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">{sa.admin?.name}</p>
                       <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 group-hover:text-slate-500">{sa.role}</p>
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="text-center p-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
                    <p className="text-slate-300 dark:text-slate-700 italic font-medium">No governance records found.</p>
                 </div>
               )}
             </div>

             <div className="mt-16 pt-12 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-3">
                <ShieldCheck size={14} className="text-emerald-500" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Institutional Access Verified</p>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, isLink, href }: { icon: any, label: string, value?: string, isLink?: boolean, href?: string }) {
  if (!value) return null;
  
  return (
    <div className="space-y-3 group">
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-4 group-hover:text-primary transition-colors">
        <Icon size={16} strokeWidth={3} className="text-primary" />
        {label}
      </p>
      {isLink ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-3xl font-black text-slate-900 dark:text-white hover:text-primary transition-all leading-none block truncate">
          {value}
        </a>
      ) : (
        <p className="text-3xl font-black text-slate-700 dark:text-slate-300 leading-none truncate">
          {value}
        </p>
      )}
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}