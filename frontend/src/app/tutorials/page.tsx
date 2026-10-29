"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  PlayCircle,
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  GraduationCap,
  Users,
  Building2,
  FileText,
  ChevronRight,
  ExternalLink,
  Layers,
  Award,
  Video as VideoIcon,
  HelpCircle,
  Compass,
  ArrowRight,
  ShieldCheck,
  Check,
  X,
  BookmarkCheck,
  Sigma
} from "lucide-react";
import VideoPlayer from "@/components/ui/VideoPlayer";
import LaTeXRenderer from "@/components/ui/LaTeXRenderer";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  TutorialItem,
  TutorialStep,
  UserRoleCategory,
  INITIAL_TUTORIALS,
  getStoredTutorials
} from "@/lib/tutorials/tutorialData";

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState<TutorialItem[]>(INITIAL_TUTORIALS);
  const [selectedRole, setSelectedRole] = useState<UserRoleCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTutorial, setActiveTutorial] = useState<TutorialItem | null>(null);
  const [activeTabMode, setActiveTabMode] = useState<"video" | "guide">("video");

  // Sync with localStorage catalog and console updates
  useEffect(() => {
    setTutorials(getStoredTutorials());

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<TutorialItem[]>;
      if (customEvent.detail) {
        setTutorials(customEvent.detail);
      }
    };
    window.addEventListener("qefas_tutorials_updated", handleUpdate);
    return () => window.removeEventListener("qefas_tutorials_updated", handleUpdate);
  }, []);

  const roleTabs = useMemo(() => [
    { id: "ALL", label: "All Tutorials", icon: Compass, count: tutorials.length, color: "text-slate-600 dark:text-slate-300" },
    { id: "ADMIN", label: "School Admins", icon: Building2, count: tutorials.filter(t => t.role === "ADMIN").length, color: "text-indigo-600 dark:text-indigo-400" },
    { id: "TEACHER", label: "Teachers", icon: BookOpen, count: tutorials.filter(t => t.role === "TEACHER").length, color: "text-emerald-600 dark:text-emerald-400" },
    { id: "STUDENT", label: "Students", icon: GraduationCap, count: tutorials.filter(t => t.role === "STUDENT").length, color: "text-rose-600 dark:text-rose-400" },
    { id: "PARENT", label: "Parents", icon: Users, count: tutorials.filter(t => t.role === "PARENT").length, color: "text-amber-600 dark:text-amber-400" }
  ], [tutorials]);

  // Filter tutorials by role & search query
  const filteredTutorials = useMemo(() => {
    return tutorials.filter((item) => {
      const matchesRole = selectedRole === "ALL" || item.role === selectedRole;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.keyTakeaways.some(k => k.toLowerCase().includes(query)) ||
        item.steps.some(s => s.title.toLowerCase().includes(query) || s.description.toLowerCase().includes(query));

      return matchesRole && matchesSearch;
    });
  }, [tutorials, selectedRole, searchQuery]);

  // Featured tutorial (first featured or first in list)
  const featuredTutorial = useMemo(() => {
    return tutorials.find(t => t.featured && (selectedRole === "ALL" || t.role === selectedRole)) || filteredTutorials[0];
  }, [tutorials, selectedRole, filteredTutorials]);

  const getRoleTheme = (role: string) => {
    switch (role) {
      case "ADMIN":
        return {
          bg: "bg-indigo-50 dark:bg-indigo-950/40",
          text: "text-indigo-700 dark:text-indigo-300",
          border: "border-indigo-200 dark:border-indigo-800/60",
          badge: "bg-indigo-600 text-white",
          glow: "from-indigo-600 to-blue-600"
        };
      case "TEACHER":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/40",
          text: "text-emerald-700 dark:text-emerald-300",
          border: "border-emerald-200 dark:border-emerald-800/60",
          badge: "bg-emerald-600 text-white",
          glow: "from-emerald-600 to-teal-600"
        };
      case "STUDENT":
        return {
          bg: "bg-rose-50 dark:bg-rose-950/40",
          text: "text-rose-700 dark:text-rose-300",
          border: "border-rose-200 dark:border-rose-800/60",
          badge: "bg-rose-600 text-white",
          glow: "from-rose-600 to-pink-600"
        };
      case "PARENT":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/40",
          text: "text-amber-700 dark:text-amber-300",
          border: "border-amber-200 dark:border-amber-800/60",
          badge: "bg-amber-600 text-white",
          glow: "from-amber-600 to-orange-600"
        };
      default:
        return {
          bg: "bg-blue-50 dark:bg-blue-950/40",
          text: "text-blue-700 dark:text-blue-300",
          border: "border-blue-200 dark:border-blue-800/60",
          badge: "bg-blue-600 text-white",
          glow: "from-blue-600 to-indigo-600"
        };
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-white font-['Lexend'] overflow-x-hidden pt-28 pb-20 selection:bg-blue-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-[130px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- HERO HEADER --- */}
        <section className="text-center pt-8 pb-12 sm:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest mb-6"
          >
            <Sparkles size={14} className="text-blue-500" />
            <span>Qefas Hub Academy & Video Library</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15] max-w-4xl mx-auto mb-4 sm:mb-6"
          >
            Master Qefas Hub with{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400">
              Video Walkthroughs
            </span>{" "}
            &amp; Step-by-Step Guides
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 px-2"
          >
            Whether you are a School Administrator managing campus rosters, a Teacher publishing CBT assessments, a Student completing homework, or a Parent checking termly report cards—we have got you covered.
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto relative mb-6 sm:mb-8 px-1"
          >
            <div className="relative flex items-center">
              <Search className="absolute left-4 size-5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search tutorials (e.g. grading, CBT, fees, attendance)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 sm:h-14 pl-11 sm:pl-12 pr-11 sm:pr-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-base font-medium shadow-xl shadow-slate-200/50 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </motion.div>

          {/* User Type Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 px-1">
            {roleTabs.map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedRole === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedRole(tab.id as UserRoleCategory)}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-lg shadow-slate-900/10 dark:shadow-none scale-[1.02]"
                      : "bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <Icon size={15} className={isSelected ? "" : tab.color} />
                  <span>{tab.label}</span>
                  <span
                    className={`ml-0.5 sm:ml-1 text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* --- SPOTLIGHT FEATURED TUTORIAL --- */}
        {featuredTutorial && !searchQuery && (
          <motion.section
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 sm:mb-16"
          >
            <div className="p-1 rounded-[28px] sm:rounded-[32px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-2xl shadow-indigo-500/10">
              <div className="bg-white dark:bg-slate-900 rounded-[26px] sm:rounded-[30px] p-5 sm:p-10 flex flex-col lg:flex-row gap-6 sm:gap-8 items-center">
                {/* Media preview */}
                <div className="w-full lg:w-1/2 relative group rounded-2xl overflow-hidden aspect-video bg-slate-950 shadow-xl border border-slate-200/40 dark:border-slate-800">
                  <Image
                    src={featuredTutorial.thumbnail}
                    alt={featuredTutorial.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  {/* Play Button Overlay */}
                  <Link
                    href={`/tutorials/${featuredTutorial.id}`}
                    className="absolute inset-0 m-auto size-14 sm:size-20 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white flex items-center justify-center shadow-2xl shadow-blue-500/50 backdrop-blur-md transform group-hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  >
                    <Play size={24} className="fill-white ml-0.5 sm:ml-1" />
                  </Link>

                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between text-white text-xs font-semibold">
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[11px] sm:text-xs">
                      <Clock size={13} /> {featuredTutorial.duration}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-600/90 font-bold uppercase tracking-wider text-[10px]">
                      Featured Guide
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] sm:text-xs font-black uppercase tracking-wider px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full ${getRoleTheme(featuredTutorial.role).bg} ${getRoleTheme(featuredTutorial.role).text} border ${getRoleTheme(featuredTutorial.role).border}`}>
                      {featuredTutorial.role === "ADMIN" ? "School Admin" : featuredTutorial.role.charAt(0) + featuredTutorial.role.slice(1).toLowerCase()}
                    </span>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                      • {featuredTutorial.category}
                    </span>
                  </div>

                  <Link href={`/tutorials/${featuredTutorial.id}`}>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors leading-tight">
                      {featuredTutorial.title}
                    </h2>
                  </Link>

                  <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-base leading-relaxed">
                    {featuredTutorial.summary}
                  </p>

                  <div className="space-y-2 pt-1 sm:pt-2">
                    <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Key Highlights:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                      {featuredTutorial.keyTakeaways.slice(0, 4).map((highlight, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                          <span>{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 pt-3 sm:pt-4">
                    <Link
                      href={`/tutorials/${featuredTutorial.id}`}
                      className="w-full sm:w-auto px-6 h-11 sm:h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <Play size={16} className="fill-white" />
                      <span>Watch Video</span>
                    </Link>
                    <Link
                      href={`/tutorials/${featuredTutorial.id}`}
                      className="w-full sm:w-auto px-6 h-11 sm:h-12 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                    >
                      <FileText size={16} />
                      <span>Read Step-by-Step Guide</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* --- TUTORIALS GRID --- */}
        <section className="space-y-8">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {selectedRole === "ALL" ? "All Video & Text Tutorials" : `${selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()} Tutorials`}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Showing {filteredTutorials.length} guides with dedicated video lessons and actionable documentation.
              </p>
            </div>
          </div>

          {filteredTutorials.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8">
              <BookOpen className="size-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">No tutorials found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                No guides matched your search for &quot;{searchQuery}&quot;. Try a different keyword or reset filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedRole("ALL");
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredTutorials.map((item, index) => {
                const theme = getRoleTheme(item.role);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 group"
                  >
                    {/* Thumbnail banner */}
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                      <Image
                        src={item.thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      <Link
                        href={`/tutorials/${item.id}`}
                        className="absolute inset-0 m-auto size-12 rounded-full bg-blue-600/90 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg backdrop-blur-sm group-hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      >
                        <Play size={18} className="fill-white ml-0.5" />
                      </Link>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-semibold">
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md">
                          <Clock size={12} /> {item.duration}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md">
                          {item.steps.length} Steps
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${theme.bg} ${theme.text} border ${theme.border}`}>
                            {item.role === "ADMIN" ? "School Admin" : item.role.charAt(0) + item.role.slice(1).toLowerCase()}
                          </span>
                          <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                            {item.category}
                          </span>
                        </div>

                        <Link href={`/tutorials/${item.id}`}>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2 mb-2">
                            {item.title}
                          </h3>
                        </Link>

                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {item.summary}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <Link
                          href={`/tutorials/${item.id}`}
                          className="flex-1 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Play size={13} className="fill-blue-600 dark:fill-blue-400" />
                          <span>Watch Video</span>
                        </Link>
                        <Link
                          href={`/tutorials/${item.id}`}
                          className="flex-1 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <FileText size={13} />
                          <span>Text Guide</span>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* --- ROLE QUICK-REFERENCE SECTION --- */}
        <section className="mt-20 pt-12 border-t border-slate-200 dark:border-slate-800">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
              Need Quick Access to Your Dedicated Workspace?
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Each user type has dedicated portals engineered specifically for their responsibilities and needs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Admin */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-950/60 shadow-lg flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/30">
                  <Building2 size={24} />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">School Administrators</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Manage teachers, student quotas, academic calendar, broadsheet results, and school billing.
                </p>
              </div>
              <Link
                href="/login/school-admin"
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:underline"
              >
                <span>Admin Portal</span> <ArrowRight size={14} />
              </Link>
            </div>

            {/* Teacher */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-950/60 shadow-lg flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-emerald-600/30">
                  <BookOpen size={24} />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Teachers &amp; Educators</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Set up CBT exams, record offline grades, track daily attendance, and upload classroom resources.
                </p>
              </div>
              <Link
                href="/login/teacher"
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 hover:underline"
              >
                <span>Teacher Portal</span> <ArrowRight size={14} />
              </Link>
            </div>

            {/* Student */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-950/60 shadow-lg flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-rose-600/30">
                  <GraduationCap size={24} />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Students &amp; Learners</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Take timed CBT tests, submit homework assignments, view timetable schedules, and check scores.
                </p>
              </div>
              <Link
                href="/login/student"
                className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1 hover:underline"
              >
                <span>Student Portal</span> <ArrowRight size={14} />
              </Link>
            </div>

            {/* Parent */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-amber-100 dark:border-amber-950/60 shadow-lg flex flex-col justify-between space-y-4">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center mb-4 shadow-lg shadow-amber-600/30">
                  <Users size={24} />
                </div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Parents &amp; Guardians</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Link multiple children, track real-time attendance, pay school fees online, and inspect report cards.
                </p>
              </div>
              <Link
                href="/login/parent"
                className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 hover:underline"
              >
                <span>Parent Gateway</span> <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* --- INTERACTIVE TUTORIAL DETAILS & VIDEO MODAL --- */}
      <Dialog open={!!activeTutorial} onOpenChange={(open) => !open && setActiveTutorial(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl">
          {activeTutorial && (
            <div>
              {/* Modal Header */}
              <div className="p-4 sm:p-8 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] sm:text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getRoleTheme(activeTutorial.role).bg} ${getRoleTheme(activeTutorial.role).text} border ${getRoleTheme(activeTutorial.role).border}`}>
                    {activeTutorial.role === "ADMIN" ? "School Admin" : activeTutorial.role.charAt(0) + activeTutorial.role.slice(1).toLowerCase()}
                  </span>
                  <span className="text-[11px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider">
                    • {activeTutorial.category} • {activeTutorial.duration}
                  </span>
                </div>
                <DialogTitle className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
                  {activeTutorial.title}
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                  {activeTutorial.summary}
                </DialogDescription>

                {/* View toggle (Video vs Text Guide) */}
                <div className="flex flex-wrap items-center gap-2 mt-4 sm:mt-6">
                  <button
                    type="button"
                    onClick={() => setActiveTabMode("video")}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTabMode === "video"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <VideoIcon size={14} />
                    <span>Video Walkthrough</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTabMode("guide")}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs font-bold transition-all ${
                      activeTabMode === "guide"
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <FileText size={14} />
                    <span>Step-by-Step Text Guide</span>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                {activeTabMode === "video" ? (
                  <div className="space-y-4 sm:space-y-6">
                    <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
                      <VideoPlayer
                        videoUrl={activeTutorial.videoUrl}
                        title={activeTutorial.title}
                        poster={activeTutorial.thumbnail}
                        variant="cinema"
                      />
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800/60">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <BookmarkCheck size={16} className="text-blue-500" />
                        <span>Core Learning Outcomes</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        {activeTutorial.keyTakeaways.map((takeaway, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span>{takeaway}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Text Guide Mode */
                  <div className="space-y-8">
                    {activeTutorial.richTextGuide && (
                      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                          <Sigma size={15} />
                          <span>Academic Manual & Mathematical Documentation</span>
                        </div>
                        <div className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed">
                          <LaTeXRenderer content={activeTutorial.richTextGuide} forceMarkdown={true} />
                        </div>
                      </div>
                    )}

                    <div className="space-y-6">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                        Detailed Action Steps:
                      </h4>

                      <div className="space-y-6">
                        {activeTutorial.steps.map((step, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80"
                          >
                            <div className="size-8 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
                              {idx + 1}
                            </div>
                            <div className="space-y-2 flex-1">
                              <h5 className="font-bold text-base text-slate-900 dark:text-white">
                                {step.title}
                              </h5>
                              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                {step.description}
                              </p>
                              {step.tips && (
                                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 font-medium flex items-start gap-2">
                                  <Sparkles size={14} className="text-amber-500 shrink-0 mt-0.5" />
                                  <span><strong>Pro Tip:</strong> {step.tips}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {activeTutorial.faqs && activeTutorial.faqs.length > 0 && (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                          Frequently Asked Questions
                        </h4>
                        <div className="space-y-3">
                          {activeTutorial.faqs.map((faq, idx) => (
                            <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm">
                              <p className="font-bold text-slate-900 dark:text-white mb-1">
                                Q: {faq.q}
                              </p>
                              <p className="text-slate-600 dark:text-slate-400">
                                A: {faq.a}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
