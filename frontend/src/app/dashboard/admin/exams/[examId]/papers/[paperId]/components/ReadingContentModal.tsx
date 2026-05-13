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
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

interface ReadingContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paperId: string;
  initialContent?: string;
}

export default function ReadingContentModal({
  isOpen,
  onClose,
  paperId,
  initialContent = "",
}: ReadingContentModalProps) {
  const [content, setContent] = useState(initialContent);
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async () => {
      await apiClient.patch(`/exams/papers/${paperId}`, { readingContent: content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper", paperId] });
      toast.success("Reading content updated!");
      onClose();
    },
    onError: () => {
      toast.error("Failed to update reading content");
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Reading Content</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-slate-500 mb-4 font-medium uppercase tracking-widest text-[10px]">
            Add or edit the reading passage/content for this paper.
          </p>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type or paste reading content here..."
            className="min-h-[300px] rounded-2xl border-slate-200 focus:ring-primary font-medium"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-xl font-bold">
            Cancel
          </Button>
          <Button 
            onClick={() => updateMutation.mutate()} 
            disabled={updateMutation.isPending}
            className="rounded-xl font-bold bg-primary text-white"
          >
            {updateMutation.isPending ? <Loader2 className="animate-spin h-4 w-4" /> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
