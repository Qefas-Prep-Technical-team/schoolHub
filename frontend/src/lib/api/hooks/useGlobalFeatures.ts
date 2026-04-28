import { useQuery } from "@tanstack/react-query"
import axios from "axios"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

/**
 * Hook to fetch enabled features for a specific role
 * This is meant for public areas like sidebars
 */
export const useGlobalFeatures = (role: 'student' | 'teacher' | 'parent' | 'admin') => {
    return useQuery({
        queryKey: ["global-features", role],
        queryFn: async () => {
            const { data } = await axios.get(`${API_BASE_URL}/platform/config/features/${role}`);
            return data.data as Record<string, boolean>;
        },
        // Cache for 5 minutes, refetch on window focus to get latest admin changes
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
    })
}
