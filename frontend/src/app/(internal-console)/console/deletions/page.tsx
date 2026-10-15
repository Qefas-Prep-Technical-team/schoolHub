"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  Trash2,
  UserX,
  ShieldAlert,
  Clock,
  Search,
  CheckCircle2,
  RotateCcw,
  AlertTriangle,
  FileText,
  Mail,
  School,
  Building2,
  Calendar,
  ExternalLink,
  MessageSquare,
  ShieldCheck,
  Filter,
  UserCheck,
  GraduationCap,
  Presentation,
  Users,
  Shield,
  Loader2,
  X,
  Send
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  usePlatformComplianceRequests,
  ComplianceTicket,
  DeactivatedUserRecord,
  usePlatformTicketDetails,
  usePlatformUpdateTicket,
  usePlatformReplyTicket,
} from "@/lib/api/hooks/usePlatformSupport";
import {
  useUpdateStudentStatus,
  useUpdateTeacherStatus,
  useUpdateParentStatus,
  useUpdateAdminStatus,
  useDeletePlatformStudent,
  useDeletePlatformTeacher,
  useDeletePlatformParent,
  useDeletePlatformAdmin,
} from "@/lib/api/hooks/usePlatformSchools";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";

export default function DeletionsAndCompliancePage() {
  const [activeTab, setActiveTab] = useState<"deletions" | "deactivated" | "audit">("deletions");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Selected ticket for inspection modal
  const [selectedTicket, setSelectedTicket] = useState<ComplianceTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");

  // Deletion modal state
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    entityId: string;
    entityName: string;
    entityType: "Student" | "Teacher" | "Admin" | "Parent";
    identifier?: string;
  }>({
    isOpen: false,
    entityId: "",
    entityName: "",
    entityType: "Student",
  });

  // Queries & Mutations
  const { data: complianceData, isLoading, refetch } = usePlatformComplianceRequests({
    role: roleFilter,
    status: statusFilter !== "ALL" ? statusFilter : undefined,
    search: searchQuery,
  });

  const { data: ticketDetails, isLoading: ticketDetailsLoading } = usePlatformTicketDetails(
    selectedTicket?.id
  );
  const updateTicketStatusMutation = usePlatformUpdateTicket();
  const replyTicketMutation = usePlatformReplyTicket();

  // Status update mutations
  const updateStudentStatus = useUpdateStudentStatus();
  const updateTeacherStatus = useUpdateTeacherStatus();
  const updateParentStatus = useUpdateParentStatus();
  const updateAdminStatus = useUpdateAdminStatus();

  // Permanent deletion mutations
  const deleteStudent = useDeletePlatformStudent();
  const deleteTeacher = useDeletePlatformTeacher();
  const deleteParent = useDeletePlatformParent();
  const deleteAdmin = useDeletePlatformAdmin();

  const isDeleting =
    deleteStudent.isPending ||
    deleteTeacher.isPending ||
    deleteParent.isPending ||
    deleteAdmin.isPending;

  const tickets = complianceData?.tickets || [];
  const deactivatedUsers = complianceData?.deactivatedUsers || [];
  const summary = complianceData?.summary;

  // Filter tickets into Data Deletion vs Self-Service Deactivation
  const deletionRequests = tickets.filter(
    (t) => t.category === "COMPLIANCE_DATA_DELETION"
  );
  const selfServiceAuditTickets = tickets.filter(
    (t) => t.category === "COMPLIANCE_ACCOUNT_DEACTIVATION"
  );

  // Filter deactivated users client-side by role if needed
  const filteredDeactivatedUsers = deactivatedUsers.filter((u) => {
    if (roleFilter !== "ALL" && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.code && u.code.toLowerCase().includes(q)) ||
        (u.schoolName && u.schoolName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Handle user reactivation
  const handleReactivate = async (user: DeactivatedUserRecord) => {
    try {
      if (user.role === "STUDENT") {
        await updateStudentStatus.mutateAsync({ id: user.id, isActive: true, status: "ACTIVE" });
      } else if (user.role === "TEACHER") {
        await updateTeacherStatus.mutateAsync({ id: user.id, isActive: true, status: "ACTIVE" });
      } else if (user.role === "PARENT") {
        await updateParentStatus.mutateAsync({ id: user.id, isActive: true, status: "ACTIVE" });
      } else if (user.role === "ADMIN") {
        await updateAdminStatus.mutateAsync({ id: user.id, isActive: true, status: "ACTIVE" });
      }
      refetch();
    } catch {
      // error handled inside mutations
    }
  };

  // Trigger delete modal for a user
  const openDeleteModal = (user: {
    id: string;
    name: string;
    role: "STUDENT" | "TEACHER" | "ADMIN" | "PARENT";
    code?: string;
  }) => {
    const roleMap: Record<string, "Student" | "Teacher" | "Admin" | "Parent"> = {
      STUDENT: "Student",
      TEACHER: "Teacher",
      ADMIN: "Admin",
      PARENT: "Parent",
    };
    setDeleteModalState({
      isOpen: true,
      entityId: user.id,
      entityName: user.name,
      entityType: roleMap[user.role] || "Student",
      identifier: user.code,
    });
  };

  // Execute deletion confirmation
  const handleConfirmDelete = async ({
    adminPassword,
    reason,
  }: {
    adminPassword: string;
    reason?: string;
  }) => {
    const { entityId, entityType } = deleteModalState;
    try {
      if (entityType === "Student") {
        await deleteStudent.mutateAsync({ id: entityId, adminPassword, reason });
      } else if (entityType === "Teacher") {
        await deleteTeacher.mutateAsync({ id: entityId, adminPassword, reason });
      } else if (entityType === "Parent") {
        await deleteParent.mutateAsync({ id: entityId, adminPassword, reason });
      } else if (entityType === "Admin") {
        await deleteAdmin.mutateAsync({ id: entityId, adminPassword, reason });
      }
      setDeleteModalState((prev) => ({ ...prev, isOpen: false }));
      refetch();
    } catch {
      // error handled in mutation
    }
  };

  // Reply to ticket
  const handleSendReply = async () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    try {
      await replyTicketMutation.mutateAsync({
        ticketId: selectedTicket.id,
        content: replyMessage.trim(),
      });
      setReplyMessage("");
    } catch {
      // handled
    }
  };

  // Change ticket status
  const handleUpdateTicketStatus = async (status: ComplianceTicket["status"]) => {
    if (!selectedTicket) return;
    try {
      await updateTicketStatusMutation.mutateAsync({
        ticketId: selectedTicket.id,
        status,
      });
      setSelectedTicket((prev) => (prev ? { ...prev, status } : null));
      refetch();
    } catch {
      // handled
    }
  };

  // Role Pill Helper
  const renderRolePill = (role?: string) => {
    const r = (role || "").toUpperCase();
    if (r === "STUDENT") {
      return (
        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
          Student
        </span>
      );
    }
    if (r === "TEACHER") {
      return (
        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300">
          Teacher
        </span>
      );
    }
    if (r === "ADMIN") {
      return (
        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
          Admin
        </span>
      );
    }
    if (r === "PARENT") {
      return (
        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300">
          Parent
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
        {r || "User"}
      </span>
    );
  };

  // Ticket Status Pill Helper
  const renderTicketStatusPill = (status: string) => {
    const s = status.toUpperCase();
    if (s === "OPEN") {
      return (
        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
          Pending Review
        </span>
      );
    }
    if (s === "IN_PROGRESS") {
      return (
        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
          In Progress
        </span>
      );
    }
    if (s === "RESOLVED") {
      return (
        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
          Completed
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
        Closed
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-widest">
            <ShieldAlert size={14} />
            Data Compliance & Privacy Ops
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Deletions & <span className="text-red-600 dark:text-red-500">Deactivations</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl font-medium">
            Monitor public data deletion requests submitted by users, review self-service deactivation audit events, and manage or permanently purge inactive accounts across all 4 ecosystem roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="rounded-xl border-slate-200 dark:border-slate-800 text-xs font-bold gap-2"
          >
            <RotateCcw size={14} className={isLoading ? "animate-spin" : ""} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Pending Deletions</span>
            <div className="h-9 w-9 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <Trash2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isLoading ? "..." : summary?.pendingDeletionRequests ?? 0}
            </span>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Of {summary?.totalDeletionRequests ?? 0} total requests submitted
            </p>
          </div>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Deactivated Accounts</span>
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <UserX size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isLoading ? "..." : summary?.totalDeactivatedUsers ?? 0}
            </span>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Students, Teachers, Admins, Parents
            </p>
          </div>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Self-Service Deactivations</span>
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {isLoading ? "..." : summary?.totalDeactivationTickets ?? 0}
            </span>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Logged via user settings portal
            </p>
          </div>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Retention Grace Period</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              30 Days
            </span>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Reversible before permanent purge
            </p>
          </div>
        </Card>
      </div>

      {/* Tabs Switcher & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("deletions")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === "deletions"
                ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            )}
          >
            <Trash2 size={14} />
            Data Deletion Requests
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-black",
                activeTab === "deletions"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
              )}
            >
              {deletionRequests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("deactivated")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === "deactivated"
                ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            )}
          >
            <UserX size={14} />
            Deactivated Accounts
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-black",
                activeTab === "deactivated"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
              )}
            >
              {deactivatedUsers.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap",
              activeTab === "audit"
                ? "bg-red-600 text-white shadow-md shadow-red-600/20"
                : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            )}
          >
            <ShieldCheck size={14} />
            Self-Service Deactivations Audit
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-black",
                activeTab === "audit"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
              )}
            >
              {selfServiceAuditTickets.length}
            </span>
          </button>
        </div>

        {/* Global Search & Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <Input
              type="text"
              placeholder="Search by name, email, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-9 pr-4 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200"
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="TEACHER">Teachers</option>
            <option value="ADMIN">Admins</option>
            <option value="PARENT">Parents</option>
          </select>

          {activeTab !== "deactivated" && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Pending Review</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Completed</option>
              <option value="CLOSED">Closed</option>
            </select>
          )}
        </div>
      </div>

      {/* Main Content Areas */}
      {activeTab === "deletions" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Public Data Deletion Requests
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Users who submitted a compliance deletion ticket via the public form or support desk.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    User / Requester
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Role
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Request ID & Subject
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Submitted Date
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Status
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="p-4">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                ) : deletionRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                      No public data deletion requests found.
                    </td>
                  </tr>
                ) : (
                  deletionRequests.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {ticket.userName || "Anonymous Requester"}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {ticket.userEmail || "No email attached"}
                        </div>
                      </td>

                      <td className="p-4">{renderRolePill(ticket.userType)}</td>

                      <td className="p-4">
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {ticket.subject}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          ID: {ticket.id.slice(0, 8)}...
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                          {format(new Date(ticket.createdAt), "MMM dd, yyyy")}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {format(new Date(ticket.createdAt), "hh:mm a")}
                        </div>
                      </td>

                      <td className="p-4">{renderTicketStatusPill(ticket.status)}</td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                            className="h-8 rounded-lg text-xs font-bold gap-1.5"
                          >
                            <MessageSquare size={13} />
                            View & Review
                          </Button>

                          {ticket.userId && ticket.userType && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                openDeleteModal({
                                  id: ticket.userId!,
                                  name: ticket.userName || ticket.userEmail || "User",
                                  role: ticket.userType as any,
                                })
                              }
                              className="h-8 rounded-lg text-xs font-bold border-red-200 text-red-600 hover:bg-red-50 dark:border-red-950 dark:hover:bg-red-950/40 gap-1.5"
                            >
                              <Trash2 size={13} />
                              Purge Record
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "deactivated" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Deactivated Accounts Across Platform
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Users currently deactivated or suspended. They cannot log in, but can be reactivated or permanently purged.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Showing {filteredDeactivatedUsers.length} inactive users
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    User Details
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Role
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Account Code
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Affiliated Institution
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Deactivated On
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Status
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                    Management Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="p-4">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredDeactivatedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 font-medium">
                      No deactivated accounts found matching the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredDeactivatedUsers.map((user) => (
                    <tr
                      key={`${user.role}-${user.id}`}
                      className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">{user.name}</div>
                        <div className="text-[11px] text-slate-500 font-medium">{user.email}</div>
                      </td>

                      <td className="p-4">{renderRolePill(user.role)}</td>

                      <td className="p-4">
                        <span className="font-mono text-slate-600 dark:text-slate-300 font-bold text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {user.code || "N/A"}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {user.schoolName || "Independent Portal"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                          {format(new Date(user.deactivatedAt), "MMM dd, yyyy")}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {format(new Date(user.deactivatedAt), "hh:mm a")}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300">
                          Deactivated
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReactivate(user)}
                            className="h-8 rounded-lg text-xs font-bold border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-950 dark:hover:bg-emerald-950/40 gap-1.5"
                          >
                            <UserCheck size={13} />
                            Reactivate
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteModal(user)}
                            className="h-8 rounded-lg text-xs font-bold border-red-200 text-red-600 hover:bg-red-50 dark:border-red-950 dark:hover:bg-red-950/40 gap-1.5"
                          >
                            <Trash2 size={13} />
                            Delete Record
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Self-Service Deactivations Audit Ledger
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Audit records logged automatically when users deactivated their account from their portal settings.
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {selfServiceAuditTickets.length} events logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    User / Account
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Role
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Deactivation Reason / Statement
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Logged Timestamp
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Audit Status
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-xs">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="p-4">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                ) : selfServiceAuditTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                      No self-service deactivation audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  selfServiceAuditTickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-b border-slate-100 dark:border-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {ticket.userName || ticket.userEmail}
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">
                          {ticket.userEmail}
                        </div>
                      </td>

                      <td className="p-4">{renderRolePill(ticket.userType)}</td>

                      <td className="p-4 max-w-md">
                        <div className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                          {ticket.description || ticket.subject}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="text-slate-700 dark:text-slate-300 font-medium">
                          {format(new Date(ticket.createdAt), "MMM dd, yyyy")}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {format(new Date(ticket.createdAt), "hh:mm a")}
                        </div>
                      </td>

                      <td className="p-4">{renderTicketStatusPill(ticket.status)}</td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedTicket(ticket)}
                            className="h-8 rounded-lg text-xs font-bold gap-1.5"
                          >
                            <FileText size={13} />
                            View Audit Trail
                          </Button>

                          {ticket.userId && ticket.userType && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                openDeleteModal({
                                  id: ticket.userId!,
                                  name: ticket.userName || ticket.userEmail || "User",
                                  role: ticket.userType as any,
                                })
                              }
                              className="h-8 rounded-lg text-xs font-bold border-red-200 text-red-600 hover:bg-red-50 dark:border-red-950 dark:hover:bg-red-950/40 gap-1.5"
                            >
                              <Trash2 size={13} />
                              Purge Record
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Ticket Details & Review Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
          <DialogHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Ticket #{selectedTicket?.id.slice(0, 8)}
              </span>
              <div className="flex items-center gap-2">
                {selectedTicket && renderRolePill(selectedTicket.userType)}
                {selectedTicket && renderTicketStatusPill(selectedTicket.status)}
              </div>
            </div>
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">
              {selectedTicket?.subject}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Submitted by <strong className="text-slate-800 dark:text-slate-200">{selectedTicket?.userName}</strong> ({selectedTicket?.userEmail}) on{" "}
              {selectedTicket && format(new Date(selectedTicket.createdAt), "MMMM dd, yyyy 'at' hh:mm a")}
            </DialogDescription>
          </DialogHeader>

          {/* Description Content */}
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
            {selectedTicket?.description}
          </div>

          {/* Ticket Conversation / Messages */}
          <div className="mt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Communication History
            </h4>

            <div className="max-h-40 overflow-y-auto space-y-2 p-3 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/60">
              {ticketDetailsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-8 w-1/2" />
                </div>
              ) : ticketDetails?.messages?.length === 0 ? (
                <p className="text-center text-[11px] text-slate-400 py-3">
                  No replies on this ticket yet.
                </p>
              ) : (
                ticketDetails?.messages?.map((msg: any) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "p-3 rounded-xl text-xs space-y-1",
                      msg.senderRole === "SUPPORT_AGENT"
                        ? "bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40 ml-4"
                        : "bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 mr-4"
                    )}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span>{msg.senderName || msg.senderRole}</span>
                      <span>{format(new Date(msg.createdAt), "MMM d, h:mm a")}</span>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Quick Reply Form */}
            <div className="flex gap-2 mt-2">
              <Input
                placeholder="Type response or status update note..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                className="h-9 text-xs rounded-xl border-slate-200 dark:border-slate-800"
                onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
              />
              <Button
                onClick={handleSendReply}
                disabled={replyTicketMutation.isPending || !replyMessage.trim()}
                className="h-9 px-4 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold gap-1.5"
              >
                <Send size={13} />
                Reply
              </Button>
            </div>
          </div>

          <DialogFooter className="mt-6 flex flex-col sm:flex-row justify-between gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Update Status:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateTicketStatus("IN_PROGRESS")}
                disabled={selectedTicket?.status === "IN_PROGRESS"}
                className="h-8 rounded-lg text-xs font-bold"
              >
                In Progress
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateTicketStatus("RESOLVED")}
                disabled={selectedTicket?.status === "RESOLVED"}
                className="h-8 rounded-lg text-xs font-bold border-green-200 text-green-700 hover:bg-green-50 dark:border-green-950 dark:text-green-300"
              >
                Completed
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUpdateTicketStatus("CLOSED")}
                disabled={selectedTicket?.status === "CLOSED"}
                className="h-8 rounded-lg text-xs font-bold"
              >
                Close
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectedTicket(null)}
              className="h-8 rounded-lg text-xs font-bold"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal with Staff Password Verification */}
      <DeleteConfirmationModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleConfirmDelete}
        entityName={deleteModalState.entityName}
        entityType={deleteModalState.entityType}
        identifier={deleteModalState.identifier}
        isLoading={isDeleting}
      />
    </div>
  );
}
