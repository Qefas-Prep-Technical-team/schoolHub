"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { platformClient } from "@/lib/api/platformClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tag, Plus, X, CheckCircle2, XCircle, Loader2,
  Calendar, Users, Percent, Hash, ChevronDown, ChevronUp,
  BadgeCheck, AlertTriangle, Copy, Trash2, PauseCircle
} from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";

// ─── Types ────────────────────────────────────────────────────
interface CouponUsage {
  id: string;
  userEmail: string;
  usedAt: string;
  discount: number;
}

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  maxDiscountNaira: number | null;
  minAmountNaira: number | null;
  applicablePlans: string | null;
  applicableRoles: string | null;
  maxUses: number | null;
  maxUsesPerUser: number;
  currentUses: number;
  isActive: boolean;
  startsAt: string;
  expiresAt: string | null;
  createdAt: string;
  usages: CouponUsage[];
}

// ─── Fetch helpers ────────────────────────────────────────────
const fetchCoupons = async (): Promise<Coupon[]> => {
  const res = await platformClient.get("/platform/billing/coupon");
  return res.data.data;
};

// ─── StatusBadge ─────────────────────────────────────────────
function StatusBadge({ coupon }: { coupon: Coupon }) {
  const now = new Date();
  const expired = coupon.expiresAt && new Date(coupon.expiresAt) < now;
  const exhausted = coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses;

  if (!coupon.isActive)
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold"><PauseCircle className="w-3 h-3" />Inactive</span>;
  if (expired)
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-100 text-red-600 text-xs font-bold"><XCircle className="w-3 h-3" />Expired</span>;
  if (exhausted)
    return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold"><AlertTriangle className="w-3 h-3" />Exhausted</span>;
  return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold"><CheckCircle2 className="w-3 h-3" />Active</span>;
}

// ─── Create Form ──────────────────────────────────────────────
const DEFAULT_FORM = {
  code: "", description: "", discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
  discountValue: "", maxDiscountNaira: "", minAmountNaira: "",
  applicablePlans: "", applicableRoles: "",
  maxUses: "", maxUsesPerUser: "1",
  isActive: true, startsAt: "", expiresAt: "",
};

function CreateCouponModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(DEFAULT_FORM);

  const mutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const payload: Record<string, unknown> = {
        code: data.code,
        description: data.description || undefined,
        discountType: data.discountType,
        discountValue: parseFloat(data.discountValue),
        maxDiscountNaira: data.maxDiscountNaira ? parseFloat(data.maxDiscountNaira) : undefined,
        minAmountNaira: data.minAmountNaira ? parseFloat(data.minAmountNaira) : undefined,
        applicablePlans: data.applicablePlans ? data.applicablePlans.split(",").map((s) => s.trim()) : undefined,
        applicableRoles: data.applicableRoles ? data.applicableRoles.split(",").map((s) => s.trim().toUpperCase()) : undefined,
        maxUses: data.maxUses ? parseInt(data.maxUses) : undefined,
        maxUsesPerUser: parseInt(data.maxUsesPerUser) || 1,
        isActive: data.isActive,
        startsAt: data.startsAt ? new Date(data.startsAt).toISOString() : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : undefined,
      };
      const res = await platformClient.post("/platform/billing/coupon", payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Coupon created!");
      onClose();
    },
    onError: (err: unknown) => {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e?.response?.data?.error || "Failed to create coupon");
    },
  });

  const set = (k: keyof typeof DEFAULT_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Create Coupon</h2>
            <p className="text-sm text-slate-500">New promo code for subscribers</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }} className="p-6 space-y-5">
          {/* Code */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Code *</label>
              <input required value={form.code} onChange={set("code")}
                onInput={(e) => { (e.target as HTMLInputElement).value = (e.target as HTMLInputElement).value.toUpperCase(); }}
                placeholder="SAVE20, LAUNCH50..."
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold uppercase text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Discount Type *</label>
              <select value={form.discountType} onChange={set("discountType")}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED">Fixed Amount (₦)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                {form.discountType === "PERCENTAGE" ? "% Off *" : "₦ Off *"}
              </label>
              <input required type="number" min={0} max={form.discountType === "PERCENTAGE" ? 100 : undefined}
                value={form.discountValue} onChange={set("discountValue")}
                placeholder={form.discountType === "PERCENTAGE" ? "20" : "5000"}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          {form.discountType === "PERCENTAGE" && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Max Discount Cap (₦) <span className="text-slate-400 normal-case font-normal">optional</span></label>
              <input type="number" min={0} value={form.maxDiscountNaira} onChange={set("maxDiscountNaira")}
                placeholder="e.g. 2000 — caps 20% off at ₦2,000"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Description <span className="text-slate-400 normal-case font-normal">optional</span></label>
            <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Internal note about this coupon..."
              rows={2}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Uses Cap <span className="text-slate-400 normal-case font-normal">optional</span></label>
              <input type="number" min={1} value={form.maxUses} onChange={set("maxUses")}
                placeholder="Unlimited"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Uses Per User</label>
              <input type="number" min={1} value={form.maxUsesPerUser} onChange={set("maxUsesPerUser")}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Applies To Plans <span className="text-slate-400 normal-case font-normal">comma-separated</span></label>
              <input value={form.applicablePlans} onChange={set("applicablePlans")}
                placeholder="pro, starter (blank = all)"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Applies To Roles <span className="text-slate-400 normal-case font-normal">comma-separated</span></label>
              <input value={form.applicableRoles} onChange={set("applicableRoles")}
                placeholder="ADMIN, TEACHER (blank = all)"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Min Order Amount (₦) <span className="text-slate-400 normal-case font-normal">optional</span></label>
            <input type="number" min={0} value={form.minAmountNaira} onChange={set("minAmountNaira")}
              placeholder="e.g. 5000"
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Valid From</label>
              <input type="datetime-local" value={form.startsAt} onChange={set("startsAt")}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Expires At <span className="text-slate-400 normal-case font-normal">optional</span></label>
              <input type="datetime-local" value={form.expiresAt} onChange={set("expiresAt")}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={set("isActive")} className="w-4 h-4 rounded accent-indigo-600" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Active immediately</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending}
              className="flex-1 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60">
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Coupon"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// ─── Coupon Row ───────────────────────────────────────────────
function CouponRow({ coupon }: { coupon: Coupon }) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);

  const deactivate = useMutation({
    mutationFn: () => platformClient.patch(`/platform/billing/coupon/${coupon.id}/deactivate`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["coupons"] }); toast.success("Coupon deactivated"); },
  });

  const deleteMut = useMutation({
    mutationFn: () => platformClient.delete(`/platform/billing/coupon/${coupon.id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["coupons"] }); toast.success("Coupon deleted"); },
    onError: () => toast.error("Failed to delete"),
  });

  const copy = () => { navigator.clipboard.writeText(coupon.code); toast.success(`Copied ${coupon.code}`); };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6 flex items-center gap-5">
        {/* Code */}
        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
          <Tag className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-black text-slate-900 dark:text-white font-mono text-base tracking-wider">{coupon.code}</span>
            <button onClick={copy} className="text-slate-400 hover:text-indigo-500 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
            <StatusBadge coupon={coupon} />
          </div>
          {coupon.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{coupon.description}</p>}
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-8 text-center">
          <div>
            <p className="text-xs text-slate-400 font-medium mb-0.5">Discount</p>
            <p className="text-base font-black text-slate-900 dark:text-white">
              {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : `₦${coupon.discountValue.toLocaleString()}`}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium mb-0.5">Uses</p>
            <p className="text-base font-black text-slate-900 dark:text-white">
              {coupon.currentUses}{coupon.maxUses ? `/${coupon.maxUses}` : ""}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium mb-0.5">Expires</p>
            <p className="text-base font-black text-slate-900 dark:text-white">
              {coupon.expiresAt ? format(new Date(coupon.expiresAt), "dd MMM yy") : "Never"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {coupon.isActive && (
            <button onClick={() => deactivate.mutate()} disabled={deactivate.isPending}
              title="Deactivate"
              className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 hover:bg-amber-200 transition-colors">
              {deactivate.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PauseCircle className="w-3.5 h-3.5" />}
            </button>
          )}
          <button onClick={() => { if (confirm(`Delete coupon "${coupon.code}"?`)) deleteMut.mutate(); }}
            disabled={deleteMut.isPending}
            title="Delete"
            className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors">
            {deleteMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => setExpanded(!expanded)}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {[
                { label: "Plans", val: coupon.applicablePlans ? JSON.parse(coupon.applicablePlans).join(", ") : "All plans" },
                { label: "Roles", val: coupon.applicableRoles ? JSON.parse(coupon.applicableRoles).join(", ") : "All roles" },
                { label: "Min Amount", val: coupon.minAmountNaira ? `₦${coupon.minAmountNaira.toLocaleString()}` : "None" },
                { label: "Per-user Limit", val: `${coupon.maxUsesPerUser}x` },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">{val}</p>
                </div>
              ))}
            </div>

            {coupon.usages.length > 0 && (
              <div className="px-5 pb-5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Recent Redemptions</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {coupon.usages.slice(0, 10).map((u) => (
                    <div key={u.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-2.5">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{u.userEmail}</span>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="text-emerald-600 font-bold">-₦{u.discount.toLocaleString()}</span>
                        <span>{format(new Date(u.usedAt), "dd MMM yy, HH:mm")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {coupon.usages.length === 0 && (
              <div className="px-5 pb-5">
                <p className="text-xs text-slate-400 italic">No redemptions yet</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function CouponsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");

  const { data: coupons, isLoading, error } = useQuery({
    queryKey: ["coupons"],
    queryFn: fetchCoupons,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });

  const filtered = coupons?.filter((c) => {
    if (filter === "active") return c.isActive;
    if (filter === "inactive") return !c.isActive;
    return true;
  }) ?? [];

  const totalRedemptions = coupons?.reduce((s, c) => s + c.currentUses, 0) ?? 0;
  const totalDiscountGiven = coupons?.reduce((s, c) => s + c.usages.reduce((a, u) => a + u.discount, 0), 0) ?? 0;
  const activeCoupons = coupons?.filter((c) => c.isActive).length ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-8">
      <div className="w-full max-w-[95%] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white">Coupon Codes</h1>
            <p className="text-slate-500 text-base mt-1">Create and manage promotional discount codes</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm shadow-lg shadow-indigo-600/20 transition-all">
            <Plus className="w-4 h-4" /> New Coupon
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {[
            { icon: <BadgeCheck className="w-6 h-6 text-emerald-600" />, label: "Active Coupons", val: activeCoupons, bg: "bg-emerald-50 dark:bg-emerald-900/20" },
            { icon: <Users className="w-6 h-6 text-indigo-600" />, label: "Total Redemptions", val: totalRedemptions, bg: "bg-indigo-50 dark:bg-indigo-900/20" },
            { icon: <Percent className="w-6 h-6 text-orange-500" />, label: "Discount Given", val: `₦${totalDiscountGiven.toLocaleString()}`, bg: "bg-orange-50 dark:bg-orange-900/20" },
          ].map(({ icon, label, val, bg }) => (
            <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center mb-4`}>{icon}</div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{val}</p>
              <p className="text-sm text-slate-500 font-medium mt-1.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-5">
          {(["all", "active", "inactive"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all capitalize ${filter === f ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"}`}>
              {f}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-400 font-medium">{filtered.length} coupon{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* List */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        )}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 text-center">
            <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600 font-semibold">Failed to load coupons</p>
          </div>
        )}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800">
            <Tag className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">No coupons yet</h3>
            <p className="text-slate-500 text-sm mb-6">Create your first promo code to offer discounts to subscribers</p>
            <button onClick={() => setShowCreate(true)}
              className="px-5 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-black hover:bg-indigo-700 transition-colors">
              Create First Coupon
            </button>
          </div>
        )}
        <div className="space-y-3">
          {filtered.map((c) => <CouponRow key={c.id} coupon={c} />)}
        </div>
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && <CreateCouponModal onClose={() => setShowCreate(false)} />}
      </AnimatePresence>
    </div>
  );
}
