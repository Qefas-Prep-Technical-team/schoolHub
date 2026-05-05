"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Link as LinkIcon, Mail, Loader2, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { toast } from "react-toastify";

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryColor?: string;
  onSuccess: () => void;
}

export function AddTeacherModal({ isOpen, onClose, primaryColor = "#2563eb", onSuccess }: AddTeacherModalProps) {
  const [activeTab, setActiveTab] = useState<"code" | "create">("create");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form states
  const [teacherCode, setTeacherCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    // Basic validation
    if (activeTab === "code" && !teacherCode.trim()) {
      toast.error("Teacher Code is required");
      return;
    }
    if (activeTab === "create" && (!name.trim() || !email.trim())) {
      toast.error("Name and Email are required");
      return;
    }

    setIsLoading(true);

    try {
      const payload = activeTab === "code" 
        ? { action: "code", teacherCode } 
        : { action: "create", name, email };

      const res = await apiClient.post("/admin/teachers/invite", payload);
      
      if (res.data.success) {
        toast.success(res.data.message);
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add teacher");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTeacherCode("");
      setName("");
      setEmail("");
      setIsSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-slate-950 border-slate-100 dark:border-white/5 rounded-3xl">
        <div className="p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              Add New <span style={{ color: primaryColor }}>Teacher</span>
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">
              Invite an existing teacher or pre-register a new account.
            </DialogDescription>
          </DialogHeader>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="size-20 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                <CheckCircle2 size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Success!</h3>
              <p className="text-sm font-medium text-slate-500 text-center">
                {activeTab === 'code' 
                  ? "An invitation has been sent to the teacher." 
                  : "Teacher pre-registered and an email invitation has been dispatched."}
              </p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 dark:bg-white/5 p-1 rounded-xl">
                <TabsTrigger value="create" className="rounded-lg text-xs font-black uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
                  <UserPlus size={14} className="mr-2" /> Pre-Register
                </TabsTrigger>
                <TabsTrigger value="code" className="rounded-lg text-xs font-black uppercase tracking-wider data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
                  <LinkIcon size={14} className="mr-2" /> By Code
                </TabsTrigger>
              </TabsList>

              <div className="space-y-6">
                <TabsContent value="create" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Full Name</Label>
                    <Input 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email Address</Label>
                    <Input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl"
                    />
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-start gap-3">
                    <Mail size={16} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                      We will create an account and send an email to this address with a secure link to claim it and set a password.
                    </p>
                  </div>
                  
                  <Button 
                    type="button" 
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full h-14 mt-6 rounded-xl text-white font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor, boxShadow: `0 10px 15px -3px ${primaryColor}40` }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} /> 
                        Processing...
                      </>
                    ) : (
                      'Register & Invite'
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="code" className="space-y-4 mt-0">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Teacher Code</Label>
                    <Input 
                      value={teacherCode}
                      onChange={(e) => setTeacherCode(e.target.value)}
                      placeholder="e.g. TEA-12345"
                      className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl font-mono uppercase"
                    />
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                    <p className="text-xs font-medium text-slate-500">
                      If the teacher already has an account, enter their unique Teacher Code. They will receive a notification to accept the link to your school.
                    </p>
                  </div>

                  <Button 
                    type="button" 
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full h-14 mt-6 rounded-xl text-white font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor, boxShadow: `0 10px 15px -3px ${primaryColor}40` }}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} /> 
                        Processing...
                      </>
                    ) : (
                      'Send Invite Request'
                    )}
                  </Button>
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
