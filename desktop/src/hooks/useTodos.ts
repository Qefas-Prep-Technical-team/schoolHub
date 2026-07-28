import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "./useRepositories";
import { TodoRecord } from "../types/database";
import { useSyncStore } from "../store/useSyncStore";

export const TODO_QUERY_KEY = ["todos"];

export const useTodos = () => {
  const { todoRepo } = useRepositories();
  const queryClient = useQueryClient();
  const { updatePendingCount, triggerSync } = useSyncStore();

  const todosQuery = useQuery<TodoRecord[]>({
    queryKey: TODO_QUERY_KEY,
    queryFn: async () => {
      return await todoRepo.findMany();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      userId: string;
      title: string;
      description?: string | null;
      priority?: "low" | "medium" | "high";
    }) => {
      const created = await todoRepo.create({
        userId: data.userId,
        title: data.title,
        description: data.description || null,
        isCompleted: 0,
        priority: data.priority || "medium",
        dueDate: null,
      });
      await updatePendingCount();
      triggerSync();
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODO_QUERY_KEY });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      const updated = await todoRepo.toggleComplete(id, isCompleted);
      await updatePendingCount();
      triggerSync();
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODO_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await todoRepo.softDelete(id);
      await updatePendingCount();
      triggerSync();
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TODO_QUERY_KEY });
    },
  });

  return {
    todos: todosQuery.data || [],
    isLoading: todosQuery.isLoading,
    isError: todosQuery.isError,
    refetch: todosQuery.refetch,
    createTodo: createMutation.mutateAsync,
    toggleTodo: toggleMutation.mutateAsync,
    deleteTodo: deleteMutation.mutateAsync,
  };
};
