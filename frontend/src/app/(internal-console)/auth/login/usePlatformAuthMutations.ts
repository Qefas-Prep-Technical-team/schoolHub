import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { platformClient } from "@/lib/api/platformClient";
import { usePlatformStaffStore } from "@/store/usePlatformStaffStore";
import { toast } from "react-toastify";

export const usePlatformLoginMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const setStaff = usePlatformStaffStore((state) => state.setStaff);

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await platformClient.post("/platform/auth/login", credentials);
      return data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["platform-staff"] });
      
      // Response structure is { success, message, data: { id, fullName, email, role, token } }
      const { token, ...staffData } = response.data;
      setStaff(staffData, token);
      
      toast.success(`Welcome back, ${staffData.fullName}`);
      
      setTimeout(() => {
        router.push("/console");
      }, 800);
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Platform login failed";
      toast.error(errorMessage);
    },
  });
};

export const usePlatformLogoutMutation = () => {
    const router = useRouter();
    const clearStaff = usePlatformStaffStore((state) => state.clearStaff);
  
    return useMutation({
      mutationFn: async () => {
        await platformClient.post("/platform/auth/logout");
      },
      onSuccess: () => {
        clearStaff();
        toast.info("Logged out from Operations Console");
        router.push("/auth/login?type=platform");
      },
      onError: () => {
        clearStaff(); // Clear anyway
        router.push("/auth/login?type=platform");
      },
    });
  };
