import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { platformClient } from "../platformClient"
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore"
import { toast } from "react-toastify"

export const usePlatformSchools = (query: string = "", page: number = 1, limit: number = 10, plan: string = "ALL", status: string = "ALL") => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-schools", query, page, limit, plan, status],
        queryFn: async () => {
            const { data } = await platformClient.get(`/platform/support/schools?query=${query}&page=${page}&limit=${limit}&plan=${plan}&status=${status}`, {
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
            const { data } = await platformClient.get(`/platform/support/schools/${id}`, {
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
            const { data } = await platformClient.patch(`/platform/support/schools/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["platform-schools"] })
            queryClient.invalidateQueries({ queryKey: ["platform-school-details"] })
            toast.success(res.message)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update school status")
        }
    })
}

export const useImpersonateAdmin = () => {
    const { platform_token } = usePlatformStaffStore()

    return useMutation({
        mutationFn: async (schoolId: string) => {
            const { data } = await platformClient.post(`/platform/support/impersonate`, { schoolId }, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (data) => {
            toast.success(`Access tunnel established for ${data.adminName}`)
            // Open dashboard in new tab with token (impersonation)
            window.open(`/dashboard/admin?token=${data.token}`, "_blank")
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Impersonation failed")
        }
    })
}

export const useUpdateSchoolLimits = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, limits }: { id: string, limits: any }) => {
            const { data } = await platformClient.patch(`/platform/support/schools/${id}/limits`, limits, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["platform-schools"] })
            queryClient.invalidateQueries({ queryKey: ["platform-school-details"] })
            toast.success(res.message)
        },
        onError: (err: any) => {
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
        mutationFn: async ({ id, planData }: { id: string, planData: any }) => {
            const { data } = await platformClient.patch(`/platform/support/schools/${id}/plan`, planData, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["platform-schools"] })
            queryClient.invalidateQueries({ queryKey: ["platform-school-details"] })
            toast.success(res.message)
        },
        onError: (err: any) => {
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
            const { data } = await platformClient.get(`/platform/support/plans`, {
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
export const usePlatformStudents = (query: string = "", status: string = "ALL", page: number = 1, limit: number = 20) => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-students", query, status, page, limit],
        queryFn: async () => {
            const { data } = await platformClient.get(`/platform/support/students?query=${query}&status=${status}&page=${page}&limit=${limit}`, {
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
            const { data } = await platformClient.get(`/platform/support/students/${id}`, {
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
        mutationFn: async ({ id, planData }: { id: string, planData: any }) => {
            const { data } = await platformClient.patch(`/platform/support/students/${id}/plan`, planData, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["platform-students"] })
            queryClient.invalidateQueries({ queryKey: ["platform-student-details"] })
            toast.success(res.message)
        },
        onError: (err: any) => {
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
            const { data } = await platformClient.get(`/platform/support/teachers?query=${query}&page=${page}&limit=${limit}&plan=${plan}&status=${status}`, {
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
            const { data } = await platformClient.get(`/platform/support/parents?query=${query}&page=${page}&limit=${limit}&plan=${plan}&status=${status}`, {
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
            const { data } = await platformClient.get(`/platform/support/features`, {
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
        mutationFn: async ({ id, updateData }: { id: string, updateData: any }) => {
            const { data } = await platformClient.patch(`/platform/support/features/${id}`, updateData, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["platform-features"] })
            queryClient.invalidateQueries({ queryKey: ["platform-features-manifest"] })
            toast.success(res.message)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update feature")
        }
    })
}
export const usePlatformTeacherDetails = (id: string) => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-teacher-details", id],
        queryFn: async () => {
            const { data } = await platformClient.get(`/platform/support/teachers/${id}`, {
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
        mutationFn: async ({ id, planData }: { id: string, planData: any }) => {
            const { data } = await platformClient.patch(`/platform/support/teachers/${id}/plan`, planData, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["platform-teachers"] })
            queryClient.invalidateQueries({ queryKey: ["platform-teacher-details"] })
            toast.success(res.message)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update teacher plan")
        }
    })
}
export const usePlatformParentDetails = (id: string) => {
    const { platform_token } = usePlatformStaffStore()
    return useQuery({
        queryKey: ["platform-parent-details", id],
        queryFn: async () => {
            const { data } = await platformClient.get(`/platform/support/parents/${id}`, {
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
        mutationFn: async ({ id, planData }: { id: string, planData: any }) => {
            const { data } = await platformClient.patch(`/platform/support/parents/${id}/plan`, planData, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["platform-parents"] })
            queryClient.invalidateQueries({ queryKey: ["platform-parent-details"] })
            toast.success(res.message)
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update parent plan")
        }
    })
}
