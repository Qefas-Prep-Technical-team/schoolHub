"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sessionService, Session } from "@/lib/api/services/sessionService";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
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
  ChevronRight
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";
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
  const schoolId = user?.schools[0]?.schoolId || "";

  const { data: sessions = [], isLoading, isError } = useQuery({
    queryKey: ["sessions"],
    queryFn: () => sessionService.getSessions(),
  });

  const activeSession = sessions.find(s => s.status === "ACTIVE");
  const archivedSessions = sessions.filter(s => s.status === "ARCHIVED");
  const inactiveSessions = sessions.filter(s => s.status === "INACTIVE");

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
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
        <div className="flex justify-between items-center">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-12 w-48" />
        </div>
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-10 pb-24">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
            <History size={14} /> Academic Periods
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Session Management
          </h1>
          <p className="text-slate-500 max-w-lg">
            Define academic years, set active periods, and manage historical session data for your institution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2 text-sm shadow-sm gap-2">
            <Search size={16} className="text-slate-400" />
            <input type="text" placeholder="Search sessions..." className="bg-transparent outline-none w-40" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Create & Active */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <Plus size={20} />
              </div>
              <h2 className="text-lg font-bold">New Session</h2>
            </div>
            <CreateSessionForm schoolId={schoolId} />
          </div>

          {activeSession && (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-200 dark:shadow-none relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 h-40 w-40 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
              <div className="relative z-10 space-y-4">
                <div className="flex justify-between items-start">
                  <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">Active Current</span>
                  <ShieldCheck size={20} className="text-blue-100" />
                </div>
                <div>
                  <h3 className="text-xl font-black">{activeSession.name}</h3>
                  <p className="text-blue-100 text-xs mt-1">
                    Started {format(new Date(activeSession.startDate), 'MMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="text-[10px] text-blue-200 uppercase font-black">Ends in {format(new Date(activeSession.endDate), 'MMM d, yyyy')}</div>
                  <ChevronRight size={16} className="text-white/50" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: List of All Sessions */}
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black flex items-center gap-2">
                All Planned Sessions <span className="text-slate-400 font-medium text-sm">({sessions.length})</span>
              </h2>
            </div>

            {sessions.length === 0 ? (
              <div className="bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-20 text-center space-y-4">
                <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <Calendar size={40} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-900 dark:text-white">No sessions established</h3>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto">Create your first academic session using the form on the left to start managing school activities.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "group bg-white dark:bg-slate-950 border rounded-3xl p-5 flex items-center justify-between transition-all hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-900",
                      session.status === 'ACTIVE' ? "border-blue-200 bg-blue-50/10" : "border-slate-200 dark:border-slate-800"
                    )}
                  >
                    <div className="flex items-center gap-5">
                      <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                        session.status === 'ACTIVE' ? "bg-blue-600 text-white shadow-lg shadow-blue-200" :
                          session.status === 'ARCHIVED' ? "bg-slate-100 dark:bg-slate-800 text-slate-400" :
                            "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600"
                      )}>
                        <Calendar size={24} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-slate-900 dark:text-white">{session.name}</h3>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter",
                            session.status === 'ACTIVE' ? "bg-blue-100 text-blue-700" :
                              session.status === 'ARCHIVED' ? "bg-slate-100 text-slate-500" :
                                "bg-indigo-100 text-indigo-700"
                          )}>
                            {session.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {format(new Date(session.startDate), 'MMM d, yyyy')} — {format(new Date(session.endDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {session.status !== 'ARCHIVED' && (
                        <button
                          onClick={() => archiveMutation.mutate(session.id)}
                          className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-orange-500 transition-all"
                          title="Archive Session"
                        >
                          <Archive size={18} />
                        </button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 transition-all">
                          <MoreVertical size={18} />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-2xl">
                          <DropdownMenuLabel>Session Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2 cursor-pointer">
                            <Search size={14} /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 text-red-600 cursor-pointer"
                            onClick={() => {
                              if (confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
                                deleteMutation.mutate(session.id);
                              }
                            }}
                          >
                            <Trash2 size={14} /> Delete Permanently
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {archivedSessions.length > 0 && (
            <div className="pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Archive size={14} /> Archived Vault ({archivedSessions.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 opacity-70 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                {archivedSessions.map((s) => (
                  <div key={s.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-3">
                    <div className="h-10 w-10 bg-white dark:bg-slate-950 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 dark:border-slate-800">
                      <History size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-bold truncate w-32">{s.name}</div>
                      <div className="text-[10px] text-slate-500">Archived on {format(new Date(s.updatedAt), 'MMM d, yyyy')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
