"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  LifeBuoy,
  MessageSquare,
  Send,
  HelpCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Cpu,
  BookOpen,
  Search,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Plus,
  RefreshCw,
  FileText,
  ShieldCheck,
  Zap,
  GraduationCap,
  Calendar,
  Layers,
  Check,
  CheckCheck,
  Lightbulb,
  ThumbsUp,
  Volume2,
  VolumeX,
  Bell,
  BellRing,
  Filter,
  Lock,
  User,
  Headphones,
  Paperclip,
  Smile,
  Loader2,
  Bot,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  useSupportTickets,
  useTicketMessages,
  useCreateTicket,
  useSendTicketMessage,
  type SupportTicketItem,
  type SupportTicketMessage,
} from "@/lib/api/hooks/useSupportTickets";
import { useSupportSocket } from "@/lib/hooks/useSupportSocket";
import { useSupportFaqs } from "@/lib/api/hooks/useSupportFaqs";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { toast } from "react-toastify";
import { cn } from "@/lib/utils";

// Web Audio API WhatsApp-style sound generator
function playWhatsAppChime() {
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

    // WhatsApp-like dual frequency notification chime
    playTone(830.61, 0, 0.12, 0.25); // G#5
    playTone(1244.51, 0.08, 0.2, 0.35); // D#6
  } catch (err) {
    console.warn("Audio notification not supported or blocked:", err);
  }
}

// Request and trigger browser desktop notifications
function triggerDesktopNotification(title: string, body: string) {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/favicon.ico",
        });
      } catch (e) {
        console.warn("Could not dispatch desktop notification", e);
      }
    }
  }
}

// FAQ Interface
interface FAQItem {
  id: string;
  category: string;
  categoryLabel: string;
  question: string;
  summary: string;
  answer: string[];
}

const ROLE_FAQS: Record<string, FAQItem[]> = {
  TEACHER: [
    {
      id: "faq-ca-grading",
      category: "grading",
      categoryLabel: "Continuous Assessment & Grading",
      question: "How are Continuous Assessment (CA) and Exam scores calculated?",
      summary: "Understand the weighted composite percentage and automated GPA grade boundaries.",
      answer: [
        "Qefas Hub uses standard weighted percentage aggregates configured by your institution (e.g. 20% First CA + 20% Second CA + 60% Exam = 100%).",
        "When you input scores on the Grades portal, the system automatically checks against maximum achievable marks for each assessment.",
        "The system computes cumulative totals instantly and translates them into letter grades and GPA points.",
        "Important: Once scores are approved and signed off by the Principal, records are locked against modifications."
      ]
    },
    {
      id: "faq-offline-grades",
      category: "sync",
      categoryLabel: "Offline Grades & Spreadsheet Sync",
      question: "How do I work offline and safely sync grades back later?",
      summary: "Download official CSV/Excel templates, enter marks offline, and upload without merge conflicts.",
      answer: [
        "Navigate to 'Offline Grades' in your left sidebar menu.",
        "Select your assigned class and subject, then click 'Download Grade Sheet Template'.",
        "Fill in your scores using Excel, Google Sheets, or WPS Office without modifying student identifiers.",
        "Return to 'Offline Grades' when reconnected to drag-and-drop the saved spreadsheet."
      ]
    },
    {
      id: "faq-attendance",
      category: "attendance",
      categoryLabel: "Daily Attendance & Roll Call",
      question: "How do I record class attendance and notify parents of unexcused absences?",
      summary: "Mark presence, excused absences, and late arrivals in seconds.",
      answer: [
        "Open your class roster from 'Classes' or 'Attendance' on your dashboard.",
        "Use the 'Mark All Present' quick button to set everyone to present with one tap, then toggle absent students.",
        "Parent portals and SMS/email notifications are automatically updated based on attendance configurations."
      ]
    },
    {
      id: "faq-exams",
      category: "exams",
      categoryLabel: "Digital Exams & Quizzes",
      question: "How do I create and submit exam papers for administrative approval?",
      summary: "Create paper blueprints, import question banks, and request Principal approval.",
      answer: [
        "Go to 'Exams & Quizzes' -> 'Create New Paper'.",
        "Select objective, theory, or hybrid paper blueprints and author or generate questions.",
        "Click 'Submit for Administrative Approval' for your School Principal or Exam Officer to certify the questions."
      ]
    },
    {
      id: "faq-timetable",
      category: "timetable",
      categoryLabel: "Timetable & Hall Scheduling",
      question: "What should I do if there is a lecture hall or timetable clash?",
      summary: "Escalate period collisions directly to the timetable committee or administration.",
      answer: [
        "Review your weekly schedule on 'Timetable' to verify period numbers and allocated venues.",
        "If two subjects or classes collide, switch to the 'Complaints' tab on this Support page.",
        "Select 'Classroom & Facility Issue' or 'Timetable Conflict' to dispatch a high-priority resolution alert."
      ]
    }
  ],
  STUDENT: [
    {
      id: "faq-student-exams",
      category: "exams",
      categoryLabel: "CBT Exams & Continuous Assessments",
      question: "How do I take and submit my online CBT exams and tests?",
      summary: "Understand digital test navigation, automated answer saving, and final submissions.",
      answer: [
        "Ensure a stable internet connection and enter your active exam paper code from 'Exams & Quizzes'.",
        "Answers are automatically saved locally and on the server whenever you select an option or advance questions.",
        "If your device or browser accidentally disconnects, reconnect immediately; your timer and choices are safely preserved.",
        "Upon completing all questions, click 'Submit Final Exam'. A progress modal will verify each paper and provide instant receipt."
      ]
    },
    {
      id: "faq-student-grades",
      category: "grades",
      categoryLabel: "Term Results & GPA Transcripts",
      question: "Where can I view my term grade cards, GPA, and academic transcripts?",
      summary: "Access published continuous assessment scores, term summaries, and official report cards.",
      answer: [
        "Click 'Grades & Results' on your left sidebar navigation.",
        "Select the academic session and term you wish to review.",
        "View your subject score breakdown (Tests, Mid-Term, Final Exam, and Total Score) along with cumulative GPA.",
        "Click 'Download Official Result Slip' to export a verified, watermarked PDF report card."
      ]
    },
    {
      id: "faq-student-assignments",
      category: "assignments",
      categoryLabel: "Homework & Assignment Submissions",
      question: "How do I upload and submit class assignments or homework?",
      summary: "View assignment briefings, attach deliverables, and monitor teacher evaluations.",
      answer: [
        "Go to 'Assignments' in your dashboard navigation.",
        "Select any pending assignment to read the briefing, due date, and rubric.",
        "Upload supported document files (PDF, DOCX, PNG) or write your solution and tap 'Submit Assignment'.",
        "Review your teacher's feedback and awarded marks once grading is concluded."
      ]
    },
    {
      id: "faq-student-alumni",
      category: "linking",
      categoryLabel: "Alumni & Alma Mater Streams",
      question: "What should I do if I graduated and need my alma mater academic transcripts?",
      summary: "Access graduated stream records and request certified transcripts.",
      answer: [
        "Navigate to 'Linking Hub' from your student dashboard.",
        "If you have graduated, your 'Alma Mater Classrooms' hub will display your Graduated Scholar badge.",
        "You can view historical class streams and request official academic records directly from your alma mater."
      ]
    }
  ],
  PARENT: [
    {
      id: "faq-parent-attendance",
      category: "attendance",
      categoryLabel: "Daily Attendance & Tracking",
      question: "How do I track my child's daily school attendance and punctuality?",
      summary: "Monitor daily presence, excused absences, and arrival timestamps in real-time.",
      answer: [
        "Click 'Attendance' on your parent dashboard or select your child's profile card.",
        "Review real-time records displaying presence, excused absences, and late arrivals for each school day.",
        "Automated notifications and SMS updates keep you informed if an unexcused absence is flagged."
      ]
    },
    {
      id: "faq-parent-grades",
      category: "academics",
      categoryLabel: "Multi-Child Academic Monitoring",
      question: "How do I view report cards and academic performance for multiple children?",
      summary: "Switch seamlessly between siblings and download verified term report cards.",
      answer: [
        "Use the Child Switcher dropdown at the top of your screen to switch between your linked children.",
        "Navigate to 'Academics & Grades' to view detailed subject performance, teacher remarks, and GPA.",
        "Download verified PDF report cards for each term and child with one click."
      ]
    },
    {
      id: "faq-parent-billing",
      category: "billing",
      categoryLabel: "Tuition & School Fee Payments",
      question: "How do I pay school tuition and incidental fees securely online?",
      summary: "Pay via verified cards, transfers, and generate instant official payment receipts.",
      answer: [
        "Go to 'Bills & Invoices' on your parent dashboard navigation.",
        "Select the pending invoice and choose your preferred payment method (Paystack, Flutterwave, or Transfer).",
        "Upon successful payment, an official digital receipt is instantly generated and archived in your payment history."
      ]
    },
    {
      id: "faq-parent-linking",
      category: "linking",
      categoryLabel: "Linking Additional Children",
      question: "How do I link a new child to my existing parent account?",
      summary: "Unify all your school-enrolled children under a single guardian dashboard.",
      answer: [
        "Navigate to 'Children' or 'Linking Hub' in your parent dashboard.",
        "Click 'Link Another Child' and enter the unique Student Code provided by the school administration.",
        "Once verified, the child's academic and financial profile will immediately sync into your account."
      ]
    }
  ],
  ADMIN: [
    {
      id: "faq-admin-onboarding",
      category: "onboarding",
      categoryLabel: "Teacher & Student Onboarding",
      question: "How do I onboard teachers and import student enrollment rosters?",
      summary: "Download official CSV/Excel templates for bulk institutional roster synchronization.",
      answer: [
        "Go to 'Students' or 'Teachers' in your administrator console.",
        "Click 'Bulk Import (Excel / CSV)' to download the verified roster template.",
        "Populate records without modifying column headers, then drag-and-drop the spreadsheet to synchronize into the database."
      ]
    },
    {
      id: "faq-admin-subscription",
      category: "billing",
      categoryLabel: "Subscriptions & Institutional Capacity",
      question: "How do I manage school subscription tiers and student quotas?",
      summary: "Upgrade tiers, monitor student seat limits, and manage billing renewals.",
      answer: [
        "Navigate to 'Subscription & Billing' from the main dashboard.",
        "Review your active plan, current student seat quota, and renewal date.",
        "Select 'Upgrade Plan' or 'Add Student Seats' to adjust your institutional capacity anytime."
      ]
    },
    {
      id: "faq-admin-approvals",
      category: "exams",
      categoryLabel: "Exam Paper Blueprints & Approvals",
      question: "How do I review and approve exam paper blueprints before tests go live?",
      summary: "Inspect questions, verify difficulty distribution, and publish digital papers.",
      answer: [
        "Open 'Exams & Quizzes' and select 'Paper Approvals'.",
        "Review the question blueprint, difficulty balance, and marking rubric submitted by subject teachers.",
        "Click 'Approve & Schedule' to make the exam live for testing, or 'Request Revision' with feedback notes."
      ]
    }
  ]
};

