"use client";

import React, { useState, useMemo } from "react";
import {
  BellRing,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Mail,
  CreditCard,
  MessageSquare,
  Lightbulb,
  Radio,
  Send,
  Trash2,
  Edit2,
  Power,
  Users,
  Zap,
  Check,
  Server,
  UserPlus,
  Sparkles,
  Loader2,
  Copy,
  Hash,
  CheckCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  usePlatformRecipients,
  useCreateRecipient,
  useUpdateRecipient,
  useToggleRecipient,
  useDeleteRecipient,
  useSendTestAlert,
  type AlertRecipient,
  type AlertEventType,
} from "@/lib/api/hooks/usePlatformNotifications";
import { toast } from "react-toastify";

const EVENT_TYPE_CONFIGS: Record<
  AlertEventType,
  {
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    badgeBg: string;
  }
> = {
  NEW_USERS: {
    label: "New User Registrations",
    description: "New schools, teachers, students, and parent account onboardings",
    icon: UserPlus,
    color: "text-cyan-500",
    badgeBg: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border-cyan-300",
  },
  PAYMENTS: {
    label: "Payments & Invoices",
    description: "Tuition settlements, gateway callbacks, card deposits & fee receipts",
    icon: CreditCard,
    color: "text-emerald-500",
    badgeBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300",
  },
  SUBSCRIPTIONS: {
    label: "Plan Subscriptions",
    description: "Subscription activations, tier upgrades, renewals & 100% coupon activations",
    icon: Sparkles,
    color: "text-purple-500",
    badgeBg: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-300",
  },
  COMPLAINTS: {
    label: "Grievances & Complaints",
    description: "Escalated parent grievances, teacher facility & collision reports",
    icon: AlertTriangle,
    color: "text-rose-500",
    badgeBg: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-300",
  },
  SUGGESTIONS: {
    label: "Proposals & Ideas",
    description: "Community proposals, curriculum feedback & feature requests",
    icon: Lightbulb,
    color: "text-amber-500",
    badgeBg: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300",
  },
  INQUIRIES: {
    label: "Support Inquiries",
    description: "Live chat escalation requests, technical support tickets & portal bugs",
    icon: MessageSquare,
    color: "text-blue-500",
    badgeBg: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-300",
  },
  SYSTEM_ALERTS: {
    label: "System & Infrastructure",
    description: "Database latency warnings, background job failures & security anomalies",
    icon: Server,
    color: "text-slate-500",
    badgeBg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300",
  },
};

const ALL_EVENT_TYPES: AlertEventType[] = [
  "NEW_USERS",
  "PAYMENTS",
  "SUBSCRIPTIONS",
  "COMPLAINTS",
  "SUGGESTIONS",
  "INQUIRIES",
  "SYSTEM_ALERTS",
];

