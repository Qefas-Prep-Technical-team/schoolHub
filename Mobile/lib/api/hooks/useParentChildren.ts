import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { parentService, ChildSummary } from "../services/parentService";

export const useParentChildren = () => {
    return useQuery<ChildSummary[]>({
        queryKey: ["parent-children"],
        queryFn: async () => {
            return await parentService.getChildren();
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useUpdateChild = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ childId, data }: { childId: string, data: { name?: string; profileImage?: string } }) => {
            return await parentService.updateChild(childId, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["parent-children"] });
        }
    });
};

export const useChildDetails = (childId: string | null) => {
    return useQuery({
        queryKey: ["child-details", childId],
        queryFn: async () => {
            if (!childId) return null;
            return await parentService.getChildDetails(childId);
        },
        enabled: !!childId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

export const useChildAssignments = (childId: string | null) => {
    return useQuery({
        queryKey: ["student-assignments", childId],
        queryFn: async () => {
            if (!childId) return null;
            return await parentService.getChildAssignments(childId);
        },
        enabled: !!childId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};

export const useChildAssignmentDetails = (childId: string | null, assignmentId: string | null) => {
    return useQuery({
        queryKey: ["childAssignmentDetails", childId, assignmentId],
        queryFn: async () => {
            if (!childId || !assignmentId) return null;
            return await parentService.getChildAssignmentDetails(childId, assignmentId);
        },
        enabled: !!childId && !!assignmentId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
};