interface RoleTheme {
  primaryName: string;
  heroGradient: string;
  heroOrb1: string;
  heroOrb2: string;
  badge: string;
  tabActive: string;
  btnPrimary: string;
  borderSelected: string;
  bgCardSelected: string;
  textAccent: string;
  chatBubble: string;
  headerAgentBg: string;
  pulseColor: string;
  iconBg: string;
}

const ROLE_CONFIGS: Record<
  string,
  {
    roleLabel: string;
    subheading: string;
    whatsappText: string;
    complaintCategories: string[];
    suggestionCategories: string[];
    suggestionScopes: string[];
    theme: RoleTheme;
  }
> = {
  TEACHER: {
    roleLabel: "Educator",
    subheading: "Multi-Portal Educator Helpdesk",
    whatsappText: "Hello%20Qefas%20Support%2C%20I%20am%20a%20teacher%20needing%20assistance",
    complaintCategories: [
      "Facility & Classroom Infrastructure",
      "Timetable & Period Collision",
      "Grade Sheet & Score Sync Issue",
      "Student Discipline & Behavior",
      "Teaching Software & Portal Bug",
      "Other Issue"
    ],
    suggestionCategories: [
      "Teaching Tools & Software",
      "Classroom Architecture & Equipment",
      "Curriculum & Syllabus Suggestions",
      "Administrative Workflow Automation"
    ],
    suggestionScopes: ["My Department", "Whole School", "Platform-Wide"],
    theme: {
      primaryName: "emerald",
      heroGradient: "from-slate-900 via-teal-950 to-slate-900",
      heroOrb1: "bg-emerald-500/10",
      heroOrb2: "bg-teal-500/10",
      badge: "bg-emerald-500/20 border-emerald-400/30 text-emerald-300",
      tabActive: "border-emerald-600 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30",
      btnPrimary: "bg-emerald-600 hover:bg-emerald-700 text-white",
      borderSelected: "border-emerald-300 dark:border-emerald-800/80",
      bgCardSelected: "bg-emerald-50/70 dark:bg-emerald-950/30",
      textAccent: "text-emerald-600 dark:text-emerald-400",
      chatBubble: "bg-emerald-600 text-white",
      headerAgentBg: "bg-gradient-to-tr from-emerald-600 to-teal-500",
      pulseColor: "bg-emerald-500",
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600",
    }
  },
  STUDENT: {
    roleLabel: "Scholar",
    subheading: "Multi-Portal Student Helpdesk",
    whatsappText: "Hello%20Qefas%20Support%2C%20I%20am%20a%20student%20needing%20assistance",
    complaintCategories: [
      "Classroom & Academic Issue",
      "Exam & Assessment Issue",
      "Timetable & Schedule Issue",
      "Portal & Login Technical Bug",
      "Facility & Campus Infrastructure",
      "Other Issue"
    ],
    suggestionCategories: [
      "Student Portal & Learning Tools",
      "Campus Facilities & Library",
      "Extracurricular & Clubs",
      "Exam & Assignment Workflow",
      "General Platform Idea"
    ],
    suggestionScopes: ["My Class", "Whole School", "Platform-Wide"],
    theme: {
      primaryName: "pink",
      heroGradient: "from-slate-900 via-pink-950/70 to-slate-900",
      heroOrb1: "bg-pink-500/15",
      heroOrb2: "bg-rose-500/15",
      badge: "bg-pink-500/20 border-pink-400/30 text-pink-300",
      tabActive: "border-pink-600 text-pink-600 dark:text-pink-400 bg-pink-50/50 dark:bg-pink-950/30",
      btnPrimary: "bg-pink-600 hover:bg-pink-700 text-white shadow-sm shadow-pink-500/20",
      borderSelected: "border-pink-300 dark:border-pink-800/80",
      bgCardSelected: "bg-pink-50/70 dark:bg-pink-950/30",
      textAccent: "text-pink-600 dark:text-pink-400",
      chatBubble: "bg-pink-600 text-white",
      headerAgentBg: "bg-gradient-to-tr from-pink-600 to-rose-500",
      pulseColor: "bg-pink-500",
      iconBg: "bg-pink-50 dark:bg-pink-950/40 text-pink-600",
    }
  },
  PARENT: {
    roleLabel: "Guardian",
    subheading: "Multi-Portal Parent Helpdesk",
    whatsappText: "Hello%20Qefas%20Support%2C%20I%20am%20a%20parent%20needing%20assistance",
    complaintCategories: [
      "Fee Payment & Billing Issue",
      "Academic Performance Inquiry",
      "Attendance & Absence Alert Issue",
      "Child Linking & Account Access",
      "School Communication Grievance",
      "Other Issue"
    ],
    suggestionCategories: [
      "Parent Portal Features",
      "Payment & Billing Options",
      "School-Parent Communication",
      "Student Welfare & Facilities"
    ],
    suggestionScopes: ["My Children's School", "Platform-Wide"],
    theme: {
      primaryName: "orange",
      heroGradient: "from-slate-900 via-orange-950/50 to-slate-900",
      heroOrb1: "bg-orange-500/10",
      heroOrb2: "bg-amber-500/10",
      badge: "bg-orange-500/20 border-orange-400/30 text-orange-300",
      tabActive: "border-orange-600 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/30",
      btnPrimary: "bg-orange-600 hover:bg-orange-700 text-white",
      borderSelected: "border-orange-300 dark:border-orange-800/80",
      bgCardSelected: "bg-orange-50/70 dark:bg-orange-950/30",
      textAccent: "text-orange-600 dark:text-orange-400",
      chatBubble: "bg-orange-600 text-white",
      headerAgentBg: "bg-gradient-to-tr from-orange-600 to-amber-500",
      pulseColor: "bg-orange-500",
      iconBg: "bg-orange-50 dark:bg-orange-950/40 text-orange-600",
    }
  },
  ADMIN: {
    roleLabel: "Administrator",
    subheading: "Multi-Portal Administrator Helpdesk",
    whatsappText: "Hello%20Qefas%20Support%2C%20I%20am%20a%20school%20administrator%20needing%20assistance",
    complaintCategories: [
      "Subscription & Tier Limits",
      "Data Migration & Roster Import",
      "Staff & Teacher Access Issue",
      "Payment Gateway & Settlement",
      "System & Platform Technical Bug",
      "Other Issue"
    ],
    suggestionCategories: [
      "School Management Tools",
      "Reporting & Analytics Features",
      "Billing & Payment Automation",
      "Exam & Result Engine Improvements"
    ],
    suggestionScopes: ["My Institution", "Platform-Wide"],
    theme: {
      primaryName: "blue",
      heroGradient: "from-slate-900 via-blue-950/50 to-slate-900",
      heroOrb1: "bg-blue-500/10",
      heroOrb2: "bg-cyan-500/10",
      badge: "bg-blue-500/20 border-blue-400/30 text-blue-300",
      tabActive: "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30",
      btnPrimary: "bg-blue-600 hover:bg-blue-700 text-white",
      borderSelected: "border-blue-300 dark:border-blue-800/80",
      bgCardSelected: "bg-blue-50/70 dark:bg-blue-950/30",
      textAccent: "text-blue-600 dark:text-blue-400",
      chatBubble: "bg-blue-600 text-white",
      headerAgentBg: "bg-gradient-to-tr from-blue-600 to-cyan-500",
      pulseColor: "bg-blue-500",
      iconBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-600",
    }
  }
};

