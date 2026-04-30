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
