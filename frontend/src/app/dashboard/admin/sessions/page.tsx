"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionService, Session } from "@/lib/api/services/sessionService";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { SessionForm } from "./components/SessionForm";
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
  Layers,
  Edit,
  X,
  Loader2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SessionsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";
  const [editingSession, setEditingSession] = useState<Session | null>(null);

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

  const setActiveMutation = useMutation({
    mutationFn: (id: string) => sessionService.updateSession(id, { isActive: true }),
    onSuccess: () => {
      toast.success("Session marked as active");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: () => toast.error("Failed to set session as active"),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 p-6 md:p-10 space-y-8">
        <Skeleton className="h-10 w-64 rounded-xl" />
        <Skeleton className="h-32 w-full rounded-2xl max-w-7xl mx-auto" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
          <Skeleton className="col-span-4 h-[500px] rounded-2xl" />
          <Skeleton className="col-span-8 h-[500px] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pb-20 font-sans">
      {/* Page Header */}
      <header className="pb-8 bg-transparent">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 max-w-7xl mx-auto">
          <div className="space-y-1.5">
            <div className="flex items-center text-xs text-slate-500 font-medium">
              <span>Admin</span>
              <ChevronRight size={14} className="mx-1" />
              <span className="text-slate-900 dark:text-slate-100 font-semibold">Sessions</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Academic Sessions
            </h1>
            <p className="text-sm text-slate-500">Manage and monitor school sessions and terms.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <Input 
                placeholder="Search sessions..."
                className="h-10 pl-9 pr-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
              />
            </div>
            <Button 
              onClick={() => {
                setEditingSession(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="h-10 rounded-xl bg-primary hover:bg-primary/90 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-medium px-4 shadow-sm"
            >
              <Plus size={16} className="mr-2" />
              New Session
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* Active Session Overview Banner */}
        {activeSession && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100 dark:border-emerald-500/20 shadow-sm">
                <Activity size={28} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{activeSession.name}</h2>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                    Active
                  </span>
                </div>
                <p className="text-sm text-slate-500 flex items-center gap-2 font-medium">
                  <Clock size={14} className="text-slate-400" /> 
                  {format(new Date(activeSession.startDate), 'MMM d, yyyy')} — {format(new Date(activeSession.endDate), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 w-full md:w-auto">
               <div className="px-5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center min-w-[110px]">
                 <span className="text-[11px] text-slate-500 font-semibold mb-0.5 uppercase tracking-wider">Total Terms</span>
                 <span className="text-xl font-bold text-slate-900 dark:text-white">{activeSession.termPeriods?.length || 0}</span>
               </div>
               <Button 
                 variant="outline"
                 className="h-full rounded-xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
                 onClick={() => setEditingSession(activeSession)}
               >
                 Manage Details
               </Button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Container */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 sticky top-32">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center border bg-blue-50 dark:bg-blue-500/10 text-blue-600 border-blue-100 dark:border-blue-500/20">
                    <Plus size={18} />
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    New Session
                  </h2>
                </div>
              </div>
              <SessionForm 
                schoolId={schoolId} 
                onSuccess={() => setEditingSession(null)}
              />
            </div>
          </div>

          {/* Right Column: Sessions List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
               <h3 className="text-base font-bold text-slate-900 dark:text-white">All Sessions ({sessions.length})</h3>
            </div>
            
            {sessions.length === 0 ? (
              <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-2">
                  <Calendar size={24} />
                </div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">No Sessions Found</h4>
                <p className="text-sm text-slate-500 max-w-sm">Add your first academic session to start managing your school's schedule.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <motion.div
                    key={session.id}
                    layout
                    className={cn(
                      "group p-5 rounded-2xl flex flex-col gap-5 transition-all bg-white dark:bg-slate-900 border shadow-sm",
                      session.status === 'ACTIVE' 
                        ? "border-emerald-200 dark:border-emerald-800 ring-1 ring-emerald-50 dark:ring-emerald-900/10" 
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center mt-1 border",
                          session.status === 'ACTIVE' ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400" :
                            session.status === 'ARCHIVED' ? "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400" :
                              "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                        )}>
                          <Calendar size={20} />
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-3 mb-1.5">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors tracking-tight">
                              {session.name}
                            </h3>
                            <div className={cn(
                              "px-2 py-0.5 rounded-md text-[10px] font-semibold border",
                              session.status === 'ACTIVE' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" :
                                session.status === 'ARCHIVED' ? "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700" :
                                  "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20"
                            )}>
                              {session.status === 'INACTIVE' ? 'Upcoming' : session.status.charAt(0) + session.status.slice(1).toLowerCase()}
                            </div>
                          </div>
                          <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                            <Clock size={12} className="text-slate-400"/>
                            {format(new Date(session.startDate), 'MMM d, yyyy')} — {format(new Date(session.endDate), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {session.status !== 'ARCHIVED' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => archiveMutation.mutate(session.id)}
                            className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                            title="Archive Session"
                          >
                            <Archive size={16} />
                          </Button>
                        )}

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5 border border-slate-200 dark:border-slate-700 shadow-lg">
                            {session.status !== 'ACTIVE' && session.status !== 'ARCHIVED' && (
                              <DropdownMenuItem 
                                className="rounded-lg gap-2 text-sm font-medium cursor-pointer text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-500/10"
                                onClick={(e) => {
                                  e.preventDefault();
                                  setActiveMutation.mutate(session.id);
                                }}
                                disabled={setActiveMutation.isPending}
                              >
                                {setActiveMutation.isPending && setActiveMutation.variables === session.id ? (
                                  <>
                                    <Loader2 size={14} className="animate-spin" /> Setting Active...
                                  </>
                                ) : (
                                  <>
                                    <Activity size={14} /> Set as Active
                                  </>
                                )}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              className="rounded-lg gap-2 text-sm font-medium cursor-pointer"
                              onClick={() => {
                                setEditingSession(session);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                              }}
                            >
                              <Edit size={14} /> Edit Session
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />
                            <DropdownMenuItem
                              className="rounded-lg gap-2 text-sm font-medium text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10 cursor-pointer"
                              onClick={() => {
                                if (confirm("Are you sure you want to delete this session?")) {
                                  deleteMutation.mutate(session.id);
                                }
                              }}
                            >
                              <Trash2 size={14} /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Term Dates Display */}
                    {session.termPeriods && session.termPeriods.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        {session.termPeriods.sort((a, b) => {
                          const order = { FIRST: 1, SECOND: 2, THIRD: 3 };
                          return order[a.term] - order[b.term];
                        }).map((term) => (
                          <div key={term.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <p className="text-[11px] font-semibold text-slate-500 mb-1">{term.term} Term</p>
                            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
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

            {archivedSessions.length > 0 && (
              <div className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-slate-500 flex items-center gap-2">
                  <Archive size={14} /> Archived Sessions ({archivedSessions.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {archivedSessions.map((s) => (
                    <div key={s.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3 group hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm">
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors shadow-sm">
                        <History size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{s.name}</p>
                        <p className="text-[10px] font-medium text-slate-500 uppercase mt-0.5">Archived {format(new Date(s.updatedAt), 'MMM yyyy')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Session Dialog */}
      <Dialog open={!!editingSession} onOpenChange={(open) => !open && setEditingSession(null)}>
        <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Session</DialogTitle>
          </DialogHeader>
          {editingSession && (
            <SessionForm 
              schoolId={schoolId} 
              initialData={editingSession}
              onSuccess={() => setEditingSession(null)}
              onCancel={() => setEditingSession(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

