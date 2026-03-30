import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { classService, ClassJoinRequestData } from "../services/classService";
import { toast } from "react-toastify";
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
  });
};

export const useSingleClass = (id: string) => {
  return useQuery({
    queryKey: classQueryKeys.detail(id),
    queryFn: () => classService.getSingleClass(id),
    enabled: !!id,
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
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send class join request");
    },
  });
};
