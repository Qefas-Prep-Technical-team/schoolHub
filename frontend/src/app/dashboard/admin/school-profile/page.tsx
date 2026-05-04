'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
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
  Fingerprint
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function SchoolProfilePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || '';
  
  const { data: school, isLoading: schoolLoading, isError: schoolError, refetch } = useSchoolProfile(schoolId);
  const { data: stats, isLoading: statsLoading, isError: statsError } = useSchoolStats(schoolId);
  const { data: settings } = useSchoolSettings(schoolId);

  const primaryColor = settings?.themeColor || '#2563eb'; // Fallback to Institutional Blue

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
      <div className="fixed inset-0 z-[100] bg-white dark:bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full blur-[120px] opacity-20 animate-pulse" style={{ backgroundColor: primaryColor }} />
          <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-10 animate-pulse delay-1000" style={{ backgroundColor: primaryColor }} />
        </div>
        
        <div className="relative z-10 flex flex-col items-center gap-10 max-w-7xl w-full px-8">
           <div className="flex items-center gap-6">
              <div className="size-20 rounded-[2.5rem] bg-slate-100 dark:bg-white/5 border-2 border-slate-200 dark:border-white/10 animate-spin-slow flex items-center justify-center">
                 <Building2 size={32} className="text-slate-300 dark:text-slate-600" />
              </div>
              <div className="space-y-3">
                 <div className="h-10 w-64 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />
                 <div className="h-4 w-40 bg-slate-50 dark:bg-white/5 rounded-full animate-pulse opacity-50" />
              </div>
           </div>

           <div className="w-full h-[450px] bg-slate-50 dark:bg-white/5 rounded-[4rem] border-2 border-slate-100 dark:border-white/5 overflow-hidden p-12 flex items-end">
              <div className="flex items-center gap-8 w-full">
                 <div className="size-32 rounded-[2.5rem] bg-slate-200 dark:bg-white/10 animate-pulse" />
                 <div className="space-y-4 flex-1">
                    <div className="h-16 w-1/2 bg-slate-200 dark:bg-white/10 rounded-[2rem] animate-pulse" />
                    <div className="h-6 w-1/3 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse" />
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-4 gap-8 w-full">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 rounded-[3rem] bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 p-8 flex flex-col justify-between">
                   <div className="size-10 rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
                   <div className="space-y-2">
                      <div className="h-3 w-16 bg-slate-100 dark:bg-white/5 rounded-full animate-pulse" />
                      <div className="h-8 w-24 bg-slate-200 dark:bg-white/10 rounded-xl animate-pulse" />
                   </div>
                </div>
              ))}
           </div>
        </div>
        
        <div className="absolute bottom-12 flex flex-col items-center gap-3">
           <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" style={{ backgroundColor: primaryColor }} />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Synchronizing Institutional Node</p>
           </div>
        </div>
      </div>
    );
  }

  if (schoolError || statsError) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-10">
          <div className="relative inline-block">
             <div className="absolute -inset-6 rounded-full blur-3xl opacity-20" style={{ backgroundColor: primaryColor }} />
             <div className="size-24 rounded-[2.5rem] bg-red-50 dark:bg-red-950/20 border-2 border-red-100 dark:border-red-900/30 flex items-center justify-center mx-auto text-red-500 shadow-2xl">
                <Target size={40} className="animate-pulse" />
             </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Synchronization <br />Failed.</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs leading-relaxed">
              We encountered a protocol disturbance while reconciling your institutional architecture.
            </p>
          </div>
          <Button 
            onClick={() => refetch()}
            className="h-16 px-12 rounded-full font-black uppercase tracking-[0.2em] text-xs shadow-2xl active:scale-95 transition-all"
            style={{ backgroundColor: primaryColor }}
          >
            Re-Initialize Connection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 space-y-16"
      style={{ '--theme-primary': primaryColor } as React.CSSProperties}
    >
      
      {/* Console Header */}
      <header className="px-6 md:px-12 pt-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
            <span>Core Systems</span>
            <div className="h-1 w-1 rounded-full" style={{ backgroundColor: primaryColor }} />
            <span style={{ color: primaryColor }}>Institutional Identity</span>
          </div>
          <div className="flex items-center gap-5">
            <div className="p-4 bg-slate-900 dark:bg-slate-800 rounded-[2rem] shadow-2xl group hover:rotate-6 transition-transform" style={{ backgroundColor: primaryColor }}>
              <Building2 size={32} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
              School Profile
            </h1>
          </div>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 font-bold tracking-tight max-w-xl leading-relaxed uppercase opacity-80">
            Establish and manage your institution's digital footprint and operational parameters.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <Button 
                onClick={handleEditProfile} 
                className="h-14 px-10 w-full sm:w-auto rounded-[1.8rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest text-[11px] shadow-2xl active:scale-95 gap-3 group"
                style={{ backgroundColor: primaryColor }}
            >
                <Edit3 size={18} className="group-hover:rotate-12 transition-transform" />
                Modify Identity
            </Button>
            {school?.website && (
                <Button 
                    variant="outline"
                    className="h-14 px-8 w-full sm:w-auto rounded-[1.8rem] border-2 border-slate-200 dark:border-white/10 font-black uppercase tracking-widest text-[10px] gap-3"
                    onClick={() => window.open(school.website.startsWith('http') ? school.website : `https://${school.website}`, '_blank')}
                >
                    Public Portal
                    <ExternalLink size={14} />
                </Button>
            )}
        </div>
      </header>

      <div className="px-6 md:px-12 space-y-16">
        {/* Premium Hero Section */}
        <motion.section 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative h-[600px] rounded-[4.5rem] overflow-hidden group transition-all"
          style={{ boxShadow: `0 35px 60px -15px ${primaryColor}33` }}
        >
          {/* Banner with sophisticated overlays */}
          <div className="absolute inset-0">
             {school?.bannerImage ? (
               <img src={school.bannerImage} alt="Banner" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2000ms]" />
             ) : (
               <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                  <div className="absolute inset-0 blur-3xl opacity-50" style={{ background: `linear-gradient(to bottom right, ${primaryColor}66, #0f172a)` }} />
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                  <Building2 size={300} className="text-white/[0.03] animate-pulse" />
               </div>
             )}
             <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
             <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 to-transparent" />
          </div>

          {/* Hero Content Overlay */}
          <div className="absolute inset-0 p-12 md:p-20 flex flex-col justify-end gap-10">
             <div className="flex flex-col lg:flex-row items-center lg:items-end gap-12 relative z-10">
                {/* Logo Node */}
                <div className="relative group/logo">
                    <div className="absolute -inset-4 rounded-[3.5rem] blur-2xl transition-colors opacity-30 group-hover/logo:opacity-50" style={{ backgroundColor: primaryColor }} />
                    <div 
                        className="h-48 w-48 rounded-[3.2rem] bg-white dark:bg-slate-800 p-2 overflow-hidden flex items-center justify-center border-[8px] border-white/20 dark:border-slate-800/20 shrink-0 relative z-20 backdrop-blur-3xl group-hover/logo:-translate-y-2 transition-transform duration-500"
                        style={{ boxShadow: `0 25px 50px -12px ${primaryColor}4D` }}
                    >
                        {school?.logo ? (
                            <img src={school.logo} alt={school.name} className="h-full w-full object-cover rounded-[2.5rem]" />
                        ) : (
                            <div className="flex flex-col items-center gap-2 opacity-30">
                                <Building2 size={64} className="text-slate-400" />
                                <span className="text-[8px] font-black uppercase tracking-[0.2em]">No Logo</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Identity Info */}
                <div className="flex-1 text-center lg:text-left space-y-6">
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                       <Badge className="text-white border-none rounded-full px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl" style={{ backgroundColor: primaryColor, boxShadow: `0 20px 25px -5px ${primaryColor}4D` }}>
                          {school?.schoolType || 'Premier Institution'}
                       </Badge>
                       <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.25em] border border-white/10">
                          <ShieldCheck size={14} style={{ color: primaryColor }} /> Active System Link
                       </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] uppercase">
                            {school?.name}
                        </h2>
                        <div className="flex flex-col md:flex-row md:items-center justify-center lg:justify-start gap-6">
                            <p className="text-2xl font-bold font-lexend italic max-w-2xl leading-tight" style={{ color: primaryColor }}>
                                "{school?.motto || 'Empowering minds for a better tomorrow.'}"
                            </p>
                            <div className="hidden lg:block h-10 w-px bg-white/20" />
                            <div className="flex items-center gap-3 text-white/60 font-black uppercase tracking-[0.3em] text-[10px]">
                                <Navigation size={14} style={{ color: primaryColor }} />
                                <span>Global Campus Protocol</span>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        </motion.section>

        {/* Tactical Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: 'Network Students', value: stats?.students || 0, icon: GraduationCap, colorClass: 'text-primary', shadowClass: 'shadow-primary/10' },
            { label: 'Faculty Nodes', value: stats?.teachers || 0, icon: Users, colorClass: 'text-blue-500', shadowClass: 'shadow-blue-500/10' },
            { label: 'Operational Classes', value: stats?.classes || 0, icon: BookOpen, colorClass: 'text-emerald-500', shadowClass: 'shadow-emerald-500/10' },
            { label: 'Founded Year', value: school?.foundedYear || '---', icon: Trophy, colorClass: 'text-amber-500', shadowClass: 'shadow-amber-500/10' },
          ].map((stat, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className={cn(
                "bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/[0.03] p-10 rounded-[3.5rem] relative overflow-hidden group transition-all"
              )}
              style={{ boxShadow: `0 20px 25px -5px ${primaryColor}15` }}
            >
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-10 group-hover:scale-125 transition-all duration-700">
                <stat.icon size={120} />
              </div>
              <div 
                className={cn("h-14 w-14 rounded-2xl flex items-center justify-center mb-8 bg-slate-50 dark:bg-white/[0.03] group-hover:text-white transition-all duration-500")}
                style={idx === 0 ? { color: primaryColor } : {}}
              >
                <stat.icon size={28} strokeWidth={2.5} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">{stat.label}</p>
                <p className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Detailed Institutional Intel */}
          <Card 
            className="lg:col-span-2 rounded-[4.5rem] border-none bg-white dark:bg-slate-900/50 backdrop-blur-3xl overflow-hidden relative border-2 border-transparent transition-all"
            style={{ boxShadow: `0 35px 60px -15px ${primaryColor}1A` }}
          >
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-10" style={{ backgroundColor: primaryColor }} />
            <CardContent className="p-12 md:p-16 space-y-16">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 border-b border-slate-100 dark:border-white/5 pb-12">
                <div className="flex items-center gap-8">
                   <div className="h-20 w-20 rounded-[2.2rem] flex items-center justify-center shrink-0 shadow-inner" style={{ backgroundColor: `${primaryColor}1A`, color: primaryColor }}>
                      <Target size={36} strokeWidth={2.5} />
                   </div>
                   <div>
                      <h3 className="text-3xl font-black tracking-tight mb-1 uppercase">Institutional Intel</h3>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.4em]">Operational Parameters & Connectivity</p>
                   </div>
                </div>
                
                {/* Social Footprint */}
                <div className="flex items-center gap-4">
                   {socialLinks && Object.entries(socialLinks).map(([platform, url]) => (
                     url ? (
                       <a 
                        key={platform} 
                        href={url as string} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white transition-all border border-slate-100 dark:border-white/5"
                        style={{ '--hover-bg': primaryColor } as any}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = primaryColor)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                        title={platform}
                       >
                         <SocialIcon platform={platform} size={20} />
                       </a>
                     ) : null
                   ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-x-24">
                <div className="space-y-12">
                  <InfoItem icon={Mail} label="Academic Dispatch" value={school?.schoolEmail} isLink href={`mailto:${school?.schoolEmail}`} themeColor={primaryColor} />
                  <InfoItem icon={Phone} label="Voice Frequency" value={school?.phone} isLink href={`tel:${school?.phone}`} themeColor={primaryColor} />
                  <InfoItem icon={Globe} label="Digital Portal" value={school?.website} isLink href={school?.website?.startsWith('http') ? school.website : `https://${school?.website}`} themeColor={primaryColor} />
                  <InfoItem icon={Clock} label="Execution Hours" value={school?.operatingHours || 'Mon-Fri: 8:00 AM - 4:00 PM'} themeColor={primaryColor} />
                </div>
                <div className="space-y-12">
                  <InfoItem icon={MapPin} label="Physical Coordinate" value={school?.address || "Coordinate Not Mapped"} themeColor={primaryColor} />
                  <InfoItem icon={UserIcon} label="Executive Officer" value={school?.principal} themeColor={primaryColor} />
                  <InfoItem icon={Navigation} label="Sector Classification" value={school?.schoolType} themeColor={primaryColor} />
                  <InfoItem icon={Fingerprint} label="System Identifier" value={school?.schoolCode} themeColor={primaryColor} />
                </div>
              </div>

              <div className="pt-12 border-t border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-3 mb-6">
                   <div className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Institutional Narrative</h4>
                </div>
                <p className="text-2xl font-bold text-slate-600 dark:text-slate-400 leading-relaxed font-lexend italic">
                  {school?.description || "A premier educational institution focused on excellence and holistic development. Committed to nurturing future leaders through innovative teaching methodologies."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Console Sidebar Modules */}
          <div className="space-y-12">
            {/* System Architecture Node */}
            <Card 
                className="rounded-[4.5rem] border-none bg-slate-900 text-white overflow-hidden relative group transition-all"
                style={{ boxShadow: `0 35px 60px -15px ${primaryColor}4D` }}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" style={{ background: `linear-gradient(to bottom right, ${primaryColor}33, transparent)` }} />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20" style={{ backgroundColor: primaryColor }} />
              
              <CardContent className="p-12 md:p-14 space-y-12 relative z-10">
                <div className="flex justify-between items-start">
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.5em]" style={{ color: `${primaryColor}99` }}>Console Module</h3>
                        <p className="text-4xl font-black tracking-tighter uppercase leading-[0.9]">System <br />Architecture</p>
                    </div>
                    <Zap style={{ color: primaryColor }} className="animate-pulse" size={40} />
                </div>

                <div className="space-y-6">
                  <div className="p-10 bg-white/5 rounded-[3.5rem] border border-white/5 group/node hover:bg-white/10 transition-all">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Institutional Hash</p>
                    <p className="text-5xl font-black tracking-widest text-white select-all font-mono">{school?.schoolCode || '---'}</p>
                  </div>
                  
                  <div className="p-10 bg-white/5 rounded-[3.5rem] border border-white/5 group/node hover:bg-white/10 transition-all">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Network Subdomain</p>
                    <div className="flex items-center justify-between gap-4">
                       <p className="text-xl font-black truncate uppercase tracking-tighter" style={{ color: primaryColor }}>{school?.subdomain ? `${school.subdomain}.qefashub.com` : 'OFFLINE'}</p>
                       <Globe size={24} className="text-slate-500 shrink-0" />
                    </div>
                  </div>
                </div>

                {/* Active Features Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/10" />
                    <h4 className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-500">Core Capabilities</h4>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {school?.subscriptionPlan?.features?.slice(0, 6).map((feature: string, idx: number) => (
                      <div 
                        key={idx}
                        className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05] text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 hover:bg-white/[0.08] transition-colors"
                      >
                        <div className="size-1 rounded-full" style={{ backgroundColor: primaryColor }} />
                        {feature}
                      </div>
                    )) || (
                      <div className="w-full py-4 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                         <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 italic">No Active Features Detected</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 flex flex-col gap-6">
                   <div className="flex items-center gap-4 px-6 py-3 rounded-full w-fit border" style={{ backgroundColor: `${primaryColor}1A`, borderColor: `${primaryColor}33` }}>
                      <div className="h-2 w-2 rounded-full animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.8)]" style={{ backgroundColor: primaryColor }} />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: primaryColor }}>Live Session Active</span>
                   </div>
                   <p className="text-5xl font-black tracking-tighter leading-none italic text-white/90 truncate uppercase">{school?.sessions?.[0]?.name || '---'}</p>
                </div>
              </CardContent>
            </Card>

            {/* Leadership Protocol Card */}
            <Card 
                className="rounded-[4.5rem] border-none bg-white dark:bg-slate-900 p-12 md:p-14 border-2 border-transparent transition-all"
                style={{ boxShadow: `0 35px 60px -15px ${primaryColor}1A` }}
            >
               <div className="flex items-center justify-between mb-12">
                  <div className="space-y-1">
                     <h3 className="text-3xl font-black tracking-tight uppercase leading-none">Leadership</h3>
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Administrative Protocol</p>
                  </div>
                  <div className="h-16 w-16 rounded-[1.8rem] flex items-center justify-center shadow-inner" style={{ backgroundColor: `${primaryColor}1A`, color: primaryColor }}>
                     <Award size={32} />
                  </div>
               </div>
               
               <div className="space-y-10">
                 {school?.admins?.length > 0 ? (
                   school.admins.map((sa: any, idx: number) => (
                     <div key={idx} className="flex items-center gap-8 group">
                       <div className="h-20 w-20 rounded-[2.2rem] flex items-center justify-center font-black text-3xl text-white shadow-xl group-hover:rotate-6 transition-transform" style={{ backgroundColor: primaryColor }}>
                         {sa.admin?.name?.charAt(0)}
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="font-black text-xl text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate uppercase tracking-tight" style={{ '--hover-color': primaryColor } as any} onMouseEnter={(e) => (e.currentTarget.style.color = primaryColor)} onMouseLeave={(e) => (e.currentTarget.style.color = '')}>{sa.admin?.name}</p>
                         <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">{sa.role}</p>
                       </div>
                     </div>
                   ))
                 ) : (
                   <div className="text-center p-14 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[3.5rem] bg-slate-50/50 dark:bg-transparent">
                      <p className="text-slate-400 italic font-bold uppercase text-[10px] tracking-widest">No leadership data detected</p>
                   </div>
                 )}
               </div>

               <div className="mt-16 pt-12 border-t border-slate-100 dark:border-white/5 flex items-center justify-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Security Access Verified</p>
               </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, isLink, href, themeColor }: { icon: any, label: string, value?: string, isLink?: boolean, href?: string, themeColor: string }) {
  if (!value) return null;
  
  return (
    <div className="space-y-4 group">
      <div className="flex items-center gap-4 text-slate-400 group-hover:opacity-100 transition-opacity" style={{ color: `${themeColor}CC` }}>
        <Icon size={18} strokeWidth={2.5} style={{ color: themeColor }} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em]">
            {label}
        </p>
      </div>
      {isLink ? (
        <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-3xl font-black text-slate-900 dark:text-white transition-all leading-tight block truncate uppercase tracking-tighter"
            onMouseEnter={(e) => (e.currentTarget.style.color = themeColor)}
            onMouseLeave={(e) => (e.currentTarget.style.color = '')}
        >
          {value}
        </a>
      ) : (
        <p className="text-3xl font-black text-slate-800 dark:text-slate-200 leading-tight truncate uppercase tracking-tighter">
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

