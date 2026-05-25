"use client";

import { useState } from "react";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { useSchoolSettings } from "@/lib/api/hooks/useSchool";
import { MailPlus, Search, Send, CheckCircle2, Users, GraduationCap, UserPlus } from "lucide-react";
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

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setStudentPage(1);
    setTeacherPage(1);
  };

  const handleTeacherSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["school-teachers-invitations"] });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 lg:p-10 transition-colors duration-500">
      <div className="max-w-[1600px] mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
              <div className="size-2 rounded-full animate-pulse" style={{ backgroundColor: primaryColor }} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Invitations Management</span>
            </div>
            <div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-[0.9]">
                Invitations<span style={{ color: primaryColor }}>.</span>
              </h1>
              <p className="mt-4 text-lg font-medium text-slate-500 max-w-xl">
                Invite pre-registered members to claim their accounts. Link their real email and send a verification link.
              </p>
            </div>
          </div>
        </div>

        {/* Search & Action */}
        <div className="flex flex-wrap items-center justify-between gap-6 p-4 rounded-[3rem] bg-slate-50/50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5">
          <div className="relative group flex-1 max-w-xl">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" size={22} />
            <input 
              type="text" 
              placeholder="Search members to invite..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full h-16 pl-16 pr-6 bg-white dark:bg-slate-950 border border-slate-100 dark:border-white/5 rounded-[2rem] focus:outline-none focus:ring-4 transition-all font-bold text-slate-700 dark:text-slate-200"
              style={{ '--tw-ring-color': `${primaryColor}20` } as any}
            />
          </div>

          <Button 
            onClick={() => activeTab === "students" ? setIsStudentDialogOpen(true) : setIsTeacherDialogOpen(true)}
            style={{ backgroundColor: primaryColor }}
            className="h-16 px-8 rounded-[2rem] text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all flex items-center gap-3 border-none shrink-0"
          >
            <UserPlus size={20} />
            {activeTab === "students" ? "Create Student" : "Create Teacher"}
          </Button>
        </div>

        {/* Tabs & Table */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-6">
            <TabsList className="bg-slate-50 dark:bg-slate-900 p-1.5 rounded-2xl">
              <TabsTrigger 
                value="students" 
                className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-md transition-all flex items-center gap-2"
              >
                <GraduationCap size={16} /> Students
              </TabsTrigger>
              <TabsTrigger 
                value="teachers" 
                className="rounded-xl px-6 py-2.5 text-xs font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-primary data-[state=active]:shadow-md transition-all flex items-center gap-2"
              >
                <Users size={16} /> Teachers
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="students" className="mt-0 outline-none">
            <div className="rounded-[4rem] bg-white dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-100 dark:border-white/5 p-2 shadow-2xl overflow-hidden">
              <InvitationsTable 
                searchTerm={searchTerm} 
                page={studentPage}
                onPageChange={setStudentPage}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="teachers" className="mt-0 outline-none">
            <div className="rounded-[4rem] bg-white dark:bg-slate-900/40 backdrop-blur-3xl border border-slate-100 dark:border-white/5 p-2 shadow-2xl overflow-hidden">
              <TeacherInvitationsTable 
                searchTerm={searchTerm} 
                page={teacherPage}
                onPageChange={setTeacherPage}
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
