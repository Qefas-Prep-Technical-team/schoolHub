"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { MailPlus, Search, Send, CheckCircle2, Users, GraduationCap, UserPlus, List, LayoutGrid, Info } from "lucide-react";
import { TooltipProvider, Tooltip as UITooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InvitationsTable from "./components/InvitationsTable";
import TeacherInvitationsTable from "./components/TeacherInvitationsTable";
import AddStudentDialog from "../students/components/AddStudentDialog";
import { AddTeacherModal } from "../teachers/components/AddTeacherModal";
import { useQueryClient } from "@tanstack/react-query";

export default function InvitationsPage() {
  const { user } = useAuthStore();
  const schoolId = user?.schools?.[0]?.schoolId || user?.tenantId || "";
  
  const { data: settings } = useSchoolSettings(schoolId);
  const primaryColor = settings?.themeColor || "#2563eb";
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [studentPage, setStudentPage] = useState(1);
  const [teacherPage, setTeacherPage] = useState(1);
  const [activeTab, setActiveTab] = useState("students");
  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [isTeacherDialogOpen, setIsTeacherDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setViewMode('grid');
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setStudentPage(1);
    setTeacherPage(1);
  };

  const handleTeacherSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["school-teachers-invitations"] });
  };

  return (
    <div className="min-h-screen bg-transparent p-4 md:p-6 lg:p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <MailPlus size={14} /> Invitations Management
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Invitations
                </h1>
                <TooltipProvider>
                  <UITooltip delayDuration={300}>
                    <TooltipTrigger asChild>
                      <button type="button" className="text-slate-400 hover:text-primary transition-colors focus:outline-none mt-1">
                        <Info size={20} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs p-3 text-sm leading-relaxed bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-200 border-none shadow-xl">
                      Manage pending onboarding flows. Here you can generate secure invite links, track account claiming status, and verify newly registered students and faculty.
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Invite pre-registered members to claim their accounts. Link their real email and send a verification link.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full lg:w-auto mt-2 lg:mt-0">
              <div className="relative group w-full sm:min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search members to invite..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full h-11 pl-11 pr-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400"
                />
              </div>

              <Button 
                onClick={() => activeTab === "students" ? setIsStudentDialogOpen(true) : setIsTeacherDialogOpen(true)}
                style={{ backgroundColor: primaryColor }}
                className="h-11 px-6 rounded-xl text-white font-semibold text-sm shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 border-none shrink-0 whitespace-nowrap"
              >
                <UserPlus size={18} />
                {activeTab === "students" ? "Create Student" : "Create Teacher"}
              </Button>
            </div>
          </div>
        </header>

        {/* Tabs & Table */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
            <TabsList className="bg-slate-100 dark:bg-slate-800/50 p-1 rounded-full h-auto inline-flex w-fit max-w-full overflow-x-auto hide-scrollbar">
            <TabsTrigger 
              value="students" 
              className="rounded-full px-6 py-2 text-sm font-medium text-slate-500 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              <div className="flex flex-row items-center justify-center gap-2">
                <GraduationCap size={16} /> Students
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="teachers" 
              className="rounded-full px-6 py-2 text-sm font-medium text-slate-500 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
            >
              <div className="flex flex-row items-center justify-center gap-2">
                <Users size={16} /> Teachers
              </div>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
          <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-full items-center shrink-0">
            <button 
              onClick={() => setViewMode('list')} 
              className={cn("p-1.5 rounded-full transition-all", viewMode === 'list' ? 'bg-white shadow-sm text-slate-900 dark:bg-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300')}
            > 
              <List size={16}/> 
            </button>
            <button 
              onClick={() => setViewMode('grid')} 
              className={cn("p-1.5 rounded-full transition-all", viewMode === 'grid' ? 'bg-white shadow-sm text-slate-900 dark:bg-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300')}
            > 
              <LayoutGrid size={16}/> 
            </button>
          </div>
        </div>
          
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="students" className="mt-0 outline-none">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <InvitationsTable 
                searchTerm={searchTerm} 
                page={studentPage}
                onPageChange={setStudentPage}
                viewMode={viewMode}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="teachers" className="mt-0 outline-none">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <TeacherInvitationsTable 
                searchTerm={searchTerm} 
                page={teacherPage}
                onPageChange={setTeacherPage}
                viewMode={viewMode}
              />
            </div>
          </TabsContent>
        </Tabs>

        <AddStudentDialog 
          open={isStudentDialogOpen}
          onOpenChange={setIsStudentDialogOpen}
        />
        
        <AddTeacherModal 
          isOpen={isTeacherDialogOpen}
          onClose={() => setIsTeacherDialogOpen(false)}
          primaryColor={primaryColor}
          onSuccess={handleTeacherSuccess}
          schoolId={schoolId}
        />

      </div>
    </div>
  );
}
