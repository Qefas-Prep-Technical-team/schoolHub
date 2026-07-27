import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "./useRepositories";

export const SETTINGS_QUERY_KEY = ["settings"];

export const useSettings = () => {
  const { settingsRepo } = useRepositories();
  const queryClient = useQueryClient();

  const getSettingQuery = (key: string) => {
    return useQuery<string | null>({
      queryKey: [...SETTINGS_QUERY_KEY, key],
      queryFn: async () => {
        return await settingsRepo.getByKey(key);
      },
    });
  };

  const setSettingMutation = useMutation({
    mutationFn: async ({ key, value, category }: { key: string; value: string; category?: string }) => {
      return await settingsRepo.setKey(key, value, category);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...SETTINGS_QUERY_KEY, variables.key] });
    },
  });

  return {
    getSetting: getSettingQuery,
    setSetting: setSettingMutation.mutateAsync,
  };
};
