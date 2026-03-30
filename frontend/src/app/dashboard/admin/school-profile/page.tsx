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
  Trophy
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

  if (schoolLoading || statsLoading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-64 w-full rounded-[3rem]" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 lg:p-12 space-y-12">
      {/* Premium Hero Header */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3.5rem] p-8 md:p-16 overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none"
      >
        <div className="absolute top-0 right-0 p-16 opacity-[0.03] pointer-events-none">
          <Building2 size={350} className="text-primary rotate-6" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="h-40 w-40 rounded-[2.5rem] bg-gradient-to-br from-primary to-blue-600 p-1 shadow-2xl shadow-primary/20">
            <div className="h-full w-full rounded-[2.3rem] bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
              {school?.logo ? (
                <img src={school.logo} alt={school.name} className="h-full w-full object-cover" />
              ) : (
                <Building2 size={64} className="text-primary" />
              )}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <Badge className="bg-primary/10 text-primary border-none rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest">
                {school?.schoolType || 'Educational Institution'}
              </Badge>
              <div className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-500" /> Registered System
              </span>
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">
              {school?.name}
            </h1>
            
            <p className="text-xl font-medium text-slate-500 dark:text-slate-400 italic font-serif">
              "{school?.motto || 'Empowering minds for a better tomorrow.'}"
            </p>

            <div className="pt-4">
              <Button onClick={handleEditProfile} className="h-12 px-8 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-transform">
                <Edit3 className="mr-2" size={16} /> Edit Profile
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Students', value: stats?.students || 0, icon: GraduationCap, color: 'text-blue-500' },
          { label: 'Teachers', value: stats?.teachers || 0, icon: Users, color: 'text-emerald-500' },
          { label: 'Classes', value: stats?.classes || 0, icon: BookOpen, color: 'text-amber-500' },
          { label: 'Global Rank', value: 'A+', icon: Trophy, color: 'text-indigo-500' },
        ].map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group"
          >
            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center mb-4 bg-slate-50 dark:bg-slate-800 group-hover:scale-110 transition-transform", stat.color)}>
              <stat.icon size={24} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Information */}
        <Card className="lg:col-span-2 rounded-[3rem] border-none shadow-xl bg-white dark:bg-slate-900">
          <CardContent className="p-10 space-y-10">
            <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <Globe size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight">Connectivity & Presence</h3>
                <p className="text-xs text-slate-500">Official channels and location data</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <InfoItem icon={Mail} label="Official Email" value={school?.schoolEmail} isLink href={`mailto:${school?.schoolEmail}`} />
                <InfoItem icon={Phone} label="Contact Phone" value={school?.phone} isLink href={`tel:${school?.phone}`} />
                <InfoItem icon={Globe} label="Website" value={school?.website} isLink href={school?.website?.startsWith('http') ? school.website : `https://${school?.website}`} />
              </div>
              <div className="space-y-6">
                <InfoItem icon={MapPin} label="Campus Address" value={school?.address || "No address provided"} />
                <InfoItem icon={Calendar} label="Founded Year" value={school?.foundedYear?.toString()} />
                <InfoItem icon={UserIcon} label="Current Principal" value={school?.principal} />
              </div>
            </div>

            <div className="pt-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">About the Institution</h4>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium line-clamp-4">
                {school?.description || "A premier educational institution focused on academic excellence and holistic development. Committed to nurturing future leaders through innovative teaching methodologies and a supportive learning environment."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* System & Identity */}
        <div className="space-y-8">
          <Card className="rounded-[3rem] border-none shadow-xl bg-gradient-to-br from-indigo-600 to-primary text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <ShieldCheck size={180} />
            </div>
            <CardContent className="p-10 space-y-6 relative z-10">
              <h3 className="text-xl font-black tracking-tight">System Identity</h3>
              <div className="space-y-4">
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                  <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">School Code</p>
                  <p className="text-2xl font-black tracking-widest">{school?.schoolCode || '---'}</p>
                </div>
                <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
                  <p className="text-xs font-black uppercase tracking-widest opacity-60 mb-1">Digital Subdomain</p>
                  <p className="text-lg font-bold">{school?.subdomain ? `${school.subdomain}.schoolhub.com` : 'Not Set'}</p>
                </div>
              </div>
              <div className="pt-4 flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Active Academic Session</span>
              </div>
              <p className="text-2xl font-black">{school?.sessions?.[0]?.name || 'Current Session'}</p>
            </CardContent>
          </Card>

          <Card className="rounded-[3rem] border-none shadow-xl bg-white dark:bg-slate-900 p-8">
             <h3 className="text-lg font-black tracking-tight mb-6 flex items-center gap-2">
               <div className="h-2 w-2 rounded-full bg-primary" />
               Institutional Admins
             </h3>
             <div className="space-y-6">
               {school?.admins?.map((sa: any, idx: number) => (
                 <div key={idx} className="flex items-center gap-4 p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-colors">
                   <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-primary">
                     {sa.admin?.name?.charAt(0)}
                   </div>
                   <div>
                     <p className="font-black text-sm">{sa.admin?.name}</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{sa.role}</p>
                   </div>
                 </div>
               ))}
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
    <div className="space-y-1">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
        <Icon size={12} className="text-primary" />
        {label}
      </p>
      {isLink ? (
        <a href={href} className="text-lg font-bold text-slate-900 dark:text-white hover:text-primary transition-colors">
          {value}
        </a>
      ) : (
        <p className="text-lg font-bold text-slate-700 dark:text-slate-200">
          {value}
        </p>
      )}
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}