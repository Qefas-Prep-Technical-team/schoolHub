import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { platformClient } from "../platformClient"
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore"
import { toast } from "react-toastify"
import { AxiosError } from "axios";

export interface PlatformPlanTab {
    id: string;
    name: string;
    type: string;
    [key: string]: unknown;
}

export interface PlatformPlanCategory {
    category: string;
    tabs: PlatformPlanTab[];
}

export interface PlatformParentDetails {
    id: string;
    fullName: string;
    email: string;
    parentCode: string;
    phone?: string;
    subscriptionStatus: string;
    plan: string;
    createdAt: string;
    verified: boolean;
    role: string;
    trialEndsAt?: string;
    subscriptionEnd?: string;
    children: {
        id: string;
        studentId: string;
        student: {
            id: string;
            name: string;
            studentCode: string;
            school?: {
                id: string;
                name: string;
                schoolCode: string;
            };
        };
    }[];
    _count: {
        children: number;
        payments: number;
    };
}

export interface PlatformParentSummary {
    id: string;
    fullName: string;
    email: string;
    parentCode: string;
    phone?: string;
    subscriptionStatus: string;
    createdAt: string;
    _count?: {
        children: number;
    };
}

export interface PlatformStatusBreakdown {
    type: string;
    count: number;
}

export interface PlatformStudentSummary {
    id: string;
    name: string;
    studentCode: string;
    email: string;
    gradeLevel: string;
    subscriptionStatus: string;
    createdAt: string;
    school?: {
        id: string;
        name: string;
    };
}

export interface PlatformTeacherSummary {
    id: string;
    name: string;
    teacherCode: string;
    email: string;
    jobTitle: string;
    subscriptionStatus: string;
    createdAt: string;
    primarySchool?: {
        id: string;
        name: string;
    };
}

export interface PlatformPaginatedResponse<T> {
    success: boolean;
    data: T[];
    planBreakdown: Record<string, unknown>[];
    statusBreakdown: Record<string, unknown>[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface PlatformSchoolDetails {
    id: string;
    name: string;
    schoolCode: string;
    tenantId: string;
    logo?: string;
    schoolEmail?: string;
    phone?: string;
    address?: string;
    subscriptionStatus: string;
    plan: string;
    subscriptionPlanId?: string;
    subscriptionEnd?: string;
    isTrialActive: boolean;
    trialEndsAt?: string;
    billingCycle?: string;
    lastPaymentDate?: string;
    createdAt: string;
    maxStudentsOverride?: number;
    maxExamsOverride?: number;
    maxClassesOverride?: number;
    maxStorageGbOverride?: number;
    maxTeachersOverride?: number;
    paystackCustomerCode?: string;
    paystackSubaccountCode?: string;
    paystackSubaccountStatus?: string;
    subscriptionPlan?: {
        id: string;
        name: string;
        maxStudents?: number;
        maxExams?: number;
        maxClasses?: number;
        maxStorageGb?: number;
        maxTeachers?: number;
        maxParents?: number;
    };
    settlementAccounts?: {
        id: string;
        paystackSubaccountCode: string;
        paystackSubaccountStatus: string;
        bankName: string;
        accountNumber: string;
        percentageCharge: number;
        isDefault: boolean;
    }[];
    emailLogs?: {
        subject: string;
        recipientEmail: string;
        body: string;
        status: string;
        type: string;
        createdAt: string;
    }[];
    _count?: {
        students: number;
        Teacher_Teacher_activeSchoolIdToSchool: number;
        admins: number;
        exams: number;
        classes: number;
    };
}

export interface PlatformTeacherDetails {
    id: string;
    name: string;
    email: string;
    teacherCode: string;
    subscriptionStatus: string;
    plan: string;
    createdAt: string;
    verified: boolean;
    role: string;
    subscriptionPlanId?: string;
    isTrialActive: boolean;
    trialEndsAt?: string;
    subscriptionEnd?: string;
    profileImage?: string;
    jobTitle?: string;
    gender?: string;
    bio?: string;
    authProvider?: string;
    billingCycle?: string;
    lastPaymentDate?: string;
    primarySchool?: {
        id: string;
        name: string;
        schoolCode: string;
        tenantId: string;
    };
    teacherSubjects?: unknown[];
    classTeachers?: unknown[];
    _count?: {
        teacherSubjects: number;
        classTeachers: number;
        exams: number;
    };
}

export interface PlatformStudentDetails {
    id: string;
    name: string;
    email: string;
    studentCode: string;
    subscriptionStatus: string;
    plan: string;
    createdAt: string;
    verified: boolean;
    role: string;
    gradeLevel?: string;
    subscriptionPlanId?: string;
    isTrialActive: boolean;
    trialEndsAt?: string;
    subscriptionEnd?: string;
    profileImage?: string;
    dateOfBirth?: string;
    termAverage?: number;
    authProvider?: string;
    billingCycle?: string;
    lastPaymentDate?: string;
    school?: {
        id: string;
        name: string;
        schoolCode: string;
        tenantId: string;
    };
    department?: unknown;
    classes?: unknown[];
    parentLinks?: unknown[];
    _count?: {
        attendances: number;
        behaviourAlerts: number;
        examAttempts: number;
        grades: number;
        classes?: number;
    };
}


export const usePlatformSchools = (query: string = "", page: number = 1, limit: number = 10, plan: string = "ALL", status: string = "ALL") => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-schools", query, page, limit, plan, status],
        queryFn: async () => {
            const { data } = await platformClient.get<PlatformPaginatedResponse<PlatformSchoolSummary>>(`/platform/support/schools?query=${query}&page=${page}&limit=${limit}&plan=${plan}&status=${status}`, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        enabled: !!platform_token,
    })
}

/**
 * Get detailed school information for support console
 */
export const usePlatformSchoolDetails = (id: string) => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-school-details", id],
        queryFn: async () => {
            const { data } = await platformClient.get<{ data: PlatformSchoolDetails }>(`/platform/support/schools/${id}`, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data;
        },
        enabled: !!platform_token && !!id,
    })
}

