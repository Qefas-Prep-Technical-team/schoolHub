"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  usePlatformSchoolDetails,
  useUpdateSchoolPlan,
  useAllPlatformPlans,
  useUpdateSchoolStatus,
  useDeletePlatformSchool,
  useImpersonateAdmin,
} from "@/lib/api/hooks/usePlatformSchools";
import { useResetSchoolSubscription } from "@/lib/api/hooks/usePlatformBilling";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import {
  Building2 as BuildingIcon,
  Calendar as CalendarIcon,
  ChevronLeft as ChevronLeftIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  CreditCard as CreditCardIcon,
  Zap as ZapIcon,
  ShieldCheck as ShieldCheckIcon,
  ExternalLink as ExternalLinkIcon,
  Users as UsersIcon,
  BookOpen as BookOpenIcon,
  FileText as FileTextIcon,
  Save as SaveIcon,
  Clock as ClockIcon,
  Lock as LockIcon,
  Unlock as UnlockIcon,
  Cloud as CloudIcon,
  RotateCcw as RotateCcwIcon,
  CheckCircle2 as CheckCircle2Icon,
  ShieldAlert as ShieldAlertIcon,
  AlertTriangle as AlertTriangleIcon,
  Check as CheckIcon,
  Trash2 as TrashIcon,
  Layers,
  Sparkles,
  Sliders,
  DollarSign,
  Globe,
  Award,
  RefreshCw,
  PlusCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { format } from "date-fns";

// Available School Tier Presets
const PRESET_SCHOOL_PLANS = [
  {
    type: "FREE",
    name: "Free Tier",
    badge: "STARTER",
    price: "₦0",
    students: 50,
    teachers: 5,
    exams: 10,
    storage: "1 GB",
    color: "slate",
    description: "Essential school features for small or testing setups",
  },
  {
    type: "BASIC",
    name: "Basic School",
    badge: "GROWING",
    price: "₦15,000 / mo",
    students: 250,
    teachers: 25,
    exams: 50,
    storage: "10 GB",
    color: "blue",
    description: "Core features for small primary and private academies",
  },
  {
    type: "STANDARD",
    name: "Standard School",
    badge: "POPULAR",
    price: "₦35,000 / mo",
    students: 500,
    teachers: 50,
    exams: 150,
    storage: "25 GB",
    color: "emerald",
    description: "Standard institutional package for established schools",
  },
  {
    type: "PRO",
    name: "Pro School",
    badge: "RECOMMENDED",
    price: "₦70,000 / mo",
    students: 1000,
    teachers: 100,
    exams: 500,
    storage: "50 GB",
    color: "indigo",
    description: "Comprehensive enterprise package with advanced analytics and AI",
  },
  {
    type: "GROWTH",
    name: "Growth / Enterprise",
    badge: "MAXIMUM",
    price: "₦150,000 / mo",
    students: 5000,
    teachers: 250,
    exams: "Unlimited",
    storage: "150 GB",
    color: "purple",
    description: "Multi-campus enterprise institutions with massive capacity",
  },
];

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string; icon: React.ElementType }
> = {
  ACTIVE: {
    label: "ACTIVE",
    badgeClass:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: CheckCircle2Icon,
  },
  SUSPENDED: {
    label: "SUSPENDED",
    badgeClass:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: ShieldAlertIcon,
  },
  EXPIRED: {
    label: "EXPIRED",
    badgeClass: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
    icon: ClockIcon,
  },
  INACTIVE: {
    label: "INACTIVE",
    badgeClass:
      "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    icon: ClockIcon,
  },
  DEACTIVATED: {
    label: "DEACTIVATED",
    badgeClass:
      "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    icon: LockIcon,
  },
};

