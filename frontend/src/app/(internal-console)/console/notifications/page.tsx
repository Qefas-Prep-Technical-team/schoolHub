"use client";

import React, { useState, useMemo } from "react";
import {
  BellRing,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  Shield,
  CreditCard,
  MessageSquare,
  HelpCircle,
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
  Filter,
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
  PAYMENTS: {
    label: "Payment & Billing",
    description: "Tuition settlements, webhook callbacks, subscription upgrades & disputes",
    icon: CreditCard,
    color: "text-emerald-500",
    badgeBg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300",
  },
  COMPLAINTS: {
    label: "Grievances & Complaints",
    description: "Escalated parent grievances, teacher facility & period collision tickets",
    icon: AlertTriangle,
    color: "text-rose-500",
    badgeBg: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-300",
  },
  SUGGESTIONS: {
    label: "Proposals & Ideas",
    description: "Community-upvoted suggestions, curriculum improvements & workflow ideas",
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
    color: "text-purple-500",
    badgeBg: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-300",
  },
};

const ALL_EVENT_TYPES: AlertEventType[] = [
  "PAYMENTS",
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

  // Reset form
  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("");
    setSelectedEvents([]);
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
    setSelectedEvents([...recipient.events]);
  };

  const toggleEventSelection = (eventType: AlertEventType) => {
    setSelectedEvents((prev) =>
      prev.includes(eventType) ? prev.filter((e) => e !== eventType) : [...prev, eventType]
    );
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
      toast.success(`Alert routing enabled for ${name}!`);
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
    try {
      await toggleMutation.mutateAsync(recipient.id);
      toast.info(
        recipient.isActive
          ? `Muted alerts for ${recipient.name}`
          : `Activated alerts for ${recipient.name}`
      );
    } catch {
      toast.error("Could not toggle recipient status.");
    }
  };

  const handleDelete = async (recipient: AlertRecipient) => {
    if (!window.confirm(`Permanently remove ${recipient.name} from alert routing?`)) return;
    try {
      await deleteMutation.mutateAsync(recipient.id);
      toast.success(`Removed ${recipient.name} from routing roster.`);
    } catch {
      toast.error("Could not delete recipient.");
    }
  };

  const handleTestAlert = async (recipient: AlertRecipient) => {
    try {
      await testAlertMutation.mutateAsync(recipient.id);
      toast.success(`Direct email alert successfully dispatched to ${recipient.email}! Check inbox.`);
    } catch {
      toast.error("Test alert dispatch failed. Verify SMTP settings.");
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
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Platform Email Alert Routing</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <BellRing className="w-7 h-7 text-indigo-400" />
              Notification Routing &amp; Email Alert Dispatcher
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
              Configure multi-channel email alert routing. When critical events occur (payments, grievances, inquiries, proposals, or system alerts), high-priority email notifications are dispatched directly to each recipient&apos;s personal inbox.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-bold h-10 px-3.5"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Refresh
            </Button>
            <Button
              onClick={handleOpenAdd}
              size="sm"
              className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold h-10 px-4 shadow-md gap-1.5"
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
            <p className="text-xl md:text-2xl font-black text-white mt-1">5 Event Types</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[11px] text-slate-400 font-medium">SMTP Engine</p>
            <p className="text-xl md:text-2xl font-black text-emerald-400 mt-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Operational
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[11px] text-slate-400 font-medium">Socket Dispatcher</p>
            <p className="text-xl md:text-2xl font-black text-indigo-400 mt-1 flex items-center gap-1.5">
              <Zap className="w-5 h-5 text-indigo-400" />
              Live Ready
            </p>
          </div>
        </div>
      </div>

      {/* ── EVENT STREAM CARDS ────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-500" />
            Active Platform Event Channels
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Events automatically trigger targeted email and push notifications
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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
                className={`p-4 rounded-2xl text-left border transition-all ${
                  isFilterSelected
                    ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-xl bg-slate-100 dark:bg-slate-800 ${cfg.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <Badge variant="outline" className="text-[10px] font-bold">
                    {countForType} Subscribed
                  </Badge>
                </div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {cfg.label}
                </h3>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
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
                Alert Routing Recipients ({filteredRecipients.length})
              </CardTitle>
              <CardDescription className="text-slate-500 text-xs mt-1">
                Individuals receiving instant dispatches when monitored platform events fire.
              </CardDescription>
            </div>

            {/* Search Input */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
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
                  className="h-9 px-2 text-xs font-bold text-indigo-600 dark:text-indigo-400"
                >
                  Clear Filter
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 pt-6">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-500" />
              <p className="text-xs font-medium">Loading routing matrix...</p>
            </div>
          ) : filteredRecipients.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <BellRing className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                No alert recipients found
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery || selectedEventFilter !== "ALL"
                  ? "Try adjusting your search query or filter options."
                  : "Add your first engineering or operations team member to begin routing alerts."}
              </p>
              <Button
                onClick={handleOpenAdd}
                size="sm"
                className="rounded-xl bg-indigo-600 text-white font-bold text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Recipient
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecipients.map((recipient) => (
                <div
                  key={recipient.id}
                  className="py-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-2xl"
                >
                  {/* Left: Avatar & Identity */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs border border-indigo-400/30">
                      {recipient.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {recipient.name}
                        </h4>
                        <Badge
                          className={`text-[9px] font-bold px-1.5 py-0 ${
                            recipient.isActive
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                          }`}
                        >
                          {recipient.isActive ? "Active" : "Muted"}
                        </Badge>
                        {recipient.role && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            • {recipient.role}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                        <Mail className="w-3 h-3 text-slate-400" />
                        {recipient.email}
                      </p>

                      {/* Event Chips */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-2">
                        {recipient.events.map((ev) => {
                          const cfg = EVENT_TYPE_CONFIGS[ev];
                          return (
                            <span
                              key={ev}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${cfg.badgeBg}`}
                            >
                              {cfg.label}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestAlert(recipient)}
                      disabled={testAlertMutation.isPending}
                      title="Send test dispatch email to recipient"
                      className="h-8 px-2.5 rounded-xl border-slate-200 dark:border-slate-700 text-xs font-bold gap-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Send className="w-3 h-3 text-indigo-500" />
                      <span>Test Alert</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(recipient)}
                      disabled={toggleMutation.isPending}
                      title={recipient.isActive ? "Mute alerts" : "Enable alerts"}
                      className={`h-8 px-2.5 rounded-xl text-xs font-bold gap-1 ${
                        recipient.isActive
                          ? "border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900/60 dark:text-amber-300 dark:hover:bg-amber-950/40"
                          : "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/60 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                      }`}
                    >
                      <Power className="w-3 h-3" />
                      <span>{recipient.isActive ? "Mute" : "Enable"}</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEdit(recipient)}
                      className="h-8 w-8 p-0 rounded-xl border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(recipient)}
                      disabled={deleteMutation.isPending}
                      className="h-8 w-8 p-0 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
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
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Subscribed Event Channels</span>
                <span className="text-[10px] font-normal text-slate-400">
                  {selectedEvents.length} selected
                </span>
              </label>

              <div className="space-y-2">
                {ALL_EVENT_TYPES.map((ev) => {
                  const cfg = EVENT_TYPE_CONFIGS[ev];
                  const Icon = cfg.icon;
                  const isChecked = selectedEvents.includes(ev);

                  return (
                    <button
                      key={ev}
                      type="button"
                      onClick={() => toggleEventSelection(ev)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        isChecked
                          ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                          isChecked
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {cfg.label}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                          {cfg.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl text-xs font-bold h-10 px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold h-10 px-5"
              >
                {createMutation.isPending ? "Adding..." : "Add Recipient"}
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
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Subscribed Event Channels</span>
                <span className="text-[10px] font-normal text-slate-400">
                  {selectedEvents.length} selected
                </span>
              </label>

              <div className="space-y-2">
                {ALL_EVENT_TYPES.map((ev) => {
                  const cfg = EVENT_TYPE_CONFIGS[ev];
                  const Icon = cfg.icon;
                  const isChecked = selectedEvents.includes(ev);

                  return (
                    <button
                      key={ev}
                      type="button"
                      onClick={() => toggleEventSelection(ev)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                        isChecked
                          ? "bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-400 shadow-xs"
                          : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                          isChecked
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {cfg.label}
                          </p>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                          {cfg.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingRecipient(null)}
                className="rounded-xl text-xs font-bold h-10 px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold h-10 px-5"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
