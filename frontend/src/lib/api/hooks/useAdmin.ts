import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../services/adminService";

export const adminKeys = {
  all: ["admin"] as const,
  teachers: () => [...adminKeys.all, "teachers"] as const,
  teacher: (id: string) => [...adminKeys.teachers(), id] as const,
  timetable: (teacherId: string, termPeriodId?: string, schoolId?: string) => [...adminKeys.teacher(teacherId), "timetable", termPeriodId, schoolId].filter(Boolean) as string[],
  teacherAttendance: (teacherId: string, schoolId: string, month?: string) => [...adminKeys.teacher(teacherId), "attendance", schoolId, month].filter(Boolean) as string[],
};

export const useTeacherDetails = (teacherId: string) => {
  return useQuery({
    queryKey: adminKeys.teacher(teacherId),
    queryFn: () => adminService.getTeacherById(teacherId),
    enabled: !!teacherId,
  });
};

export const useTeacherTimetable = (teacherId: string, termPeriodId?: string, schoolId?: string) => {
  return useQuery({
    queryKey: adminKeys.timetable(teacherId, termPeriodId, schoolId),
    queryFn: () => adminService.getTeacherTimetable(teacherId, termPeriodId, schoolId),
    enabled: !!teacherId,
  });
};

export const useTeacherAttendance = (teacherId: string, schoolId: string, month?: string) => {
  return useQuery({
    queryKey: adminKeys.teacherAttendance(teacherId, schoolId, month),
    queryFn: () => adminService.getTeacherAttendance(teacherId, schoolId, month),
    enabled: !!teacherId && !!schoolId,
  });
};

export const useSchoolTeacherAttendanceByDate = (schoolId: string, date: string) => {
  return useQuery({
    queryKey: adminKeys.teacherAttendance(schoolId, 'date', date),
    queryFn: () => adminService.getSchoolTeacherAttendanceByDate(schoolId, date),
    enabled: !!schoolId && !!date,
  });
};

export const useSchoolTeacherAttendanceTrend = (schoolId: string, days?: number) => {
  return useQuery({
    queryKey: ['admin', 'teachers', 'attendance-trend', schoolId, days],
    queryFn: () => adminService.getSchoolTeacherAttendanceTrend(schoolId, days),
    enabled: !!schoolId,
  });
};

export const useMarkTeacherAttendance = (teacherId: string, schoolId: string, month?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { schoolId: string; date: string; status: string; note?: string }) => 
      adminService.markTeacherAttendance(teacherId, data),
    onSuccess: () => {
      // Invalidate both specific month and all attendance for this teacher/school
      queryClient.invalidateQueries({ queryKey: adminKeys.teacherAttendance(teacherId, schoolId, month) });
      queryClient.invalidateQueries({ queryKey: adminKeys.teacherAttendance(teacherId, schoolId) });
      toast.success("Attendance marked successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to mark attendance");
    },
  });
};

export const useMarkBulkTeacherAttendance = (schoolId: string, month?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { schoolId: string; records: { teacherId: string; date: string; status: string; note?: string }[] }) => 
      adminService.markBulkTeacherAttendance(data),
    onSuccess: (data, variables) => {
      // Invalidate attendance queries for all affected teachers
      variables.records.forEach(record => {
        queryClient.invalidateQueries({ queryKey: adminKeys.teacherAttendance(record.teacherId, schoolId, month) });
        queryClient.invalidateQueries({ queryKey: adminKeys.teacherAttendance(record.teacherId, schoolId) });
      });
      toast.success("Attendance saved successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to save attendance");
    },
  });
};

export const useUpsertTimetablePeriod = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => adminService.upsertTimetablePeriod(teacherId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.timetable(teacherId) });
      toast.success("Timetable updated successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
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
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to remove period");
    },
  });
};

export const useUpdateTeacher = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => adminService.updateTeacher(teacherId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.teacher(teacherId) });
      queryClient.invalidateQueries({ queryKey: adminKeys.teachers() });
      toast.success("Teacher updated successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to update teacher");
    },
  });
};

export const useAssignTeacherToClass = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (classId: string) => adminService.assignTeacherToClass(teacherId, classId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.teacher(teacherId) });
      toast.success("Teacher assigned to class successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to assign teacher to class");
    },
  });
};

export const useAssignTeacherToSubject = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subjectId: string) => adminService.assignTeacherToSubject(teacherId, subjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.teacher(teacherId) });
      toast.success("Teacher assigned to subject successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to assign teacher to subject");
    },
  });
};

export const useUnassignTeacherFromSubject = (teacherId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subjectId: string) => adminService.unassignTeacherFromSubject(teacherId, subjectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.teacher(teacherId) });
      toast.success("Teacher removed from subject successfully");
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || "Failed to remove teacher from subject");
    },
  });
};
