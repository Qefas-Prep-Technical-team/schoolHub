"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { format } from "date-fns";
import {
  usePlatformTickets,
  usePlatformTicketDetails,
  usePlatformUpdateTicket,
  usePlatformReplyTicket,
} from "@/lib/api/hooks/usePlatformSupport";
import {
  usePlatformFaqs,
  useCreateFaq,
  useUpdateFaq,
  useDeleteFaq,
  type SupportFaqItem,
  type FaqPayload,
} from "@/lib/api/hooks/useSupportFaqs";
import { useSupportSocket } from "@/lib/hooks/useSupportSocket";
import {
  Search,
  MessageCircle,
  ShieldCheck,
  Zap,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Lightbulb,
  Cpu,
  Filter,
  CheckCheck,
  User,
  Building2,
  Volume2,
  VolumeX,
  RefreshCw,
  XCircle,
  ArrowRight,
  BookOpen,
  Edit3,
  Plus,
  Trash2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Layers,
  Save,
  PlusCircle,
  MinusCircle,
  ExternalLink,
  Bot,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore";

// Helper to determine ticket portal type
type TicketPortalType = "TECHNICAL" | "COMPLAINT" | "SUGGESTION" | "GENERAL";

function getTicketPortalType(ticket: { subject?: string; category?: string | null }): TicketPortalType {
  const sub = (ticket.subject || "").toUpperCase();
  const cat = (ticket.category || "").toUpperCase();

  if (sub.includes("[COMPLAINT]") || cat.includes("COMPLAINT")) return "COMPLAINT";
  if (sub.includes("[SUGGESTION]") || cat.includes("SUGGESTION")) return "SUGGESTION";
  if (
    cat.includes("SOFTWARE") ||
    cat.includes("BUG") ||
    cat.includes("GRADE") ||
    cat.includes("PORTAL") ||
    cat.includes("SYNC") ||
    cat.includes("TECH")
  ) {
    return "TECHNICAL";
  }
  return "TECHNICAL"; // default to technical
}

// Web Audio sound generator for incoming user messages
function playIncomingMessageChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playTone = (freq: number, start: number, dur: number, vol = 0.3) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(vol, ctx.currentTime + start);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    };

    // Agent alert tone: High double pop (C6 -> G6)
    playTone(1046.5, 0, 0.1, 0.25);
    playTone(1567.98, 0.08, 0.16, 0.35);
  } catch (err) {
    console.warn("Could not play agent audio notification:", err);
  }
}

const FAQ_CATEGORY_SUGGESTIONS = [
  "Continuous Assessment & Grading",
  "Daily Attendance & Roll Call",
  "Offline Grades & Spreadsheet Sync",
  "Digital Exams & Quizzes",
  "Timetable & Hall Scheduling",
  "Multi-School Teaching & Linking",
  "Account Security & Password",
  "Billing & Subscription",
];

