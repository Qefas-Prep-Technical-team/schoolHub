"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { Input } from "@/components/ui/input";
import { Loader2, BookOpen, Save, Eye, Edit3, Image as ImageIcon, X, Upload, Copy } from "lucide-react";
import { examService } from "@/lib/api/services/examService";
import { imageService } from "@/lib/api/services/imageService";
import LaTeXRenderer from "@/components/ui/LaTeXRenderer";
import { cn } from "@/lib/utils";

interface ReadingContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paperId: string;
  initialContent?: string;
  initialImages?: string[];
  initialLabels?: string[];
}

export default function ReadingContentModal({
  isOpen,
  onClose,
  paperId,
  initialContent = "",
  initialImages = [],
  initialLabels = []
}: ReadingContentModalProps) {
  const [content, setContent] = useState(initialContent || "");
  const [images, setImages] = useState<string[]>(initialImages || []);
  const [imageLabels, setImageLabels] = useState<string[]>(initialLabels || []);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (isOpen) {
      setContent(initialContent || "");
      setImages(initialImages || []);
      const effectiveLabels = (initialLabels && initialLabels.length > 0) 
        ? initialLabels 
        : new Array(initialImages?.length || 0).fill("");
      
      setImageLabels(prev => {
        if (JSON.stringify(prev) === JSON.stringify(effectiveLabels)) return prev;
        return effectiveLabels;
      });
    }
  }, [initialContent, initialImages, initialLabels, isOpen]);

  const updateMutation = useMutation({
    mutationFn: (data: { content: string, images: string[], imageLabels: string[] }) => 
      examService.updateSubjectPaper(paperId, { 
        readingContent: data.content,
        images: data.images,
        imageLabels: data.imageLabels
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper", paperId] });
      toast.success("Reading content updated successfully!");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update reading content");
    }
  });

  const handleSave = () => {
    updateMutation.mutate({ content, images, imageLabels });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => imageService.proxyUploadToBunny(file));
      const results = await Promise.all(uploadPromises);
      const newImageUrls = results.map(res => res.publicUrl);
      setImages(prev => [...prev, ...newImageUrls]);
      setImageLabels(prev => [...prev, ...new Array(newImageUrls.length).fill("")]);
      toast.success(`${files.length} image(s) uploaded successfully!`);
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageLabels(prev => prev.filter((_, i) => i !== index));
  };

  const updateLabel = (index: number, label: string) => {
    setImageLabels(prev => {
      const next = [...prev];
      next[index] = label;
      return next;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl focus:outline-none">
        <div className="bg-gradient-to-br from-primary/5 via-transparent to-primary/5 p-8 pb-4">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <BookOpen size={20} />
              </div>
              Reading Comprehension Content
            </DialogTitle>
            <DialogDescription className="text-gray-500 font-medium ml-13">
              Paste or write the comprehension passage that students will read before answering questions.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-8 pt-2">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                Content Editor
              </Label>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setActiveTab("edit")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                    activeTab === "edit" ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Edit3 size={12} /> Edit
                </button>
                <button
                  onClick={() => setActiveTab("preview")}
                  className={cn(
                    "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                    activeTab === "preview" ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  <Eye size={12} /> Preview
                </button>
              </div>
            </div>

            {activeTab === "edit" ? (
              <div className="space-y-4">
                <Textarea
                  id="readingContent"
                  placeholder="Paste your comprehension passage here..."
                  className="min-h-[400px] rounded-2xl border-slate-200 focus:ring-primary/20 resize-none font-medium leading-relaxed p-6 text-base"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">
                      Reading Section Images
                    </Label>
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        id="image-upload"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        disabled={isUploading}
                        className="rounded-xl border-dashed border-2 hover:border-primary hover:text-primary transition-all flex items-center gap-2"
                      >
                        {isUploading ? (
                          <Loader2 className="animate-spin h-4 w-4" />
                        ) : (
                          <Upload size={16} />
                        )}
                        Upload Images
                      </Button>
                    </div>
                  </div>

                  {images && images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                      {images.map((url, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="relative group aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-all hover:shadow-md">
                            <img src={url} alt={`Reading ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                               <button
                                 type="button"
                                 onClick={() => {
                                   const label = imageLabels[idx] || "Reading Image";
                                   const markdown = `![${label}](${url})`;
                                   navigator.clipboard.writeText(markdown);
                                   toast.success("Markdown copied! Paste it in the text area.");
                                 }}
                                 className="h-8 w-8 rounded-full bg-white text-primary flex items-center justify-center hover:bg-white/90 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all"
                                 title="Copy Markdown"
                               >
                                 <Copy size={16} />
                               </button>
                              <button
                                 type="button"
                                 onClick={() => removeImage(idx)}
                                 className="h-8 w-8 rounded-full bg-white text-red-500 flex items-center justify-center hover:bg-red-50 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all"
                                 title="Remove Image"
                               >
                                 <X size={16} />
                               </button>
                            </div>
                          </div>
                          <Input 
                            value={imageLabels[idx] || ""}
                            onChange={(e) => updateLabel(idx, e.target.value)}
                            placeholder="Add image label (e.g. Figure 1)"
                            className="h-8 text-xs rounded-lg bg-white/50 dark:bg-slate-950/50"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-slate-400 font-medium italic">
                  Tip: You can use **Markdown** and **LaTeX** (e.g. $x^2$) for formatting. 
                  Upload images above, then click the **Copy icon** to embed them anywhere in your text using `![alt](url)` syntax.
                </p>
              </div>
            ) : (
              <div className="min-h-[400px] max-h-[600px] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-8 custom-scrollbar space-y-6">
                {images && images.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {images.map((url, idx) => (
                      <img 
                        key={idx} 
                        src={url} 
                        alt={`Reading ${idx + 1}`} 
                        className="rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-full" 
                      />
                    ))}
                  </div>
                )}
                {content ? (
                  <LaTeXRenderer content={content} />
                ) : (
                  !images.length && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-20">
                      <BookOpen size={48} className="opacity-20" />
                      <p className="text-sm font-medium italic">Nothing to preview yet.</p>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-8 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="rounded-2xl font-bold h-12 px-6 border-slate-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className="rounded-2xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 h-12 px-8 flex items-center gap-2"
          >
            {updateMutation.isPending ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : (
              <Save size={18} />
            )}
            Save Content
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
