import { useQuery } from "@tanstack/react-query";
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
