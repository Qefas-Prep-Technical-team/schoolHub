"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { CreatePaperForm } from "../../components/CreatePaperForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FilePlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateStandalonePaperPage() {
  const { user } = useAuthStore();
  const schoolId = user?.defaultTenantId;

  const { data: subjects = [], isLoading: isLoadingSubjects } = useQuery({
    queryKey: ["all-subjects"],
    queryFn: async () => {
      const { data } = await apiClient.get("/academic/subjects");
      return data.data || data;
    },
  });

  const { data: teachers = [], isLoading: isLoadingTeachers } = useQuery({
    queryKey: ["all-teachers", schoolId],
    queryFn: async () => {
      const { data } = await apiClient.get(`/schools/${schoolId}/teachers`);
      return data.data || data;
    },
    enabled: !!schoolId,
  });

  const isLoading = isLoadingSubjects || isLoadingTeachers;

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard/admin/exams" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mb-4 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Exams
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-xl">
              <FilePlus className="text-blue-600" size={28} />
            </div>
            Create Subject Paper
          </h1>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-gray-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-3xl overflow-hidden ring-1 ring-gray-100 dark:ring-gray-800">
        <CardHeader className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 p-8">
          <CardTitle className="text-xl">Paper Details</CardTitle>
          <CardDescription>
            Fill in the information below to create a new subject assessment paper. 
            You can link this paper to an examination later.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <CreatePaperForm 
            subjects={subjects} 
            teachers={teachers} 
            isLoadingData={isLoading}
            redirectOnSuccess="/dashboard/admin/exams/papers/[id]"
          />
        </CardContent>
      </Card>

      <div className="mt-8 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 rounded-2xl p-6 flex gap-4 items-start">
        <div className="bg-amber-100 dark:bg-amber-800 p-2 rounded-lg text-amber-600">
          <FilePlus size={20} />
        </div>
        <div>
          <h4 className="font-bold text-amber-900 dark:text-amber-100 text-sm">Standalone Paper</h4>
          <p className="text-amber-700 dark:text-amber-300 text-xs mt-1 leading-relaxed">
            Standalone papers are not immediately part of any multi-subject examination. 
            They will appear as "Unlinked" in your dashboard tabs until you associate them with an exam.
          </p>
        </div>
      </div>
    </div>
  );
}
