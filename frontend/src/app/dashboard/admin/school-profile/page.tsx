'use client';

import React, { useState } from 'react';
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
  Link as LinkIcon,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
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
  const [leadershipPage, setLeadershipPage] = useState(1);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const primaryColor = settings?.themeColor || '#2563eb';

  const handleEditProfile = () => {
    setIsEditingProfile(true);
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
      <div className="min-h-screen bg-transparent p-4 md:p-6 lg:p-8 space-y-6">
        <div className="h-64 w-full bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 animate-pulse shadow-sm" />
        <div className="flex gap-8 px-6">
           <div className="size-32 -mt-16 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse shadow-sm border border-slate-50 dark:border-slate-950" />
           <div className="flex-1 space-y-4 pt-4">
              <div className="h-8 w-1/3 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-4 w-1/4 bg-slate-100 dark:bg-slate-900 rounded-full animate-pulse" />
           </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 space-y-6">
              <div className="h-64 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm animate-pulse" />
              <div className="h-96 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm animate-pulse" />
           </div>
           <div className="space-y-6">
              <div className="h-80 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm animate-pulse" />
           </div>
        </div>
      </div>
    );
  }

  if (schoolError || statsError) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-8">
        <div className="max-w-md w-full text-center space-y-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
          <div className="size-16 rounded-2xl bg-rose-50 dark:bg-rose-900/10 flex items-center justify-center mx-auto text-rose-500 mb-2">
             <Info size={32} />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Profile Sync Failed</h2>
          <p className="text-sm text-slate-500">We couldn't retrieve your institutional data. Please check your connection.</p>
          <Button onClick={() => refetch()} className="w-full mt-4 h-12 rounded-xl text-sm font-semibold" style={{ backgroundColor: primaryColor }}>Retry Synchronization</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-20">
      
      {/* Hero Section */}
      <section className="relative p-4 md:p-6 lg:p-8 pb-0">
        <div className="max-w-[1400px] mx-auto">
            <div className="h-56 md:h-72 w-full relative overflow-hidden rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
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
                </div>
            )}
            <div className="absolute top-4 right-4 flex gap-3">
                <Button 
                    onClick={handleEditProfile}
                    disabled={isEditingProfile}
                    variant="secondary"
                    className="bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-900 backdrop-blur-md rounded-xl h-10 px-4 font-semibold text-xs tracking-wide shadow-sm"
                >
                    {isEditingProfile ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Edit3 size={14} className="mr-2" />}
                    Edit Cover
                </Button>
            </div>
            </div>

            <div className="px-4 sm:px-6 relative">
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 -mt-12 md:-mt-16 relative z-20">
                {/* Logo Container */}
                <div className="size-28 md:size-36 rounded-3xl bg-white dark:bg-slate-900 p-2 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0">
                    {school?.logo ? (
                    <div className="relative w-full h-full rounded-2xl overflow-hidden">
                        <Image src={school.logo} alt={school.name} fill className="object-cover" />
                    </div>
                    ) : (
                    <Building2 size={40} className="text-slate-300" />
                    )}
                </div>

                {/* Profile Header Info */}
                <div className="flex-1 pt-2 md:pt-20 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                            {school?.name}
                        </h1>
                        <p className="text-sm md:text-base font-medium text-slate-500 dark:text-slate-400">
                            {school?.motto || "Empowering minds for a better tomorrow."}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 font-medium mt-2">
                            <span className="flex items-center gap-1.5">
                                <MapPin size={14} style={{ color: primaryColor }} /> 
                                {school?.mapLocation ? (
                                    <a href={school.mapLocation} target="_blank" rel="noopener noreferrer" className="hover:underline transition-all">
                                        {school?.address ? school.address : "View on Map"}
                                    </a>
                                ) : (
                                    school?.address ? school.address : "Location Pending"
                                )}
                            </span>
                            
                            {(school?.schoolEmail || school?.phone) && (
                                <>
                                    <span className="hidden md:block h-1 w-1 rounded-full bg-slate-300" />
                                    <a 
                                        href={school?.schoolEmail ? `mailto:${school.schoolEmail}` : `tel:${school?.phone}`}
                                        className="flex items-center gap-1.5 hover:underline cursor-pointer transition-all" 
                                        style={{ color: primaryColor }}
                                    >
                                        <LinkIcon size={14} /> 
                                        {school?.schoolEmail || school?.phone}
                                    </a>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2 md:pt-0">
                        <Button 
                            onClick={handleEditProfile}
                            disabled={isEditingProfile}
                            className="h-10 w-full sm:w-auto px-6 rounded-xl font-semibold text-xs shadow-sm flex items-center justify-center"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {isEditingProfile && <Loader2 size={14} className="mr-2 animate-spin" />}
                            Edit Profile
                        </Button>
                    </div>
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                    <p className="text-sm font-medium text-slate-500">
                        <span className="text-slate-800 dark:text-white font-bold">{stats?.students || 0}</span> Students
                    </p>
                    <p className="text-sm font-medium text-slate-500">
                        <span className="text-slate-800 dark:text-white font-bold">{stats?.teachers || 0}</span> Teachers
                    </p>
                    </div>
                </div>
            </div>
            </div>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Main Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* About Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-4">About Institution</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {school?.description || "A premier educational institution focused on excellence and holistic development. Committed to nurturing future leaders through innovative teaching methodologies and a balanced approach to academic and extracurricular growth."}
            </p>
          </div>

          {/* Academic Leadership */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-base font-semibold text-slate-800 dark:text-white">Leadership Protocol</h2>
            </div>
            
            <div className="space-y-6">
                {school?.admins?.length > 0 ? (
                school.admins.slice((leadershipPage - 1) * 10, leadershipPage * 10).map((sa: any, idx: number) => (
                    <div key={idx} className="flex gap-4 items-start">
                        <span className="text-slate-400 text-sm font-medium pt-3 w-5">{((leadershipPage - 1) * 10) + idx + 1}.</span>
                        <div className="size-12 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center font-bold text-lg text-slate-400 shrink-0">
                        {sa.admin?.name?.charAt(0)}
                        </div>
                        <div className="flex-1 space-y-1">
                        <p className="text-sm font-bold text-slate-800 dark:text-white">{sa.admin?.name}</p>
                        <p className="text-xs font-semibold text-slate-500 tracking-wide">
                            {sa.role ? sa.role.replace(/_/g, ' ').replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()) : 'Administrator'}
                        </p>
                        <p className="text-xs text-slate-400">Managing institutional operations and academic excellence since participation.</p>
                        </div>
                    </div>
                ))
                ) : (
                <p className="text-slate-400 italic text-sm">No leadership data detected.</p>
                )}
            </div>
            {school?.admins?.length > 10 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Button 
                        variant="ghost" 
                        size="sm"
                        disabled={leadershipPage === 1}
                        onClick={() => setLeadershipPage(p => p - 1)}
                        className="text-xs"
                    >
                        Previous
                    </Button>
                    <span className="text-xs text-slate-500">Page {leadershipPage} of {Math.ceil(school.admins.length / 10)}</span>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        disabled={leadershipPage === Math.ceil(school.admins.length / 10)}
                        onClick={() => setLeadershipPage(p => p + 1)}
                        className="text-xs"
                    >
                        Next
                    </Button>
                </div>
            )}
          </div>

          {/* System Architecture */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-6">Digital Capabilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                    <p className="text-xs font-semibold text-slate-500">Institutional Hash</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-white font-mono tracking-wide">{school?.schoolCode || '---'}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                    <p className="text-xs font-semibold text-slate-500">System Subdomain</p>
                    <p className="text-base font-bold truncate" style={{ color: primaryColor }}>
                    {school?.subdomain ? `${school.subdomain}.qefashub.com` : 'OFFLINE'}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-6">
                {school?.subscriptionPlan?.features?.map((feature: string, idx: number) => (
                <Badge key={idx} variant="outline" className="rounded-xl px-3 py-1 text-[10px] font-semibold border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                    <div className="size-1.5 rounded-full mr-2" style={{ backgroundColor: primaryColor }} />
                    {feature}
                </Badge>
                ))}
            </div>
          </div>

          {/* Academic Levels */}
          {school?.levels && school.levels.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-slate-800 dark:text-white">Academic Levels</h2>
                <Badge variant="secondary" className="rounded-xl px-2 py-0.5 text-[10px] font-semibold">
                    {school.levels.length} Configured
                </Badge>
                </div>
                <p className="text-sm text-slate-500 mb-6">Custom academic levels configured for class assignments across this institution.</p>
                <div className="flex flex-wrap gap-2">
                {school.levels.map((level: string, idx: number) => (
                    <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300"
                    >
                    <GraduationCap size={14} className="text-slate-400" />
                    {level}
                    </motion.div>
                ))}
                </div>
            </div>
          )}
        </div>

        {/* Right/Sidebar Column */}
        <div className="space-y-6">
          
          {/* Contact Details Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-6">Connectivity</h2>
            
            <div className="space-y-6">
                <SidebarInfoItem icon={Mail} label="Academic Dispatch" value={school?.schoolEmail} themeColor={primaryColor} />
                <SidebarInfoItem icon={Phone} label="Voice Frequency" value={school?.phone} themeColor={primaryColor} />
                <SidebarInfoItem icon={Globe} label="Institutional Portal" value={school?.website} themeColor={primaryColor} />
                <SidebarInfoItem icon={Navigation} label="Physical Coordinate" value={school?.address} themeColor={primaryColor} />
            </div>

            <div className="pt-6 mt-6 flex justify-center gap-4 border-t border-slate-100 dark:border-slate-800">
                {socialLinks && Object.entries(socialLinks).map(([platform, url]) => (
                url ? (
                    <a 
                    key={platform} 
                    href={url as string} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                    <SocialIcon platform={platform} size={18} />
                    </a>
                ) : null
                ))}
            </div>
          </div>

          {/* Operational Insights */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800 dark:text-white mb-6">Institutional Stats</h2>
            
            <div className="space-y-5">
                <StatRow label="Founded Year" value={school?.foundedYear || '---'} icon={Trophy} color="text-amber-500 bg-amber-50 dark:bg-amber-900/20" />
                <StatRow label="Education Type" value={school?.schoolType || 'General'} icon={BookOpen} color="text-blue-500 bg-blue-50 dark:bg-blue-900/20" />
                <StatRow label="Active Classes" value={stats?.classes || 0} icon={Users} color="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" />
                <StatRow label="Verification" value="Verified" icon={ShieldCheck} color="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" />
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
                <Zap size={72} style={{ color: primaryColor }} />
             </div>
             <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Service Status</p>
                <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-tight">System <br />Operational</h3>
             </div>
             <div className="flex items-center gap-2 mt-4 relative z-10">
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-500">Session Secure</span>
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
    <div className="space-y-1">
      <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
        <Icon size={14} style={{ color: themeColor }} /> {label}
      </p>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight break-words">{value}</p>
    </div>
  );
}

function StatRow({ label, value, icon: Icon, color }: { label: string, value: any, icon: any, color: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className={cn("size-8 rounded-xl flex items-center justify-center", color)}>
           <Icon size={16} />
        </div>
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</p>
      </div>
      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{value}</p>
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

