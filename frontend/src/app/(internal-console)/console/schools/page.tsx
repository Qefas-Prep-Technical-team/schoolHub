"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  usePlatformSchools,
  useUpdateSchoolStatus,
  useImpersonateAdmin,
  PlatformPlanBreakdownItem,
  PlatformSchoolSummary,
} from "@/lib/api/hooks/usePlatformSchools";
import { cn } from "@/lib/utils";
import {
  Search as SearchIcon,
  MoreVertical as MoreVerticalIcon,
  ExternalLink as ExternalLinkIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Building2 as BuildingIcon,
  Filter as FilterIcon,
  Settings2 as SettingsIcon,
  CreditCard,
  Sparkles,
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { LimitsModal } from "./components/LimitsModal";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "@/components/ui/Pagination";
import { copyToClipboard } from "@/lib/utils/clipboard";

export default function SchoolsManagementPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [planFilter, setPlanFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const limit = 10;

  const { data: response, isLoading, refetch, isFetching } = usePlatformSchools(
    search,
    page,
    limit,
    planFilter,
    statusFilter
  );

  const schools = response?.data || [];
  const planBreakdown = response?.planBreakdown || [];
  const statusBreakdown = response?.statusBreakdown || [];
  const pagination = response?.pagination || { total: 0, totalPages: 1 };

  const toggleStatus = useUpdateSchoolStatus();
  const impersonate = useImpersonateAdmin();
  const [selectedSchool, setSelectedSchool] = useState<PlatformSchoolSummary | null>(null);
  const [isLimitsModalOpen, setIsLimitsModalOpen] = useState(false);

  // Status Metrics
  const paidCount = statusBreakdown.find((s) => s.type === "PAID")?.count || 0;
  const expiredCount = statusBreakdown.find((s) => s.type === "EXPIRED")?.count || 0;
  const cancelledCount = statusBreakdown.find((s) => s.type === "CANCELLED")?.count || 0;
  const trialCount = statusBreakdown.find((s) => s.type === "TRIAL")?.count || 0;

  const handleCopyCode = (text: string, id: string) => {
    copyToClipboard(text, "Identifier");
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSelectPlanFilter = (planName: string) => {
    if (planFilter === planName) {
      setPlanFilter("ALL");
    } else {
      setPlanFilter(planName);
    }
    setPage(1);
  };

  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-8 rounded-3xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/50">
              <BuildingIcon size={22} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Institutions & Subscriptions
            </h1>
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold border-indigo-200 dark:border-indigo-800">
              {pagination.total} Deployed
            </Badge>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">
            Manage institutional tenants, available subscription tiers, live quotas, and billing health across the network.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch md:self-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-10 px-3.5 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold gap-2 cursor-pointer"
          >
            <RefreshCw size={14} className={cn(isFetching && "animate-spin")} />
            <span>Sync Live</span>
          </Button>

          <Button
            type="button"
            onClick={() => router.push("/console/schools/deploy")}
            className="h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-500 hover:via-indigo-500 hover:to-indigo-600 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            Deploy New Tenant
          </Button>
        </div>
      </div>

      {/* Top Operational Status KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Paid Institutions */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800/90 p-5 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active Paid Schools
              </p>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {isLoading ? <Skeleton className="h-7 w-16" /> : paidCount}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/70 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CreditCard size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={13} />
            <span>Operational & Renewing</span>
          </div>
        </Card>

        {/* Active Trials */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800/90 p-5 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active Trial Cohorts
              </p>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {isLoading ? <Skeleton className="h-7 w-16" /> : trialCount}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/70 dark:border-amber-800/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
            <Sparkles size={13} />
            <span>In Evaluation Period</span>
          </div>
        </Card>

        {/* Expired / Overdue */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800/90 p-5 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Expired Access
              </p>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {isLoading ? <Skeleton className="h-7 w-16" /> : expiredCount}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/50 border border-red-200/70 dark:border-red-800/50 text-red-600 dark:text-red-400 flex items-center justify-center">
              <LockIcon size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-red-600 dark:text-red-400">
            <AlertTriangle size={13} />
            <span>Requires Renewal Extension</span>
          </div>
        </Card>

        {/* Cancelled / Deactivated */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800/90 p-5 rounded-2xl shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Cancelled / Inactive
              </p>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {isLoading ? <Skeleton className="h-7 w-16" /> : cancelledCount}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center">
              <BuildingIcon size={20} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <ShieldCheck size={13} />
            <span>Suspended or Dormant</span>
          </div>
        </Card>
      </div>

      {/* ATM Style Pricing Plan Cards */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Institutional Subscription Tiers
              </h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-xs">
              Click any ATM card to filter institutions by subscription tier or view total directory.
            </p>
          </div>

          {planFilter !== "ALL" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setPlanFilter("ALL");
                setPage(1);
              }}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 cursor-pointer h-8 self-start sm:self-auto"
            >
              Showing: {planFilter} • Reset Filter
            </Button>
          )}
        </div>

        {/* ATM Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-[185px] w-full rounded-[2rem] bg-slate-100 dark:bg-slate-800"
              />
            ))
          ) : (
            [
              {
                id: "total-schools",
                name: "Total Schools",
                count: pagination?.total || 0,
                type: "TOTAL",
              },
              ...planBreakdown,
            ].map((plan: any, i: number) => {
              const isTotal = plan.type === "TOTAL";
              const isSelected = isTotal
                ? planFilter === "ALL"
                : planFilter === plan.name || planFilter === plan.type;

              const planTypeUpper = (plan.type || "").toUpperCase();
              const planNameUpper = (plan.name || "").toUpperCase();

              // Determine gradient matching the console design system
              const gradientClass = isTotal
                ? "bg-gradient-to-br from-indigo-950 via-slate-900 to-black"
                : planTypeUpper === "FREE" || planNameUpper.includes("FREE") || planNameUpper.includes("BASIC")
                ? "bg-gradient-to-br from-slate-600 via-slate-700 to-slate-900"
                : planTypeUpper === "TRIAL" || planNameUpper.includes("TRIAL")
                ? "bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700"
                : planTypeUpper === "STARTER" || planNameUpper.includes("STARTER")
                ? "bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900"
                : planTypeUpper === "GROWTH" || planNameUpper.includes("GROWTH") || planNameUpper.includes("ENTERPRISE")
                ? "bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900"
                : "bg-gradient-to-br from-indigo-500 via-purple-600 to-purple-800";

              return (
                <div
                  key={plan.id || i}
                  onClick={() => handleSelectPlanFilter(isTotal ? "ALL" : plan.name)}
                  className={cn(
                    "relative h-[185px] w-full rounded-[2rem] p-6 text-white overflow-hidden shadow-2xl transition-all duration-300 hover:scale-[1.02] cursor-pointer group select-none",
                    isSelected
                      ? "ring-4 ring-offset-2 ring-indigo-500 ring-offset-white dark:ring-offset-slate-950 scale-[1.02] shadow-indigo-500/30"
                      : "hover:shadow-indigo-500/20"
                  )}
                >
                  {/* Dynamic Gradient Background */}
                  <div className={cn("absolute inset-0 z-0", gradientClass)} />

                  {/* Glass Shimmer & Soft Radial Blur */}
                  <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-3xl group-hover:scale-125 transition-transform" />
                  <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-black/20 rounded-full blur-2xl" />

                  {/* Content Container */}
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    {/* Top Row: Subtitle + Plan Name & Golden EMV Chip */}
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">
                          {isTotal ? "Institution Demographics" : "Subscription Plan"}
                        </p>
                        <h3 className="text-2xl font-black tracking-tighter mt-0.5 uppercase italic leading-tight max-w-[210px] line-clamp-1">
                          {plan.name}
                        </h3>
                        {!isTotal && plan.monthlyPrice !== undefined && (
                          <p className="text-[11px] font-semibold opacity-75 mt-0.5">
                            {plan.monthlyPrice === 0
                              ? "Free Forever"
                              : `₦${plan.monthlyPrice.toLocaleString()} / mo`}
                          </p>
                        )}
                      </div>

                      {/* Golden EMV Chip */}
                      <div className="h-10 w-14 bg-gradient-to-br from-yellow-200 via-yellow-400 to-yellow-600 rounded-lg shadow-inner flex items-center justify-center overflow-hidden border border-white/20 shrink-0">
                        <div className="grid grid-cols-3 grid-rows-3 gap-0.5 w-full h-full p-1 opacity-45">
                          {Array.from({ length: 9 }).map((_, j) => (
                            <div key={j} className="border border-black/15 rounded-xs" />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Enrolled Metric & Frosted Hologram Avatar */}
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-medium opacity-60">
                          {isTotal ? "Total Registered" : "Schools Enrolled"}
                        </p>
                        <div className="text-3xl font-mono tracking-widest font-black leading-none mt-1">
                          {(plan.count || 0).toString().padStart(4, "0")}
                        </div>
                      </div>

                      {/* Overlapping Frosted Glass Badge with Building Icon */}
                      <div className="flex -space-x-3 items-center">
                        <div className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg">
                          <BuildingIcon size={18} className="text-white" />
                        </div>
                        <div className="h-7 w-7 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                          <CreditCard size={13} className="text-white/80" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Search and Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 p-4 sm:p-5 rounded-3xl shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1">
            <SearchIcon
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              type="search"
              placeholder="Search by institution name, tenant ID, or school code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Plan Filter */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <FilterIcon size={14} className="text-slate-400" />
              <span>Plan:</span>
              <select
                value={planFilter}
                onChange={(e) => {
                  setPlanFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Plans</option>
                {planBreakdown.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
                <option value="FREE">Free Tier (Generic)</option>
                <option value="TRIAL">Trial Mode (Generic)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <SettingsIcon size={14} className="text-slate-400" />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent font-bold text-indigo-600 dark:text-indigo-400 focus:outline-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="INACTIVE">Inactive</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {(planFilter !== "ALL" || statusFilter !== "ALL" || search) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setPlanFilter("ALL");
                  setStatusFilter("ALL");
                  setSearch("");
                  setPage(1);
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white h-9 px-3 rounded-xl cursor-pointer"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Schools Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 rounded-3xl overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-slate-50/80 dark:bg-slate-800/50">
            <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
              <TableHead className="py-4 pl-6 text-slate-400 font-black uppercase tracking-wider text-[10px] w-12">
                #
              </TableHead>
              <TableHead className="py-4 text-slate-400 font-black uppercase tracking-wider text-[10px]">
                Institution Name
              </TableHead>
              <TableHead className="py-4 text-slate-400 font-black uppercase tracking-wider text-[10px]">
                Tenant ID & Code
              </TableHead>
              <TableHead className="py-4 text-slate-400 font-black uppercase tracking-wider text-[10px]">
                Active Plan Tier
              </TableHead>
              <TableHead className="py-4 text-slate-400 font-black uppercase tracking-wider text-[10px]">
                Billing Status
              </TableHead>
              <TableHead className="py-4 text-slate-400 font-black uppercase tracking-wider text-[10px]">
                Enrolled On
              </TableHead>
              <TableHead className="py-4 pr-6 text-right text-slate-400 font-black uppercase tracking-wider text-[10px]">
                Manage
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i} className="border-slate-100 dark:border-slate-800">
                  <TableCell className="pl-6 py-4">
                    <Skeleton className="h-5 w-4" />
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Skeleton className="h-8 w-8 ml-auto rounded-lg" />
                  </TableCell>
                </TableRow>
              ))
            ) : schools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <BuildingIcon size={32} className="text-slate-300 dark:text-slate-600" />
                    <p className="text-slate-600 dark:text-slate-300 font-bold text-sm">
                      No institutions found
                    </p>
                    <p className="text-slate-400 text-xs max-w-sm">
                      Try adjusting your search terms, changing the tier filter, or clearing the status criteria.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              schools.map((school: PlatformSchoolSummary, index: number) => {
                const isActive = school.subscriptionStatus === "ACTIVE";
                const isExpired = school.subscriptionStatus === "EXPIRED";
                const isSuspended = school.subscriptionStatus === "SUSPENDED";
                const isGrowth = school.plan?.toLowerCase().includes("growth");
                const isStarter = school.plan?.toLowerCase().includes("starter");

                return (
                  <TableRow
                    key={school.id}
                    className="border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/console/schools/${school.id}`)}
                  >
                    {/* Index */}
                    <TableCell className="pl-6 py-4 text-slate-400 font-mono text-xs">
                      {((page - 1) * limit + index + 1).toString().padStart(2, "0")}
                    </TableCell>

                    {/* School Name & Avatar */}
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                          {school.name ? school.name.charAt(0).toUpperCase() : "S"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {school.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                              CODE:
                            </span>
                            <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-300">
                              {school.schoolCode}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Tenant ID with Copy */}
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(school.tenantId, school.id)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-mono text-xs transition-colors cursor-pointer"
                        title="Click to copy Tenant ID"
                      >
                        <span>{school.tenantId}</span>
                        {copiedId === school.id ? (
                          <Check size={12} className="text-emerald-500" />
                        ) : (
                          <Copy size={12} className="text-slate-400" />
                        )}
                      </button>
                    </TableCell>

                    {/* Active Plan Tier */}
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-xl px-2.5 py-1 text-xs font-bold",
                          isGrowth
                            ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                            : isStarter
                            ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300"
                            : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        )}
                      >
                        {school.plan || "Free Tier"}
                      </Badge>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold">
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            isActive
                              ? "bg-emerald-500 animate-pulse"
                              : isExpired
                              ? "bg-red-500"
                              : isSuspended
                              ? "bg-amber-500"
                              : "bg-slate-400"
                          )}
                        />
                        <span
                          className={cn(
                            isActive
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isExpired
                              ? "text-red-600 dark:text-red-400"
                              : isSuspended
                              ? "text-amber-600 dark:text-amber-400"
                              : "text-slate-500 dark:text-slate-400"
                          )}
                        >
                          {school.subscriptionStatus}
                        </span>
                      </div>
                    </TableCell>

                    {/* Joined Date */}
                    <TableCell className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {new Date(school.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>

                    {/* Actions Menu */}
                    <TableCell className="pr-6 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                          >
                            <MoreVerticalIcon size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-56 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5"
                        >
                          <DropdownMenuItem
                            className="rounded-xl py-2.5 cursor-pointer font-medium text-xs flex items-center gap-2.5 text-slate-700 dark:text-slate-200"
                            onClick={() => router.push(`/console/schools/${school.id}`)}
                          >
                            <SearchIcon size={14} className="text-slate-400" />
                            <span>View Full Details & Plan</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="rounded-xl py-2.5 cursor-pointer font-medium text-xs flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400"
                            onClick={() => impersonate.mutate(school.id)}
                          >
                            <ExternalLinkIcon size={14} />
                            <span>Impersonate School Admin</span>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="rounded-xl py-2.5 cursor-pointer font-medium text-xs flex items-center gap-2.5 text-amber-600 dark:text-amber-400"
                            onClick={() => {
                              setSelectedSchool(school);
                              setIsLimitsModalOpen(true);
                            }}
                          >
                            <SettingsIcon size={14} />
                            <span>Override Quota Limits</span>
                          </DropdownMenuItem>

                          <div className="h-[1px] bg-slate-100 dark:bg-slate-800 my-1 mx-1" />

                          {school.subscriptionStatus === "ACTIVE" ? (
                            <DropdownMenuItem
                              className="rounded-xl py-2.5 cursor-pointer font-medium text-xs flex items-center gap-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                              onClick={() =>
                                toggleStatus.mutate({ id: school.id, status: "SUSPENDED" })
                              }
                            >
                              <LockIcon size={14} />
                              <span>Suspend Tenant</span>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="rounded-xl py-2.5 cursor-pointer font-medium text-xs flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                              onClick={() =>
                                toggleStatus.mutate({ id: school.id, status: "ACTIVE" })
                              }
                            >
                              <UnlockIcon size={14} />
                              <span>Restore Tenant Access</span>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {pagination.total > 0 && (
        <div className="flex justify-center pt-2">
          <Pagination
            currentPage={page}
            totalItems={pagination.total}
            itemsPerPage={limit}
            totalPages={pagination.totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Limits Override Modal */}
      {selectedSchool && (
        <LimitsModal
          isOpen={isLimitsModalOpen}
          onClose={() => {
            setIsLimitsModalOpen(false);
            setSelectedSchool(null);
          }}
          school={selectedSchool}
        />
      )}
    </div>
  );
}
