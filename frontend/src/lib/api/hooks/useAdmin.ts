import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/adminService";
import { toast } from "react-toastify";

export const adminKeys = {
  all: ["admin"] as const,
  teachers: () => [...adminKeys.all, "teachers"] as const,
  teacher: (id: string) => [...adminKeys.teachers(), id] as const,
  timetable: (teacherId: string) => [...adminKeys.teacher(teacherId), "timetable"] as const,
};

export const useTeacherDetails = (teacherId: string) => {
  return useQuery({
    queryKey: adminKeys.teacher(teacherId),
    queryFn: () => adminService.getTeacherById(teacherId),
    enabled: !!teacherId,
  });
};

export const useTeacherTimetable = (teacherId: string) => {
  return useQuery({
    queryKey: adminKeys.timetable(teacherId),
    queryFn: () => adminService.getTeacherTimetable(teacherId),
    enabled: !!teacherId,
  });
};

export const useUpsertTimetablePeriod = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminService.upsertTimetablePeriod(teacherId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.timetable(teacherId) });
      toast.success("Timetable updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update timetable");
    },
  });
};

export const useDeleteTimetablePeriod = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (periodId: string) => adminService.deleteTimetablePeriod(teacherId, periodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.timetable(teacherId) });
      toast.success("Period removed successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to remove period");
    },
  });
};

export const useUpdateTeacher = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => adminService.updateTeacher(teacherId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.teacher(teacherId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.teachers() });
      toast.success("Teacher updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update teacher");
    },
  });
};
