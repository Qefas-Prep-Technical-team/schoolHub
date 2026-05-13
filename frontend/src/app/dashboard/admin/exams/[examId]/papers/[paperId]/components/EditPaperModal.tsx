"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { toast } from "react-toastify";
import { Loader2, Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EditPaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: any;
  subjects: any[];
  teachers: any[];
  isLoadingData: boolean;
}

export default function EditPaperModal({
  isOpen,
  onClose,
  paper,
  subjects,
  teachers,
  isLoadingData,
}: EditPaperModalProps) {
  const [formData, setFormData] = useState({
    title: paper?.title || "",
    durationMinutes: paper?.durationMinutes || 60,
    totalMarks: paper?.totalMarks || 100,
    passMark: paper?.passMark || 40,
    subjectId: paper?.subjectId || "",
    teacherId: paper?.teacherId || "",
  });

  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async () => {
      await apiClient.put(`/exams/papers/${paper.id}`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper", paper.id] });
      toast.success("Paper settings updated!");
      onClose();
    },
    onError: () => {
      toast.error("Failed to update paper settings");
    },
  });

  if (!paper) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl font-black uppercase tracking-tight">
            <Settings className="w-6 h-6 text-primary" />
            Paper Settings
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paper Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="rounded-xl border-slate-200 font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration (Mins)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: parseInt(e.target.value) })}
                className="rounded-xl border-slate-200 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalMarks" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Marks</Label>
              <Input
                id="totalMarks"
                type="number"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
                className="rounded-xl border-slate-200 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="passMark" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pass Mark (%)</Label>
              <Input
                id="passMark"
                type="number"
                value={formData.passMark}
                onChange={(e) => setFormData({ ...formData, passMark: parseInt(e.target.value) })}
                className="rounded-xl border-slate-200 font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subject</Label>
              <Select 
                value={formData.subjectId} 
                onValueChange={(val) => setFormData({ ...formData, subjectId: val })}
              >
                <SelectTrigger className="rounded-xl border-slate-200 font-bold">
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Teacher</Label>
            <Select 
              value={formData.teacherId} 
              onValueChange={(val) => setFormData({ ...formData, teacherId: val })}
            >
              <SelectTrigger className="rounded-xl border-slate-200 font-bold">
                <SelectValue placeholder="Select Teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} className="rounded-xl font-bold">
            Cancel
          </Button>
          <Button 
            onClick={() => updateMutation.mutate()} 
            disabled={updateMutation.isPending || isLoadingData}
            className="rounded-xl font-bold bg-primary text-white"
          >
            {updateMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