export const useUpdateSchoolStatus = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, status }: { id: string, status: string }) => {
            const { data } = await platformClient.patch<{ message: string }>(`/platform/support/schools/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res: { message: string }) => {
            queryClient.invalidateQueries({ queryKey: ["platform-schools"] })
            queryClient.invalidateQueries({ queryKey: ["platform-school-details"] })
            toast.success(res.message)
        },
        onError: (err: AxiosError<{ message?: string }>) => {
            toast.error(err.response?.data?.message || "Failed to update school status")
        }
    })
}

export const useImpersonateAdmin = () => {
    const { platform_token } = usePlatformStaffStore()

    return useMutation({
        mutationFn: async (schoolId: string) => {
            const { data } = await platformClient.post<{ adminName: string; token: string }>(`/platform/support/impersonate`, { schoolId }, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (data: { adminName: string; token: string }) => {
            toast.success(`Access tunnel established for ${data.adminName}`)
            // Open dashboard in new tab with token (impersonation)
            window.open(`/dashboard/admin?token=${data.token}`, "_blank")
        },
        onError: (err: AxiosError<{ message?: string }>) => {
            toast.error(err.response?.data?.message || "Impersonation failed")
        }
    })
}

export const useUpdateSchoolLimits = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, limits }: { id: string, limits: Record<string, unknown> }) => {
            const { data } = await platformClient.patch<{ message: string }>(`/platform/support/schools/${id}/limits`, limits, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res: { message: string }) => {
            queryClient.invalidateQueries({ queryKey: ["platform-schools"] })
            queryClient.invalidateQueries({ queryKey: ["platform-school-details"] })
            toast.success(res.message)
        },
        onError: (err: AxiosError<{ message?: string }>) => {
            toast.error(err.response?.data?.message || "Failed to update school limits")
        }
    })
}

/**
 * Manually update a school's subscription plan
 */
export const useUpdateSchoolPlan = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, planData }: { id: string, planData: Record<string, unknown> }) => {
            const { data } = await platformClient.patch<{ message: string }>(`/platform/support/schools/${id}/plan`, planData, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res: { message: string }) => {
            queryClient.invalidateQueries({ queryKey: ["platform-schools"] })
            queryClient.invalidateQueries({ queryKey: ["platform-school-details"] })
            toast.success(res.message)
        },
        onError: (err: AxiosError<{ message?: string }>) => {
            toast.error(err.response?.data?.message || "Failed to update school plan")
        }
    })
}

/**
 * Get all available subscription plans for platform staff
 */
export const useAllPlatformPlans = () => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-all-plans"],
        queryFn: async () => {
            const { data } = await platformClient.get<{ data: PlatformPlanCategory[] }>(`/platform/support/plans`, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data;
        },
        enabled: !!platform_token,
    })
}

/**
 * Search students across the platform
 */
export const usePlatformStudents = (query: string = "", status: string = "ALL", page: number = 1, limit: number = 20, plan: string = "ALL") => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-students", query, status, page, limit, plan],
        queryFn: async () => {
            const { data } = await platformClient.get<PlatformPaginatedResponse<PlatformStudentSummary>>(`/platform/support/students?query=${query}&status=${status}&page=${page}&limit=${limit}&plan=${plan}`, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        enabled: !!platform_token,
    })
}

export const usePlatformStudentDetails = (id: string) => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-student-details", id],
        queryFn: async () => {
            const { data } = await platformClient.get<{ data: PlatformStudentDetails }>(`/platform/support/students/${id}`, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data;
        },
        enabled: !!platform_token && !!id,
    })
}

export const useUpdateStudentPlan = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, planData }: { id: string, planData: Record<string, unknown> }) => {
            const { data } = await platformClient.patch<{ message: string }>(`/platform/support/students/${id}/plan`, planData, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res: { message: string }) => {
            queryClient.invalidateQueries({ queryKey: ["platform-students"] })
            queryClient.invalidateQueries({ queryKey: ["platform-student-details"] })
            toast.success(res.message)
        },
        onError: (err: AxiosError<{ message?: string }>) => {
            toast.error(err.response?.data?.message || "Failed to update student plan")
        }
    })
}

/**
 * Search teachers across the platform
 */
export const usePlatformTeachers = (query: string = "", page: number = 1, limit: number = 20, plan: string = "ALL", status: string = "ALL") => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-teachers", query, page, limit, plan, status],
        queryFn: async () => {
            const { data } = await platformClient.get<PlatformPaginatedResponse<PlatformTeacherSummary>>(`/platform/support/teachers?query=${query}&page=${page}&limit=${limit}&plan=${plan}&status=${status}`, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        enabled: !!platform_token,
    })
}

/**
 * Search parents across the platform
 */
export const usePlatformParents = (query: string = "", page: number = 1, limit: number = 20, plan: string = "ALL", status: string = "ALL") => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-parents", query, page, limit, plan, status],
        queryFn: async () => {
            const { data } = await platformClient.get<PlatformPaginatedResponse<PlatformParentSummary>>(`/platform/support/parents?query=${query}&page=${page}&limit=${limit}&plan=${plan}&status=${status}`, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        enabled: !!platform_token,
    })
}

/**
 * Get all platform features for management
 */
export const usePlatformFeatures = () => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-features"],
        queryFn: async () => {
            const { data } = await platformClient.get<{ data: Record<string, unknown>[] }>(`/platform/support/features`, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data;
        },
        enabled: !!platform_token,
    })
}

/**
 * Update a platform feature toggle state
 */
export const useUpdatePlatformFeature = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, updateData }: { id: string, updateData: Record<string, unknown> }) => {
            const { data } = await platformClient.patch<{ message: string }>(`/platform/support/features/${id}`, updateData, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res: { message: string }) => {
            queryClient.invalidateQueries({ queryKey: ["platform-features"] })
            queryClient.invalidateQueries({ queryKey: ["platform-features-manifest"] })
            toast.success(res.message)
        },
        onError: (err: AxiosError<{ message?: string }>) => {
            toast.error(err.response?.data?.message || "Failed to update feature")
        }
    })
}
export const usePlatformTeacherDetails = (id: string) => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-teacher-details", id],
        queryFn: async () => {
            const { data } = await platformClient.get<{ data: PlatformTeacherDetails }>(`/platform/support/teachers/${id}`, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data;
        },
        enabled: !!platform_token && !!id,
    })
}

export const useUpdateTeacherPlan = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, planData }: { id: string, planData: Record<string, unknown> }) => {
            const { data } = await platformClient.patch<{ message: string }>(`/platform/support/teachers/${id}/plan`, planData, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res: { message: string }) => {
            queryClient.invalidateQueries({ queryKey: ["platform-teachers"] })
            queryClient.invalidateQueries({ queryKey: ["platform-teacher-details"] })
            toast.success(res.message)
        },
        onError: (err: AxiosError<{ message?: string }>) => {
            toast.error(err.response?.data?.message || "Failed to update teacher plan")
        }
    })
}
export const usePlatformParentDetails = (id: string) => {
    const { platform_token } = usePlatformStaffStore()
    return useQuery({
        queryKey: ["platform-parent-details", id],
        queryFn: async () => {
            const { data } = await platformClient.get<{ data: PlatformParentDetails }>(`/platform/support/parents/${id}`, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data;
        },
        enabled: !!id && !!platform_token
    })
}

export const useUpdateParentPlan = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, planData }: { id: string, planData: Record<string, unknown> }) => {
            const { data } = await platformClient.patch<{ message: string }>(`/platform/support/parents/${id}/plan`, planData, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res: { message: string }) => {
            queryClient.invalidateQueries({ queryKey: ["platform-parents"] })
            queryClient.invalidateQueries({ queryKey: ["platform-parent-details"] })
            toast.success(res.message)
        },
        onError: (err: AxiosError<{ message?: string }>) => {
            toast.error(err.response?.data?.message || "Failed to update parent plan")
        }
    })
}
