"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { useDashboardStore } from '@/lib/api/hooks/useDashboardStore';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, FileText, Check, Globe, Settings as SettingsIcon, Trash2, Users, LayoutList, Eye, EyeOff, Loader2, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import QuestionManager from "./components/QuestionManager";
import { useUpdateAssignmentStatus } from "@/lib/api/hooks/useAssignments";
import { toast } from "react-toastify";
import SettingsModal from "./components/SettingsModal";
import SubmissionList from "./components/SubmissionList";
import { useState } from "react";
import VideoPlayer from "@/components/ui/VideoPlayer";


export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { selectedSchoolId } = useDashboardStore();
  const { user } = useAuthStore();
  const assignmentId = params.id as string;
  const effectiveSchoolId = selectedSchoolId || user?.schools?.[0]?.schoolId || user?.tenantId || "";
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateAssignmentStatus(effectiveSchoolId);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { data: assignmentData, isLoading, isPending, isError } = useQuery({
    queryKey: ["assignment-detail", assignmentId],
    queryFn: async () => {
      const response = await apiClient.get(`/assignment/admin/${assignmentId}`, {
        headers: { 'x-school-id': effectiveSchoolId }
      }); 
      return response.data.data;
    },
    enabled: !!assignmentId && !!effectiveSchoolId,
  });

  if (isLoading || isPending || (!assignmentData && !isError)) {
    return (
      <div className="min-h-screen bg-gray-50/30 dark:bg-gray-950/30 animate-pulse">
        {/* Sticky Header Skeleton */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Skeleton className="h-9 w-9 sm:h-10 sm:w-10 rounded-full" />
              <div className="flex flex-col gap-1.5 sm:gap-2">
                <Skeleton className="h-3 w-24 sm:w-32 rounded-md" />
                <Skeleton className="h-4 sm:h-5 w-36 sm:w-48 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Skeleton className="h-8 w-20 sm:w-24 rounded-lg" />
              <Skeleton className="h-8 w-8 sm:w-24 rounded-lg" />
              <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-800 hidden sm:block mx-1"></div>
              <div className="hidden sm:flex flex-col gap-1 items-end">
                <Skeleton className="h-4 w-16 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          <Skeleton className="h-10 sm:h-12 w-full max-w-2xl rounded-xl mb-6 sm:mb-8" />
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 md:p-8 shadow-sm">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <Skeleton className="h-7 sm:h-8 w-1/3 sm:w-1/4 rounded-lg" />
                <Skeleton className="h-9 sm:h-10 w-28 sm:w-32 rounded-lg" />
              </div>
              <Skeleton className="h-28 sm:h-32 w-full rounded-xl sm:rounded-2xl" />
              <Skeleton className="h-28 sm:h-32 w-full rounded-xl sm:rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-8 text-center">
        <h2 className="text-xl font-bold text-red-600 mb-2">Assignment Not Found</h2>
        <p className="text-gray-500 mb-6">The assignment you are looking for does not exist or has been removed.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const assignment = assignmentData;

  return (
    <div className="min-h-screen bg-gray-50/30 dark:bg-gray-950/30">
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Main Top Row */}
          <div className="h-16 flex items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => router.back()}
                className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 shrink-0 h-9 w-9"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider hidden sm:inline">Assignment</span>
                  <span className="text-gray-300 dark:text-gray-700 hidden sm:inline">/</span>
                  <h1 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white capitalize truncate">
                    {assignment.title}
                  </h1>
                </div>
                {assignment.creator && (
                  <div className="hidden sm:flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-500">
                    <span>Created by</span>
                    {assignment.creator.profileImage ? (
                      <img src={assignment.creator.profileImage} alt={assignment.creator.name} className="w-4 h-4 rounded-full object-cover" />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                        {assignment.creator.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[150px]">{assignment.creator.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Desktop Status Badge */}
              <div className={`hidden md:flex px-3 py-1 rounded-full text-[10px] font-bold border items-center gap-1.5 shadow-sm ${
                assignment.status === "PUBLISHED" 
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20"
                  : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20"
              }`}>
                {assignment.status === "PUBLISHED" ? <Check size={12} /> : <EyeOff size={12} />} 
                {assignment.status || "PUBLISHED"}
              </div>
              
              {/* Publish / Unpublish Button */}
              <Button 
                variant="outline" 
                size="sm" 
                disabled={isUpdatingStatus}
                onClick={() => {
                  const newStatus = assignment.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
                  updateStatus({ assignmentId, status: newStatus }, {
                    onSuccess: () => toast.success(`Assignment ${newStatus.toLowerCase()} successfully`),
                    onError: (error: unknown) => {
                      const err = error as { response?: { data?: { error?: string } } };
                      toast.error(err?.response?.data?.error || "Failed to update status");
                    }
                  });
                }}
                className={`h-8 rounded-lg text-xs px-2.5 sm:px-3 font-semibold flex items-center gap-1 sm:gap-1.5 ${
                  assignment.status === "PUBLISHED"
                    ? "text-amber-600 border-amber-200 hover:bg-amber-50"
                    : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                }`}
              >
                {isUpdatingStatus ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : assignment.status === "PUBLISHED" ? (
                  <EyeOff size={14} />
                ) : (
                  <Eye size={14} />
                )}
                <span className="hidden sm:inline">
                  {isUpdatingStatus 
                    ? (assignment.status === "PUBLISHED" ? "Unpublishing..." : "Publishing...")
                    : (assignment.status === "PUBLISHED" ? "Unpublish" : "Publish")}
                </span>
              </Button>

              {/* Settings Button */}
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => setIsSettingsOpen(true)}
                className="h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs px-2.5 sm:px-3 font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <SettingsIcon size={14} /> 
                <span className="hidden sm:inline">Settings</span>
              </Button>
              
              {/* Desktop Marks & Due date */}
              <div className="h-8 w-[1px] bg-gray-200 dark:bg-gray-800 hidden sm:block mx-1"></div>
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-black text-gray-900 dark:text-white leading-none">
                  {assignment.maxScore || 100} Marks
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                  {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "No Deadline"}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Secondary Sub-strip (shown only on sm:hidden) */}
          <div className="sm:hidden flex items-center justify-between pb-2.5 pt-1 border-t border-gray-100 dark:border-gray-800 text-xs">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${
                assignment.status === "PUBLISHED" 
                  ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20"
                  : "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20"
              }`}>
                {assignment.status === "PUBLISHED" ? <Check size={10} /> : <EyeOff size={10} />} 
                {assignment.status || "PUBLISHED"}
              </span>
              {assignment.creator && (
                <span className="text-[10px] text-gray-500 truncate max-w-[120px]">
                  by <strong className="text-gray-700 dark:text-gray-300">{assignment.creator.name}</strong>
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="font-black text-gray-900 dark:text-white">
                {assignment.maxScore || 100} Marks
              </span>
              <span className="text-gray-300 dark:text-gray-700">•</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : "No Deadline"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <main className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Tabs defaultValue="questions" className="w-full">
          <TabsList className="mb-6 sm:mb-8 p-1 bg-gray-100 dark:bg-gray-800 rounded-2xl sm:rounded-xl w-full max-w-2xl grid grid-cols-3 h-auto">
            <TabsTrigger value="questions" className="rounded-xl sm:rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm py-2 sm:py-2.5 font-bold transition-all text-xs sm:text-sm">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                <LayoutList size={15} /> <span>Questions</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="submissions" className="rounded-xl sm:rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm py-2 sm:py-2.5 font-bold transition-all text-xs sm:text-sm">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                <Users size={15} /> <span>Submissions</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="instructions" className="rounded-xl sm:rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm py-2 sm:py-2.5 font-bold transition-all text-xs sm:text-sm">
              <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                <FileText size={15} /> 
                <span className="sm:hidden">Details</span>
                <span className="hidden sm:inline">Instructions</span>
              </div>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="mt-0">
             <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 md:p-8 shadow-sm">
                <QuestionManager 
                  assignmentId={assignmentId} 
                  assignment={assignment} 
                />
             </div>
          </TabsContent>

          <TabsContent value="submissions">
             <SubmissionList 
               assignment={assignment} 
               schoolId={effectiveSchoolId} 
             />
          </TabsContent>

          <TabsContent value="instructions">
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl sm:rounded-[2rem] p-4 sm:p-6 md:p-8 shadow-sm prose dark:prose-invert max-w-none">
                <h3>Instructions</h3>
                <p>{assignment.instructions || "No instructions provided."}</p>
                
                {assignment.attachmentUrl && (
                  <div className="mt-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="m-0">Attached File Preview</h4>
                      <a 
                        href={assignment.attachmentUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-bold transition-colors no-underline"
                      >
                        Open in new tab <ExternalLink size={16} />
                      </a>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 aspect-video w-full relative group">
                      <iframe 
                        src={assignment.attachmentUrl} 
                        className="w-full h-full border-0 absolute inset-0" 
                        title="Attachment Preview"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/5 dark:bg-white/5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  </div>
                )}

                {assignment.videoUrl && (
                  <div className="mt-8">
                    <VideoPlayer videoUrl={assignment.videoUrl} title="Video Resource" />
                  </div>
                )}

                {assignment.referenceUrl && (
                  <div className="mt-8 space-y-4">
                    <h4 className="m-0">External Reference</h4>
                    <a 
                      href={assignment.referenceUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="flex items-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg text-sm font-bold transition-colors no-underline border border-blue-100 dark:border-blue-800/50"
                    >
                      <ExternalLink size={18} /> {assignment.referenceUrl}
                    </a>
                  </div>
                )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      {isSettingsOpen && (
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          assignment={assignment} 
          schoolId={effectiveSchoolId} 
        />
      )}
    </div>
  );
}
