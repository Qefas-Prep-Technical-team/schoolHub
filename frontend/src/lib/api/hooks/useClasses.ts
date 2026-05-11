import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { classService, ClassJoinRequestData } from "../services/classService";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { queryKeys as linkQueryKeys } from "./useLinks";

export const classQueryKeys = {
  all: ["classes"] as const,
  list: (schoolId?: string) => [...classQueryKeys.all, "list", { schoolId }] as const,
  detail: (id: string) => [...classQueryKeys.all, "detail", id] as const,
};

export const useClasses = (schoolId?: string) => {
  return useQuery({
    queryKey: classQueryKeys.list(schoolId),
    queryFn: () => classService.getClasses(schoolId),
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
    refetchInterval: 5000,
    staleTime: 4000,
  });
};

export const useClassAttendanceSummary = (classId: string) => {
  return useQuery({
    queryKey: [...classQueryKeys.all, "attendance-summary", classId],
    queryFn: () => classService.getAttendanceSummary(classId),
    enabled: !!classId,
    refetchInterval: 5000,
    staleTime: 4000,
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
export const useClassTimetable = (classId: string) => {
  return useQuery({
    queryKey: [...classQueryKeys.all, "timetable", classId],
    queryFn: () => classService.getTimetable(classId),
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

export const useUpdateClass = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { 
      name?: string; 
      section?: string; 
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

export const useClassBehaviourAlerts = (classId: string) => {
  return useQuery({
    queryKey: [...classQueryKeys.detail(classId), "behaviour-alerts"],
    queryFn: async () => {
      const response = await apiClient.get(`/classes/${classId}/behaviour-alerts`);
      return response.data.data;
    },
    enabled: !!classId,
  });
};

export const useAllTeachers = () => {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: () => classService.getAllTeachers(),
    staleTime: 60000,
  });
};
