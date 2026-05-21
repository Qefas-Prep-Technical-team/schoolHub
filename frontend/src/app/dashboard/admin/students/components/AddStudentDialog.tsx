"use client";

import { useState } from "react";
import { Loader2, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClasses } from "@/lib/api/hooks/useClasses";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/lib/hooks/useToast";
import { adminService } from "@/lib/api/services/adminService";
import { useQueryClient } from "@tanstack/react-query";

interface CreatedCredentials {
  fullName: string;
  studentCode: string;
  email: string;
  passwordPlaintext: string;
}

export default function AddStudentDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { user } = useAuthStore();
  // Admins always have their primary school in schools[0].schoolId.
  // Never fall back to tenantId (which is a slug, not a UUID).
  const schoolId = user?.schools?.[0]?.schoolId || "";
  const { data: classesResponse, isLoading } = useClasses(schoolId);
  const classes = Array.isArray(classesResponse) ? classesResponse : classesResponse?.data || [];
  const toast = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    fullName: "",
    classId: "",
    gender: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<CreatedCredentials | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    if (!formData.fullName || !formData.classId) {
      toast.error.show("Please fill in all required fields.");
      return;
    }

    // Guard: schoolId must be present and a valid UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!schoolId || !uuidRegex.test(schoolId)) {
      toast.error.show("Unable to determine your school. Please log out and log back in.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        fullName: formData.fullName,
        classId: formData.classId,
        schoolId,
        gender: formData.gender || undefined,
      };

      const res = await adminService.createStudent(payload);

      if (res.success && res.data) {
        toast.success.show("Student created successfully!");
        setCreatedCredentials({
          fullName: formData.fullName,
          studentCode: res.data.student.studentCode,
          email: res.data.email,
          passwordPlaintext: res.data.password,
        });

        // Invalidate queries to refresh list
        queryClient.invalidateQueries({ queryKey: ["school-students"] });
      } else {
        toast.error.show(res.message || "Failed to create student.");
      }
    } catch (error: any) {
      console.error("Failed to create student:", error);
      // Surface the exact error from the backend response body
      const errMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to create student.";
      toast.error.show(errMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCredentials = async () => {
    if (!createdCredentials) return;
    const text = `Full Name: ${createdCredentials.fullName}\nStudent Code: ${createdCredentials.studentCode}\nEmail: ${createdCredentials.email}\nPassword: ${createdCredentials.passwordPlaintext}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success.show("Credentials copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error.show("Failed to copy credentials.");
    }
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      setCreatedCredentials(null);
      setFormData({ fullName: "", classId: "", gender: "" });
    }
    onOpenChange(newOpen);
  };

  const handleCloseSuccess = () => {
    handleClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {createdCredentials ? "Credentials Generated" : "Add New Student"}
          </DialogTitle>
        </DialogHeader>

        {createdCredentials ? (
          <div className="space-y-6 py-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 text-emerald-700 dark:text-emerald-400 text-sm space-y-2">
              <div>
                <p className="font-semibold mb-1">Student registered successfully!</p>
                <p>Please share these credentials with the student. For security reasons, the password will not be shown again.</p>
              </div>
              <div className="border-t border-emerald-500/20 pt-2 text-xs opacity-90">
                <p className="mt-1">
                  The student can be invited to claim their account from the invite page and all they need to do is add the student email and a verification link will be sent to that email which can be used to claim account.
                </p>
              </div>
            </div>
            
            <div className="space-y-3 bg-secondary/30 border border-border/50 rounded-lg p-4 relative overflow-hidden">
              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Full Name</span>
                <p className="text-sm font-semibold">{createdCredentials.fullName}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Student Code</span>
                <p className="text-sm font-semibold font-mono">{createdCredentials.studentCode}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Login Email</span>
                <p className="text-sm font-semibold font-mono">{createdCredentials.email}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Temporary Password</span>
                <p className="text-sm font-semibold font-mono text-primary">{createdCredentials.passwordPlaintext}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleCopyCredentials}
                className="flex-1 flex items-center justify-center gap-2"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Credentials"}
              </Button>
              <Button
                onClick={handleCloseSuccess}
                className="flex-1 bg-primary hover:bg-primary/85 text-white"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4 py-2">
              {isLoading ? (
                <>
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </>
              ) : (
                <>
                  <Input
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />

                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Select Class</option>
                    {classes.map((cls: any) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} {cls.section ? `(${cls.section})` : ""}
                      </option>
                    ))}
                  </select>

                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select Gender (Optional)</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </>
              )}
            </div>

            <DialogFooter>
              <Button
                onClick={handleSave}
                disabled={isLoading || isSaving}
                className="bg-primary hover:bg-primary/80 text-white w-full sm:w-auto flex items-center justify-center"
              >
                {isSaving && <Loader2 className="mr-2 animate-spin" size={16} />}
                Save Student
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
