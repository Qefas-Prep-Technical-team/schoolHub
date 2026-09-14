"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
import FormulaPalette from "./FormulaPalette";

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
  initialContent,
  initialImages,
  initialLabels
}: ReadingContentModalProps) {
  const [content, setContent] = useState(initialContent || "");
  const [images, setImages] = useState<string[]>(initialImages || []);
  const [imageLabels, setImageLabels] = useState<string[]>(initialLabels || []);
  const [uploadingFiles, setUploadingFiles] = useState<{ id: string; file: File; progress: number }[]>([]);
  const [editorMode, setEditorMode] = useState<"normal" | "math">("normal");
  const [hasEdited, setHasEdited] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const queryClient = useQueryClient();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && !hasEdited) {
      // Show skeleton while images sync in
      setIsLoadingImages(true);
      setContent(initialContent || "");
      
      const nextImages = initialImages || [];
      setImages(nextImages);
      
      const effectiveLabels = (initialLabels && initialLabels.length > 0) 
        ? initialLabels 
        : new Array(nextImages.length).fill("");
      setImageLabels(effectiveLabels);

      // Short delay so the skeleton is visible, then reveal images
      const timer = setTimeout(() => setIsLoadingImages(false), 600);
      return () => clearTimeout(timer);
    }
    
    if (!isOpen) {
      // Reset edit state when modal closes so it re-syncs when opened next time
      setHasEdited(false);
    }
  }, [initialContent, initialImages, initialLabels, isOpen, hasEdited]);

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
      setHasEdited(false);
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

    const newUploads = Array.from(files).map(file => ({
      id: Math.random().toString(36).substring(7),
      file,
      progress: 0
    }));

    setUploadingFiles(prev => [...prev, ...newUploads]);
    
    // Clear the input value so the same files can be selected again if needed
    if (e.target) {
      e.target.value = '';
    }

    for (const upload of newUploads) {
      // Simulate progress
      const interval = setInterval(() => {
        setUploadingFiles(prev => prev.map(f => {
          if (f.id === upload.id && f.progress < 90) {
            const nextProgress = f.progress + Math.floor(Math.random() * 15) + 5;
            return { ...f, progress: Math.min(nextProgress, 90) };
          }
          return f;
        }));
      }, 300);

      try {
        const { publicUrl } = await imageService.proxyUploadToBunny(upload.file);
        
        clearInterval(interval);
        
        // Remove from uploading list
        setUploadingFiles(prev => prev.filter(f => f.id !== upload.id));
        
        // Add to images
        setImages(prev => [...prev, publicUrl]);
        setImageLabels(prev => [...prev, upload.file.name.split('.')[0] || ""]);
        setHasEdited(true); // Mark as edited so background refetches don't wipe it
        
        toast.success(`Image uploaded successfully!`);
      } catch (error) {
        console.error("Upload failed:", error);
        clearInterval(interval);
        setUploadingFiles(prev => prev.filter(f => f.id !== upload.id));
        toast.error(`Failed to upload ${upload.file.name}`);
      }
    }
  };

  const removeImage = (index: number) => {
    setHasEdited(true);
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageLabels(prev => prev.filter((_, i) => i !== index));
  };

  const updateLabel = (index: number, label: string) => {
    setHasEdited(true);
    setImageLabels(prev => {
      const next = [...prev];
      next[index] = label;
      return next;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "rounded-[2rem] p-0 overflow-hidden border-none shadow-2xl focus:outline-none transition-all duration-300",
        editorMode === "math" ? "max-w-5xl" : "sm:max-w-3xl"
      )}>
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
              <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800/60 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setEditorMode('normal')}
                  className={`px-4 py-2 text-[11px] font-black tracking-wide transition-all ${
                    editorMode === 'normal'
                      ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  ✏️ Normal
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode('math')}
                  className={`px-4 py-2 text-[11px] font-black tracking-wide transition-all border-l border-slate-200 dark:border-slate-700 ${
                    editorMode === 'math'
                      ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  𝑓(𝑥) Math
                </button>
              </div>
            </div>

            <div className={`grid grid-cols-1 gap-6 ${editorMode === 'math' ? 'md:grid-cols-[1fr_300px]' : ''}`}>
              
              {/* Left Column: Editor & Images */}
              <div className="space-y-4">
                {editorMode === 'normal' ? (
                <Textarea
                  id="readingContent"
                  placeholder="Paste your comprehension passage here..."
                  className="min-h-[300px] rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus:border-primary/40 focus:ring-0 resize-y font-medium leading-relaxed p-6 text-base bg-white dark:bg-slate-900"
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setHasEdited(true);
                  }}
                />
              ) : (
                <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus-within:border-primary/40 transition-all overflow-hidden flex flex-col" style={{ minHeight: '400px' }}>
                  <Textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      setHasEdited(true);
                    }}
                    placeholder="Type your reading passage. Use the formula builder or LaTeX syntax to add math..."
                    className="w-full resize-y min-h-[200px] p-6 text-base font-mono leading-relaxed text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:outline-none border-none focus-visible:ring-0 rounded-none block flex-shrink-0"
                  />
                  
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-slate-800 border-t border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <Eye size={10} className="text-primary/70" />
                    <span className="text-[9px] uppercase font-black tracking-widest text-primary/70">Live Preview</span>
                  </div>
                  
                  <div className="flex-1 px-6 py-4 bg-white dark:bg-slate-900 overflow-y-auto">
                    {content ? (
                      <LaTeXRenderer content={content} className="text-base leading-relaxed" />
                    ) : (
                      <p className="text-slate-300 dark:text-slate-600 text-xs font-medium italic py-2">
                        Your rendered math appears here as you type...
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
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
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('image-upload')?.click()}
                        className="rounded-xl border-dashed border-2 hover:border-primary hover:text-primary transition-all flex items-center gap-2"
                      >
                        <Upload size={16} />
                        Upload Images
                      </Button>
                    </div>
                  </div>

                  {/* Image skeleton loading state */}
                  {isLoadingImages && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <div className="aspect-video rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 animate-pulse" />
                          <div className="h-7 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
                        </div>
                      ))}
                    </div>
                  )}

                  {!isLoadingImages && images && images.length > 0 && (
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

                  {uploadingFiles.length > 0 && (
                    <div className="space-y-3 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                      {uploadingFiles.map(file => (
                        <div key={file.id} className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <ImageIcon size={14} className="text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                                {file.file.name}
                              </span>
                              <span className="text-[10px] font-bold text-primary">
                                {file.progress}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 font-medium italic">
                  Tip: You can use **Markdown** and **LaTeX** (e.g. $x^2$) for formatting. 
                  Upload images above, then click the **Copy icon** to embed them anywhere in your text using `![alt](url)` syntax.
                </p>
              </div>
            </div>

              {/* Right Column: Formula Palette (Only in Math Mode) */}
              {editorMode === 'math' && (
                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200 dark:border-slate-700 h-fit space-y-4">
                  <FormulaPalette
                    onInsert={(formula) => {
                      const textarea = textareaRef.current;
                      if (textarea) {
                        const start = textarea.selectionStart ?? 0;
                        const end = textarea.selectionEnd ?? 0;
                        const before = content.substring(0, start);
                        const after = content.substring(end);
                        const newVal = before + formula + after;
                        setContent(newVal);
                        setTimeout(() => {
                          textarea.focus();
                          textarea.setSelectionRange(start + formula.length, start + formula.length);
                        }, 0);
                      } else {
                        setContent((c: string) => c + formula);
                      }
                      setHasEdited(true);
                    }}
                  />
                  <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden mt-4">
                    <div className="px-4 py-2.5 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-[11px] font-black uppercase tracking-widest text-slate-400">
                      Example
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-900">
                      <LaTeXRenderer
                        content="Solve for $x$: $$x^2 + 3x - 4 = 0$$"
                        className="text-sm text-slate-700 dark:text-slate-300"
                      />
                      <div className="mt-2 text-[10px] text-slate-400 font-mono overflow-x-auto">
                        {`Solve for $x$: $$x^2 + 3x - 4 = 0$$`}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
            className="rounded-2xl font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 h-12 px-8 flex items-center gap-2"
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
