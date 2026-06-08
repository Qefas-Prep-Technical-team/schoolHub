import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { classService, ClassJoinRequestData } from "../services/classService";
import { apiClient } from "../client";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { queryKeys as linkQueryKeys } from "./useLinks";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";

export const classQueryKeys = {
  all: ["classes"] as const,
  list: (schoolId?: string) => [...classQueryKeys.all, "list", { schoolId }] as const,
  detail: (id: string) => [...classQueryKeys.all, "detail", id] as const,
};

export const useClasses = (schoolId?: string) => {
  const { user } = useAuthStore();
  const isAdmin = user?.userType === "ADMIN";

  return useQuery({
    queryKey: classQueryKeys.list(schoolId),
    queryFn: () => classService.getClasses(schoolId),
    enabled: isAdmin ? !!schoolId : true,
    refetchInterval: 5000, // Refetch every 5 seconds for "real-time" feel
    staleTime: 4000,       // Keep data fresh for 4 seconds
    refetchIntervalInBackground: true, // Continue polling when tab is not focused if needed
  });
};

export const useSingleClass = (id: string) => {
  return useQuery({
    queryKey: classQueryKeys.detail(id),
    queryFn: () => classService.getSingleClass(id),
    enabled: !!id,
    refetchInterval: 5000, // Polling for real-time updates
    staleTime: 4000,
  });
};

export const usePreviewClassById = (id: string) => {
  return useQuery({
    queryKey: [...classQueryKeys.all, "preview", id],
    queryFn: () => classService.previewClassById(id),
    enabled: !!id,
    staleTime: 60000, // Metadata doesn't change often
  });
};

export const useRequestToJoinClass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ClassJoinRequestData) => classService.requestToJoinClass(data),
    onSuccess: () => {
      // Invalidate link requests since join requests are also link requests in the backend
      queryClient.invalidateQueries({ queryKey: linkQueryKeys.requests() });
      queryClient.invalidateQueries({ queryKey: linkQueryKeys.pending() });
      toast.success("Class join request sent successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to send class join request");
    },
  });
};

// Attendance Hooks
export const useClassAttendance = (classId: string, date?: string) => {
  return useQuery({
    queryKey: [...classQueryKeys.all, "attendance", classId, { date }],
    queryFn: () => classService.getAttendance(classId, date),
    enabled: !!classId,
    staleTime: 60000,
  });
};

export const useClassAttendanceSummary = (classId: string, month?: string) => {
  return useQuery({
    queryKey: [...classQueryKeys.all, "attendance-summary", classId, { month }],
    queryFn: () => classService.getAttendanceSummary(classId, month),
    enabled: !!classId,
    staleTime: 60000,
  });
};

export const useClassStats = (classId: string) => {
  return useQuery({
    queryKey: [...classQueryKeys.all, "stats", classId],
    queryFn: () => classService.getClassStats(classId),
    enabled: !!classId,
    refetchInterval: 10000, // Analytics can be slightly slower
    staleTime: 8000,
  });
};

export const useSubmitAttendance = (classId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (records: Record<string, unknown>[]) => classService.submitAttendance(classId, records),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...classQueryKeys.all, "attendance", classId] });
      queryClient.invalidateQueries({ queryKey: [...classQueryKeys.all, "attendance-summary", classId] });
      toast.success("Attendance saved successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to save attendance");
    },
  });
};

// Timetable Hooks
export const useClassTimetable = (classId: string, termPeriodId?: string) => {
  return useQuery({
    queryKey: [...classQueryKeys.all, "timetable", classId, { termPeriodId }],
    queryFn: () => classService.getTimetable(classId, termPeriodId),
    enabled: !!classId,
    refetchInterval: 5000,
    staleTime: 4000,
  });
};

export const useUpsertTimetablePeriod = (classId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => classService.upsertTimetablePeriod(classId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...classQueryKeys.all, "timetable", classId] });
      toast.success("Timetable updated successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update timetable");
    },
  });
};

export const useDeleteTimetablePeriod = (classId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (periodId: string) => classService.deleteTimetablePeriod(classId, periodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...classQueryKeys.all, "timetable", classId] });
      toast.success("Period removed successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to remove period");
    },
  });
};

export const useAutoGenerateTimetable = (classId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (termPeriodId: string) => classService.autoGenerateTimetable(classId, termPeriodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...classQueryKeys.all, "timetable", classId] });
      toast.success("Timetable auto-generated successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to auto-generate timetable");
    },
  });
};

export const useReplicateTimetable = (classId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sourceTermPeriodId, targetTermPeriodId }: { sourceTermPeriodId: string; targetTermPeriodId: string }) =>
      classService.replicateTimetable(classId, sourceTermPeriodId, targetTermPeriodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...classQueryKeys.all, "timetable", classId] });
      toast.success("Timetable replicated successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to replicate timetable");
    },
  });
};

export const useUpdateClass = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { 
      name?: string; 
      section?: string; 
      term?: string;
      session?: string;
      level?: string;
      teacherIds?: string[]; 
      departmentIds?: string[];
      studentIds?: string[];
    }) =>
      classService.updateClass(id, data),
    onSuccess: (updatedClass) => {
      queryClient.setQueryData(classQueryKeys.detail(id), updatedClass);
      queryClient.invalidateQueries({ queryKey: classQueryKeys.list() });
      toast.success("Class updated successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update class");
    },
  });
};

export const useClassBehaviourAlerts = (classId: string, studentId?: string) => {
  return useQuery({
    queryKey: [...classQueryKeys.detail(classId), "behaviour-alerts", { studentId }],
    queryFn: () => classService.getBehaviourAlerts(classId, studentId),
    enabled: !!classId,
  });
};

export const useCreateBehaviourAlert = (classId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { type: string; title: string; description?: string; studentId: string }) =>
      classService.createBehaviourAlert(classId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...classQueryKeys.detail(classId), "behaviour-alerts"] });
      toast.success("Behaviour alert logged successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to log behaviour alert");
    },
  });
};

export const useUpdateBehaviourAlert = (classId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ alertId, data }: { alertId: string; data: { type?: string; title?: string; description?: string } }) =>
      classService.updateBehaviourAlert(classId, alertId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...classQueryKeys.detail(classId), "behaviour-alerts"] });
      toast.success("Behaviour alert updated successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update behaviour alert");
    },
  });
};

export const useDeleteBehaviourAlert = (classId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alertId: string) => classService.deleteBehaviourAlert(classId, alertId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...classQueryKeys.detail(classId), "behaviour-alerts"] });
      toast.success("Behaviour alert removed");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to remove behaviour alert");
    },
  });
};

export const useAllTeachers = () => {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: () => classService.getAllTeachers(),
    staleTime: 60000,
  });
};
