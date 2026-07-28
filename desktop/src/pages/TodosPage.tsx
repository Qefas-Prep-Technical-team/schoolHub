import React, { useEffect, useState } from "react";
import { Plus, Search, CheckCircle2, Circle, Trash2, Tag, Filter, RefreshCw } from "lucide-react";
import { TodoRepository } from "../repositories";
import { TodoRecord, SyncStatus } from "../types/database";
import { useSyncStore } from "../store/useSyncStore";

export const TodosPage: React.FC = () => {
  const [todos, setTodos] = useState<TodoRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "completed">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<"low" | "medium" | "high">("medium");

  const todoRepo = new TodoRepository();
  const { updatePendingCount, triggerSync } = useSyncStore();

  const loadTodos = async () => {
    const records = await todoRepo.findMany();
    setTodos(records);
    await updatePendingCount();
  };

  useEffect(() => {
    loadTodos();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    await todoRepo.create({
      userId: "user_admin_01",
      title: newTitle.trim(),
      description: newDescription.trim() || null,
      isCompleted: 0,
      priority: newPriority,
      dueDate: null,
    });

    setNewTitle("");
    setNewDescription("");
    setIsModalOpen(false);
    await loadTodos();
    triggerSync();
  };

  const handleToggle = async (id: string, currentStatus: number) => {
    await todoRepo.toggleComplete(id, currentStatus === 0);
    await loadTodos();
    triggerSync();
  };

  const handleDelete = async (id: string) => {
    await todoRepo.softDelete(id);
    await loadTodos();
    triggerSync();
  };

  const filteredTodos = todos.filter((todo) => {
    const matchesSearch =
      todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (todo.description && todo.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterStatus === "completed") return matchesSearch && todo.isCompleted === 1;
    if (filterStatus === "pending") return matchesSearch && todo.isCompleted === 0;
    return matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & New Action */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Tasks & Todos Workspace</h1>
          <p className="text-xs text-slate-400 mt-1">
            Offline CRUD operations powered by SQLite and automatic background queue.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg hover:bg-indigo-500 transition"
        >
          <Plus className="h-4 w-4" />
          <span>New Offline Task</span>
        </button>
      </div>

      {/* Controls Bar: Search & Status Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-800 bg-slate-900/80 p-3 shadow-inner">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search local SQLite tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-800 bg-slate-950 pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-slate-500 mr-1" />
          {(["all", "pending", "completed"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-lg px-3 py-1 text-xs font-medium capitalize transition ${
                filterStatus === status
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Todo Items List */}
      <div className="space-y-2">
        {filteredTodos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="h-8 w-8 mx-auto text-slate-600" />
            <p className="text-sm font-medium">No tasks found</p>
            <p className="text-xs text-slate-600">Create a task to test offline SQLite persistence.</p>
          </div>
        ) : (
          filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-center justify-between rounded-xl border p-4 transition ${
                todo.isCompleted === 1
                  ? "border-slate-800/60 bg-slate-900/40 text-slate-500"
                  : "border-slate-800 bg-slate-900/90 text-slate-200 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0 pr-4">
                <button
                  onClick={() => handleToggle(todo.id, todo.isCompleted)}
                  className="text-slate-400 hover:text-indigo-400 transition flex-shrink-0"
                >
                  {todo.isCompleted === 1 ? (
                    <CheckCircle2 className="h-5 w-5 text-indigo-400" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <h4 className={`text-sm font-semibold truncate ${todo.isCompleted === 1 ? "line-through" : ""}`}>
                    {todo.title}
                  </h4>
                  {todo.description && (
                    <p className="text-xs text-slate-400 truncate mt-0.5">{todo.description}</p>
                  )}
                </div>
              </div>

              {/* Status Tags */}
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    todo.priority === "high"
                      ? "bg-rose-950/60 text-rose-400 border border-rose-800/50"
                      : todo.priority === "medium"
                      ? "bg-amber-950/60 text-amber-400 border border-amber-800/50"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {todo.priority}
                </span>

                <span
                  className={`rounded-md px-2 py-0.5 text-[10px] font-mono ${
                    todo.syncStatus === SyncStatus.SYNCED
                      ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                      : "bg-amber-950/60 text-amber-300 border border-amber-800/40"
                  }`}
                >
                  {todo.syncStatus}
                </span>

                <button
                  onClick={() => handleDelete(todo.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                  title="Soft Delete Task"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Todo Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100">Create Offline Task</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Task title..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Description</label>
                <textarea
                  rows={3}
                  placeholder="Additional task notes..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Priority Level</label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value as "low" | "medium" | "high")}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow"
                >
                  Save to SQLite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
