"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPlus, Link as LinkIcon, Mail, Loader2, CheckCircle2, Copy, Check } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { toast } from "react-toastify";
import { useClasses } from "@/lib/api/hooks/useClasses";
import { useSchoolSubjects } from "@/lib/api/hooks/useSchool";
import { Skeleton } from "@/components/ui/skeleton";

interface CreatedCredentials {
  teacherCode: string;
  email: string;
  passwordPlaintext: string;
}

interface AddTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryColor?: string;
  onSuccess: () => void;
  schoolId?: string;
}

function SearchableSelect({ 
  options, 
  value, 
  onChange, 
  placeholder 
}: {
  options: { id: string; name: string; section?: string }[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  const filteredOptions = options.filter(opt => {
    const text = opt.section ? `${opt.name} (${opt.section})` : opt.name;
    return text.toLowerCase().includes(search.toLowerCase());
  });

  const selectedOpt = options.find(o => o.id === value);
  const displayText = selectedOpt ? (selectedOpt.section ? `${selectedOpt.name} (${selectedOpt.section})` : selectedOpt.name) : "";

  return (
    <div className="relative w-full">
      <div 
        className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-3 py-2 text-sm cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={displayText ? "text-slate-900 dark:text-slate-100 font-medium" : "text-muted-foreground"}>
          {displayText || placeholder}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </div>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            <div 
              className="px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer rounded-md font-medium"
              onClick={() => { onChange(""); setIsOpen(false); setSearch(""); }}
            >
              None
            </div>
            {filteredOptions.length > 0 ? filteredOptions.map(opt => (
              <div
                key={opt.id}
                className={`px-3 py-2 text-sm cursor-pointer rounded-md flex items-center justify-between font-medium ${value === opt.id ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"}`}
                onClick={() => { onChange(opt.id); setIsOpen(false); setSearch(""); }}
              >
                {opt.section ? `${opt.name} (${opt.section})` : opt.name}
                {value === opt.id && <Check size={14} />}
              </div>
            )) : (
              <div className="px-3 py-4 text-sm text-center text-slate-500">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function AddTeacherModal({ isOpen, onClose, primaryColor = "#2563eb", onSuccess, schoolId }: AddTeacherModalProps) {
  const [activeTab, setActiveTab] = useState<"code" | "create">("create");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials | null>(null);
  const [copied, setCopied] = useState(false);

  // Queries
  const { data: classesResponse, isLoading: isLoadingClasses } = useClasses(schoolId);
  const classes = Array.isArray(classesResponse) ? classesResponse : classesResponse?.data || [];
  const { data: subjectsResponse, isLoading: isLoadingSubjects } = useSchoolSubjects(schoolId || "");
  const subjects = Array.isArray(subjectsResponse) ? subjectsResponse : subjectsResponse?.data || [];

  // Form states
  const [teacherCode, setTeacherCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  const handleSubmit = async () => {
    // Basic validation
    if (activeTab === "code" && !teacherCode.trim()) {
      toast.error("Teacher Code is required");
      return;
    }
    if (activeTab === "create" && !name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsLoading(true);

    try {
      const payload = activeTab === "code" 
        ? { action: "code", teacherCode } 
        : { action: "create", name, email: email.trim() || undefined, classId: classId || undefined, subjectId: subjectId || undefined };

      const res = await apiClient.post("/admin/teachers/invite", payload);
      
      if (res.data.success) {
        toast.success(res.data.message);
        
        if (activeTab === "create" && res.data.data?.password) {
          setCreatedCredentials({
            teacherCode: res.data.data.teacherCode,
            email: res.data.data.email,
            passwordPlaintext: res.data.data.password,
          });
        }

        setIsSuccess(true);
        if (activeTab === "code") {
          setTimeout(() => {
            onSuccess();
            handleClose();
          }, 2000);
        } else {
          onSuccess();
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add teacher");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCredentials = async () => {
    if (!createdCredentials) return;
    const text = `Name: ${name}\nTeacher Code: ${createdCredentials.teacherCode}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.passwordPlaintext}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Credentials copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy credentials.");
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setTeacherCode("");
      setName("");
      setEmail("");
      setClassId("");
      setSubjectId("");
      setIsSuccess(false);
      setCreatedCredentials(null);
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
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="size-16 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                <CheckCircle2 size={32} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Success!</h3>
              
              {createdCredentials ? (
                <div className="w-full space-y-4 text-left">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-emerald-700 dark:text-emerald-400 text-sm">
                    <p className="font-semibold">Teacher registered successfully!</p>
                    <p className="mt-1 opacity-90 text-xs">Please share these credentials with the teacher. For security reasons, the password will not be shown again.</p>
                  </div>
                  
                  <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Teacher Code</span>
                      <p className="text-sm font-semibold font-mono text-slate-900 dark:text-slate-100">{createdCredentials.teacherCode}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Login Email</span>
                      <p className="text-sm font-semibold font-mono text-slate-900 dark:text-slate-100">{createdCredentials.email}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Temporary Password</span>
                      <p className="text-sm font-semibold font-mono" style={{ color: primaryColor }}>{createdCredentials.passwordPlaintext}</p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={handleCopyCredentials}
                      className="flex-1 flex items-center justify-center gap-2 h-12 rounded-xl border-slate-200 dark:border-slate-700"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied!" : "Copy Credentials"}
                    </Button>
                    <Button
                      onClick={handleClose}
                      className="flex-1 h-12 rounded-xl text-white font-bold uppercase tracking-wide"
                      style={{ backgroundColor: primaryColor }}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm font-medium text-slate-500 text-center">
                  An invitation has been sent to the teacher.
                </p>
              )}
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
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Email Address (Optional)</Label>
                    <Input 
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Optional"
                      className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl"
                    />
                  </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Assign to Class (Optional)</Label>
                        {isLoadingClasses ? (
                          <Skeleton className="h-12 w-full rounded-xl bg-slate-100 dark:bg-white/5" />
                        ) : (
                          <SearchableSelect 
                            options={classes}
                            value={classId}
                            onChange={setClassId}
                            placeholder="Select a class..."
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Assign Subject (Optional)</Label>
                        {isLoadingSubjects ? (
                          <Skeleton className="h-12 w-full rounded-xl bg-slate-100 dark:bg-white/5" />
                        ) : (
                          <SearchableSelect 
                            options={subjects}
                            value={subjectId}
                            onChange={setSubjectId}
                            placeholder="Select a subject..."
                          />
                        )}
                      </div>
                    </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-start gap-3">
                    <Mail size={16} className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-xs font-medium text-blue-800 dark:text-blue-300">
                      If left blank, an email will be automatically generated. Temporary login credentials will be displayed for you to copy.
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
