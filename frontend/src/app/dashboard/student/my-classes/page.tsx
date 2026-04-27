"use client";

import { useState, useMemo } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  User, 
  BookOpen, 
  MoreHorizontal, 
  ChevronRight,
  TrendingUp,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpRight,
  Filter,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useClasses } from '@/lib/api/hooks/useClasses';
import { Skeleton } from '@/components/ui/skeleton';

// Enhanced Mock Data based on what was there
const classesData = [
  {
    id: 1,
    title: 'Advanced Algebra & Calculus',
    subject: 'Mathematics',
    teacher: 'Dr. Emily Carter',
    room: 'Hall 402',
    progress: 78,
    assignmentsDue: 3,
    nextSession: '10:00 AM - 11:30 AM',
    days: ['Mon', 'Wed', 'Fri'],
    description: 'Exploration of complex functions, limits, and derivative applications.',
    color: '#3B82F6', // Blue
  },
  {
    id: 2,
    title: 'World History: 1500-Present',
    subject: 'History',
    teacher: 'Prof. David Chen',
    room: 'Lab 210',
    progress: 45,
    assignmentsDue: 1,
    nextSession: '01:00 PM - 03:00 PM',
    days: ['Tue', 'Thu'],
    description: 'Analyzing global shifts, colonial expansions, and the industrial revolution.',
    color: '#F59E0B', // Amber
  },
  {
    id: 3,
    title: 'Quantum Mechanics Basics',
    subject: 'Physics',
    teacher: 'Dr. Olivia Reed',
    room: 'Science Lab A',
    progress: 92,
    assignmentsDue: 0,
    nextSession: '09:00 AM - 10:30 AM',
    days: ['Mon', 'Wed'],
    description: 'Introduction to wave functions, particle duality, and quantum theory.',
    color: '#10B981', // Emerald
  },
  {
    id: 4,
    title: 'Creative Writing Workshop',
    subject: 'Literature',
    teacher: 'Prof. Liam Smith',
    room: 'Studio 12',
    progress: 60,
    assignmentsDue: 2,
    nextSession: '02:00 PM - 04:00 PM',
    days: ['Fri'],
    description: 'Practical sessions on narrative structure, voice, and stylistic devices.',
    color: '#8B5CF6', // Violet
  },
  {
    id: 5,
    title: 'AI & Machine Learning',
    subject: 'Computer Science',
    teacher: 'Dr. Anya Sharma',
    room: 'Main Tech Lab',
    progress: 88,
    assignmentsDue: 5,
    nextSession: '11:00 AM - 01:00 PM',
    days: ['Tue', 'Thu'],
    description: 'Foundational neural networks, dataset training, and ethical AI implementation.',
    color: '#EC4899', // Pink
  }
];

