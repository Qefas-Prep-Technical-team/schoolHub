"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Users,
  ArrowRight,
  Check,
  Search,
  AlertTriangle,
} from "lucide-react";
import { classService } from "@/lib/api/services/classService";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { toast } from "react-toastify";

interface PromoteStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  classData: any;
}

const PromoteStudentsModal: React.FC<PromoteStudentsModalProps> = ({
  isOpen,
  onClose,
  classData,
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [targetClassId, setTargetClassId] = useState<string>("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");

  // Fetch all classes for the school to select the target class
  const { data: allClasses = [], isLoading: loadingClasses } = useQuery({
    queryKey: ["school-classes", schoolId],
    queryFn: () => classService.getClasses(schoolId),
    enabled: isOpen && !!schoolId,
  });

  const promoteMutation = useMutation({
    mutationFn: async () => {
      if (!targetClassId) throw new Error("Please select a destination class.");
      if (selectedStudentIds.length === 0)
        throw new Error("Please select at least one student to promote.");

      return await classService.promoteStudents(classData.id, {
        toClassId: targetClassId,
        studentIds: selectedStudentIds,
      });
    },
    onSuccess: (res) => {
      toast.success(res?.message || "Students successfully promoted.");
      queryClient.invalidateQueries({
        queryKey: ["single-class", classData.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["single-class", targetClassId],
      });
      queryClient.invalidateQueries({ queryKey: ["school-classes"] });
      onClose();
      // Reset state
      setSelectedStudentIds([]);
      setTargetClassId("");
    },
    onError: (error: any) => {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Failed to promote students.";
      toast.error(msg);
    },
  });

  // Filter out the current class from the destination options
  const targetClassOptions = useMemo(() => {
    return allClasses.filter((c: any) => c.id !== classData?.id);
  }, [allClasses, classData?.id]);

  const students = useMemo(() => {
    return classData?.enrollments?.map((e: any) => e.student) || [];
  }, [classData]);

  const filteredStudents = useMemo(() => {
    return students.filter(
      (s: any) =>
        s?.name?.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
        s?.studentCode?.toLowerCase().includes(studentSearchTerm.toLowerCase()),
    );
  }, [students, studentSearchTerm]);

  // Handle Select All
  const handleSelectAll = () => {
    if (
      selectedStudentIds.length === filteredStudents.length &&
      filteredStudents.length > 0
    ) {
      // If all currently filtered are selected, deselect them
      const filteredIds = filteredStudents.map((s: any) => s.id);
      setSelectedStudentIds((prev) =>
        prev.filter((id) => !filteredIds.includes(id)),
      );
    } else {
      // Select all filtered
      const newIds = [...selectedStudentIds];
      filteredStudents.forEach((s: any) => {
        if (!newIds.includes(s.id)) newIds.push(s.id);
      });
      setSelectedStudentIds(newIds);
    }
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    promoteMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ArrowRight className="text-primary" size={24} />
              Promote Students
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Move students from{" "}
              <span className="font-bold text-gray-700 dark:text-gray-300">
                {classData?.name}
              </span>{" "}
              to another class.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Target Class Selection */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl p-4">
            <label className="block text-sm font-bold text-gray-900 dark:text-white mb-2">
              Destination Class
            </label>
            <select
              value={targetClassId}
              onChange={(e) => setTargetClassId(e.target.value)}
              className="w-full px-4 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              required
            >
              <option value="">-- Select Target Class --</option>
              {loadingClasses ? (
                <option disabled>Loading classes...</option>
              ) : targetClassOptions.length === 0 ? (
                <option disabled>No other classes available</option>
              ) : (
                targetClassOptions.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.section ? `(${c.section})` : ""} -{" "}
                    {c.level || "No Level"}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Student Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users size={16} className="text-gray-500" />
                Select Students to Promote ({selectedStudentIds.length} /{" "}
                {students.length})
              </label>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
              >
                {selectedStudentIds.length === filteredStudents.length &&
                filteredStudents.length > 0
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search students in this class..."
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
              />
            </div>

            <div className="max-h-[240px] overflow-y-auto space-y-1.5 custom-scrollbar pr-2 mt-2">
              {students.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                  <AlertTriangle
                    className="mx-auto text-amber-500 mb-2"
                    size={24}
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No students enrolled in this class.
                  </p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-500">
                  No students match your search.
                </p>
              ) : (
                filteredStudents.map((student: any) => {
                  const isSelected = selectedStudentIds.includes(student.id);
                  return (
                    <div
                      key={student.id}
                      onClick={() => toggleStudent(student.id)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? "bg-primary/5 border-primary/30"
                          : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs uppercase ${
                            isSelected
                              ? "bg-primary text-white"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {student.name?.charAt(0)}
                        </div>
                        <div>
                          <p
                            className={`text-sm font-semibold ${isSelected ? "text-primary" : "text-gray-900 dark:text-white"}`}
                          >
                            {student.name}
                          </p>
                          <p className="text-[10px] text-gray-500 font-medium">
                            {student.studentCode}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center ${
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-gray-300 dark:border-gray-600 bg-transparent"
                        }`}
                      >
                        {isSelected && (
                          <Check size={14} className="text-white" />
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
              disabled={promoteMutation.isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                promoteMutation.isPending ||
                selectedStudentIds.length === 0 ||
                !targetClassId
              }
            >
              {promoteMutation.isPending
                ? "Promoting..."
                : `Promote ${selectedStudentIds.length} Student(s)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromoteStudentsModal;
