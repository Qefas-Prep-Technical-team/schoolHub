"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useChildDetails } from "@/lib/api/hooks/useParentChildren";
import { 
  User, 
  GraduationCap, 
  Calendar, 
  Activity, 
  ShieldAlert, 
  TrendingUp, 
  ChevronRight,
  X,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { cn } from "@/lib/utils";

export interface ChildStats {
  averageGrade: string;
  attendance: string;
  behavior: string;
}

export interface ChildData {
  id: string;
  name: string;
  class: string;
  studentId: string;
  imageUrl: string;
  isActive: boolean;
  stats: ChildStats;
}

interface QuickAction {
  id: string;
  icon: any;
  title: string;
  description: string;
  color: string;
  badge?: number;
}

interface ChildDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  child: ChildData | null;
  onViewDashboard?: (child: ChildData) => void;
  onQuickAction?: (actionId: string, child: ChildData | null) => void;
  onSwitchProfile?: () => void;
}

const quickActions: QuickAction[] = [
  {
    id: "results",
    icon: TrendingUp,
    title: "Academic Analysis",
    description: "Real-time performance metrics",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    id: "attendance",
    icon: Calendar,
    title: "Presence Log",
    description: "Daily synchronization records",
    color: "bg-green-500/10 text-green-600 dark:text-green-400",
  },
  {
    id: "alerts",
    icon: ShieldAlert,
    title: "Security Alerts",
    description: "Behavioral and remark protocols",
    color: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  }
];

export default function ChildDetailsDrawer({
  isOpen,
  onClose,
  child,
  onViewDashboard,
  onQuickAction,
  onSwitchProfile,
}: ChildDetailsDrawerProps) {
  const { data: fullDetails, isLoading } = useChildDetails(child?.id || null);

  if (!child) return null;

  const handleViewDashboard = () => {
    onViewDashboard?.(child);
    onClose();
  };

  const handleQuickAction = (id: string) => {
    onQuickAction?.(id, child);
    onClose();
  };

  const placeholderUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(child.name)}&backgroundColor=ea580c&fontFamily=Arial&fontSize=40&fontWeight=900`;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 flex justify-end">
            <Transition.Child
              as={Fragment}
              enter="transform transition duration-500 cubic-bezier(0, 0, 0.2, 1)"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition duration-400 cubic-bezier(0.4, 0, 1, 1)"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="w-full max-w-[500px] h-full bg-white dark:bg-slate-950 shadow-[-20px_0_50px_rgba(0,0,0,0.1)] flex flex-col border-l border-slate-200 dark:border-white/5">
                {/* Header */}
                <div className="p-8 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="size-12 rounded-2xl bg-orange-600/10 flex items-center justify-center text-orange-600">
                      <Activity size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Node Intelligence</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocol: SYNC-ACTIVE</p>
                    </div>
                  </div>
                  <button onClick={onClose} className="size-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:bg-orange-600 hover:text-white transition-all">
                    <X size={20} />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
                  {/* Profile Section */}
                  <div className="relative group">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="size-32 rounded-[2.5rem] overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl relative">
                          <Image 
                            src={child.imageUrl || placeholderUrl} 
                            alt={child.name} 
                            fill 
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="absolute -bottom-2 -right-2 size-10 bg-green-500 rounded-2xl border-4 border-white dark:border-slate-950 flex items-center justify-center text-white shadow-lg">
                          <ShieldAlert size={18} />
                        </div>
                      </div>
                      <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{child.name}</h2>
                        <p className="text-orange-600 font-black text-[10px] uppercase tracking-[0.2em] mt-3">ID: {child.studentId}</p>
                        <div className="flex items-center gap-3 mt-4 text-slate-500 font-bold text-xs uppercase tracking-wider">
                          <span className="flex items-center gap-1.5"><GraduationCap size={14} /> {child.class}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Core Metrics */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Avg Grade', value: child.stats.averageGrade, color: 'text-blue-600', bg: 'bg-blue-600/10', icon: TrendingUp },
                      { label: 'Attendance', value: child.stats.attendance, color: 'text-green-600', bg: 'bg-green-600/10', icon: Calendar },
                      { label: 'Behavior', value: 'Excellent', color: 'text-orange-600', bg: 'bg-orange-600/10', icon: Activity }
                    ].map((stat, i) => (
                      <div key={i} className="p-4 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
                        <div className={cn("size-8 rounded-xl flex items-center justify-center mb-3", stat.bg, stat.color)}>
                          <stat.icon size={16} />
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white mt-1">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent Activity / Intelligent Logs */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Intelligent Logs (Recent Grades)</h4>
                      {isLoading && <div className="size-3 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />}
                    </div>
                    
                    <div className="space-y-3">
                      {fullDetails?.grades?.length > 0 ? (
                        fullDetails.grades.map((grade: any, i: number) => (
                          <div key={i} className="p-4 rounded-2xl bg-white dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center justify-between group hover:border-orange-600/30 transition-all">
                            <div className="flex items-center gap-3">
                              <div className="size-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500">
                                <BookOpen size={18} />
                              </div>
                              <div>
                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{grade.subject}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">{grade.assessmentType || 'Assessment'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black text-orange-600">{Math.round((grade.score / grade.maxMarks) * 100)}%</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(grade.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 rounded-3xl border-2 border-dashed border-slate-100 dark:border-white/5 text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No recent logs found</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Access Terminal */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Quick Access Terminal</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {quickActions.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleQuickAction(action.id)}
                          className="flex items-center justify-between p-5 rounded-[1.5rem] bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 hover:bg-orange-600/5 hover:border-orange-600/30 transition-all group"
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn("size-12 rounded-2xl flex items-center justify-center", action.color)}>
                              <action.icon size={20} />
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{action.title}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase">{action.description}</p>
                            </div>
                          </div>
                          <ChevronRight size={18} className="text-slate-300 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-8 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5">
                  <button
                    onClick={handleViewDashboard}
                    className="w-full h-16 rounded-[1.5rem] bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-orange-600 dark:hover:bg-orange-600 dark:hover:text-white transition-all shadow-xl hover:shadow-orange-600/30 flex items-center justify-center gap-3 active:scale-[0.98] group"
                  >
                    Enter Full Intelligence Terminal
                    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