export default function SupportCenterPage() {
  const { staff } = usePlatformStaffStore();

  // Navigation: Tickets vs FAQ manager
  const [activeTab, setActiveTab] = useState<"TICKETS" | "FAQS">("TICKETS");

  // Tickets state
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [ticketSearch, setTicketSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [portalFilter, setPortalFilter] = useState<"ALL" | "TECHNICAL" | "COMPLAINT" | "SUGGESTION">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED">("ALL");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Tickets queries & mutations
  const { data: tickets, isLoading: ticketsLoading, refetch: refetchTickets } = usePlatformTickets();
  const {
    data: ticketDetails,
    isLoading: ticketDetailsLoading,
    isFetching: ticketDetailsFetching,
  } = usePlatformTicketDetails(activeTicketId || undefined);
  const updateTicket = usePlatformUpdateTicket();
  const replyTicket = usePlatformReplyTicket();

  // Optimistic Support Message State
  const [optimisticMessages, setOptimisticMessages] = useState<
    Array<{
      id: string;
      ticketId: string;
      content: string;
      createdAt: string;
      senderRole: "SUPPORT_AGENT";
      senderName: string;
      status: "sending" | "sent" | "failed";
    }>
  >([]);

  // FAQ queries & mutations
  const { data: faqs = [], isLoading: faqsLoading, refetch: refetchFaqs } = usePlatformFaqs();
  const createFaqMutation = useCreateFaq();
  const updateFaqMutation = useUpdateFaq();
  const deleteFaqMutation = useDeleteFaq();

  // FAQ state
  const [faqSearch, setFaqSearch] = useState("");
  const [faqRoleFilter, setFaqRoleFilter] = useState<string>("ALL");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<SupportFaqItem | null>(null);

  // FAQ Form State
  const [faqFormQuestion, setFaqFormQuestion] = useState("");
  const [faqFormCategory, setFaqFormCategory] = useState("");
  const [faqFormCategoryLabel, setFaqFormCategoryLabel] = useState("");
  const [faqFormSummary, setFaqFormSummary] = useState("");
  const [faqFormTargetRole, setFaqFormTargetRole] = useState("TEACHER");
  const [faqFormAnswerSteps, setFaqFormAnswerSteps] = useState<string[]>([""]);
  const [faqFormOrder, setFaqFormOrder] = useState<number>(0);
  const [faqFormIsPublished, setFaqFormIsPublished] = useState(true);

  // Socket callback for real-time messages & audio chiming
  // STRICTLY filter out support agent replies, staff echoes, and system messages
  const handleIncomingSocketMessage = useCallback(
    (payload: any) => {
      const msg = payload?.message || payload;
      const role = msg?.senderRole;

      // Only notify if message is from a genuine USER (never for SUPPORT_AGENT or STAFF)
      if (role === "USER") {
        if (soundEnabled) {
          playIncomingMessageChime();
        }
        const sender = payload?.userName || msg?.senderName || "User";
        const snippet = msg?.content ? `"${msg.content.slice(0, 50)}..."` : "New inquiry received";
        toast.info(`🔔 New message from ${sender}: ${snippet}`);
      }
    },
    [soundEnabled]
  );

  useSupportSocket(activeTicketId || undefined, handleIncomingSocketMessage, { isPlatform: true });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message (both server messages and optimistic outgoing messages)
  useEffect(() => {
    if (ticketDetails?.messages || optimisticMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [ticketDetails?.messages?.length, optimisticMessages.length]);

  // Derived filtered tickets list
  const filteredTickets = useMemo(() => {
    if (!tickets) return [];
    return tickets.filter((t: any) => {
      // Portal type filter
      if (portalFilter !== "ALL") {
        const type = getTicketPortalType(t);
        if (type !== portalFilter) return false;
      }

      // Status filter
      if (statusFilter !== "ALL") {
        if (t.status !== statusFilter) return false;
      }

      // Search keyword
      if (ticketSearch.trim()) {
        const q = ticketSearch.toLowerCase();
        const matchesSubject = t.subject?.toLowerCase().includes(q);
        const matchesUser = t.userName?.toLowerCase().includes(q) || t.userEmail?.toLowerCase().includes(q);
        const matchesCategory = t.category?.toLowerCase().includes(q);
        const matchesSchool = t.schoolName?.toLowerCase().includes(q);
        if (!matchesSubject && !matchesUser && !matchesCategory && !matchesSchool) return false;
      }

      // Date filter
      if (dateFilter && !t.createdAt.startsWith(dateFilter)) {
        return false;
      }

      return true;
    });
  }, [tickets, portalFilter, statusFilter, ticketSearch, dateFilter]);

  // Auto-select first ticket if none currently selected
  useEffect(() => {
    if (!activeTicketId && filteredTickets && filteredTickets.length > 0) {
      setActiveTicketId(filteredTickets[0].id);
    }
  }, [activeTicketId, filteredTickets]);

  // Calculate ticket metrics
  const metrics = useMemo(() => {
    if (!tickets) return { total: 0, open: 0, complaints: 0, suggestions: 0, technical: 0 };
    let open = 0;
    let complaints = 0;
    let suggestions = 0;
    let technical = 0;

    tickets.forEach((t: any) => {
      if (t.status === "OPEN" || t.status === "IN_PROGRESS") open++;
      const type = getTicketPortalType(t);
      if (type === "COMPLAINT") complaints++;
      else if (type === "SUGGESTION") suggestions++;
      else technical++;
    });

    return {
      total: tickets.length,
      open,
      complaints,
      suggestions,
      technical,
    };
  }, [tickets]);

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return faqs.filter((f) => {
      const matchesRole = faqRoleFilter === "ALL" || f.targetRole === faqRoleFilter || f.targetRole === "ALL";
      if (!matchesRole) return false;
      if (!faqSearch.trim()) return true;
      const q = faqSearch.toLowerCase();
      return (
        f.question.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q) ||
        (f.categoryLabel && f.categoryLabel.toLowerCase().includes(q)) ||
        f.summary.toLowerCase().includes(q) ||
        f.answer.some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [faqs, faqRoleFilter, faqSearch]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeTicketId) return;
    const msgContent = newMessage.trim();
    setNewMessage("");

    const tempId = `opt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newOptMsg = {
      id: tempId,
      ticketId: activeTicketId,
      content: msgContent,
      createdAt: new Date().toISOString(),
      senderRole: "SUPPORT_AGENT" as const,
      senderName: staff?.displayName || staff?.fullName || "Support Agent",
      status: "sending" as const,
    };

    setOptimisticMessages((prev) => [...prev, newOptMsg]);

    replyTicket.mutate(
      { ticketId: activeTicketId, content: msgContent },
      {
        onSuccess: () => {
          setOptimisticMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, status: "sent" as const } : m))
          );
          setTimeout(() => {
            setOptimisticMessages((prev) => prev.filter((m) => m.id !== tempId));
          }, 3500);
        },
        onError: () => {
          setOptimisticMessages((prev) =>
            prev.map((m) => (m.id === tempId ? { ...m, status: "failed" as const } : m))
          );
        },
      }
    );
  };

  const handleRetryMessage = (optMsg: { id: string; ticketId: string; content: string }) => {
    setOptimisticMessages((prev) =>
      prev.map((m) => (m.id === optMsg.id ? { ...m, status: "sending" as const } : m))
    );
    replyTicket.mutate(
      { ticketId: optMsg.ticketId, content: optMsg.content },
      {
        onSuccess: () => {
          setOptimisticMessages((prev) =>
            prev.map((m) => (m.id === optMsg.id ? { ...m, status: "sent" as const } : m))
          );
          setTimeout(() => {
            setOptimisticMessages((prev) => prev.filter((m) => m.id !== optMsg.id));
          }, 3500);
        },
        onError: () => {
          setOptimisticMessages((prev) =>
            prev.map((m) => (m.id === optMsg.id ? { ...m, status: "failed" as const } : m))
          );
        },
      }
    );
  };

  const activeTicketMessages = useMemo(() => {
    const backendMsgs = ticketDetails?.messages || [];
    const currentOptMsgs = optimisticMessages.filter((m) => m.ticketId === activeTicketId);

    const filteredOptMsgs = currentOptMsgs.filter(
      (opt) =>
        !backendMsgs.some(
          (b: any) =>
            b.content === opt.content &&
            Math.abs(new Date(b.createdAt).getTime() - new Date(opt.createdAt).getTime()) < 20000
        )
    );

    return [...backendMsgs, ...filteredOptMsgs];
  }, [ticketDetails?.messages, optimisticMessages, activeTicketId]);

  const handleUpdateStatus = (status: string) => {
    if (!activeTicketId) return;
    updateTicket.mutate({ ticketId: activeTicketId, status });
  };

  const handleUpdatePriority = (priority: string) => {
    if (!activeTicketId) return;
    updateTicket.mutate({ ticketId: activeTicketId, priority });
  };

  // FAQ Modal Handlers
  const openCreateFaqModal = () => {
    setEditingFaq(null);
    setFaqFormQuestion("");
    setFaqFormCategory(FAQ_CATEGORY_SUGGESTIONS[0]);
    setFaqFormCategoryLabel("Grading & Evaluation");
    setFaqFormSummary("");
    setFaqFormTargetRole("TEACHER");
    setFaqFormAnswerSteps([""]);
    setFaqFormOrder((faqs.length || 0) + 1);
    setFaqFormIsPublished(true);
    setIsFaqModalOpen(true);
  };

  const openEditFaqModal = (faq: SupportFaqItem) => {
    setEditingFaq(faq);
    setFaqFormQuestion(faq.question);
    setFaqFormCategory(faq.category);
    setFaqFormCategoryLabel(faq.categoryLabel || "");
    setFaqFormSummary(faq.summary);
    setFaqFormTargetRole(faq.targetRole);
    setFaqFormAnswerSteps(faq.answer && faq.answer.length > 0 ? [...faq.answer] : [""]);
    setFaqFormOrder(faq.order || 0);
    setFaqFormIsPublished(faq.isPublished ?? true);
    setIsFaqModalOpen(true);
  };

  const handleAddAnswerStep = () => {
    setFaqFormAnswerSteps((prev) => [...prev, ""]);
  };

  const handleRemoveAnswerStep = (idx: number) => {
    if (faqFormAnswerSteps.length <= 1) return;
    setFaqFormAnswerSteps((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateAnswerStep = (idx: number, val: string) => {
    setFaqFormAnswerSteps((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqFormQuestion.trim() || !faqFormCategory.trim() || !faqFormSummary.trim()) {
      toast.warning("Please provide a question, category, and summary.");
      return;
    }

    const cleanedSteps = faqFormAnswerSteps.map((s) => s.trim()).filter(Boolean);
    if (cleanedSteps.length === 0) {
      toast.warning("Please provide at least one answer step or bullet point.");
      return;
    }

    const payload: FaqPayload = {
      question: faqFormQuestion.trim(),
      category: faqFormCategory.trim(),
      categoryLabel: faqFormCategoryLabel.trim() || null,
      summary: faqFormSummary.trim(),
      targetRole: faqFormTargetRole,
      answer: cleanedSteps,
      order: Number(faqFormOrder) || 0,
      isPublished: faqFormIsPublished,
    };

    if (editingFaq) {
      await updateFaqMutation.mutateAsync({ id: editingFaq.id, data: payload });
    } else {
      await createFaqMutation.mutateAsync(payload);
    }

    setIsFaqModalOpen(false);
  };

  const handleDeleteFaq = async (id: string, question: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete this FAQ from the database?\n\n"${question}"`)) {
      return;
    }
    await deleteFaqMutation.mutateAsync(id);
  };

  const handleToggleFaqPublish = async (faq: SupportFaqItem) => {
    await updateFaqMutation.mutateAsync({
      id: faq.id,
      data: { isPublished: !faq.isPublished },
    });
  };

  const statusColors: Record<string, string> = {
    OPEN: "bg-amber-500/10 text-amber-600 border-amber-500/30",
    IN_PROGRESS: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    RESOLVED: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
    CLOSED: "bg-slate-500/10 text-slate-600 border-slate-500/30",
  };

  const priorityColors: Record<string, string> = {
    LOW: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
    MEDIUM: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    HIGH: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    URGENT: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 border-rose-300 animate-pulse font-bold",
  };

  return (
    <div className="space-y-8 pb-20 max-w-[1800px] mx-auto">
      {/* ── TOP HEADER & MODE NAVIGATION ─────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            <span>Platform Support Command Center</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Support, Grievance &amp; FAQ Command
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Treat live conversations, resolve user complaints, and manage PostgreSQL-backed FAQs in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Main Navigation Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab("TICKETS")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "TICKETS"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Inquiries Desk</span>
              {metrics.total > 0 && (
                <Badge className="bg-indigo-600 text-white text-[10px] h-4.5 px-1.5 py-0">
                  {metrics.total}
                </Badge>
              )}
            </button>

            <button
              onClick={() => setActiveTab("FAQS")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "FAQS"
                  ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>FAQ Knowledge Base</span>
              <Badge className="bg-emerald-600 text-white text-[10px] h-4.5 px-1.5 py-0">
                {faqs.length}
              </Badge>
            </button>
          </div>

          {/* Sound Notification Toggle */}
          <button
            onClick={() => {
              setSoundEnabled((prev) => !prev);
              toast.info(soundEnabled ? "Audio chimes muted." : "Audio chimes enabled!");
            }}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              soundEnabled
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400"
                : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500"
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="hidden sm:inline">{soundEnabled ? "Chime ON" : "Chime Muted"}</span>
          </button>

          <Button
            variant="outline"
            onClick={() => {
              refetchTickets();
              refetchFaqs();
              toast.info("Refreshed latest support data");
            }}
            className="rounded-xl h-10 px-3.5 text-xs font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: TICKETS & INQUIRIES DESK ───────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "TICKETS" && (
        <div className="space-y-6">
          {/* KPI Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <div
              onClick={() => {
                setPortalFilter("ALL");
                setStatusFilter("ALL");
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                portalFilter === "ALL" && statusFilter === "ALL"
                  ? "bg-indigo-600/10 border-indigo-500/40 shadow-sm"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
                Total Inquiries
              </p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{metrics.total}</p>
            </div>

            <div
              onClick={() => {
                setPortalFilter("ALL");
                setStatusFilter("OPEN");
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                statusFilter === "OPEN"
                  ? "bg-amber-500/10 border-amber-500/40 shadow-sm"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-wider text-amber-600 mb-1">
                  Open / In Progress
                </p>
                {metrics.open > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
              </div>
              <p className="text-2xl font-black text-amber-600">{metrics.open}</p>
            </div>

            <div
              onClick={() => {
                setPortalFilter("COMPLAINT");
                setStatusFilter("ALL");
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                portalFilter === "COMPLAINT"
                  ? "bg-rose-500/10 border-rose-500/40 shadow-sm"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-wider text-rose-600 mb-1">
                  Complaints
                </p>
                <AlertCircle className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-black text-rose-600">{metrics.complaints}</p>
            </div>

            <div
              onClick={() => {
                setPortalFilter("SUGGESTION");
                setStatusFilter("ALL");
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                portalFilter === "SUGGESTION"
                  ? "bg-amber-500/10 border-amber-500/40 shadow-sm"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-wider text-amber-600 mb-1">
                  Suggestions
                </p>
                <Lightbulb className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600">{metrics.suggestions}</p>
            </div>

            <div
              onClick={() => {
                setPortalFilter("TECHNICAL");
                setStatusFilter("ALL");
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                portalFilter === "TECHNICAL"
                  ? "bg-blue-500/10 border-blue-500/40 shadow-sm"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black uppercase tracking-wider text-blue-600 mb-1">
                  Technical Chats
                </p>
                <Cpu className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-blue-600">{metrics.technical}</p>
            </div>
          </div>

          {/* Main Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-230px)] lg:min-h-[620px] lg:max-h-[800px]">
            {/* Left Column: Tickets Inbox & Multi-Filter (5 Cols) */}
            <Card className="lg:col-span-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-0 shadow-lg flex flex-col overflow-hidden">
              {/* Inbox Filter Header */}
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
                {/* Search and Date Row */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input
                      type="search"
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                      placeholder="Search subject, user email, or school..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    />
                  </div>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-32 px-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs outline-none font-medium text-slate-500"
                  />
                </div>

                {/* Portal Type Filter Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {[
                    { key: "ALL", label: "All Portals" },
                    { key: "TECHNICAL", label: "Technical" },
                    { key: "COMPLAINT", label: "Complaints" },
                    { key: "SUGGESTION", label: "Suggestions" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setPortalFilter(tab.key as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        portalFilter === tab.key
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Status Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {(["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                        statusFilter === st
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                          : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      }`}
                    >
                      {st.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tickets List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {ticketsLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full bg-slate-100 dark:bg-slate-800 rounded-2xl" />
                  ))
                ) : filteredTickets.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    <MessageCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-600 dark:text-slate-300">No tickets match this filter</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try switching to &quot;All Portals&quot; or clearing your search.</p>
                  </div>
                ) : (
                  filteredTickets.map((ticket: any) => {
                    const portalType = getTicketPortalType(ticket);
                    const isSelected = activeTicketId === ticket.id;

                    return (
                      <button
                        key={ticket.id}
                        onClick={() => setActiveTicketId(ticket.id)}
                        className={cn(
                          "w-full text-left p-3.5 rounded-2xl transition-all border",
                          isSelected
                            ? "bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        )}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="flex items-center gap-1.5">
                            {portalType === "COMPLAINT" && (
                              <Badge className="text-[9px] bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold px-1.5 py-0">
                                Complaint
                              </Badge>
                            )}
                            {portalType === "SUGGESTION" && (
                              <Badge className="text-[9px] bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-bold px-1.5 py-0">
                                Suggestion
                              </Badge>
                            )}
                            {portalType === "TECHNICAL" && (
                              <Badge className="text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold px-1.5 py-0">
                                Technical
                              </Badge>
                            )}
                            <Badge className={cn("text-[9px] uppercase tracking-wider font-bold border px-1.5 py-0", priorityColors[ticket.priority])}>
                              {ticket.priority}
                            </Badge>
                          </div>

                          <span className="text-[10px] text-slate-400 font-medium">
                            {format(new Date(ticket.createdAt), "MMM d, h:mm a")}
                          </span>
                        </div>

                        <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1 mb-1">
                          {ticket.subject}
                        </h4>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="truncate max-w-[200px] flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {ticket.userName || ticket.userEmail}
                          </span>

                          <Badge className={cn("text-[9px] font-bold border capitalize", statusColors[ticket.status])}>
                            {ticket.status.replace("_", " ").toLowerCase()}
                          </Badge>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </Card>

            {/* Right Column: Ticket Conversation Workspace (7 Cols) */}
            <Card className="lg:col-span-7 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-0 shadow-lg flex flex-col overflow-hidden min-h-[600px]">
              {activeTicketId && (ticketDetailsLoading || (!ticketDetails && ticketsLoading)) ? (
                <div className="flex-1 flex flex-col h-full bg-slate-50/40 dark:bg-slate-950/20">
                  {/* Top Header Skeleton */}
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Skeleton className="h-5 w-16 rounded-md" />
                          <Skeleton className="h-5 w-20 rounded-md" />
                        </div>
                        <Skeleton className="h-5 w-64 rounded-md" />
                      </div>
                      <Skeleton className="h-8 w-24 rounded-xl" />
                    </div>
                  </div>

                  {/* Centered Loading State */}
                  <div className="flex-1 flex flex-col items-center justify-center p-8 gap-3 my-auto">
                    <div className="w-14 h-14 rounded-3xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center shadow-inner">
                      <Loader2 className="w-7 h-7 animate-spin text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      Loading conversation thread...
                    </p>
                    <p className="text-xs text-slate-400 font-medium">
                      Fetching messages, participant metadata & AI responses
                    </p>
                  </div>
                </div>
              ) : ticketDetails ? (
                <>
                  {/* Ticket Header & Status Control Bar */}
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={cn("text-[10px] uppercase font-black border", priorityColors[ticketDetails.priority])}>
                            {ticketDetails.priority}
                          </Badge>
                          <Badge className={cn("text-[10px] font-bold border", statusColors[ticketDetails.status])}>
                            {ticketDetails.status.replace("_", " ")}
                          </Badge>
                          <span className="text-xs text-slate-400 font-mono">#{ticketDetails.id.slice(0, 8)}</span>
                          {ticketDetailsFetching && (
                            <span className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold ml-1">
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              Syncing...
                            </span>
                          )}
                        </div>
                        <h2 className="text-base font-black text-slate-900 dark:text-white">
                          {ticketDetails.subject}
                        </h2>
                      </div>

                      {/* Status Transition Action Buttons */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {ticketDetails.status !== "IN_PROGRESS" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus("IN_PROGRESS")}
                            disabled={updateTicket.isPending}
                            className="text-xs h-8 rounded-xl font-bold border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            Mark In Progress
                          </Button>
                        )}
                        {ticketDetails.status !== "RESOLVED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus("RESOLVED")}
                            disabled={updateTicket.isPending}
                            className="text-xs h-8 rounded-xl font-bold border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                          >
                            <CheckCheck className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                            Resolve
                          </Button>
                        )}
                        {ticketDetails.status !== "CLOSED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus("CLOSED")}
                            disabled={updateTicket.isPending}
                            className="text-xs h-8 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-100"
                          >
                            Close
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Requester Profile Summary Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 text-xs">
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Requester</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{ticketDetails.userName || "Guest"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Role / Portal</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200 capitalize">{ticketDetails.userType?.toLowerCase() || "User"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Email</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{ticketDetails.userEmail || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">School Context</p>
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{ticketDetails.schoolName || "Independent"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages Stream */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-slate-950/20">
                    {/* Initial Description Card with User Avatar */}
                    {ticketDetails.description && (
                      <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs">
                        <div className="w-8 h-8 rounded-full bg-amber-600/20 border border-amber-400 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                          {(ticketDetails.userName || "U").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-[11px]">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Initial Submission from {ticketDetails.userName || "Educator"}</span>
                            </div>
                            <span className="text-[10px] text-amber-700/70 font-medium">
                              {format(new Date(ticketDetails.createdAt), "MMM d, h:mm a")}
                            </span>
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap leading-relaxed">
                            {ticketDetails.description}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Chat Messages with Distinct AI, User, and Support Staff Visual Alignment */}
                    {activeTicketMessages.map((msg: any) => {
                      const isAI =
                        msg.senderRole === "AI" ||
                        msg.senderRole === "SYSTEM" ||
                        msg.senderRole === "BOT" ||
                        (msg.senderName || "").toUpperCase().includes("AI") ||
                        (msg.senderName || "").toUpperCase().includes("BOT");

                      const isAgent =
                        !isAI &&
                        (msg.senderRole === "SUPPORT_AGENT" ||
                          msg.senderRole === "STAFF" ||
                          msg.senderRole === "ADMIN");

                      const isUser = !isAI && !isAgent;
                      const userInitial = (msg.senderName || ticketDetails.userName || "US").slice(0, 2).toUpperCase();
                      const staffInitial = (msg.senderName || staff?.fullName || "AG").slice(0, 2).toUpperCase();

                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex items-end gap-2.5 my-1.5",
                            isUser ? "justify-start" : "justify-end"
                          )}
                        >
                          {/* ── USER AVATAR (LEFT) ── */}
                          {isUser && (
                            <div
                              className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-200 font-bold text-xs shadow-xs shrink-0 select-none overflow-hidden"
                              title={msg.senderName || ticketDetails.userName || "User"}
                            >
                              {userInitial}
                            </div>
                          )}

                          {/* ── MESSAGE BUBBLE ── */}
                          <div
                            className={cn(
                              "max-w-[78%] rounded-2xl p-3.5 text-xs shadow-xs transition-all",
                              isAI
                                ? "bg-emerald-600 text-white rounded-br-none border border-emerald-500/40 shadow-sm"
                                : isAgent
                                ? "bg-indigo-600 text-white rounded-br-none border border-indigo-500/40"
                                : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none"
                            )}
                          >
                            {/* Message Header (Sender Label, Badges & Time) */}
                            <div
                              className={cn(
                                "flex items-center gap-2 mb-1.5 text-[10px]",
                                isAI ? "opacity-95 text-emerald-100" : isAgent ? "opacity-80 text-white" : "opacity-80 text-slate-600 dark:text-slate-300"
                              )}
                            >
                              <span className="font-bold flex items-center gap-1">
                                {isAI && <Sparkles className="w-3 h-3 text-emerald-300" />}
                                {isAgent && <ShieldCheck className="w-3 h-3 text-indigo-200" />}
                                {isUser && <User className="w-3 h-3 text-slate-400" />}
                                {isAI
                                  ? msg.senderName || "Qefas AI Assistant"
                                  : isAgent
                                  ? msg.senderName || staff?.fullName || "Support Agent"
                                  : msg.senderName || ticketDetails.userName || "User"}
                              </span>

                              {isAI && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-700/70 font-black uppercase tracking-wider text-emerald-100 border border-emerald-400/30">
                                  AI Bot
                                </span>
                              )}

                              {isUser && ticketDetails.userType && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 font-bold uppercase text-slate-500">
                                  {ticketDetails.userType}
                                </span>
                              )}

                              <span>•</span>
                              <span>{format(new Date(msg.createdAt), "h:mm a")}</span>
                            </div>

                            {/* Message Body Content */}
                            <p className="font-medium whitespace-pre-wrap leading-relaxed">{msg.content}</p>

                            {/* Real-time Message Delivery Status Indicator */}
                            {isAgent && (
                              <div className="mt-1 flex items-center justify-end">
                                {msg.status === "sending" && (
                                  <span className="flex items-center gap-1 text-[10px] text-indigo-200 font-medium">
                                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                    Sending...
                                  </span>
                                )}
                                {msg.status === "sent" && (
                                  <span className="flex items-center gap-1 text-[10px] text-emerald-200 font-bold">
                                    <CheckCheck className="w-3 h-3 text-emerald-300" />
                                    Sent
                                  </span>
                                )}
                                {msg.status === "failed" && (
                                  <div className="flex items-center gap-1.5 text-[10px] text-red-200 bg-red-950/60 border border-red-500/40 px-2 py-0.5 rounded-lg">
                                    <AlertCircle className="w-3 h-3 text-red-300" />
                                    <span>Failed to deliver</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRetryMessage(msg)}
                                      className="underline hover:text-white font-bold ml-1 cursor-pointer"
                                    >
                                      Retry
                                    </button>
                                  </div>
                                )}
                                {!msg.status && (
                                  <span className="opacity-75">
                                    <CheckCheck className="w-3 h-3 text-indigo-200" />
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* ── AI AVATAR (RIGHT, GREEN) ── */}
                          {isAI && (
                            <div
                              className="w-8 h-8 rounded-full bg-emerald-600 border border-emerald-400 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none overflow-hidden ring-2 ring-emerald-500/20"
                              title={msg.senderName || "Qefas AI Assistant"}
                            >
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                          )}

                          {/* ── SUPPORT STAFF AVATAR (RIGHT, INDIGO) ── */}
                          {isAgent && (
                            <div
                              className="w-8 h-8 rounded-full bg-indigo-600 text-white border border-indigo-400/50 flex items-center justify-center font-bold text-xs shadow-xs shrink-0 select-none overflow-hidden"
                              title={msg.senderName || staff?.fullName || "Support Agent"}
                            >
                              {staff?.profileImage ? (
                                <img
                                  src={staff.profileImage}
                                  alt={staff.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{staffInitial}</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick canned replies */}
                  <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center gap-2 overflow-x-auto">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                      Quick Responses:
                    </span>
                    {[
                      "We are investigating this issue right now.",
                      "Please refresh your browser and try again.",
                      "This issue has been escalated to platform software engineering.",
                      "This has now been resolved. Thank you for your patience!",
                    ].map((phrase, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setNewMessage((prev) => (prev ? `${prev} ${phrase}` : phrase))}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 transition-all"
                      >
                        {phrase}
                      </button>
                    ))}
                  </div>

                  {/* Message Input Bar */}
                  <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                    <form onSubmit={handleSendMessage} className="relative flex items-center">
                      <input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your response to the user (Press Enter to send)..."
                        className="w-full pl-5 pr-14 py-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all shadow-sm text-sm font-medium"
                      />
                      <Button
                        type="submit"
                        disabled={replyTicket.isPending || !newMessage.trim()}
                        size="icon"
                        className="absolute right-2 h-10 w-10 shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                      >
                        {replyTicket.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-10 h-full">
                  <div className="w-20 h-20 mb-6 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <MessageCircle className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                    Select a Ticket to Treat
                  </h3>
                  <p className="text-slate-500 font-medium max-w-xs mx-auto text-sm">
                    Choose any technical conversation, teacher complaint, or suggestion from the left inbox to respond and update the user.
                  </p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: KNOWLEDGE BASE & FAQ MANAGER ───────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "FAQS" && (
        <div className="space-y-6">
          {/* FAQ Controls & Actions Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search questions, categories, summaries, answers..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Role filter buttons */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                {(["ALL", "TEACHER", "STUDENT", "ADMIN", "PARENT"] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setFaqRoleFilter(r)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      faqRoleFilter === r
                        ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Add New FAQ Button */}
              <Button
                onClick={openCreateFaqModal}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-4 text-xs font-bold shadow-md shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Create New FAQ
              </Button>
            </div>
          </div>

          {/* FAQs List in Database */}
          <div className="space-y-3.5 max-h-[calc(100vh-270px)] min-h-[500px] overflow-y-auto pr-2">
            {faqsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-3xl bg-slate-100 dark:bg-slate-800" />
              ))
            ) : filteredFaqs.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  No FAQs found matching your filter
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Click &quot;Create New FAQ&quot; above to add your first database-backed article, or try searching for another term.
                </p>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;

                return (
                  <Card
                    key={faq.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Left: Metadata & Question */}
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 text-[10px] font-bold">
                            {faq.targetRole} Portal
                          </Badge>
                          <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 text-[10px] font-bold">
                            {faq.category}
                          </Badge>
                          {faq.categoryLabel && (
                            <Badge variant="outline" className="text-[10px] text-slate-500 font-medium">
                              {faq.categoryLabel}
                            </Badge>
                          )}
                          <Badge
                            className={cn(
                              "text-[10px] font-bold border",
                              faq.isPublished
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-300"
                                : "bg-slate-100 text-slate-500 border-slate-300"
                            )}
                          >
                            {faq.isPublished ? "Published" : "Draft"}
                          </Badge>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Order #{faq.order}
                          </span>
                        </div>

                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                          {faq.question}
                        </h3>

                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {faq.summary}
                        </p>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditFaqModal(faq)}
                          className="rounded-xl h-9 text-xs font-bold border-slate-200 hover:bg-slate-100"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                          Edit &amp; Update
                        </Button>

                        <button
                          onClick={() => handleToggleFaqPublish(faq)}
                          title={faq.isPublished ? "Switch to Draft" : "Publish FAQ"}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all"
                        >
                          {faq.isPublished ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
                        </button>

                        <button
                          onClick={() => handleDeleteFaq(faq.id, faq.question)}
                          title="Delete FAQ"
                          className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Answer Steps */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 animate-in fade-in duration-300">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Step-by-Step Guidance (Live Database Record):
                        </p>
                        <div className="space-y-2 pl-2 border-l-2 border-indigo-500/40">
                          {faq.answer.map((step, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300 font-medium">
                              <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* ── FAQ CREATE / EDIT DIALOG MODAL ─────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={isFaqModalOpen} onOpenChange={setIsFaqModalOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>{editingFaq ? "Edit & Update FAQ in Database" : "Create New Database-Backed FAQ"}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Changes are saved directly to PostgreSQL and dynamically displayed to teachers and platform users.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveFaq} className="space-y-4 mt-2">
            {/* Question */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                FAQ Question <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={faqFormQuestion}
                onChange={(e) => setFaqFormQuestion(e.target.value)}
                placeholder="e.g. How are Continuous Assessment (CA) and Exam scores calculated?"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Category with quick chips */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Category <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={faqFormCategory}
                onChange={(e) => setFaqFormCategory(e.target.value)}
                placeholder="Enter or select category below"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                {FAQ_CATEGORY_SUGGESTIONS.slice(0, 5).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFaqFormCategory(cat)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-all"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Label and Target Role Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Category Badge Subtitle
                </label>
                <input
                  type="text"
                  value={faqFormCategoryLabel}
                  onChange={(e) => setFaqFormCategoryLabel(e.target.value)}
                  placeholder="e.g. Grading & Evaluation"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Target Audience / Role
                </label>
                <select
                  value={faqFormTargetRole}
                  onChange={(e) => setFaqFormTargetRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="TEACHER">TEACHER (Teacher Support Hub)</option>
                  <option value="STUDENT">STUDENT (Student Portal)</option>
                  <option value="ADMIN">ADMIN (School Admin Console)</option>
                  <option value="PARENT">PARENT (Parent Dashboard)</option>
                  <option value="ALL">ALL (Universal Knowledge Base)</option>
                </select>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Summary Headline <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={faqFormSummary}
                onChange={(e) => setFaqFormSummary(e.target.value)}
                placeholder="Short 1-2 sentence overview of the answer..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Step-by-Step Guidance / Answer Bullets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Step-by-Step Answer Points <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAddAnswerStep}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Add Step</span>
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {faqFormAnswerSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      required
                      value={step}
                      onChange={(e) => handleUpdateAnswerStep(idx, e.target.value)}
                      placeholder={`Guidance step #${idx + 1}...`}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {faqFormAnswerSteps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAnswerStep(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      >
                        <MinusCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Order and Publish Status Row */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Sort Order:
                </label>
                <input
                  type="number"
                  value={faqFormOrder}
                  onChange={(e) => setFaqFormOrder(parseInt(e.target.value, 10) || 0)}
                  className="w-20 px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={faqFormIsPublished}
                  onChange={(e) => setFaqFormIsPublished(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <span>Published to Users</span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end items-center gap-2.5 pt-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFaqModalOpen(false)}
                className="rounded-xl h-10 px-4 text-xs font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createFaqMutation.isPending || updateFaqMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-5 text-xs font-bold shadow-md shadow-indigo-600/20"
              >
                {createFaqMutation.isPending || updateFaqMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Saving to Database...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    {editingFaq ? "Save Changes to Database" : "Save FAQ to Database"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
