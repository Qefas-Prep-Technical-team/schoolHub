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
  ExternalLink
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { toast } from "react-toastify";

export default function AdminInquiriesPage() {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";
  
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const { data: response, isLoading } = useSchoolInquiries(schoolId, { page, limit });
  const inquiries = response?.data || [];
  const pagination = response?.pagination;

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

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen">
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
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Messages</h2>
        </div>

        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading inquiries...</p>
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
                  <th className="px-6 py-4 font-semibold">Contact Info</th>
                  <th className="px-6 py-4 font-semibold">Message</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {inquiries.map((iq: any) => (
                  <tr key={iq.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
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
    </div>
  );
}
