"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserCog } from "lucide-react";
import { useUpdateTeacher } from "@/lib/api/hooks/useAdmin";

interface EditTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  primaryColor?: string;
  teacher: {
    id: string;
    name: string;
    gender?: string;
    department?: string;
  };
}

export function EditTeacherModal({ isOpen, onClose, primaryColor = "#2563eb", teacher }: EditTeacherModalProps) {
  const [name, setName] = useState(teacher.name);
  const [gender, setGender] = useState(teacher.gender || "");
  const [department, setDepartment] = useState(teacher.department || "");

  const updateTeacherMutation = useUpdateTeacher(teacher.id);

  useEffect(() => {
    setName(teacher.name);
    setGender(teacher.gender || "");
    setDepartment(teacher.department || "");
  }, [teacher]);

  const handleSubmit = async () => {
    updateTeacherMutation.mutate({
      name,
      gender,
      department
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-white dark:bg-slate-950 border-slate-100 dark:border-white/5 rounded-3xl">
        <div className="p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
              Edit <span style={{ color: primaryColor }}>Teacher Profile</span>
            </DialogTitle>
            <DialogDescription className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">
              Update core identity information for this teacher record.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Full Name</Label>
              <Input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Gender</Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 rounded-xl">
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Department</Label>
                <Input 
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Science"
                  className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl"
                />
              </div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-start gap-3 border border-amber-100 dark:border-amber-500/20">
              <UserCog size={16} className="text-amber-600 dark:text-amber-400 mt-0.5" />
              <p className="text-[10px] font-medium text-amber-800 dark:text-amber-300">
                Editing is only permitted until the teacher claims their account. After that, they will manage their own profile.
              </p>
            </div>
            
            <Button 
              type="button" 
              onClick={handleSubmit}
              disabled={updateTeacherMutation.isPending}
              className="w-full h-14 mt-6 rounded-xl text-white font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              style={{ backgroundColor: primaryColor, boxShadow: `0 10px 15px -3px ${primaryColor}40` }}
            >
              {updateTeacherMutation.isPending ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> 
                  Saving Changes...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