export default function StudentClassesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: enrollments, isLoading } = useClasses();

  const classesList = useMemo(() => {
    if (!enrollments || !Array.isArray(enrollments)) return [];
    
    // The backend returns ClassEnrollment[] for students
    return enrollments.map((en: any) => {
      const cls = en.class;
      return {
        id: cls.id,
        title: cls.name,
        subject: cls.subjects?.[0]?.subject?.name || 'General',
        teacher: cls.teacher?.name || 'Unassigned',
        room: cls.section || 'General',
        progress: Math.floor(Math.random() * 40) + 60, // Progress needs a real metric, using random for now as placeholder
        assignmentsDue: cls.quizzes?.length || 0,
        nextSession: 'TBD',
        days: ['Mon', 'Wed', 'Fri'], // This would need a schedule model in Prisma
        description: cls.subjects?.map((s: any) => s.subject?.name).join(', ') || 'Academic class enrollment.',
        color: ['#3B82F6', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899'][Math.floor(Math.random() * 5)],
      };
    });
  }, [enrollments]);

  const filteredClasses = useMemo(() => {
    return classesList.filter(c => 
      (c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       c.subject.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, classesList]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 p-6 lg:p-10 pb-40">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Modern Header */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <BookOpen size={20} />
              </div>
              <Badge variant="outline" className="rounded-full border-primary/20 text-primary uppercase tracking-widest text-[10px] font-black px-4 py-1">
                Active Enrollment
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]">
              Academic Hub <br/> <span className="text-slate-400">& Class Insights</span>
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                    placeholder="Search your subjects..." 
                    className="pl-12 h-14 rounded-[1.5rem] border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm focus:ring-primary focus:border-primary transition-all text-sm font-medium"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Button className="h-14 w-full sm:w-auto px-8 rounded-[1.5rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest text-[10px] hover:shadow-xl transition-all">
                <Filter className="mr-2" size={16} /> Filter
            </Button>
          </div>
        </section>

        {/* Highlight Stats Row */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { label: 'Classes Enrolled', value: classesList.length, icon: Layers, color: 'text-pink-500', bg: 'bg-pink-500/10' },
                { label: 'Weekly Hours', value: `${classesList.length * 4}h`, icon: Clock, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { label: 'Attendance Rate', value: '98%', icon: TrendingUp, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                { label: 'Learning Velocity', value: 'High', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/10' },
            ].map((stat, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] flex items-center gap-5 shadow-sm">
                    <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center", stat.bg, stat.color)}>
                        <stat.icon size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{stat.label}</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                    </div>
                </div>
            ))}
        </section>

        {/* Main Class Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {isLoading && (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[400px] rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
                  <Skeleton className="h-8 w-32 mb-4" />
                  <Skeleton className="h-12 w-full mb-6" />
                  <Skeleton className="h-20 w-full mb-8" />
                  <div className="flex gap-4 mb-8">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                  <Skeleton className="h-14 w-full rounded-2xl" />
                </div>
              ))}
            </>
          )}
          <AnimatePresence mode="popLayout">
            {filteredClasses.map((cls, idx) => (
              <motion.div
                key={cls.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-8 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:scale-125 transition-transform duration-1000">
                    <BookOpen size={240} style={{ color: cls.color }} />
                </div>

                <div className="relative z-10 space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary px-3 py-1 rounded-full bg-primary/5 border border-primary/5">
                            {cls.subject}
                        </span>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors tracking-tight leading-tight pt-2">
                           {cls.title}
                        </h3>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 hover:bg-slate-50 dark:hover:bg-slate-800">
                        <MoreHorizontal className="text-slate-400" />
                    </Button>
                  </div>

                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                    {cls.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-primary transition-colors">
                            <User size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Instructor</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{cls.teacher}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-500 transition-colors">
                            <MapPin size={18} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Venue</span>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{cls.room}</span>
                        </div>
                    </div>
                  </div>

                  {/* Progress & Session */}
                  <div className="space-y-6 pt-4 border-t border-slate-50 dark:border-slate-800">
                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mastery Level</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white">{cls.progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${cls.progress}%` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="h-full bg-primary rounded-full" 
                                style={{ backgroundColor: cls.color }}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
                        <div className="flex items-center gap-3">
                            <Calendar size={16} className="text-slate-400" />
                            <span className="text-xs font-bold text-slate-500">{cls.days.join(' • ')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-primary">
                            <Clock size={16} />
                            <span className="text-[10px] font-black tracking-tighter uppercase whitespace-nowrap">{cls.nextSession.split(' - ')[0]}</span>
                        </div>
                    </div>
                  </div>

                  {/* CTA */}
                  <Button className="w-full h-14 rounded-2xl bg-white dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 hover:border-primary/50 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] group/btn transition-all shadow-sm">
                        Access Learning Materials
                        <ArrowUpRight className="ml-2 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" size={16} />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </section>

        {/* Empty State */}
        {filteredClasses.length === 0 && (
          <div className="text-center py-40 p-10 rounded-[4rem] bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800">
             <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search size={32} className="text-slate-400" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">No classes found</h3>
             <p className="text-slate-500 font-medium max-w-xs mx-auto mt-2">We couldn't find any classes matching your search criteria. Try a different subject or title.</p>
          </div>
        )}

        {/* Global Academic Summary */}
        <section className="bg-slate-900 dark:bg-white rounded-[3.5rem] p-10 md:p-16 text-white dark:text-slate-900 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none rotate-12">
                <Sparkles size={400} />
            </div>
            
            <div className="space-y-6 max-w-lg relative z-10 text-center lg:text-left">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
                    Your Academic <br/> Load Analysis
                </h2>
                <p className="text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
                    You're currently enrolled in <span className="text-white dark:text-slate-900 font-black">{classesList.length} core modules</span>. This semester suggests a focus on academic expansion and subject mastery.
                </p>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                    <Button className="rounded-full px-8 h-12 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[10px]">
                        Academic Calendar
                    </Button>
                    <Button variant="outline" className="rounded-full px-8 h-12 border-slate-700 text-white dark:text-slate-900 font-black uppercase tracking-widest text-[10px] hover:bg-slate-800">
                        Exam Schedule
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-8 w-full lg:w-auto relative z-10">
                <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 dark:bg-slate-50 dark:border-slate-100 text-center space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Credits</p>
                    <p className="text-5xl font-black tracking-tighter">124</p>
                </div>
                <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 dark:bg-slate-50 dark:border-slate-100 text-center space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rank</p>
                    <p className="text-5xl font-black tracking-tighter">#08</p>
                </div>
            </div>
        </section>

      </div>
    </div>
  );
}

