"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

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
  icon: string;
  title: string;
  description: string;
  color: string;
  badge?: number;
}

interface ChildDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  child: ChildData | null;
  // optional callbacks the parent can provide:
  onViewDashboard?: (child: ChildData) => void;
  onQuickAction?: (actionId: string, child: ChildData | null) => void;
  onSwitchProfile?: () => void;
}

const quickActions: QuickAction[] = [
  {
    id: "1",
    icon: "bar_chart",
    title: "Academic Results",
    description: "View grades and report cards",
    color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  },
  {
    id: "2",
    icon: "history",
    title: "Attendance History",
    description: "Check daily logs and leaves",
    color: "bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400",
  },
  {
    id: "3",
    icon: "assignment",
    title: "Homework & Assignments",
    description: "2 Pending assignments",
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    badge: 2,
  },
  {
    id: "4",
    icon: "quiz",
    title: "Exams & Quizzes",
    description: "Schedule and upcoming tests",
    color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  },
  {
    id: "5",
    icon: "chat_bubble",
    title: "Contact Teachers",
    description: "Ms. Anderson (Homeroom)",
    color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
  },
];

export default function ChildDetailsDrawer({
  isOpen,
  onClose,
  child,
  onViewDashboard,
  onQuickAction,
  onSwitchProfile,
}: ChildDetailsDrawerProps) {
  if (!child) {
    // Early render while no child selected — allow Dialog to handle open/close normally
    return null;
  }

  const stats = [
    {
      id: "grade",
      icon: "school",
      label: "Avg. Grade",
      value: child.stats.averageGrade,
      color: "bg-blue-100 text-primary dark:bg-blue-900/30 dark:text-blue-400",
    },
    {
      id: "attendance",
      icon: "calendar_month",
      label: "Attendance",
      value: child.stats.attendance,
      color: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
    },
    {
      id: "behavior",
      icon: "sentiment_very_satisfied",
      label: "Behavior",
      value: child.stats.behavior,
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    },
  ];

  const handleViewDashboard = () => {
    onViewDashboard?.(child);
    onClose();
  };

  const handleQuickAction = (id: string) => {
    onQuickAction?.(id, child);
    onClose();
  };

  const handleSwitchProfile = () => {
    onSwitchProfile?.();
    // keep drawer open or close depending on UX; here we'll close
    onClose();
  };

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        {/* Drawer container */}
        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 flex justify-end">
            <Transition.Child
              as={Fragment}
              enter="transform transition duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition duration-200"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="w-full max-w-[480px] h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col">
                {/* Header */}
                <div className="sticky top-0 z-20 bg-white/60 dark:bg-gray-900/60 backdrop-blur border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: 26 }}>
                      face_3
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Child Details</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={onClose}
                      aria-label="Close"
                      className="p-2 rounded-full bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {/* Profile */}
                  <div className="flex flex-col items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="relative w-32 h-32 rounded-full border-4 border-white dark:border-gray-700 shadow-lg overflow-hidden">
                        <Image src={child.imageUrl} alt={child.name} fill className="object-cover" sizes="128px" />
                      </div>

                      {child.isActive && (
                        <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center ring-2 ring-white dark:ring-gray-800">
                          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                            check
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white">{child.name}</h4>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
                        {child.class} • ID: {child.studentId}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {stats.map((s) => (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.18 }}
                        className="flex flex-col items-center rounded-xl p-4 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700"
                      >
                        <div className={`mb-2 w-10 h-10 rounded-full flex items-center justify-center ${s.color}`}>
                          <span className="material-symbols-outlined">{s.icon}</span>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">{s.value}</div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Primary Action */}
                  <Link href={"/dashboard/parent/my-children/details"} className="mb-6">
                    <button
                      onClick={handleViewDashboard}
                      className="w-full flex items-center cursor-pointer justify-center gap-3 h-12 rounded-xl bg-primary text-white font-bold shadow-lg hover:bg-blue-600 active:scale-[0.98] transition"
                    >
                      <span>View Full Dashboard</span>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                        arrow_forward
                      </span>
                    </button>
                  </Link>

                  {/* Quick Actions */}
                  <div className="mb-6">
                    <h5 className="text-xs font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
                      Quick Actions
                    </h5>

                    <div className="flex flex-col gap-3">
                      {quickActions.map((action) => (
                        <button
                          key={action.id}
                          onClick={() => handleQuickAction(action.id)}
                          className="group flex items-center justify-between gap-4 rounded-xl bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 hover:shadow-md transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color} group-hover:scale-105 transition-transform`}>
                              <span className="material-symbols-outlined">{action.icon}</span>
                            </div>

                            <div className="text-left">
                              <div className="font-bold text-gray-900 dark:text-white">{action.title}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{action.description}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {action.badge && <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">{action.badge}</span>}
                            <span className="material-symbols-outlined text-gray-400">chevron_right</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-center">
                    <button onClick={handleSwitchProfile} className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary transition inline-flex items-center gap-1">
                      Switch Child Profile
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_more</span>
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t dark:border-gray-700 px-6 py-3 text-center">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Last updated: Today at {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
        <div className="mb-8">
  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Quick Actions</h4>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {quickActions.map((action) => (
      <button
        key={action.id}
        onClick={() => handleQuickAction(action.id)}
        className="flex items-center gap-3 p-4 rounded-xl border bg-gray-50 dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
      >
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.color}`}>
          <span className="material-symbols-outlined">{action.icon}</span>
        </div>

        <div className="flex-1 text-left">
          <p className="font-semibold text-gray-900 dark:text-white">{action.title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
        </div>

        {action.badge && (
          <span className="px-2 py-1 text-xs rounded-full bg-red-600 text-white">
            {action.badge}
          </span>
        )}
      </button>
    ))}
  </div>
</div>
      </Dialog>
    </Transition>
  );
}
