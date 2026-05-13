import { toast } from "react-toastify"
import { AxiosError } from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore";
import { platformClient } from "../platformClient";

export const usePlatformPlans = () => {
    const { platform_token } = usePlatformStaffStore()

    return useQuery({
        queryKey: ["platform-plans"],
        queryFn: async () => {
            const { data } = await platformClient.get<{ data: Record<string, unknown>[] }>("/platform/billing/plans", {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data.data;
        },
        enabled: !!platform_token,
    })
}

export const useResetStudentSubscription = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: { studentId: string }) => {
            const { data } = await platformClient.post<{ message: string }>(`/platform/billing/reset-student`, payload, {
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
            toast.error(err.response?.data?.message || "Failed to reset student subscription")
        }
    })
}

export const useUpdatePlatformPlan = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ id, planData }: { id: string, planData: Record<string, unknown> }) => {
            const { data } = await platformClient.put<{ message: string }>(`/platform/billing/plans/${id}`, planData, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res: { message: string }) => {
            queryClient.invalidateQueries({ queryKey: ["platform-plans"] })
            toast.success(res.message)
        },
        onError: (err: AxiosError<{ message?: string }>) => {
            toast.error(err.response?.data?.message || "Failed to update plan")
        }
    })
}

export const useCreatePlatformPlan = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (planData: Record<string, unknown>) => {
            const { data } = await platformClient.post<{ message: string }>("/platform/billing/plans", planData, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res: { message: string }) => {
            queryClient.invalidateQueries({ queryKey: ["platform-plans"] })
            toast.success(res.message)
        },
        onError: (err: AxiosError<{ message?: string }>) => {
            toast.error(err.response?.data?.message || "Failed to create plan")
        }
    })
}

export const useAssignSchoolPlan = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: { schoolId: string, planId: string, status: string, endDate?: string }) => {
            const { data } = await platformClient.post<{ message: string }>(`/platform/billing/assign`, payload, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res: { message: string }) => {
            queryClient.invalidateQueries({ queryKey: ["platform-schools"] })
            toast.success(res.message)
        },
        onError: (err: AxiosError<{ message?: string }>) => {
            toast.error(err.response?.data?.message || "Failed to assign plan")
        }
    })
}

export const useResetSchoolSubscription = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: { schoolId: string }) => {
            const { data } = await platformClient.post<{ message: string }>(`/platform/billing/reset`, payload, {
                headers: { Authorization: `Bearer ${platform_token}` }
            });
            return data;
        },
        onSuccess: (res: { message: string }) => {
            queryClient.invalidateQueries({ queryKey: ["platform-schools"] })
            queryClient.invalidateQueries({ queryKey: ["platform-school-detail"] })
            toast.success(res.message)
        },
        onError: (err: AxiosError<{ message?: string }>) => {
            toast.error(err.response?.data?.message || "Failed to reset subscription")
        }
    })
}
export const useResetTeacherSubscription = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: { teacherId: string }) => {
            const { data } = await platformClient.post<{ message: string }>(`/platform/billing/reset-teacher`, payload, {
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
            toast.error(err.response?.data?.message || "Failed to reset teacher subscription")
        }
    })
}
export const useResetParentSubscription = () => {
    const { platform_token } = usePlatformStaffStore()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async (payload: { id: string }) => {
            const { data } = await platformClient.post<{ message: string }>(`/platform/billing/reset-parent`, payload, {
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
            toast.error(err.response?.data?.message || "Failed to reset parent subscription")
        }
    })
}
