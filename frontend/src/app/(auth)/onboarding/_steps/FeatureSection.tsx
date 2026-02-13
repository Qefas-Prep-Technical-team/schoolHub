"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, Users, Calendar, PlayCircle, 
  BookOpen, MessageSquare, Eye, FileText, Sparkles 
} from "lucide-react";
import ButtonGroup from "../_components/ButtonGroup";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";

// Map your string icons to actual Lucide Components
const iconMap = {
  bar_chart: <BarChart3 />,
  users: <Users />,
  calendar_month: <Calendar />,
  play_circle: <PlayCircle />,
  auto_stories: <BookOpen />,
  forum: <MessageSquare />,
  visibility: <Eye />,
  description: <FileText />,
};

export default function FeatureSection() {
  const { userType } = useAuthStore();
  const currentRole = userType || "STUDENT";

  const features = {
    ADMIN: [
      { icon: "bar_chart", title: "School Analytics", description: "Monitor attendance, revenue, and school growth in real-time.", color: "text-blue-500" },
      { icon: "users", title: "Staff Payroll", description: "Manage teacher contracts, registrar accounts, and salaries.", color: "text-indigo-500" }
    ],
    TEACHER: [
      { icon: "calendar_month", title: "Smart Timetable", description: "Automated weekly teaching schedules synced with your classes.", color: "text-purple-500" },
      { icon: "play_circle", title: "Lesson Hub", description: "Centralized storage for curriculum, videos, and student resources.", color: "text-rose-500" }
    ],
    STUDENT: [
      { icon: "auto_stories", title: "Digital Assignments", description: "Submit your work and get instant feedback on your grades.", color: "text-emerald-500" },
      { icon: "forum", title: "Study Groups", description: "Collaborative chat spaces to connect with your classmates.", color: "text-sky-500" }
    ],
    PARENT: [
      { icon: "visibility", title: "Live Tracking", description: "Peace of mind with real-time attendance and safety alerts.", color: "text-orange-500" },
      { icon: "description", title: "Report Cards", description: "Instant access to term results, invoices, and performance history.", color: "text-pink-500" }
    ]
  }[currentRole];

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-6 py-12">
      {/* Role Badge */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 mb-6"
      >
        <Sparkles size={14} className="text-blue-500" />
        <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-zinc-400">
          {currentRole} Account Ready
        </span>
      </motion.div>

      <div className="text-center space-y-3 mb-12">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Ready to explore?
        </h2>
        <p className="text-lg text-slate-500 dark:text-zinc-400 max-w-lg mx-auto">
          Here is how <span className="text-blue-600 dark:text-blue-400 font-semibold italic">Academix</span> transforms your experience.
        </p>
      </div>
      
      {/* Feature Grid with Entrance Animation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-3xl">
        {features.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group relative p-6 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 transition-all hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/5"
          >
            <div className={`mb-4 w-12 h-12 rounded-2xl bg-slate-50 dark:bg-zinc-950 flex items-center justify-center ${f.color} group-hover:scale-110 transition-transform`}>
              {iconMap[f.icon as keyof typeof iconMap]}
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{f.title}</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed">
              {f.description}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 w-full max-w-xs"
      >
       
        <p className="mt-4 text-center text-xs text-slate-400 dark:text-zinc-500">
          By entering, you agree to our Terms of Service.
        </p>
      </motion.div>
    </div>
  );
}