export default function NotificationRoutingPage() {
  const { data: recipients = [], isLoading, refetch } = usePlatformRecipients();
  const createMutation = useCreateRecipient();
  const updateMutation = useUpdateRecipient();
  const toggleMutation = useToggleRecipient();
  const deleteMutation = useDeleteRecipient();
  const testAlertMutation = useSendTestAlert();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventFilter, setSelectedEventFilter] = useState<AlertEventType | "ALL">("ALL");

  // Per-item loading indicators
  const [testingRecipientId, setTestingRecipientId] = useState<string | null>(null);
  const [togglingRecipientId, setTogglingRecipientId] = useState<string | null>(null);
  const [deletingRecipientId, setDeletingRecipientId] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Dialog states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<AlertRecipient | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<AlertEventType[]>([]);

  // Filtered recipients
  const filteredRecipients = useMemo(() => {
    return recipients.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.role && r.role.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesEvent =
        selectedEventFilter === "ALL" || r.events.includes(selectedEventFilter);

      return matchesSearch && matchesEvent;
    });
  }, [recipients, searchQuery, selectedEventFilter]);

  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("");
    setSelectedEvents(["NEW_USERS", "PAYMENTS", "SUBSCRIPTIONS"]);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (recipient: AlertRecipient) => {
    setEditingRecipient(recipient);
    setName(recipient.name);
    setEmail(recipient.email);
    setRole(recipient.role || "");
    setSelectedEvents(recipient.events);
  };

  const toggleEventSelection = (eventType: AlertEventType) => {
    setSelectedEvents((prev) =>
      prev.includes(eventType)
        ? prev.filter((t) => t !== eventType)
        : [...prev, eventType]
    );
  };

  const selectAllEvents = () => {
    setSelectedEvents([...ALL_EVENT_TYPES]);
  };

  const clearAllEvents = () => {
    setSelectedEvents([]);
  };

  const handleCopyEmail = (emailAddress: string) => {
    navigator.clipboard.writeText(emailAddress);
    setCopiedEmail(emailAddress);
    toast.info(`Copied ${emailAddress} to clipboard`);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.warning("Name and Email are required.");
      return;
    }
    if (selectedEvents.length === 0) {
      toast.warning("Select at least one event stream to route.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        role: role.trim() || undefined,
        events: selectedEvents,
        isActive: true,
      });
      toast.success("Routing recipient registered successfully!");
      setIsAddModalOpen(false);
      resetForm();
    } catch {
      toast.error("Failed to add routing recipient.");
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecipient) return;
    if (!name.trim() || !email.trim()) {
      toast.warning("Name and Email are required.");
      return;
    }
    if (selectedEvents.length === 0) {
      toast.warning("Select at least one event stream to route.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: editingRecipient.id,
        data: {
          name: name.trim(),
          email: email.trim(),
          role: role.trim() || undefined,
          events: selectedEvents,
        },
      });
      toast.success("Routing recipient updated successfully!");
      setEditingRecipient(null);
      resetForm();
    } catch {
      toast.error("Failed to update routing recipient.");
    }
  };

  const handleToggle = async (recipient: AlertRecipient) => {
    setTogglingRecipientId(recipient.id);
    try {
      await toggleMutation.mutateAsync(recipient.id);
      toast.info(
        recipient.isActive
          ? `Muted alerts for ${recipient.name}`
          : `Activated alerts for ${recipient.name}`
      );
    } catch {
      toast.error("Could not toggle recipient status.");
    } finally {
      setTogglingRecipientId(null);
    }
  };

  const handleDelete = async (recipient: AlertRecipient) => {
    if (!window.confirm(`Permanently remove ${recipient.name} from alert routing?`)) return;
    setDeletingRecipientId(recipient.id);
    try {
      await deleteMutation.mutateAsync(recipient.id);
      toast.success(`Removed ${recipient.name} from routing roster.`);
    } catch {
      toast.error("Could not delete recipient.");
    } finally {
      setDeletingRecipientId(null);
    }
  };

  const handleTestAlert = async (recipient: AlertRecipient) => {
    setTestingRecipientId(recipient.id);
    try {
      await testAlertMutation.mutateAsync(recipient.id);
      toast.success(`Direct email alert successfully dispatched to ${recipient.email}! Check inbox.`);
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message || (err as Error)?.message || "Test alert dispatch failed.";
      toast.error(`Dispatch error: ${errorMsg}`);
    } finally {
      setTestingRecipientId(null);
    }
  };

  const activeRecipientsCount = useMemo(
    () => recipients.filter((r) => r.isActive).length,
    [recipients]
  );

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* ── TOP HERO HEADER ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-950 via-slate-950 to-slate-900 p-6 md:p-8 text-white shadow-xl border border-indigo-500/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Platform Email Alert Routing Matrix</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <BellRing className="w-7 h-7 text-indigo-400" />
              Notification Routing &amp; Email Alert Dispatcher
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
              Configure which team members, managers, and operational leads receive instant direct email alerts when new users register, payments succeed, subscriptions change, or customer grievances are escalated.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="rounded-xl border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-bold h-10 px-3.5 gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Sync Status</span>
            </Button>
            <Button
              onClick={handleOpenAdd}
              size="sm"
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold h-10 px-4 shadow-md gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Recipient</span>
            </Button>
          </div>
        </div>

        {/* ── METRIC TILES ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[11px] text-slate-400 font-medium">Active Alert Routes</p>
            <p className="text-xl md:text-2xl font-black text-white mt-1">
              {activeRecipientsCount} <span className="text-xs font-normal text-slate-400">/ {recipients.length} total</span>
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[11px] text-slate-400 font-medium">Monitored Streams</p>
            <p className="text-xl md:text-2xl font-black text-white mt-1">7 Event Types</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[11px] text-slate-400 font-medium">Email Dispatch Engine</p>
            <p className="text-xl md:text-2xl font-black text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Operational
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[11px] text-slate-400 font-medium">Delivery Guarantee</p>
            <p className="text-xl md:text-2xl font-black text-cyan-400 mt-1 flex items-center gap-1.5">
              <Zap className="w-5 h-5 text-cyan-400" />
              Verified Direct
            </p>
          </div>
        </div>
      </div>

      {/* ── EVENT STREAM CARDS ────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-500" />
            Active Platform Event Channels (7)
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Click any channel below to filter the recipients roster
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {ALL_EVENT_TYPES.map((type) => {
            const cfg = EVENT_TYPE_CONFIGS[type];
            const Icon = cfg.icon;
            const countForType = recipients.filter((r) => r.isActive && r.events.includes(type)).length;
            const isFilterSelected = selectedEventFilter === type;

            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedEventFilter(isFilterSelected ? "ALL" : type)}
                className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                  isFilterSelected
                    ? "bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 ${cfg.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {countForType}
                  </Badge>
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {cfg.label}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                  {cfg.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RECIPIENTS ROSTER ─────────────────────────────────────────── */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm p-6">
        <CardHeader className="p-0 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Alert Routing Directory ({filteredRecipients.length})
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs mt-1">
                Designated recipients who receive immediate email dispatches when monitored platform events fire.
              </CardDescription>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or role..."
                  className="pl-8 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
              {selectedEventFilter !== "ALL" && (
                <Button
                  onClick={() => setSelectedEventFilter("ALL")}
                  variant="ghost"
                  size="sm"
                  className="h-9 px-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer"
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 pt-6">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <RefreshCw className="w-7 h-7 animate-spin mx-auto text-indigo-500" />
              <p className="text-xs font-medium">Loading routing matrix...</p>
            </div>
          ) : filteredRecipients.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <BellRing className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                No alert recipients found
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery || selectedEventFilter !== "ALL"
                  ? "Try adjusting your search query or channel filter."
                  : "Add your first operations, finance, or customer success lead to begin routing alerts."}
              </p>
              <Button
                onClick={handleOpenAdd}
                size="sm"
                className="rounded-xl bg-indigo-600 text-white font-bold text-xs cursor-pointer mt-2"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Recipient
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecipients.map((recipient, idx) => {
                const isTestingThis = testingRecipientId === recipient.id;
                const isTogglingThis = togglingRecipientId === recipient.id;
                const isDeletingThis = deletingRecipientId === recipient.id;

                return (
                  <div
                    key={recipient.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 hover:border-indigo-500/30 hover:shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
                  >
                    {/* Left: Number + Avatar + Identity */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                      {/* Number Badge */}
                      <div className="size-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 text-xs font-black flex items-center justify-center shrink-0 tabular-nums">
                        #{String(idx + 1).padStart(2, "0")}
                      </div>

                      {/* Avatar with Status Pulse */}
                      <div className="relative shrink-0">
                        <div className="size-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-black text-sm flex items-center justify-center shadow-xs border border-indigo-400/40">
                          {recipient.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white dark:border-slate-900 ${
                            recipient.isActive ? "bg-emerald-500 ring-2 ring-emerald-500/20" : "bg-slate-400"
                          }`}
                          title={recipient.isActive ? "Active Route" : "Muted Route"}
                        />
                      </div>

                      {/* Identity Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                            {recipient.name}
                          </h4>
                          <Badge
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              recipient.isActive
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            <span className={`size-1.5 rounded-full mr-1.5 ${recipient.isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                            {recipient.isActive ? "Active Alerts" : "Muted"}
                          </Badge>
                          {recipient.role && (
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800/60 px-2 py-0.5 rounded-md">
                              {recipient.role}
                            </span>
                          )}
                        </div>

                        {/* Email with copy button */}
                        <div className="flex items-center gap-2 mt-1">
                          <a
                            href={`mailto:${recipient.email}`}
                            className="text-xs text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5 truncate font-medium"
                          >
                            <Mail className="size-3.5 text-slate-400 shrink-0" />
                            <span>{recipient.email}</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopyEmail(recipient.email)}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5"
                            title="Copy email address"
                          >
                            {copiedEmail === recipient.email ? (
                              <CheckCheck className="size-3 text-emerald-500" />
                            ) : (
                              <Copy className="size-3" />
                            )}
                          </button>
                        </div>

                        {/* Subscribed Channel Badges */}
                        <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                          {recipient.events.map((ev) => {
                            const cfg = EVENT_TYPE_CONFIGS[ev];
                            if (!cfg) return null;
                            const EvIcon = cfg.icon;
                            return (
                              <span
                                key={ev}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border flex items-center gap-1 shadow-2xs ${cfg.badgeBg}`}
                              >
                                <EvIcon className="size-3" />
                                <span>{cfg.label}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end lg:self-center shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-800 w-full lg:w-auto justify-end">
                      {/* Test Alert Button with Loading State */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestAlert(recipient)}
                        disabled={isTestingThis || isTogglingThis || isDeletingThis}
                        title="Send test dispatch email to this recipient immediately"
                        className="h-8.5 px-3 rounded-xl border-slate-200 dark:border-slate-700 text-xs font-bold gap-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer shadow-xs disabled:opacity-60"
                      >
                        {isTestingThis ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin text-indigo-500" />
                            <span>Dispatching...</span>
                          </>
                        ) : (
                          <>
                            <Send className="size-3.5 text-indigo-500" />
                            <span>Test Alert</span>
                          </>
                        )}
                      </Button>

                      {/* Enable / Mute Button with Loading State */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(recipient)}
                        disabled={isTestingThis || isTogglingThis || isDeletingThis}
                        title={recipient.isActive ? "Mute all alert dispatches for this recipient" : "Activate alert dispatches for this recipient"}
                        className={`h-8.5 px-3 rounded-xl text-xs font-bold gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-60 ${
                          recipient.isActive
                            ? "border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900/60 dark:text-amber-300 dark:hover:bg-amber-950/40"
                            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/60 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                        }`}
                      >
                        {isTogglingThis ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <Power className="size-3.5" />
                            <span>{recipient.isActive ? "Mute" : "Enable"}</span>
                          </>
                        )}
                      </Button>

                      {/* Edit Button */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(recipient)}
                        disabled={isTestingThis || isTogglingThis || isDeletingThis}
                        title="Edit recipient details and channel subscriptions"
                        className="h-8.5 w-8.5 p-0 rounded-xl border-slate-200 dark:border-slate-700 text-slate-600 hover:text-slate-900 dark:hover:text-white cursor-pointer shadow-xs"
                      >
                        <Edit2 className="size-3.5" />
                      </Button>

                      {/* Delete Button with Loading State */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(recipient)}
                        disabled={isTestingThis || isTogglingThis || isDeletingThis}
                        title="Remove recipient from routing directory"
                        className="h-8.5 w-8.5 p-0 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                      >
                        {isDeletingThis ? (
                          <Loader2 className="size-3.5 animate-spin text-rose-500" />
                        ) : (
                          <Trash2 className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── MODAL: ADD RECIPIENT ─────────────────────────────────────── */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-lg rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Plus className="w-4 h-4" />
              <span>New Routing Rule</span>
            </div>
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
              Add Alert Recipient
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Enter the staff member&apos;s details and select the event channels they will receive alerts for.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitAdd} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Full Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Samuel Adekunle"
                required
                className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Official Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="samuel@qefas.com"
                required
                className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Operational Role (Optional)
              </label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Lead Technical Engineer, Financial Auditor"
                className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold"
              />
            </div>

            {/* Event Channels Multi-select */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Subscribed Channels ({selectedEvents.length} of {ALL_EVENT_TYPES.length})
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllEvents}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={clearAllEvents}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {ALL_EVENT_TYPES.map((ev) => {
                  const cfg = EVENT_TYPE_CONFIGS[ev];
                  const Icon = cfg.icon;
                  const isChecked = selectedEvents.includes(ev);

                  return (
                    <button
                      key={ev}
                      type="button"
                      onClick={() => toggleEventSelection(ev)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        isChecked
                          ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 shadow-2xs"
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`size-4.5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                          isChecked
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                        }`}
                      >
                        {isChecked && <Check className="size-3" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`size-3.5 ${cfg.color}`} />
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {cfg.label}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed line-clamp-1">
                          {cfg.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl text-xs font-bold h-10 px-4 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold h-10 px-5 cursor-pointer shadow-sm"
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <span>Add Recipient</span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── MODAL: EDIT RECIPIENT ────────────────────────────────────── */}
      <Dialog open={!!editingRecipient} onOpenChange={(open) => !open && setEditingRecipient(null)}>
        <DialogContent className="max-w-lg rounded-3xl p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Edit2 className="w-4 h-4" />
              <span>Update Routing Rule</span>
            </div>
            <DialogTitle className="text-lg font-black text-slate-900 dark:text-white">
              Edit Recipient: {editingRecipient?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update recipient details and channel subscriptions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitEdit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Full Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Official Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Operational Role (Optional)
              </label>
              <Input
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-semibold"
              />
            </div>

            {/* Event Channels Multi-select */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Subscribed Channels ({selectedEvents.length} of {ALL_EVENT_TYPES.length})
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllEvents}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={clearAllEvents}
                    className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {ALL_EVENT_TYPES.map((ev) => {
                  const cfg = EVENT_TYPE_CONFIGS[ev];
                  const Icon = cfg.icon;
                  const isChecked = selectedEvents.includes(ev);

                  return (
                    <button
                      key={ev}
                      type="button"
                      onClick={() => toggleEventSelection(ev)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                        isChecked
                          ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 shadow-2xs"
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`size-4.5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                          isChecked
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                        }`}
                      >
                        {isChecked && <Check className="size-3" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`size-3.5 ${cfg.color}`} />
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {cfg.label}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed line-clamp-1">
                          {cfg.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingRecipient(null)}
                className="rounded-xl text-xs font-bold h-10 px-4 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold h-10 px-5 cursor-pointer shadow-sm"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
