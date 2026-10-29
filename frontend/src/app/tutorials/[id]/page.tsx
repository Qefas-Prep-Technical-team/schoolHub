"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Clock,
  Sparkles,
  BookOpen,
  GraduationCap,
  Users,
  Building2,
  CheckCircle2,
  BookmarkCheck,
  ChevronRight,
  Share2,
  Copy,
  Check,
  Sigma,
  ListOrdered,
  HelpCircle,
  Video as VideoIcon,
  Layers,
  ArrowRight
} from "lucide-react";
import { toast } from "react-toastify";
import VideoPlayer from "@/components/ui/VideoPlayer";
import LaTeXRenderer from "@/components/ui/LaTeXRenderer";
import {
  TutorialItem,
  INITIAL_TUTORIALS,
  getStoredTutorials
} from "@/lib/tutorials/tutorialData";

export default function TutorialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tutorialId = params?.id as string;

  const [tutorials, setTutorials] = useState<TutorialItem[]>(INITIAL_TUTORIALS);
  const [copied, setCopied] = useState(false);

  // Sync tutorials from stored catalog and console updates
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

  const tutorial = useMemo(() => {
    return tutorials.find((t) => t.id === tutorialId);
  }, [tutorials, tutorialId]);

  // Related tutorials (same role or same category, excluding current)
  const relatedTutorials = useMemo(() => {
    if (!tutorial) return [];
    return tutorials
      .filter((t) => t.id !== tutorial.id && (t.role === tutorial.role || t.category === tutorial.category))
      .slice(0, 3);
  }, [tutorials, tutorial]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Tutorial link copied to clipboard!");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const getRoleTheme = (role: string) => {
    switch (role) {
      case "ADMIN":
        return {
          bg: "bg-indigo-50 dark:bg-indigo-950/40",
          text: "text-indigo-600 dark:text-indigo-400",
          border: "border-indigo-200 dark:border-indigo-800/60",
          badge: "bg-indigo-600 text-white"
        };
      case "TEACHER":
        return {
          bg: "bg-emerald-50 dark:bg-emerald-950/40",
          text: "text-emerald-600 dark:text-emerald-400",
          border: "border-emerald-200 dark:border-emerald-800/60",
          badge: "bg-emerald-600 text-white"
        };
      case "STUDENT":
        return {
          bg: "bg-rose-50 dark:bg-rose-950/40",
          text: "text-rose-600 dark:text-rose-400",
          border: "border-rose-200 dark:border-rose-800/60",
          badge: "bg-rose-600 text-white"
        };
      case "PARENT":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/40",
          text: "text-amber-600 dark:text-amber-400",
          border: "border-amber-200 dark:border-amber-800/60",
          badge: "bg-amber-600 text-white"
        };
      default:
        return {
          bg: "bg-blue-50 dark:bg-blue-950/40",
          text: "text-blue-600 dark:text-blue-400",
          border: "border-blue-200 dark:border-blue-800/60",
          badge: "bg-blue-600 text-white"
        };
    }
  };

  if (!tutorial) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-white font-['Lexend'] pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="size-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <VideoIcon size={32} />
          </div>
          <h1 className="text-2xl font-black">Tutorial Not Found</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            The tutorial you are looking for does not exist or may have been updated in the management console.
          </p>
          <div className="pt-2">
            <Link
              href="/tutorials"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md"
            >
              <ArrowLeft size={16} />
              <span>Back to All Tutorials</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const roleTheme = getRoleTheme(tutorial.role);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-white font-['Lexend'] overflow-x-hidden pt-24 sm:pt-28 pb-16 sm:pb-24 selection:bg-blue-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-teal-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 sm:space-y-10">
        {/* Navigation Breadcrumb Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-4 sm:pb-6">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs sm:text-sm">
            <Link
              href="/tutorials"
              className="inline-flex items-center gap-1.5 font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>All Tutorials</span>
            </Link>
            <ChevronRight size={14} className="text-slate-400" />
            <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] sm:text-[11px] uppercase tracking-wider border ${roleTheme.bg} ${roleTheme.text} ${roleTheme.border}`}>
              {tutorial.role}
            </span>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-slate-700 dark:text-slate-300 font-semibold truncate max-w-[140px] xs:max-w-[200px] sm:max-w-md">
              {tutorial.title}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shadow-sm w-full sm:w-fit"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
            <span>{copied ? "Link Copied!" : "Share Tutorial"}</span>
          </button>
        </div>

        {/* Tutorial Header */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <span className="text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {tutorial.category}
            </span>
            <span className="text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {tutorial.difficulty}
            </span>
            <span className="text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock size={13} className="text-blue-500" />
              <span>{tutorial.duration}</span>
            </span>
            {tutorial.featured && (
              <span className="text-xs font-bold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                <Sparkles size={12} />
                <span>Featured Guide</span>
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            {tutorial.title}
          </h1>

          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
            {tutorial.summary}
          </p>
        </div>

        {/* 1. VIDEO COMES FIRST (Primary requested feature) */}
        <section className="space-y-4">
          <div className="relative">
            {/* Ambient Multi-Hue Background Glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/25 via-indigo-600/20 to-purple-600/25 rounded-[36px] blur-2xl opacity-75 -z-10" />
            <VideoPlayer
              videoUrl={tutorial.videoUrl}
              title={tutorial.title}
              poster={tutorial.thumbnail}
              variant="cinema"
            />
          </div>

          {/* Quick Learning Outcomes Banner under Video */}
          {tutorial.keyTakeaways && tutorial.keyTakeaways.length > 0 && (
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <BookmarkCheck size={16} className="text-blue-500" />
                <span>What you will learn in this walkthrough:</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                {tutorial.keyTakeaways.map((takeaway, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                    <span>{takeaway}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 2. FOLLOWED BY THE STEP-BY-STEP GUIDE */}
        <section className="space-y-6 sm:space-y-8 pt-2 sm:pt-4">
          <div className="flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="size-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
              <ListOrdered size={16} />
            </div>
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Step-by-Step Implementation Guide
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Follow each action item below in order to complete this configuration seamlessly.
              </p>
            </div>
          </div>

          {/* Steps List */}
          <div className="space-y-4 sm:space-y-5">
            {tutorial.steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="flex items-start gap-3 sm:gap-6 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:border-blue-500/40 transition-colors"
              >
                <div className="size-8 sm:size-10 rounded-xl sm:rounded-2xl bg-blue-600 text-white font-black text-sm sm:text-base flex items-center justify-center shrink-0 shadow-lg shadow-blue-500/25">
                  {idx + 1}
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {step.description}
                  </p>
                  {step.tips && (
                    <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs sm:text-sm text-amber-900 dark:text-amber-200 font-medium flex items-start gap-2 sm:gap-2.5">
                      <Sparkles size={15} className="text-amber-500 shrink-0 mt-0.5" />
                      <span><strong>Pro Tip:</strong> {step.tips}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Rich LaTeX & Documentation Manual (if present) */}
          {tutorial.richTextGuide && (
            <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-4 overflow-x-auto">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 border-b border-slate-100 dark:border-slate-800 pb-3">
                <Sigma size={16} />
                <span>Academic Manual & Mathematical Formulations</span>
              </div>
              <div className="text-slate-800 dark:text-slate-200 leading-relaxed text-xs sm:text-sm sm:leading-relaxed">
                <LaTeXRenderer content={tutorial.richTextGuide} forceMarkdown={true} />
              </div>
            </div>
          )}

          {/* FAQs section if present */}
          {tutorial.faqs && tutorial.faqs.length > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle size={18} className="text-blue-500" />
                <span>Frequently Asked Questions</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tutorial.faqs.map((faq, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm space-y-1.5 shadow-sm"
                  >
                    <p className="font-bold text-slate-900 dark:text-white">
                      Q: {faq.q}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 3. RELATED TUTORIALS */}
        {relatedTutorials.length > 0 && (
          <section className="space-y-6 pt-8 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Continue Learning
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  More recommended tutorials for {tutorial.role.toLowerCase()}s
                </p>
              </div>

              <Link
                href="/tutorials"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {relatedTutorials.map((item) => (
                <Link
                  key={item.id}
                  href={`/tutorials/${item.id}`}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-500/50 transition-all flex flex-col group"
                >
                  <div className="relative aspect-video bg-slate-950 overflow-hidden">
                    <Image
                      src={item.thumbnail || "/image/backgroundSchool.jpg"}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute top-2.5 right-2.5 text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full">
                      {item.duration}
                    </div>
                    <div className="absolute inset-0 m-auto size-10 rounded-full bg-blue-600/90 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Play size={16} className="fill-white ml-0.5" />
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {item.category} • {item.difficulty}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
