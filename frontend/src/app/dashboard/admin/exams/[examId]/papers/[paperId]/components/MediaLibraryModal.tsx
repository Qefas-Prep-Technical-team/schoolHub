"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { imageService } from "@/lib/api/services/imageService";
import { Loader2, CheckCircle2, Trash2, Upload } from "lucide-react";
import { toast } from "react-toastify";

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (url: string) => void;
  onTriggerUpload: () => void;
  currentImages: string[];
}

export default function MediaLibraryModal({
  isOpen,
  onClose,
  onSelectImage,
  onTriggerUpload,
  currentImages,
}: MediaLibraryModalProps) {
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ["uploadHistory"],
    queryFn: () => imageService.getUploadHistory(1, 100),
    enabled: isOpen,
  });

  const cleanupMutation = useMutation({
    mutationFn: () => imageService.cleanupUnusedImages(),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["uploadHistory"] });
      toast.success(`Cleaned up ${res.deletedCount} unused images.`);
    },
    onError: () => {
      toast.error("Failed to clean up images.");
    }
  });

  // Sort images: current question images first, then others
  const sortedRecords = React.useMemo(() => {
    if (!data?.records) return [];
    const records = [...data.records];
    return records.sort((a, b) => {
      const aUsed = currentImages.includes(a.fileUrl);
      const bUsed = currentImages.includes(b.fileUrl);
      if (aUsed && !bUsed) return -1;
      if (!aUsed && bUsed) return 1;
      return 0;
    });
  }, [data?.records, currentImages]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col overflow-hidden bg-white dark:bg-slate-950 p-0">
        <DialogHeader className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <DialogTitle>Media Library</DialogTitle>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
                onClick={() => cleanupMutation.mutate()}
                disabled={cleanupMutation.isPending}
              >
                {cleanupMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Clean Unused Images
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Upload New Box */}
            <div 
              className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-primary hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all aspect-square bg-slate-50 dark:bg-slate-800/50"
              onClick={onTriggerUpload}
            >
              <Upload className="w-6 h-6 mb-2" />
              <span className="text-xs font-bold text-center">Upload New</span>
            </div>
            
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))
            ) : (
              sortedRecords.map((record) => {
                const isSelected = currentImages.includes(record.fileUrl);
                return (
                  <div 
                    key={record.id}
                    className={`relative group rounded-xl overflow-hidden border-2 cursor-pointer transition-all aspect-square bg-slate-100 dark:bg-slate-800 ${
                      isSelected ? "border-primary" : "border-transparent hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                    onClick={() => {
                      if (!isSelected) {
                        onSelectImage(record.fileUrl);
                        onClose();
                      }
                    }}
                  >
                    <img 
                      src={record.fileUrl} 
                      alt={record.fileName}
                      className={`w-full h-full object-cover ${isSelected ? "opacity-75" : ""}`}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/20 backdrop-blur-[1px]">
                        <CheckCircle2 className="w-8 h-8 text-primary fill-white" />
                      </div>
                    )}
                    {!isSelected && (
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-[10px] text-white truncate">{record.fileName}</p>
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        In Use
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