export interface SharedSupportCenterProps {
  role?: "TEACHER" | "STUDENT" | "ADMIN" | "PARENT";
  defaultPortal?: "complaints" | "suggestions" | "technical" | "faq";
}

export default function SharedSupportCenter({
  role: explicitRole,
  defaultPortal = "technical"
}: SharedSupportCenterProps) {
  const { user } = useAuthStore();
  const detectedRole = (user?.role ? String(user.role).toUpperCase() : "TEACHER") as
    | "TEACHER"
    | "STUDENT"
    | "ADMIN"
    | "PARENT";
  const activeRole = explicitRole || (ROLE_CONFIGS[detectedRole] ? detectedRole : "TEACHER");
  const config = ROLE_CONFIGS[activeRole] || ROLE_CONFIGS.TEACHER;
  const theme = config.theme;

  const [activePortal, setActivePortal] = useState<"complaints" | "suggestions" | "technical" | "faq">(
    defaultPortal
  );
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isNewTechnicalModalOpen, setIsNewTechnicalModalOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  // Chat message state
  const [chatInput, setChatInput] = useState("");
  const [mobileChatView, setMobileChatView] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Search filters
  const [ticketSearch, setTicketSearch] = useState("");
  const [complaintSearch, setComplaintSearch] = useState("");
  const [suggestionSearch, setSuggestionSearch] = useState("");
  const [faqSearch, setFaqSearch] = useState("");
  const [selectedFaqCategory, setSelectedFaqCategory] = useState<string>("ALL");
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>("faq-ca-grading");

  // Portal 1: Complaint Form State
  const [complaintCategory, setComplaintCategory] = useState(config.complaintCategories[0]);
  const [complaintUrgency, setComplaintUrgency] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [complaintSubject, setComplaintSubject] = useState("");
  const [complaintIncidentDate, setComplaintIncidentDate] = useState("");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [isComplaintConfidential, setIsComplaintConfidential] = useState(false);

  // Portal 2: Suggestion Form State
  const [suggestionCategory, setSuggestionCategory] = useState(config.suggestionCategories[0]);
  const [suggestionScope, setSuggestionScope] = useState(config.suggestionScopes[0]);
  const [suggestionTitle, setSuggestionTitle] = useState("");
  const [suggestionDescription, setSuggestionDescription] = useState("");
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());

  // Portal 3: Technical Form State
  const [techCategory, setTechCategory] = useState("Software Bug / Platform Issue");
  const [techPriority, setTechPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [techSubject, setTechSubject] = useState("");
  const [techDescription, setTechDescription] = useState("");

  // Discussion dialog state for Complaints and Suggestions
  const [activeDiscussionTicket, setActiveDiscussionTicket] = useState<SupportTicketItem | null>(null);
  const [discussionReplyInput, setDiscussionReplyInput] = useState("");
  const discussionEndRef = useRef<HTMLDivElement>(null);

  // Queries & Mutations
  const { data: rawTickets = [], isLoading: isTicketsLoading, refetch: refetchTickets } = useSupportTickets();
  const { data: activeTicketMessages = [], isLoading: isMessagesLoading } = useTicketMessages(
    selectedTicketId || undefined
  );
  const { data: rawDiscussionMessages = [], isLoading: isDiscussionLoading } = useTicketMessages(
    activeDiscussionTicket?.id || undefined
  );
  const createTicketMutation = useCreateTicket();
  const sendTicketMessageMutation = useSendTicketMessage();
  const { data: dbFaqs = [] } = useSupportFaqs(activeRole);

  // Strict ticket privacy isolation: only tickets belonging to current authenticated user
  const currentUserId = user?.id || (user as Record<string, unknown> | null)?.userId as string;

  const tickets = useMemo(() => {
    if (!currentUserId) return rawTickets;
    return rawTickets.filter(
      (t) => !t.userId || t.userId === currentUserId || t.userId === user?.id
    );
  }, [rawTickets, currentUserId, user?.id]);

  // Check notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const requestNotificationAccess = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === "granted") {
        toast.success("Desktop notifications enabled! You will be alerted when support replies.");
      } else {
        toast.info("Desktop notifications were not enabled. In-app alerts remain active.");
      }
    }
  };

  // Optimistic Message State for User Chat
  const [optimisticUserMessages, setOptimisticUserMessages] = useState<
    Array<{
      id: string;
      ticketId: string;
      content: string;
      createdAt: string;
      senderRole: "USER";
      senderName: string;
      senderId?: string;
      status: "sending" | "sent" | "failed";
    }>
  >([]);

  // Deduplication cache to prevent triple toasters and repeated notifications
  const lastNotifiedMessageIdsRef = useRef<Set<string>>(new Set());

  const handleSocketNewMessage = useCallback(
    (payload: any) => {
      const msg = payload?.message || payload;
      const role = msg?.senderRole;
      const senderId = msg?.senderId;

      // Never notify if sender is USER or if it originated from current user
      if (role === "USER") return;
      const currentUserId = user?.id || (user as any)?.userId;
      if (senderId && currentUserId && String(senderId) === String(currentUserId)) return;

      // Only notify when reply is genuinely from support engineers, system, or AI
      if (role === "SUPPORT_AGENT" || role === "SYSTEM" || role === "AI") {
        // Deduplicate: ignore if this message ID has already been notified
        const uniqueKey =
          msg?.id ||
          (msg?.content ? `${payload?.ticketId || ""}-${msg.content.slice(0, 30)}` : null);

        if (uniqueKey) {
          if (lastNotifiedMessageIdsRef.current.has(uniqueKey)) {
            return;
          }
          lastNotifiedMessageIdsRef.current.add(uniqueKey);
          setTimeout(() => {
            lastNotifiedMessageIdsRef.current.delete(uniqueKey);
          }, 8000);
        }

        if (soundEnabled) {
          playWhatsAppChime();
        }

        const previewText = msg?.content ? msg.content.slice(0, 65) : "New reply received from support";
        toast.info(`🔔 Support Desk: ${previewText}${msg?.content?.length > 65 ? "..." : ""}`, {
          autoClose: 5000,
        });

        triggerDesktopNotification("Qefas Support Desk", msg?.content || "New notification from support desk");
      }
    },
    [soundEnabled, user]
  );

  // Attach socket listener bound to active ticket AND user's personal room
  useSupportSocket(
    activeDiscussionTicket?.id || selectedTicketId || undefined,
    handleSocketNewMessage,
    { userId: user?.id }
  );

  // Safely extract messages array
  const messagesList = useMemo<SupportTicketMessage[]>(() => {
    if (Array.isArray(activeTicketMessages)) {
      return activeTicketMessages;
    }
    if (
      activeTicketMessages &&
      typeof activeTicketMessages === "object" &&
      "messages" in (activeTicketMessages as any)
    ) {
      const msgs = (activeTicketMessages as any).messages;
      return Array.isArray(msgs) ? msgs : [];
    }
    return [];
  }, [activeTicketMessages]);

  // Combined messages including optimistic outgoing messages for the active technical session
  const combinedChatMessages = useMemo(() => {
    const currentTicketOpts = optimisticUserMessages.filter((m) => m.ticketId === selectedTicketId);
    const filteredOpts = currentTicketOpts.filter(
      (opt) =>
        !messagesList.some(
          (b) =>
            b.content === opt.content &&
            Math.abs(new Date(b.createdAt).getTime() - new Date(opt.createdAt).getTime()) < 20000
        )
    );
    return [...messagesList, ...filteredOpts];
  }, [messagesList, optimisticUserMessages, selectedTicketId]);

  const discussionMessagesList = useMemo<SupportTicketMessage[]>(() => {
    if (Array.isArray(rawDiscussionMessages)) {
      return rawDiscussionMessages;
    }
    if (
      rawDiscussionMessages &&
      typeof rawDiscussionMessages === "object" &&
      "messages" in (rawDiscussionMessages as any)
    ) {
      const msgs = (rawDiscussionMessages as any).messages;
      return Array.isArray(msgs) ? msgs : [];
    }
    return [];
  }, [rawDiscussionMessages]);

  // Combined messages including optimistic outgoing messages for complaints/suggestions discussion thread
  const combinedDiscussionMessages = useMemo(() => {
    if (!activeDiscussionTicket) return discussionMessagesList;
    const currentOpts = optimisticUserMessages.filter((m) => m.ticketId === activeDiscussionTicket.id);
    const filteredOpts = currentOpts.filter(
      (opt) =>
        !discussionMessagesList.some(
          (b) =>
            b.content === opt.content &&
            Math.abs(new Date(b.createdAt).getTime() - new Date(opt.createdAt).getTime()) < 20000
        )
    );
    return [...discussionMessagesList, ...filteredOpts];
  }, [discussionMessagesList, optimisticUserMessages, activeDiscussionTicket]);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [combinedChatMessages, selectedTicketId]);

  useEffect(() => {
    discussionEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [combinedDiscussionMessages, activeDiscussionTicket?.id]);

  // Categorize tickets strictly belonging to current user
  const technicalTickets = useMemo(() => {
    return tickets.filter(
      (t) =>
        t.category !== "COMPLAINT" &&
        t.category !== "SUGGESTION" &&
        (ticketSearch.trim() === "" ||
          t.subject.toLowerCase().includes(ticketSearch.toLowerCase()) ||
          t.description.toLowerCase().includes(ticketSearch.toLowerCase()))
    );
  }, [tickets, ticketSearch]);

  const complaintTickets = useMemo(() => {
    return tickets.filter(
      (t) =>
        t.category === "COMPLAINT" &&
        (complaintSearch.trim() === "" ||
          t.subject.toLowerCase().includes(complaintSearch.toLowerCase()) ||
          t.description.toLowerCase().includes(complaintSearch.toLowerCase()))
    );
  }, [tickets, complaintSearch]);

  const suggestionTickets = useMemo(() => {
    return tickets.filter(
      (t) =>
        t.category === "SUGGESTION" &&
        (suggestionSearch.trim() === "" ||
          t.subject.toLowerCase().includes(suggestionSearch.toLowerCase()) ||
          t.description.toLowerCase().includes(suggestionSearch.toLowerCase()))
    );
  }, [tickets, suggestionSearch]);

  // Auto-select first technical ticket if none selected
  useEffect(() => {
    if (!selectedTicketId && technicalTickets.length > 0) {
      setSelectedTicketId(technicalTickets[0].id);
    }
  }, [technicalTickets, selectedTicketId]);

  const selectedTechnicalTicket = useMemo(() => {
    return tickets.find((t) => t.id === selectedTicketId) || null;
  }, [tickets, selectedTicketId]);

  // Dynamic Console Agent Name and Photo
  const activeSupportAgent = useMemo(() => {
    if (selectedTechnicalTicket?.assignedAgent?.name) {
      return selectedTechnicalTicket.assignedAgent.name;
    }
    const supportMsg = [...messagesList]
      .reverse()
      .find((m) => m.senderRole === "SUPPORT_AGENT" && m.senderName && m.senderName !== "Support Agent");
    return supportMsg?.senderName || null;
  }, [selectedTechnicalTicket, messagesList]);

  const activeSupportAgentPhoto = useMemo(() => {
    if (selectedTechnicalTicket?.assignedAgent?.image) {
      return selectedTechnicalTicket.assignedAgent.image;
    }
    const supportMsg = [...messagesList]
      .reverse()
      .find((m) => m.senderRole === "SUPPORT_AGENT" && m.senderImage);
    return supportMsg?.senderImage || null;
  }, [selectedTechnicalTicket, messagesList]);

  // 1. Submit Complaint
  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintSubject.trim() || !complaintDescription.trim()) {
      toast.warning("Please provide a subject and incident description.");
      return;
    }

    try {
      await createTicketMutation.mutateAsync({
        category: "COMPLAINT",
        priority: complaintUrgency,
        subject: `[${complaintCategory}] ${complaintSubject.trim()}`,
        description: `Incident Date: ${complaintIncidentDate || "Not Specified"}\nConfidential: ${isComplaintConfidential ? "YES (Protect Identity)" : "NO"
          }\n\nDetails:\n${complaintDescription.trim()}`,
      });

      toast.success("Complaint successfully lodged with administrative tracking.");
      setComplaintSubject("");
      setComplaintIncidentDate("");
      setComplaintDescription("");
      setIsComplaintConfidential(false);
      refetchTickets();
    } catch {
      toast.error("Failed to submit grievance. Please try again.");
    }
  };

  // 2. Submit Suggestion
  const handleSubmitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suggestionTitle.trim() || !suggestionDescription.trim()) {
      toast.warning("Please provide a title and detailed proposal.");
      return;
    }

    try {
      await createTicketMutation.mutateAsync({
        category: "SUGGESTION",
        priority: "MEDIUM",
        subject: `[${suggestionScope}] ${suggestionTitle.trim()}`,
        description: `Category: ${suggestionCategory}\nScope: ${suggestionScope}\n\nProposal:\n${suggestionDescription.trim()}`,
      });

      toast.success("Proposal submitted to institutional innovation council!");
      setSuggestionTitle("");
      setSuggestionDescription("");
      refetchTickets();
    } catch {
      toast.error("Failed to submit proposal. Please try again.");
    }
  };

  // 3. Create Technical Ticket
  const handleCreateTechnicalTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!techSubject.trim() || !techDescription.trim()) {
      toast.warning("Please enter a subject and error description.");
      return;
    }

    try {
      const res = await createTicketMutation.mutateAsync({
        category: techCategory,
        priority: techPriority,
        subject: techSubject.trim(),
        description: techDescription.trim(),
      });

      toast.success("Technical support session initialized!");
      setTechSubject("");
      setTechDescription("");
      setIsNewTechnicalModalOpen(false);

      if (res?.data?.id) {
        setSelectedTicketId(res.data.id);
        setMobileChatView(true);
      }
      refetchTickets();
    } catch {
      toast.error("Could not initialize support session.");
    }
  };

  // 4. Send Message in Technical Chat with Optimistic Delivery Tracking
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedTicketId) return;

    const messageText = chatInput.trim();
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const optimisticMsg = {
      id: tempId,
      ticketId: selectedTicketId,
      content: messageText,
      createdAt: nowIso,
      senderRole: "USER" as const,
      senderName: user?.name || ((user as Record<string, unknown> | null)?.fullName as string) || config.roleLabel,
      senderId: user?.id,
      status: "sending" as const,
    };

    setOptimisticUserMessages((prev) => [...prev, optimisticMsg]);
    setChatInput("");

    try {
      await sendTicketMessageMutation.mutateAsync({
        ticketId: selectedTicketId,
        content: messageText,
      });

      setOptimisticUserMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "sent" as const } : m))
      );

      setTimeout(() => {
        setOptimisticUserMessages((prev) => prev.filter((m) => m.id !== tempId));
      }, 4000);
    } catch {
      setOptimisticUserMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "failed" as const } : m))
      );
      toast.error("Failed to send message. Please retry.");
    }
  };

  const handleRetryChatMessage = async (failedMsg: { id: string; ticketId: string; content: string }) => {
    setOptimisticUserMessages((prev) =>
      prev.map((m) => (m.id === failedMsg.id ? { ...m, status: "sending" as const } : m))
    );

    try {
      await sendTicketMessageMutation.mutateAsync({
        ticketId: failedMsg.ticketId,
        content: failedMsg.content,
      });

      setOptimisticUserMessages((prev) =>
        prev.map((m) => (m.id === failedMsg.id ? { ...m, status: "sent" as const } : m))
      );

      setTimeout(() => {
        setOptimisticUserMessages((prev) => prev.filter((m) => m.id !== failedMsg.id));
      }, 4000);
    } catch {
      setOptimisticUserMessages((prev) =>
        prev.map((m) => (m.id === failedMsg.id ? { ...m, status: "failed" as const } : m))
      );
      toast.error("Message retry failed.");
    }
  };

  // 5. Send Reply in Discussion Dialog with Optimistic Delivery Tracking
  const handleSendDiscussionReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discussionReplyInput.trim() || !activeDiscussionTicket) return;

    const messageText = discussionReplyInput.trim();
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const optimisticMsg = {
      id: tempId,
      ticketId: activeDiscussionTicket.id,
      content: messageText,
      createdAt: nowIso,
      senderRole: "USER" as const,
      senderName: user?.name || ((user as Record<string, unknown> | null)?.fullName as string) || config.roleLabel,
      senderId: user?.id || ((user as Record<string, unknown> | null)?.userId as string),
      status: "sending" as const,
    };

    setOptimisticUserMessages((prev) => [...prev, optimisticMsg]);
    setDiscussionReplyInput("");

    try {
      await sendTicketMessageMutation.mutateAsync({
        ticketId: activeDiscussionTicket.id,
        content: messageText,
      });

      setOptimisticUserMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "sent" as const } : m))
      );

      setTimeout(() => {
        setOptimisticUserMessages((prev) => prev.filter((m) => m.id !== tempId));
      }, 4000);
    } catch {
      setOptimisticUserMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "failed" as const } : m))
      );
    }
  };

  const handleRetryDiscussionReply = async (failedMsg: { id: string; ticketId: string; content: string }) => {
    setOptimisticUserMessages((prev) =>
      prev.map((m) => (m.id === failedMsg.id ? { ...m, status: "sending" as const } : m))
    );

    try {
      await sendTicketMessageMutation.mutateAsync({
        ticketId: failedMsg.ticketId,
        content: failedMsg.content,
      });

      setOptimisticUserMessages((prev) =>
        prev.map((m) => (m.id === failedMsg.id ? { ...m, status: "sent" as const } : m))
      );

      setTimeout(() => {
        setOptimisticUserMessages((prev) => prev.filter((m) => m.id !== failedMsg.id));
      }, 4000);
    } catch {
      setOptimisticUserMessages((prev) =>
        prev.map((m) => (m.id === failedMsg.id ? { ...m, status: "failed" as const } : m))
      );
      toast.error("Message retry failed.");
    }
  };

  // Upvote proposal
  const toggleUpvote = (id: string) => {
    setUpvotedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        toast.info("Proposal upvoted!");
      }
      return next;
    });
  };

  // Combined FAQs (role default + backend)
  const allFaqs: FAQItem[] = useMemo(() => {
    const roleDefaultFaqs = ROLE_FAQS[activeRole] || ROLE_FAQS.TEACHER;
    const mappedDbFaqs: FAQItem[] = dbFaqs.map((df) => ({
      id: df.id,
      category: df.category.toLowerCase(),
      categoryLabel: df.categoryLabel || df.category,
      question: df.question,
      summary: df.summary || (Array.isArray(df.answer) ? df.answer.join(" ").slice(0, 90) + "..." : ""),
      answer: Array.isArray(df.answer) ? df.answer : [String(df.answer)],
    }));
    return [...roleDefaultFaqs, ...mappedDbFaqs];
  }, [activeRole, dbFaqs]);

  const filteredFaqs = useMemo(() => {
    return allFaqs.filter((item) => {
      const matchesSearch =
        faqSearch.trim() === "" ||
        item.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
        item.summary.toLowerCase().includes(faqSearch.toLowerCase());
      const matchesCat = selectedFaqCategory === "ALL" || item.category === selectedFaqCategory;
      return matchesSearch && matchesCat;
    });
  }, [allFaqs, faqSearch, selectedFaqCategory]);

  return (
    <div className="space-y-6 pb-12">
      {/* ── TOP HERO HEADER (THEMED) ─────────────────────────────────────── */}
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl bg-gradient-to-br border border-slate-800 p-6 md:p-8 shadow-2xl",
          theme.heroGradient
        )}
      >
        <div
          className={cn(
            "absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full blur-3xl pointer-events-none",
            theme.heroOrb1
          )}
        />
        <div
          className={cn(
            "absolute bottom-0 left-1/3 -mb-16 w-64 h-64 rounded-full blur-3xl pointer-events-none",
            theme.heroOrb2
          )}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border",
                theme.badge
              )}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>{config.subheading}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Support &amp; Operational Center
            </h1>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-xl">
              Real-time technical assistance with instant notifications, formal grievances, innovation suggestions, and comprehensive platform documentation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Audio Toggle */}
            <button
              onClick={() => {
                setSoundEnabled((prev) => !prev);
                toast.info(soundEnabled ? "Message sound chime muted." : "Message sound chime enabled!");
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${soundEnabled
                  ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30"
                  : "bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200"
                }`}
              title={soundEnabled ? "Mute notification sound" : "Enable notification sound"}
            >
              {soundEnabled ? (
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{soundEnabled ? "Sound ON" : "Sound Muted"}</span>
            </button>

            {/* Desktop Notification Request */}
            {notificationPermission !== "granted" && (
              <button
                onClick={requestNotificationAccess}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-300 text-xs font-bold transition-all"
              >
                <BellRing className="w-3.5 h-3.5 animate-bounce" />
                <span>Enable Alerts</span>
              </button>
            )}

            {/* WhatsApp Link */}
            <a
              href={`https://wa.me/2348165246864?text=${config.whatsappText}`}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-lg transition-all hover:scale-[1.02] active:scale-95",
                theme.btnPrimary
              )}
            >
              <Phone className="w-3.5 h-3.5" />
              <span>WhatsApp Direct</span>
            </a>
          </div>
        </div>
      </div>

      {/* ── 4 MAIN PORTAL TABS (THEMED) ──────────────────────────────────── */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-1 pb-px overflow-x-auto">
        <button
          onClick={() => setActivePortal("technical")}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 whitespace-nowrap ${activePortal === "technical"
              ? theme.tabActive
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40"
            }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Platform Technicals (Live Chat)</span>
          <span className="relative flex h-2 w-2">
            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", theme.pulseColor)} />
            <span className={cn("relative inline-flex rounded-full h-2 w-2", theme.pulseColor)} />
          </span>
        </button>

        <button
          onClick={() => setActivePortal("complaints")}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 whitespace-nowrap ${activePortal === "complaints"
              ? "border-rose-600 text-rose-600 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/30"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40"
            }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Complaints &amp; Grievances</span>
          {complaintTickets.length > 0 && (
            <Badge className="bg-rose-500 text-white text-[10px] py-0 px-1.5 h-4">
              {complaintTickets.length}
            </Badge>
          )}
        </button>

        <button
          onClick={() => setActivePortal("suggestions")}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 whitespace-nowrap ${activePortal === "suggestions"
              ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40"
            }`}
        >
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Proposals &amp; Suggestions</span>
          {suggestionTickets.length > 0 && (
            <Badge className="bg-indigo-500 text-white text-[10px] py-0 px-1.5 h-4">
              {suggestionTickets.length}
            </Badge>
          )}
        </button>

        <button
          onClick={() => setActivePortal("faq")}
          className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs rounded-t-xl transition-all border-b-2 whitespace-nowrap ${activePortal === "faq"
              ? "border-amber-600 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/30"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40"
            }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Knowledge Base &amp; FAQs</span>
        </button>
      </div>

      {/* ── PORTAL 1: LIVE TECHNICAL SUPPORT CHAT ────────────────────────── */}
      {activePortal === "technical" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[640px]">
          {/* SESSIONS LIST */}
          <div
            className={`lg:col-span-4 space-y-4 ${mobileChatView ? "hidden lg:block" : "block"
              }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Active Support Sessions
                </h3>
                <p className="text-xs text-slate-500">Your personal inquiry sessions</p>
              </div>
              <Button
                onClick={() => setIsNewTechnicalModalOpen(true)}
                size="sm"
                className={cn("text-xs font-bold rounded-xl h-8 gap-1.5 shadow-sm", theme.btnPrimary)}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Session</span>
              </Button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search ticket title or error..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
                className="pl-9 h-9 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
              {isTicketsLoading ? (
                <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <Loader2 className={cn("w-6 h-6 animate-spin mb-2", theme.textAccent)} />
                  <span className="text-xs">Synchronizing active sessions...</span>
                </div>
              ) : technicalTickets.length === 0 ? (
                <Card className="border-dashed border-slate-200 dark:border-slate-800 p-6 text-center">
                  <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mx-auto mb-3", theme.iconBg)}>
                    <LifeBuoy className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    No Active Sessions
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Encountered an issue or platform error? Launch a session to chat directly with support.
                  </p>
                  <Button
                    onClick={() => setIsNewTechnicalModalOpen(true)}
                    size="sm"
                    variant="outline"
                    className="text-xs font-bold rounded-xl h-8"
                  >
                    Start Technical Session
                  </Button>
                </Card>
              ) : (
                technicalTickets.map((t) => {
                  const isSelected = t.id === selectedTicketId;
                  const isClosed = t.status === "RESOLVED" || t.status === "CLOSED";

                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTicketId(t.id);
                        setMobileChatView(true);
                      }}
                      className={cn(
                        "p-3.5 rounded-2xl border transition-all cursor-pointer",
                        isSelected
                          ? cn("shadow-sm", theme.bgCardSelected, theme.borderSelected)
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span
                          className={`text-xs font-bold line-clamp-1 ${isSelected
                              ? theme.textAccent
                              : "text-slate-900 dark:text-white"
                            }`}
                        >
                          {t.subject}
                        </span>
                        <Badge
                          className={`text-[9px] py-0 px-1.5 uppercase font-bold shrink-0 ${isClosed
                              ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              : t.status === "IN_PROGRESS"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                                : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            }`}
                        >
                          {t.status.replace("_", " ")}
                        </Badge>
                      </div>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2">
                        {t.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(t.updatedAt || t.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className={cn("font-semibold", theme.textAccent)}>
                          {t._count?.messages || 0} msgs
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* CHAT THREAD WORKSPACE */}
          <div
            className={`lg:col-span-8 flex flex-col h-[640px] rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden ${mobileChatView ? "block" : "hidden lg:flex"
              }`}
          >
            {selectedTechnicalTicket ? (
              <>
                {/* Active Session Header with Agent Photo */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setMobileChatView(false)}
                      className="lg:hidden p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-100"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className={cn(
                      "w-10 h-10 rounded-2xl text-white flex items-center justify-center font-bold text-xs shadow-md overflow-hidden relative border border-white/20 shrink-0",
                      theme.headerAgentBg
                    )}>
                      {activeSupportAgentPhoto ? (
                        <img
                          src={activeSupportAgentPhoto}
                          alt={activeSupportAgent || "Agent"}
                          className="w-full h-full object-cover"
                        />
                      ) : activeSupportAgent ? (
                        <span>{activeSupportAgent.slice(0, 2).toUpperCase()}</span>
                      ) : (
                        <Headphones className="w-4 h-4" />
                      )}
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 shadow-xs" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs md:text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                          {activeSupportAgent || "Qefas Support Agent"}
                        </h4>
                        <Badge variant="outline" className={cn("text-[10px] py-0 px-1 font-bold border", theme.badge)}>
                          Support Agent
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {activeSupportAgent
                          ? `Assigned: ${activeSupportAgent} • ${selectedTechnicalTicket.subject}`
                          : selectedTechnicalTicket.subject}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      className={`text-[10px] uppercase font-bold py-0.5 px-2 ${selectedTechnicalTicket.priority === "URGENT"
                          ? "bg-rose-500 text-white"
                          : selectedTechnicalTicket.priority === "HIGH"
                            ? "bg-amber-500 text-white"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                    >
                      {selectedTechnicalTicket.priority}
                    </Badge>
                  </div>
                </div>

                {/* Conversation Stream */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30 dark:bg-slate-950/20">
                  {/* First system inquiry briefing */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-300 mb-1">
                      <Zap className="w-3.5 h-3.5" />
                      <span>Initial Diagnostic Briefing</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      {selectedTechnicalTicket.description}
                    </p>
                    <span className="text-[10px] text-indigo-400 mt-2 block font-semibold">
                      Logged on {new Date(selectedTechnicalTicket.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {isMessagesLoading ? (
                    <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                      <Loader2 className={cn("w-6 h-6 animate-spin mb-2", theme.textAccent)} />
                      <span className="text-xs">Loading conversation history...</span>
                    </div>
                  ) : (
                    combinedChatMessages.map((msg) => {
                      const isSupportStaff =
                        msg.senderRole === "SUPPORT_AGENT" || msg.senderRole === "SYSTEM";
                      const isAI = msg.senderRole === "AI" || msg.senderId === "AI_SYSTEM";
                      const isOptimistic = (msg as any).status !== undefined;
                      const status = (msg as any).status as "sending" | "sent" | "failed" | undefined;

                      const senderInitial = (msg.senderName || (isSupportStaff ? "SE" : "US")).slice(0, 2).toUpperCase();

                      return (
                        <div
                          key={msg.id}
                          className={`flex items-end gap-2.5 ${isSupportStaff ? "justify-start mr-auto" : "justify-end ml-auto"
                            } max-w-[85%]`}
                        >
                          {/* Agent Avatar with Photo */}
                          {isSupportStaff && (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden shadow-xs border ${isAI
                                ? "bg-emerald-600 text-white border-emerald-400/40"
                                : "bg-indigo-600 text-white border-indigo-400/30"
                              }`}>
                              {isAI ? (
                                <Bot className="w-4 h-4" />
                              ) : msg.senderImage || activeSupportAgentPhoto ? (
                                <img
                                  src={msg.senderImage || activeSupportAgentPhoto!}
                                  alt={msg.senderName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                senderInitial
                              )}
                            </div>
                          )}

                          <div className={`flex flex-col ${isSupportStaff ? "items-start" : "items-end"}`}>
                            <div
                              className={`p-3 rounded-2xl text-xs leading-relaxed ${isAI
                                  ? "bg-emerald-600 text-white rounded-bl-none shadow-sm"
                                  : isSupportStaff
                                    ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm"
                                    : cn("text-white rounded-br-none shadow-sm", theme.chatBubble)
                                }`}
                            >
                              <div className="flex items-center gap-1.5 mb-1 text-[10px] opacity-80 font-bold">
                                <span>{msg.senderName}</span>
                                {isAI && (
                                  <Badge className="bg-emerald-700 text-white text-[9px] py-0 px-1 font-semibold">
                                    AI Assist
                                  </Badge>
                                )}
                                {!isAI && isSupportStaff && (
                                  <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 text-[9px] py-0 px-1 font-semibold">
                                    Support Agent
                                  </Badge>
                                )}
                              </div>
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                            </div>

                            <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-400">
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>

                              {!isSupportStaff && (
                                <>
                                  {isOptimistic && status === "sending" && (
                                    <span className="flex items-center gap-0.5 text-amber-500">
                                      <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                      <span>Sending...</span>
                                    </span>
                                  )}
                                  {isOptimistic && status === "sent" && (
                                    <span className="flex items-center gap-0.5 text-emerald-500">
                                      <CheckCheck className="w-3 h-3" />
                                      <span>Sent</span>
                                    </span>
                                  )}
                                  {isOptimistic && status === "failed" && (
                                    <span className="flex items-center gap-1 text-rose-500">
                                      <span>Failed</span>
                                      <button
                                        onClick={() => handleRetryChatMessage(msg as any)}
                                        className="underline font-bold text-rose-600 hover:text-rose-700"
                                      >
                                        Retry
                                      </button>
                                    </span>
                                  )}
                                  {!isOptimistic && <CheckCheck className="w-3 h-3 text-emerald-500" />}
                                </>
                              )}
                            </div>
                          </div>

                          {!isSupportStaff && (
                            <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                              {senderInitial}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input Box (Themed) */}
                <form
                  onSubmit={handleSendChatMessage}
                  className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
                >
                  <Input
                    placeholder="Type technical reply or diagnostic follow-up..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
                  />
                  <Button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className={cn(
                      "h-10 px-4 font-bold rounded-xl text-xs gap-1.5 shrink-0 shadow-sm",
                      theme.btnPrimary
                    )}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <LifeBuoy className="w-10 h-10 mb-3 text-slate-300 dark:text-slate-700" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                  No Session Selected
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mb-4">
                  Select an inquiry from the left panel or click 'New Session' to start chatting directly with platform engineers.
                </p>
                <Button
                  onClick={() => setIsNewTechnicalModalOpen(true)}
                  className={cn("font-bold text-xs rounded-xl", theme.btnPrimary)}
                >
                  Launch Technical Ticket
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PORTAL 2: COMPLAINTS & GRIEVANCES ────────────────────────────── */}
      {activePortal === "complaints" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Lodge Complaint Card */}
          <div className="lg:col-span-5">
            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-rose-500/10 via-transparent to-transparent border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>Institutional Grievance Portal</span>
                </div>
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                  Lodge Official Complaint
                </CardTitle>
                <CardDescription className="text-xs">
                  Formal report routed directly to institutional leadership and school management.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <form onSubmit={handleSubmitComplaint} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Issue Category
                    </label>
                    <select
                      value={complaintCategory}
                      onChange={(e) => setComplaintCategory(e.target.value)}
                      className="w-full h-10 px-3 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      {config.complaintCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Urgency Level
                      </label>
                      <select
                        value={complaintUrgency}
                        onChange={(e) => setComplaintUrgency(e.target.value as any)}
                        className="w-full h-10 px-3 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="LOW">Low (Routine)</option>
                        <option value="MEDIUM">Medium (Normal)</option>
                        <option value="HIGH">High (Urgent Attention)</option>
                        <option value="URGENT">Critical Emergency</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Incident Date
                      </label>
                      <Input
                        type="date"
                        value={complaintIncidentDate}
                        onChange={(e) => setComplaintIncidentDate(e.target.value)}
                        className="h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Subject / Summary
                    </label>
                    <Input
                      placeholder="e.g. Facility outage, billing dispute, academic grievance..."
                      value={complaintSubject}
                      onChange={(e) => setComplaintSubject(e.target.value)}
                      required
                      className="h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Detailed Account &amp; Evidence
                    </label>
                    <Textarea
                      placeholder="Describe what occurred, who was affected, and immediate impact..."
                      value={complaintDescription}
                      onChange={(e) => setComplaintDescription(e.target.value)}
                      required
                      rows={4}
                      className="text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                    <input
                      type="checkbox"
                      id="confidentialCheck"
                      checked={isComplaintConfidential}
                      onChange={(e) => setIsComplaintConfidential(e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                    />
                    <label
                      htmlFor="confidentialCheck"
                      className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer"
                    >
                      Keep identity confidential (Visible only to Principal)
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={createTicketMutation.isPending}
                    className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md gap-2"
                  >
                    {createTicketMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>Submit Formal Grievance</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Grievance Tracking List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Your Grievance History
                </h3>
                <p className="text-xs text-slate-500">Click any report to view administrator replies</p>
              </div>

              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Filter complaints..."
                  value={complaintSearch}
                  onChange={(e) => setComplaintSearch(e.target.value)}
                  className="pl-8 h-8 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>

            <div className="space-y-3">
              {complaintTickets.length === 0 ? (
                <Card className="p-8 text-center border-dashed border-slate-200 dark:border-slate-800">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    No Complaints Filed
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    No active or historical grievances on your record.
                  </p>
                </Card>
              ) : (
                complaintTickets.map((item) => (
                  <Card
                    key={item.id}
                    onClick={() => setActiveDiscussionTicket(item)}
                    className="p-4 rounded-2xl border-slate-200 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-900/60 transition-all cursor-pointer hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block hover:text-rose-600 transition-colors">
                          {item.subject}
                        </span>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                            {item._count?.messages || 0} Replies
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Badge
                          className={`text-[9px] py-0 px-2 font-bold uppercase ${item.priority === "URGENT"
                              ? "bg-rose-500 text-white"
                              : item.priority === "HIGH"
                                ? "bg-amber-500 text-white"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            }`}
                        >
                          {item.priority}
                        </Badge>
                        <Badge
                          className={`text-[9px] py-0 px-2 font-bold uppercase ${item.status === "RESOLVED"
                              ? "bg-emerald-500 text-white"
                              : item.status === "IN_PROGRESS"
                                ? "bg-amber-500 text-white"
                                : "bg-slate-500 text-white"
                            }`}
                        >
                          {item.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PORTAL 3: PROPOSALS & SUGGESTIONS ────────────────────────────── */}
      {activePortal === "suggestions" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Submit Proposal Card */}
          <div className="lg:col-span-5">
            <Card className="rounded-3xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-500/10 via-transparent to-transparent border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <Lightbulb className="w-4 h-4" />
                  <span>Innovation Council</span>
                </div>
                <CardTitle className="text-lg font-black text-slate-900 dark:text-white">
                  Propose Improvement Idea
                </CardTitle>
                <CardDescription className="text-xs">
                  Propose educational enhancements, workflow automations, or school ideas.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 space-y-4">
                <form onSubmit={handleSubmitSuggestion} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Proposal Area
                    </label>
                    <select
                      value={suggestionCategory}
                      onChange={(e) => setSuggestionCategory(e.target.value)}
                      className="w-full h-10 px-3 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      {config.suggestionCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Impact Scope
                    </label>
                    <select
                      value={suggestionScope}
                      onChange={(e) => setSuggestionScope(e.target.value)}
                      className="w-full h-10 px-3 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
                    >
                      {config.suggestionScopes.map((scope) => (
                        <option key={scope} value={scope}>
                          {scope}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Proposal Title
                    </label>
                    <Input
                      placeholder="e.g. Automated Attendance SMS to Parents, Digital Library..."
                      value={suggestionTitle}
                      onChange={(e) => setSuggestionTitle(e.target.value)}
                      required
                      className="h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Description &amp; Anticipated Benefits
                    </label>
                    <Textarea
                      placeholder="Outline how this improves school operations, saves time, or enriches learning..."
                      value={suggestionDescription}
                      onChange={(e) => setSuggestionDescription(e.target.value)}
                      required
                      rows={5}
                      className="text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={createTicketMutation.isPending}
                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md gap-2"
                  >
                    {createTicketMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Lightbulb className="w-4 h-4" />
                    )}
                    <span>Submit to Innovation Council</span>
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Proposals Feed */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Your Submitted Proposals &amp; Ideas
                </h3>
                <p className="text-xs text-slate-500">Click any idea to view feedback from administrators</p>
              </div>

              <div className="relative w-full sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Filter suggestions..."
                  value={suggestionSearch}
                  onChange={(e) => setSuggestionSearch(e.target.value)}
                  className="pl-8 h-8 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>

            <div className="space-y-3">
              {suggestionTickets.length === 0 ? (
                <Card className="p-8 text-center border-dashed border-slate-200 dark:border-slate-800">
                  <Lightbulb className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    No Suggestions Submitted
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Be the first to submit an institutional idea or workflow suggestion!
                  </p>
                </Card>
              ) : (
                suggestionTickets.map((item) => (
                  <Card
                    key={item.id}
                    onClick={() => setActiveDiscussionTicket(item)}
                    className="p-4 rounded-2xl border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-900/60 transition-all cursor-pointer hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block hover:text-indigo-600 transition-colors">
                          {item.subject}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                            {item._count?.messages || 0} Discussion Replies
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleUpvote(item.id);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all ${upvotedIds.has(item.id)
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                          }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{upvotedIds.has(item.id) ? 1 : 0}</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── PORTAL 4: KNOWLEDGE BASE & FAQS ──────────────────────────────── */}
      {activePortal === "faq" && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search knowledge base articles, solutions, guides..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="pl-10 h-11 text-xs md:text-sm rounded-2xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedFaqCategory("ALL")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedFaqCategory === "ALL"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
              >
                All Topics
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;

              return (
                <Card
                  key={faq.id}
                  className={cn(
                    "rounded-2xl border transition-all",
                    isExpanded
                      ? cn("shadow-sm", theme.bgCardSelected, theme.borderSelected)
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900"
                  )}
                >
                  <CardHeader
                    onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                    className="p-4 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <Badge variant="outline" className="text-[10px] py-0 px-2 font-bold mb-1">
                          {faq.categoryLabel}
                        </Badge>
                        <CardTitle className="text-xs md:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {faq.question}
                        </CardTitle>
                      </div>
                      <button className="p-1 text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </CardHeader>

                  {isExpanded && (
                    <CardContent className="px-4 pb-4 pt-0 space-y-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                      {faq.answer.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MODAL: START NEW TECHNICAL SESSION ───────────────────────────── */}
      <Dialog open={isNewTechnicalModalOpen} onOpenChange={setIsNewTechnicalModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Cpu className={cn("w-5 h-5", theme.textAccent)} />
              <span>Start Live Technical Support Session</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Initialize a real-time diagnostic inquiry with Qefas engineering staff.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTechnicalTicket} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Technical Category
              </label>
              <select
                value={techCategory}
                onChange={(e) => setTechCategory(e.target.value)}
                className="w-full h-10 px-3 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none"
              >
                <option value="Software Bug / Platform Issue">Software Bug / Platform Issue</option>
                <option value="Score Sheet & Grade Upload Failure">Score Sheet & Grade Upload Failure</option>
                <option value="Exam Paper Blueprint Error">Exam Paper Blueprint Error</option>
                <option value="Attendance / Mobile Sync Bug">Attendance / Mobile Sync Bug</option>
                <option value="School Switcher & Linking Issue">School Switcher & Linking Issue</option>
                <option value="Other Technical Glitch">Other Technical Glitch</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Priority
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(["LOW", "MEDIUM", "HIGH", "URGENT"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTechPriority(p)}
                    className={cn(
                      "py-2 rounded-xl text-xs font-bold border transition-all",
                      techPriority === p
                        ? theme.btnPrimary
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Summary / Subject
              </label>
              <Input
                placeholder="e.g. Cannot save Continuous Assessment scores..."
                value={techSubject}
                onChange={(e) => setTechSubject(e.target.value)}
                required
                className="h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Error Message / Description
              </label>
              <Textarea
                placeholder="Paste error logs, URL where failure happened, or reproduction steps..."
                value={techDescription}
                onChange={(e) => setTechDescription(e.target.value)}
                required
                rows={3}
                className="text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewTechnicalModalOpen(false)}
                className="text-xs rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTicketMutation.isPending}
                className={cn("text-xs font-bold rounded-xl gap-1.5", theme.btnPrimary)}
              >
                {createTicketMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Launch Session</span>
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── DIALOG: TWO-WAY DISCUSSION FOR COMPLAINT / SUGGESTION ────────── */}
      <Dialog
        open={Boolean(activeDiscussionTicket)}
        onOpenChange={(open) => !open && setActiveDiscussionTicket(null)}
      >
        <DialogContent className="max-w-2xl rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col">
          {activeDiscussionTicket && (
            <>
              <DialogHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge
                    className={`text-[9px] py-0 px-2 font-bold uppercase ${activeDiscussionTicket.category === "COMPLAINT"
                        ? "bg-rose-500 text-white"
                        : "bg-indigo-500 text-white"
                      }`}
                  >
                    {activeDiscussionTicket.category || "General Support"}
                  </Badge>
                  <span className="text-[10px] text-slate-400">
                    ID: {activeDiscussionTicket.id.slice(0, 8)}
                  </span>
                </div>
                <DialogTitle className="text-base font-black text-slate-900 dark:text-white line-clamp-1">
                  {activeDiscussionTicket.subject}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Two-way discussion thread between you and institutional administration.
                </DialogDescription>
              </DialogHeader>

              {/* Initial Statement */}
              <div className="p-3 my-2 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Original Statement:
                </span>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {activeDiscussionTicket.description}
                </p>
              </div>

              {/* Discussion Thread Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 p-2 min-h-[200px] max-h-[340px] bg-slate-50/30 dark:bg-slate-950/20 rounded-2xl border border-slate-100 dark:border-slate-800/40">
                {isDiscussionLoading ? (
                  <div className="flex flex-col items-center justify-center p-8 text-slate-400">
                    <Loader2 className={cn("w-5 h-5 animate-spin mb-2", theme.textAccent)} />
                    <span className="text-xs">Loading replies...</span>
                  </div>
                ) : combinedDiscussionMessages.length === 0 ? (
                  <div className="text-center p-6 text-slate-400 text-xs">
                    No responses yet. Administration has received your report.
                  </div>
                ) : (
                  combinedDiscussionMessages.map((msg) => {
                    const isSupportStaff =
                      msg.senderRole === "SUPPORT_AGENT" || msg.senderRole === "SYSTEM";
                    const senderInitial = (msg.senderName || (isSupportStaff ? "SA" : "ME")).slice(0, 2).toUpperCase();

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2 ${
                          isSupportStaff ? "justify-start mr-auto" : "justify-end ml-auto"
                        } max-w-[85%]`}
                      >
                        {isSupportStaff && (
                          <div
                            className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0 overflow-hidden shadow-xs border border-indigo-400/30"
                            title={msg.senderName || "Support Officer"}
                          >
                            {msg.senderImage || activeSupportAgentPhoto ? (
                              <img
                                src={msg.senderImage || activeSupportAgentPhoto!}
                                alt={msg.senderName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              senderInitial
                            )}
                          </div>
                        )}

                        <div className={`flex flex-col ${isSupportStaff ? "items-start" : "items-end"}`}>
                          <div
                            className={`p-3 rounded-2xl text-xs leading-relaxed ${
                              isSupportStaff
                                ? "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm"
                                : cn("text-white rounded-br-none shadow-sm", theme.chatBubble)
                            }`}
                          >
                            <span className="block text-[10px] font-bold opacity-75 mb-0.5">
                              {msg.senderName || (isSupportStaff ? "Administrator" : "You")}
                            </span>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                          </div>

                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>

                            {!isSupportStaff && (
                              <>
                                {(msg as any).status === "sending" && (
                                  <span className="flex items-center gap-1 text-slate-400 font-medium">
                                    <Clock className="w-2.5 h-2.5 animate-spin" />
                                    <span>Sending...</span>
                                  </span>
                                )}
                                {(msg as any).status === "sent" && (
                                  <span className="text-emerald-500 font-bold flex items-center" title="Delivered">
                                    <CheckCheck className="w-3 h-3" />
                                  </span>
                                )}
                                {(msg as any).status === "failed" && (
                                  <div className="flex items-center gap-1 text-rose-500 font-bold">
                                    <AlertCircle className="w-2.5 h-2.5" />
                                    <span>Failed</span>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRetryDiscussionReply({
                                          id: msg.id,
                                          ticketId: activeDiscussionTicket.id,
                                          content: msg.content,
                                        })
                                      }
                                      className="underline ml-0.5 text-[10px] text-indigo-500 hover:text-indigo-600 cursor-pointer font-bold"
                                    >
                                      Retry
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        {!isSupportStaff && (
                          <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[9px] font-bold shrink-0">
                            {senderInitial}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={discussionEndRef} />
              </div>

              {/* Reply Input Bar */}
              <form onSubmit={handleSendDiscussionReply} className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Input
                  placeholder="Post response to administrator..."
                  value={discussionReplyInput}
                  onChange={(e) => setDiscussionReplyInput(e.target.value)}
                  className="flex-1 h-10 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
                <Button
                  type="submit"
                  disabled={!discussionReplyInput.trim() || sendTicketMessageMutation.isPending}
                  className={cn("h-10 px-4 text-white text-xs font-bold rounded-xl gap-1.5 shadow-sm", theme.btnPrimary)}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </Button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
