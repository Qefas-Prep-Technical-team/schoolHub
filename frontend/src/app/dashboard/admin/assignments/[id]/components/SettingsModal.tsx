import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Settings, Save, Calendar, FileText, Users, BookOpen } from "lucide-react";
import { apiClient } from "@/lib/api/client";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: any;
  schoolId: string;
}

export default function SettingsModal({ isOpen, onClose, assignment, schoolId }: SettingsModalProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(assignment?.title || "");
  const [instructions, setInstructions] = useState(assignment?.instructions || "");
  const [maxScore, setMaxScore] = useState(assignment?.totalMarks || 100);
  const [dueDate, setDueDate] = useState(
    assignment?.dueDate ? new Date(assignment.dueDate).toISOString().slice(0, 16) : ""
  );
  const [scoreReleaseDate, setScoreReleaseDate] = useState(
    assignment?.scoreReleaseDate ? new Date(assignment.scoreReleaseDate).toISOString().slice(0, 16) : ""
  );

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.patch(`/assignment/${assignment.id}/settings`, data, {
        headers: { "x-school-id": schoolId }
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment-detail", assignment.id] });
      toast.success("Assignment settings updated successfully!");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update settings");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Assignment title is required");
      return;
    }
    
    updateMutation.mutate({
      title,
      instructions,
      maxScore: Number(maxScore),
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      scoreReleaseDate: scoreReleaseDate ? new Date(scoreReleaseDate).toISOString() : null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings size={18} className="text-primary" />
            Assignment Settings
          </DialogTitle>
          <DialogDescription>
            Update the core configuration for this assignment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="flex items-center gap-2">
              <FileText size={14} className="text-gray-500" />
              Title
            </Label>
            <Input 
              id="title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="E.g. Midterm Mathematics" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users size={14} className="text-gray-500" />
                Class
              </Label>
              <Input 
                value={assignment?.class?.name || "All Classes"} 
                disabled
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <BookOpen size={14} className="text-gray-500" />
                Subject / Department
              </Label>
              <Input 
                value={
                  (assignment?.subject?.name || "General") + 
                  (assignment?.department?.name ? ` • ${assignment.department.name}` : "")
                } 
                disabled
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">General Instructions</Label>
            <Input 
              id="instructions" 
              value={instructions} 
              onChange={(e) => setInstructions(e.target.value)} 
              placeholder="E.g. Answer all questions" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxScore">Maximum Score</Label>
              <Input 
                id="maxScore" 
                type="number" 
                min="1"
                value={maxScore} 
                onChange={(e) => setMaxScore(e.target.value)} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate" className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-500" />
                Deadline
              </Label>
              <Input 
                id="dueDate" 
                type="datetime-local" 
                value={dueDate} 
                onChange={(e) => setDueDate(e.target.value)} 
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="scoreReleaseDate" className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-500" />
                Result Release Date
              </Label>
              <Input 
                id="scoreReleaseDate" 
                type="datetime-local" 
                value={scoreReleaseDate} 
                onChange={(e) => setScoreReleaseDate(e.target.value)} 
              />
              <p className="text-xs text-slate-500">
                If left blank, results will be released on the deadline.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="gap-2"
            >
              {updateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
