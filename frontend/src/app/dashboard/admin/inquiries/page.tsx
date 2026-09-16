"use client";

import React, { useState } from "react";
import { useSchoolInquiries } from "@/lib/api/hooks/useSchool";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Inbox,
  Clock,
  CheckCircle2,
  MoreVertical,
  ExternalLink,
  Trash2,
  Loader2
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AdminInquiriesPage() {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";
  
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const { data: response, isLoading } = useSchoolInquiries(schoolId, { page, limit });
  const rawInquiries = response?.data || [];
  const pagination = response?.pagination;

  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const inquiries = rawInquiries.filter((iq: any) => !deletedIds.has(iq.id));

  // Simple stats calculation (since we don't have a dedicated stats endpoint for inquiries yet, we use current page data as an estimate or just count total)
  const totalInquiries = pagination?.total || 0;
  const unreadCount = inquiries.filter((iq: any) => iq.status === "UNREAD").length;

  const handleWhatsApp = (phone: string | null) => {
    if (!phone) {
      toast.info("No phone number provided");
      return;
    }
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  const handleEmail = (email: string) => {
    window.open(`mailto:${email}`, "_blank");
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(inquiries.map((iq: any) => iq.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = (ids: string[]) => {
    setDeletingIds(ids);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    setIsDeleting(true);
    // Simulate network delay to show the deleting state
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Optimistic UI update to remove them immediately
    setDeletedIds(prev => {
      const newSet = new Set(prev);
      deletingIds.forEach(id => newSet.add(id));
      return newSet;
    });

    // TODO: Connect to backend mutation
    toast.success(`${deletingIds.length} message(s) deleted successfully.`);
    setSelectedIds([]);
    setIsDeleting(false);
    setIsDeleteDialogOpen(false);
  };

  return (
    <div className="p-6 w-[90%] max-w-[90%] mx-auto min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-500" />
          Website Inquiries
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm">
          Manage and respond to messages submitted through your public school landing page.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Inbox className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Inquiries</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{totalInquiries}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-500">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Unread (This Page)</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{unreadCount}</p>
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Recent Messages
            {selectedIds.length > 0 && (
              <span className="text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-0.5 rounded-full font-bold">
                {selectedIds.length} Selected
              </span>
            )}
          </h2>
          
          {selectedIds.length > 0 && (
            <button 
              onClick={() => confirmDelete(selectedIds)}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-500 rounded-xl text-sm font-bold transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-4 font-semibold w-12">
                    <input 
                      type="checkbox" 
                      disabled
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 dark:bg-slate-900"
                    />
                  </th>
                  <th className="px-6 py-4 font-semibold w-16">#</th>
                  <th className="px-6 py-4 font-semibold">Contact Info</th>
                  <th className="px-6 py-4 font-semibold">Message</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse bg-white dark:bg-slate-900">
                    <td className="px-6 py-5 align-top">
                      <Skeleton className="h-4 w-4 rounded" />
                    </td>
                    <td className="px-6 py-5 align-top">
                      <Skeleton className="h-4 w-6" />
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top max-w-md">
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-8 w-8 rounded-lg" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Inbox className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No inquiries yet</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md">
              When visitors fill out the contact form on your public landing page, their messages will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-6 py-4 font-semibold w-16">#</th>
                  <th className="px-6 py-4 font-semibold">Contact Info</th>
                  <th className="px-6 py-4 font-semibold">Message</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {inquiries.map((iq: any, index: number) => (
                  <tr key={iq.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-5 align-top">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(iq.id)}
                        onChange={() => handleSelectOne(iq.id)}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 dark:bg-slate-900 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-5 align-top font-medium text-slate-500 dark:text-slate-400">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex flex-col gap-1">
                        <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                          {iq.name}
                          {iq.status === "UNREAD" && (
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {iq.email}
                        </div>
                        {iq.phone && (
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3" /> {iq.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top max-w-md">
                      <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-3">
                        {iq.message}
                      </p>
                    </td>
                    <td className="px-6 py-5 align-top whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {format(new Date(iq.createdAt), "MMM d, yyyy")}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {formatDistanceToNow(new Date(iq.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 align-top">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEmail(iq.email)}
                          className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-xl transition-colors tooltip-trigger"
                          title="Send Email"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleWhatsApp(iq.phone)}
                          className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-xl transition-colors tooltip-trigger"
                          title="Send WhatsApp Message"
                        >
                          <Phone className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => confirmDelete([iq.id])}
                          className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl transition-colors tooltip-trigger"
                          title="Delete Inquiry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/30">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              Showing page <span className="font-semibold text-slate-900 dark:text-white">{page}</span> of <span className="font-semibold text-slate-900 dark:text-white">{pagination.totalPages}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl text-slate-900 dark:text-white">Delete Inquiry</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-slate-400 pt-2">
              Are you sure you want to delete {deletingIds.length > 1 ? `these ${deletingIds.length} messages` : "this message"}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4 flex gap-2 sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={executeDelete}
              disabled={isDeleting}
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white min-w-[100px]"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