export default function SchoolDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const {
    data: school,
    isLoading,
    error,
    refetch,
  } = usePlatformSchoolDetails(id as string);
  const { data: plans } = useAllPlatformPlans();
  const updatePlan = useUpdateSchoolPlan();
  const toggleStatus = useUpdateSchoolStatus();
  const deleteSchoolMutation = useDeletePlatformSchool();
  const impersonate = useImpersonateAdmin();
  const resetSubscription = useResetSchoolSubscription();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<
    "subscription" | "usage" | "profile" | "admins" | "emails"
  >("subscription");

  // Subscription Control State
  const [selectedPlanType, setSelectedPlanType] = useState<string>("FREE");
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [status, setStatus] = useState<string>("ACTIVE");
  const [endDate, setEndDate] = useState<string>("");
  const [isTrial, setIsTrial] = useState<boolean>(false);
  const [trialEndDate, setTrialEndDate] = useState<string>("");
  const [billingCycle, setBillingCycle] = useState<string>("monthly");

  // Quota overrides state
  const [maxStudentsOverride, setMaxStudentsOverride] = useState<string>("");
  const [maxTeachersOverride, setMaxTeachersOverride] = useState<string>("");
  const [maxExamsOverride, setMaxExamsOverride] = useState<string>("");
  const [maxClassesOverride, setMaxClassesOverride] = useState<string>("");
  const [maxStorageGbOverride, setMaxStorageGbOverride] = useState<string>("");

  // Modals state
  const [isResetDialogOpen, setIsResetDialogOpen] = useState<boolean>(false);
  const [resetConfirmText, setResetConfirmText] = useState<string>("");
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("ACTIVE");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // Sync state from server on school data load
  useEffect(() => {
    if (school) {
      setSelectedPlanType(school.plan ? school.plan.toUpperCase() : "FREE");
      setSelectedPlanId(school.subscriptionPlanId || "");
      setStatus(school.subscriptionStatus || "ACTIVE");
      setEndDate(
        school.subscriptionEnd
          ? new Date(school.subscriptionEnd).toISOString().split("T")[0]
          : ""
      );
      setIsTrial(Boolean(school.isTrialActive));
      setTrialEndDate(
        school.trialEndsAt
          ? new Date(school.trialEndsAt).toISOString().split("T")[0]
          : ""
      );
      setBillingCycle(school.billingCycle || "monthly");

      setMaxStudentsOverride(
        school.maxStudentsOverride !== null && school.maxStudentsOverride !== undefined
          ? String(school.maxStudentsOverride)
          : ""
      );
      setMaxTeachersOverride(
        school.maxTeachersOverride !== null && school.maxTeachersOverride !== undefined
          ? String(school.maxTeachersOverride)
          : ""
      );
      setMaxExamsOverride(
        school.maxExamsOverride !== null && school.maxExamsOverride !== undefined
          ? String(school.maxExamsOverride)
          : ""
      );
      setMaxClassesOverride(
        school.maxClassesOverride !== null && school.maxClassesOverride !== undefined
          ? String(school.maxClassesOverride)
          : ""
      );
      setMaxStorageGbOverride(
        school.maxStorageGbOverride !== null && school.maxStorageGbOverride !== undefined
          ? String(school.maxStorageGbOverride)
          : ""
      );
    }
  }, [school]);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse p-8">
        <div className="h-10 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem]"></div>
            <div className="h-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem]"></div>
          </div>
          <div className="space-y-8">
            <div className="h-[500px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] space-y-6 text-center px-4">
        <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
          <BuildingIcon size={40} className="opacity-20" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
            School not found
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm max-w-md">
            {error
              ? "We encountered an issue while retrieving this school's records. Please check the ID or try again."
              : "The school record you're looking for doesn't exist or has been removed from the platform."}
          </p>
        </div>
        <div className="flex items-center gap-4 pt-4">
          <Button
            variant="outline"
            className="rounded-2xl font-black uppercase tracking-widest text-[10px]"
            onClick={() => router.push("/console/schools")}
          >
            Back to Schools
          </Button>
          <Button
            className="rounded-2xl font-black uppercase tracking-widest text-[10px] bg-indigo-600 hover:bg-indigo-700"
            onClick={() => refetch()}
          >
            Retry Connection
          </Button>
        </div>
      </div>
    );
  }

  // Quick Extender Helpers
  const extendExpiry = (months: number) => {
    const base = endDate ? new Date(endDate) : new Date();
    base.setMonth(base.getMonth() + months);
    setEndDate(base.toISOString().split("T")[0]);
    setStatus("ACTIVE");
  };

  const handleQuickActivatePro = () => {
    setSelectedPlanType("PRO");
    setStatus("ACTIVE");
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setEndDate(nextYear.toISOString().split("T")[0]);
    setIsTrial(false);
    setBillingCycle("yearly");
  };

  const handleQuickGrantTrial = () => {
    setIsTrial(true);
    setStatus("ACTIVE");
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);
    setTrialEndDate(trialEnd.toISOString().split("T")[0]);
    setEndDate(trialEnd.toISOString().split("T")[0]);
  };

  const handleClearOverrides = () => {
    setMaxStudentsOverride("");
    setMaxTeachersOverride("");
    setMaxExamsOverride("");
    setMaxClassesOverride("");
    setMaxStorageGbOverride("");
  };

  // Save Plan & Subscription Override to backend
  const handleSavePlan = () => {
    const planData: Record<string, unknown> = {
      plan: selectedPlanType,
      subscriptionPlanId: selectedPlanId || undefined,
      subscriptionStatus: status,
      subscriptionEnd: endDate ? new Date(endDate).toISOString() : null,
      isTrialActive: isTrial,
      trialEndsAt: trialEndDate ? new Date(trialEndDate).toISOString() : null,
      billingCycle,
      maxStudentsOverride:
        maxStudentsOverride.trim() !== "" ? Number(maxStudentsOverride) : null,
      maxTeachersOverride:
        maxTeachersOverride.trim() !== "" ? Number(maxTeachersOverride) : null,
      maxExamsOverride:
        maxExamsOverride.trim() !== "" ? Number(maxExamsOverride) : null,
      maxClassesOverride:
        maxClassesOverride.trim() !== "" ? Number(maxClassesOverride) : null,
      maxStorageGbOverride:
        maxStorageGbOverride.trim() !== "" ? Number(maxStorageGbOverride) : null,
    };

    updatePlan.mutate({ id: id as string, planData });
  };

  const isDeactivated =
    school.subscriptionStatus === "DEACTIVATED" ||
    school.subscriptionStatus === "SUSPENDED";

  const currentStatusInfo =
    STATUS_CONFIG[school.subscriptionStatus] || STATUS_CONFIG.ACTIVE;

  // Handle school status toggle
  const handleApplyStatusChange = () => {
    const shouldDeactivate =
      selectedStatus === "DEACTIVATED" ||
      selectedStatus === "SUSPENDED" ||
      selectedStatus === "INACTIVE";
    toggleStatus.mutate(
      {
        id: school.id,
        status: selectedStatus,
        isActive: !shouldDeactivate,
      },
      {
        onSuccess: () => {
          setIsStatusDialogOpen(false);
        },
      }
    );
  };

  const handleDeleteSchool = async ({
    adminPassword,
    reason,
  }: {
    adminPassword: string;
    reason?: string;
  }) => {
    try {
      await deleteSchoolMutation.mutateAsync({
        id: school.id,
        adminPassword,
        reason,
      });
      setIsDeleteModalOpen(false);
      router.push("/console/schools");
    } catch (error) {
      console.error("Failed to delete school:", error);
    }
  };

  // Capacity calculations for metric cards
  const studentLimit =
    school.usage?.limits?.students ??
    school.maxStudentsOverride ??
    school.subscriptionPlan?.maxStudents ??
    50;
  const currentStudents =
    school.usage?.usage?.students ?? school._count?.students ?? 0;
  const studentPercent =
    studentLimit > 0 ? Math.min(Math.round((currentStudents / studentLimit) * 100), 100) : 0;

  const teacherLimit =
    school.usage?.limits?.teachers ??
    school.maxTeachersOverride ??
    school.subscriptionPlan?.maxTeachers ??
    10;
  const currentTeachers =
    school.usage?.usage?.teachers ?? school._count?.teachers ?? 0;
  const teacherPercent =
    teacherLimit > 0 ? Math.min(Math.round((currentTeachers / teacherLimit) * 100), 100) : 0;

  const storageLimit =
    school.usage?.limits?.storageGb ??
    school.maxStorageGbOverride ??
    school.subscriptionPlan?.maxStorageGb ??
    1;
  const currentStorage = school.usage?.usage?.storageGb ?? 0;
  const storagePercent =
    storageLimit > 0 ? Math.min(Math.round((currentStorage / storageLimit) * 100), 100) : 0;

  return (
    <div className="space-y-8 pb-24 text-slate-900 dark:text-white">
      {/* ── Top Bar: Navigation & Primary Platform Actions ──────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Button
          variant="ghost"
          className="text-slate-500 hover:text-slate-900 dark:hover:text-white -ml-3 self-start font-bold"
          onClick={() => router.push("/console/schools")}
        >
          <ChevronLeftIcon size={18} className="mr-1" /> Back to Schools Directory
        </Button>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold gap-2 h-10 px-4"
            onClick={() => impersonate.mutate(school.id)}
            disabled={impersonate.isPending}
          >
            <ExternalLinkIcon size={14} className="text-indigo-500" />
            <span>Impersonate Admin</span>
          </Button>

          <Button
            size="sm"
            onClick={() => {
              setSelectedStatus(isDeactivated ? "ACTIVE" : "SUSPENDED");
              setIsStatusDialogOpen(true);
            }}
            className={cn(
              "rounded-xl text-xs font-bold gap-2 h-10 px-4 transition-all",
              !isDeactivated
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
            )}
          >
            {!isDeactivated ? <LockIcon size={14} /> : <UnlockIcon size={14} />}
            <span>{!isDeactivated ? "Suspend Access" : "Activate Access"}</span>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            className="rounded-xl text-xs font-bold gap-2 h-10 px-4 bg-red-600 hover:bg-red-700 shadow-sm"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <TrashIcon size={14} />
            <span>Delete School</span>
          </Button>
        </div>
      </div>

      {/* ── Section 1: Executive School Identity Banner ──────── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            {/* School Logo */}
            <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden shrink-0">
              {school.logo ? (
                <Image
                  src={school.logo}
                  alt={school.name}
                  fill
                  className="object-contain p-2"
                />
              ) : (
                <BuildingIcon size={36} className="text-slate-400 dark:text-slate-600" />
              )}
            </div>

            {/* School Titles */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white truncate">
                  {school.name}
                </h1>
                <Badge
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
                    currentStatusInfo.badgeClass
                  )}
                >
                  {school.subscriptionStatus || "ACTIVE"}
                </Badge>
                {school.isTrialActive && (
                  <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase tracking-wider">
                    TRIAL MODE
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-bold text-slate-700 dark:text-slate-300">
                  CODE: {school.schoolCode}
                </span>
                <span>•</span>
                <span className="font-mono text-slate-400 truncate max-w-xs">
                  TENANT: {school.tenantId}
                </span>
                {school.schoolType && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{school.schoolType}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Plan Identity Badge on Right */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800/80 flex items-center gap-4 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <ZapIcon size={24} />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Current Active Plan
              </div>
              <div className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {school.plan || "FREE"}
              </div>
              <div className="text-[11px] text-slate-500 font-medium capitalize">
                {school.billingCycle || "Monthly"} Billing
              </div>
            </div>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2 truncate">
            <MailIcon size={14} className="text-indigo-500 shrink-0" />
            <span className="truncate">{school.schoolEmail || "No official email provided"}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <PhoneIcon size={14} className="text-emerald-500 shrink-0" />
            <span className="truncate">{school.phone || "No phone listed"}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <MapPinIcon size={14} className="text-rose-500 shrink-0" />
            <span className="truncate">{school.address || "Location unspecified"}</span>
          </div>
        </div>
      </div>

      {/* ── Section 2: Key Operational Metrics ────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Students Meter */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <UsersIcon size={15} className="text-blue-500" />
              <span>Students</span>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {studentPercent}% Cap
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {currentStudents}
            </span>
            <span className="text-xs text-slate-500">
              Limit: {studentLimit > 0 ? studentLimit : "Unlimited"}
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${studentPercent}%` }}
            />
          </div>
        </div>

        {/* Teachers Meter */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <BookOpenIcon size={15} className="text-emerald-500" />
              <span>Teachers</span>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {teacherPercent}% Cap
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {currentTeachers}
            </span>
            <span className="text-xs text-slate-500">
              Limit: {teacherLimit > 0 ? teacherLimit : "Unlimited"}
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${teacherPercent}%` }}
            />
          </div>
        </div>

        {/* Classes & Exams */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Layers size={15} className="text-indigo-500" />
              <span>Classes & Exams</span>
            </div>
            <Badge className="bg-indigo-500/10 text-indigo-600 border-none text-[9px] h-4">
              ACTIVE
            </Badge>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {school._count?.classes || 0}
            </span>
            <span className="text-xs text-slate-500">
              {school._count?.exams || 0} Exams Created
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-semibold truncate">
            {school.subscriptionPlan?.maxClasses || 50} Max Classes Allowed
          </div>
        </div>

        {/* Cloud Storage */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <CloudIcon size={15} className="text-cyan-500" />
              <span>Storage Used</span>
            </div>
            <span className="text-xs font-bold text-slate-400">
              {storagePercent}%
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {currentStorage} GB
            </span>
            <span className="text-xs text-slate-500">
              Limit: {storageLimit} GB
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-500"
              style={{ width: `${storagePercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Section 3: Navigation Tabs ───────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("subscription")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shrink-0",
            activeTab === "subscription"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <CreditCardIcon size={15} />
          <span>Subscription & Plan Control</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("usage")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shrink-0",
            activeTab === "usage"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <Sliders size={15} />
          <span>Utilization & Capacity</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("admins")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shrink-0",
            activeTab === "admins"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <UsersIcon size={15} />
          <span>Administrators ({school.admins?.length || school._count?.admins || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("profile")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shrink-0",
            activeTab === "profile"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <BuildingIcon size={15} />
          <span>Institution Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("emails")}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shrink-0",
            activeTab === "emails"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <MailIcon size={15} />
          <span>Email Logs ({school.emailLogs?.length || 0})</span>
        </button>
      </div>

      {/* ── TAB 1: SUBSCRIPTION & PLAN CONTROL SUITE ─────────────── */}
      {activeTab === "subscription" && (
        <div className="space-y-8">
          {/* Top Quick Actions Bar */}
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="text-indigo-600 dark:text-indigo-400 shrink-0" size={20} />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Quick Institutional Presets
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Instantly configure school access with standard presets
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleQuickActivatePro}
                className="rounded-xl text-xs font-bold border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              >
                Activate Pro (1 Year)
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleQuickGrantTrial}
                className="rounded-xl text-xs font-bold border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              >
                Grant 14-Day Free Trial
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => extendExpiry(1)}
                className="rounded-xl text-xs font-bold border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
              >
                +1 Month Extension
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Cols: Interactive Plan Selector & Quota Controls */}
            <div className="lg:col-span-8 space-y-8">
              {/* 1. Plan Tier Chooser Cards */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                      <Award size={18} className="text-indigo-500" />
                      Select Institutional Plan Tier
                    </h3>
                    <p className="text-xs text-slate-500">
                      Click any tier to apply preset capacity and features
                    </p>
                  </div>
                  <Badge className="bg-indigo-500/10 text-indigo-600 border-none font-bold text-xs uppercase">
                    Selected: {selectedPlanType}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
                  {PRESET_SCHOOL_PLANS.map((planPreset) => {
                    const isSelected =
                      selectedPlanType.toLowerCase() === planPreset.type.toLowerCase();

                    return (
                      <div
                        key={planPreset.type}
                        onClick={() => setSelectedPlanType(planPreset.type)}
                        className={cn(
                          "p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 relative group",
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/20"
                            : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-950/40"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {planPreset.badge}
                            </span>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-1.5">
                              {planPreset.name}
                            </h4>
                          </div>

                          <div
                            className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                              isSelected
                                ? "border-indigo-600 bg-indigo-600 text-white"
                                : "border-slate-300 dark:border-slate-700"
                            )}
                          >
                            {isSelected && <CheckIcon size={12} strokeWidth={3} />}
                          </div>
                        </div>

                        <div className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                          {planPreset.price}
                        </div>

                        <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex justify-between">
                            <span>Students:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">
                              {planPreset.students}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Teachers:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">
                              {planPreset.teachers}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Storage:</span>
                            <span className="font-bold text-slate-700 dark:text-slate-200">
                              {planPreset.storage}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Granular Quota & Limit Overrides */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                      <Sliders size={18} className="text-emerald-500" />
                      Granular Quota & Capacity Overrides
                    </h3>
                    <p className="text-xs text-slate-500">
                      Override maximum limits specifically for {school.name}. Leave blank to use plan default.
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleClearOverrides}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  >
                    Reset Overrides
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Student Limit */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Max Students</span>
                      {maxStudentsOverride && (
                        <span className="text-[10px] text-amber-500 font-bold">OVERRIDDEN</span>
                      )}
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 500"
                      value={maxStudentsOverride}
                      onChange={(e) => setMaxStudentsOverride(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Teacher Limit */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Max Teachers</span>
                      {maxTeachersOverride && (
                        <span className="text-[10px] text-amber-500 font-bold">OVERRIDDEN</span>
                      )}
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50"
                      value={maxTeachersOverride}
                      onChange={(e) => setMaxTeachersOverride(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Exam Limit */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Max Exams</span>
                      {maxExamsOverride && (
                        <span className="text-[10px] text-amber-500 font-bold">OVERRIDDEN</span>
                      )}
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 200"
                      value={maxExamsOverride}
                      onChange={(e) => setMaxExamsOverride(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Class Limit */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Max Classes</span>
                      {maxClassesOverride && (
                        <span className="text-[10px] text-amber-500 font-bold">OVERRIDDEN</span>
                      )}
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 30"
                      value={maxClassesOverride}
                      onChange={(e) => setMaxClassesOverride(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  {/* Storage Limit */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Storage (GB)</span>
                      {maxStorageGbOverride && (
                        <span className="text-[10px] text-amber-500 font-bold">OVERRIDDEN</span>
                      )}
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 25"
                      value={maxStorageGbOverride}
                      onChange={(e) => setMaxStorageGbOverride(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Subscription Status & Expiration Control Form */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <CreditCardIcon className="text-indigo-600 dark:text-indigo-400" size={20} />
                  <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white uppercase">
                    Override Controls
                  </h3>
                </div>

                {/* Status Switcher */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Subscription Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="ACTIVE">ACTIVE (Full access)</option>
                    <option value="SUSPENDED">SUSPENDED (Temporarily blocked)</option>
                    <option value="EXPIRED">EXPIRED (Payment required)</option>
                    <option value="INACTIVE">INACTIVE (Dormant)</option>
                    <option value="DEACTIVATED">DEACTIVATED (Locked out)</option>
                  </select>
                </div>

                {/* Expiration Date & Extender */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Expiration Date
                    </label>
                    <button
                      type="button"
                      onClick={() => setEndDate("")}
                      className="text-[10px] text-indigo-500 font-bold hover:underline"
                    >
                      Clear / No Expiry
                    </button>
                  </div>

                  <div className="relative">
                    <CalendarIcon
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                    />
                  </div>

                  {/* Quick Extenders */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => extendExpiry(1)}
                      className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      +1 Mo
                    </button>
                    <button
                      type="button"
                      onClick={() => extendExpiry(3)}
                      className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      +3 Mo
                    </button>
                    <button
                      type="button"
                      onClick={() => extendExpiry(6)}
                      className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      +6 Mo
                    </button>
                    <button
                      type="button"
                      onClick={() => extendExpiry(12)}
                      className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      +1 Yr
                    </button>
                  </div>
                </div>

                {/* Billing Interval */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Billing Cycle
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="monthly">Monthly Cycle</option>
                    <option value="yearly">Yearly Cycle</option>
                  </select>
                </div>

                {/* Trial Mode Toggle */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClockIcon size={14} className="text-indigo-500" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        Is Trial Active?
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isTrial}
                      onChange={(e) => setIsTrial(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>

                  {isTrial && (
                    <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">
                        Trial Ends At
                      </label>
                      <input
                        type="date"
                        value={trialEndDate}
                        onChange={(e) => setTrialEndDate(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                      />
                    </div>
                  )}
                </div>

                {/* Main Apply Button */}
                <Button
                  type="button"
                  onClick={handleSavePlan}
                  disabled={updatePlan.isPending}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold h-12 rounded-xl shadow-lg shadow-indigo-600/25 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
                >
                  <SaveIcon size={16} />
                  <span>
                    {updatePlan.isPending ? "Applying Changes..." : "Save Subscription Changes"}
                  </span>
                </Button>

                {/* Revert to Free Reset Dialog */}
                <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full border-red-500/20 text-red-500 hover:bg-red-500/10 text-xs font-bold h-10 rounded-xl"
                      disabled={resetSubscription.isPending}
                    >
                      <RotateCcwIcon size={14} className="mr-1.5" />
                      <span>Reset to Default Free Tier</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-slate-800 text-white rounded-3xl p-6">
                    <DialogHeader>
                      <DialogTitle className="text-lg font-black uppercase text-white">
                        Confirm Reset to Free
                      </DialogTitle>
                      <DialogDescription className="text-slate-400 text-xs mt-1">
                        This will revert <strong className="text-white">{school.name}</strong> to the
                        standard Free tier and clear all manual overrides.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                      <p className="text-xs text-slate-400">
                        Type <span className="font-bold text-red-400">"reset"</span> to confirm:
                      </p>
                      <input
                        type="text"
                        value={resetConfirmText}
                        onChange={(e) => setResetConfirmText(e.target.value)}
                        placeholder="reset"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        variant="ghost"
                        onClick={() => setIsResetDialogOpen(false)}
                        className="text-xs text-slate-400"
                      >
                        Cancel
                      </Button>
                      <Button
                        disabled={
                          resetConfirmText.toLowerCase() !== "reset" ||
                          resetSubscription.isPending
                        }
                        onClick={() => {
                          resetSubscription.mutate(
                            { schoolId: school.id },
                            {
                              onSuccess: () => {
                                setIsResetDialogOpen(false);
                                setResetConfirmText("");
                              },
                            }
                          );
                        }}
                        className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                      >
                        {resetSubscription.isPending ? "Resetting..." : "Confirm Reset"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: UTILIZATION & CAPACITY ────────────────────────── */}
      {activeTab === "usage" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            {
              label: "Enrolled Students",
              current: currentStudents,
              total: studentLimit,
              percent: studentPercent,
              icon: UsersIcon,
              color: "blue",
              description: "Total students currently linked and active in this school",
            },
            {
              label: "Teaching Faculty",
              current: currentTeachers,
              total: teacherLimit,
              percent: teacherPercent,
              icon: BookOpenIcon,
              color: "emerald",
              description: "Teachers with active roster assignments and gradebook access",
            },
            {
              label: "Examinations & Assessments",
              current: school._count?.exams || 0,
              total: school.usage?.limits?.exams ?? 50,
              percent: Math.min(
                Math.round(
                  ((school._count?.exams || 0) / (school.usage?.limits?.exams ?? 50)) * 100
                ),
                100
              ),
              icon: FileTextIcon,
              color: "orange",
              description: "Live exams, CBT assessments, and offline gradebook sessions",
            },
            {
              label: "Cloud Storage",
              current: `${currentStorage} GB`,
              total: `${storageLimit} GB`,
              percent: storagePercent,
              icon: CloudIcon,
              color: "cyan",
              description: "File attachments, student submissions, and uploaded school assets",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <item.icon size={20} className="text-indigo-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {item.label}
                    </h4>
                    <p className="text-[11px] text-slate-500">{item.description}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-slate-900 dark:text-white">
                    {item.current}
                  </span>
                  <span className="text-xs text-slate-500"> / {item.total}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-700",
                      item.percent > 90 ? "bg-red-500" : "bg-indigo-600"
                    )}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                  <span>Capacity Utilization</span>
                  <span>{item.percent}% Reached</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 3: ADMINISTRATORS ────────────────────────────────── */}
      {activeTab === "admins" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <UsersIcon size={18} className="text-indigo-500" />
                School Administrators Directory
              </h3>
              <p className="text-xs text-slate-500">
                Staff members authorized to administer {school.name}
              </p>
            </div>
          </div>

          {(school.admins?.length ?? 0) > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {school.admins!.map((sa, idx) => {
                const admin = sa.admin;
                return (
                  <div
                    key={admin?.id || idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
                        {admin?.name?.charAt(0) || "A"}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {admin?.name || "Administrator"}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">{admin?.email}</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                      <span className="font-mono bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                        {admin?.adminCode || "NO CODE"}
                      </span>
                      <span className="text-slate-400 capitalize">{admin?.role || "Admin"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              <UsersIcon size={36} className="mx-auto mb-2 opacity-30" />
              <p>No administrators registered for this school.</p>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: INSTITUTION PROFILE ───────────────────────────── */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <BuildingIcon size={14} className="text-indigo-500" />
              General Information
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">School Name:</span>
                <span className="font-bold text-slate-900 dark:text-white">{school.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">School Code:</span>
                <span className="font-mono font-bold text-indigo-600">{school.schoolCode}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Tenant Identifier:</span>
                <span className="font-mono text-slate-400">{school.tenantId}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Registration Date:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {school.createdAt ? format(new Date(school.createdAt), "PPP") : "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <DollarSign size={14} className="text-emerald-500" />
              Payment & Settlement Integration
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Last Payment Date:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {school.lastPaymentDate ? format(new Date(school.lastPaymentDate), "PPP") : "Never"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Paystack Subaccount:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {school.paystackSubaccountCode || "Not Connected"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Settlement Status:</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px]">
                  {school.paystackSubaccountStatus || "Pending"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: EMAIL LOGS ────────────────────────────────────── */}
      {activeTab === "emails" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <MailIcon size={18} className="text-indigo-500" />
            Communication Logs
          </h3>

          {(school.emailLogs?.length ?? 0) > 0 ? (
            <div className="space-y-3">
              {school.emailLogs!.map((log, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{log.subject}</p>
                    <p className="text-[11px] text-slate-500">
                      To: {log.recipientEmail} • {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      "text-[10px] font-bold border-none",
                      log.status === "SENT"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-red-500/10 text-red-600"
                    )}
                  >
                    {log.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs">
              <MailIcon size={36} className="mx-auto mb-2 opacity-30" />
              <p>No communication logs recorded for this school.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Operational Status Dialog ────────────────────────────── */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">Change School Status</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update institutional access status for {school.name} ({school.schoolCode})
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
            {["ACTIVE", "SUSPENDED", "DEACTIVATED", "INACTIVE"].map((st) => (
              <div
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={cn(
                  "p-3.5 rounded-2xl border-2 cursor-pointer transition-all text-xs font-bold flex items-center justify-between",
                  selectedStatus === st
                    ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                )}
              >
                <span>{st}</span>
                {selectedStatus === st && <CheckIcon size={14} />}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setIsStatusDialogOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyStatusChange}
              disabled={toggleStatus.isPending}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              {toggleStatus.isPending ? "Updating..." : "Confirm Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteSchool}
        entityName={school.name}
        entityType="School"
        identifier={school.schoolCode}
        isLoading={deleteSchoolMutation.isPending}
      />
    </div>
  );
}
