"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionService, Session } from "@/lib/api/services/sessionService";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { CreateSessionForm } from "./components/CreateSessionForm";
import {
  Calendar,
  Archive,
  Trash2,
  Plus,
  Search,
  History,
  ShieldCheck,
  AlertCircle,
  MoreVertical,
  ChevronRight,
  Zap,
  Activity,
  ArrowUpRight,
  Clock,
  Layers
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function SessionsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";

  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || '#2563eb';

  const { data: sessions = [], isLoading, isError } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => sessionService.getSessions(),
  });

  const activeSession = sessions.find(s => s.status === "ACTIVE");
  const archivedSessions = sessions.filter(s => s.status === "ARCHIVED");
  const upcomingSessions = sessions.filter(s => s.status === "INACTIVE");

  const archiveMutation = useMutation({
    mutationFn: (id: string) => sessionService.archiveSession(id),
    onSuccess: () => {
      toast.success("Session archived successfully");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: () => toast.error("Failed to archive session"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => sessionService.deleteSession(id),
    onSuccess: () => {
      toast.success("Session deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: () => toast.error("Failed to delete session"),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-12 space-y-12">
        <div className="flex justify-between items-end">
          <div className="space-y-4">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-16 w-96 rounded-3xl" />
          </div>
          <Skeleton className="h-14 w-48 rounded-2xl" />
        </div>
        <div className="grid grid-cols-12 gap-10">
          <Skeleton className="col-span-4 h-[500px] rounded-[3rem]" />
          <div className="col-span-8 space-y-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-[2.5rem]" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      {/* Dynamic Header */}
      <header className="px-8 md:px-12 pt-12 pb-16 space-y-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">
              <span>Academic Schedule</span>
              <div className="h-1 w-1 rounded-full" style={{ backgroundColor: primaryColor }} />
              <span style={{ color: primaryColor }}>School Records</span>
            </div>
            <div className="flex items-center gap-5">
              <div className="p-4 rounded-[2rem] shadow-2xl" style={{ backgroundColor: primaryColor }}>
                <History size={32} className="text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none">
                Academic Sessions
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                placeholder="Search sessions..."
                className="h-14 pl-12 pr-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 font-bold w-64 shadow-lg focus:border-primary transition-all"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="px-8 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Control Column */}
        <div className="lg:col-span-4 space-y-8">
          {/* Active Terminal Card */}
          {activeSession && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative p-8 rounded-[3rem] text-white shadow-2xl overflow-hidden group"
              style={{ backgroundColor: primaryColor }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-3xl rounded-full translate-x-10 -translate-y-10" />
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Activity size={12} />
                    Active Session
                  </div>
                  <ShieldCheck size={24} className="text-white/80" />
                </div>
                
                <div>
                  <h3 className="text-3xl font-black tracking-tighter uppercase leading-tight">{activeSession.name}</h3>
                  <p className="text-white/70 text-xs font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                    <Clock size={12} /> Started {format(new Date(activeSession.startDate), 'MMM d, yyyy')}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/20 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-white/50 uppercase tracking-widest">Ends On</p>
                    <p className="text-sm font-black uppercase tracking-tighter">{format(new Date(activeSession.endDate), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Initialization Terminal */}
          <div className="p-8 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 shadow-xl space-y-8">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
                <Plus size={24} />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Create New Session</h2>
            </div>
            <CreateSessionForm schoolId={schoolId} />
          </div>
        </div>

        {/* Right Registry Column */}
        <div className="lg:col-span-8 space-y-10">
          <div className="space-y-6">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">All Academic Sessions ({sessions.length})</h3>
            
            {sessions.length === 0 ? (
              <div className="p-24 rounded-[4rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 text-center space-y-6 shadow-xl">
                <div className="size-20 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-300">
                  <Calendar size={40} />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">No Sessions Found</p>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Add your first session to start managing your school's academic year.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <motion.div
                    key={session.id}
                    layout
                    className={cn(
                      "group p-6 rounded-[2.5rem] flex flex-col gap-6 transition-all hover:shadow-2xl border-2",
                      session.status === 'ACTIVE' 
                        ? "bg-white dark:bg-slate-900 border-primary/20 shadow-primary/5" 
                        : "bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "size-16 rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg",
                          session.status === 'ACTIVE' ? "bg-primary text-white" :
                            session.status === 'ARCHIVED' ? "bg-slate-100 dark:bg-white/5 text-slate-400 shadow-none" :
                              "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                        )}>
                          <Calendar size={28} />
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter group-hover:text-primary transition-colors">
                              {session.name}
                            </h3>
                            <div className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                              session.status === 'ACTIVE' ? "bg-primary/10 text-primary border-primary/20" :
                                session.status === 'ARCHIVED' ? "bg-slate-100 text-slate-500 border-slate-200 shadow-none" :
                                  "bg-slate-900 text-white border-slate-800"
                            )}>
                              {session.status}
                            </div>
                          </div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                            {format(new Date(session.startDate), 'MMMM d, yyyy')} — {format(new Date(session.endDate), 'MMMM d, yyyy')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {session.status !== 'ARCHIVED' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => archiveMutation.mutate(session.id)}
                            className="size-12 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all"
                          >
                            <Archive size={20} />
                          </Button>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-12 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                              <MoreVertical size={20} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 rounded-[1.5rem] p-2 border-2 border-slate-100 dark:border-white/5">
                            <DropdownMenuLabel className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-2">Session Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-100 dark:bg-white/5" />
                            <DropdownMenuItem className="rounded-xl gap-3 font-bold py-3 cursor-pointer">
                              <Layers size={16} /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="rounded-xl gap-3 font-bold py-3 text-red-500 hover:bg-red-500/10 cursor-pointer"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
                                  deleteMutation.mutate(session.id);
                                }
                              }}
                            >
                              <Trash2 size={16} /> Delete Session
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Term Dates Display */}
                    {session.termPeriods && session.termPeriods.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
                        {session.termPeriods.sort((a, b) => {
                          const order = { FIRST: 1, SECOND: 2, THIRD: 3 };
                          return order[a.term] - order[b.term];
                        }).map((term) => (
                          <div key={term.id} className="p-3 rounded-xl bg-slate-50/50 dark:bg-white/[0.02] space-y-1">
                            <p className="text-[9px] font-black text-primary uppercase tracking-widest">{term.term} TERM</p>
                            <p className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                              {format(new Date(term.startDate), 'MMM d')} - {format(new Date(term.endDate), 'MMM d, yyyy')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {archivedSessions.length > 0 && (
            <div className="pt-12 border-t border-slate-100 dark:border-white/5 space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
                <Archive size={14} /> Past Sessions ({archivedSessions.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {archivedSessions.map((s) => (
                  <div key={s.id} className="p-5 rounded-[2rem] bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center gap-4 group hover:bg-white dark:hover:bg-slate-900 transition-all shadow-sm hover:shadow-xl">
                    <div className="size-12 rounded-[1rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors shadow-sm">
                      <History size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{s.name}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Archived {format(new Date(s.updatedAt), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

