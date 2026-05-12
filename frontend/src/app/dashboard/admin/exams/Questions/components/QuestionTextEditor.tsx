/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from 'react';
import FormulaToolbar from './FormulaToolbar';
import LaTeXRenderer from '@/components/ui/LaTeXRenderer';
import { 
  Eye, EyeOff, Image as ImageIcon, X, Upload, Loader2, Copy, 
  Bold, Italic, List, ListOrdered, Hash, Type, HelpCircle,
  ChevronDown, Info, Calculator, Code
} from 'lucide-react';
import { imageService } from '@/lib/api/services/imageService';
import { toast } from 'react-toastify';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface QuestionTextEditorProps {
    questionText: string;
    onQuestionTextChange: (text: string) => void;
    images?: string[];
    imageLabels?: string[];
    onImagesChange?: (images: string[]) => void;
    onImageLabelsChange?: (labels: string[]) => void;
    label?: string;
    placeholder?: string;
}

const QuestionTextEditor: React.FC<QuestionTextEditorProps> = ({
    questionText,
    onQuestionTextChange,
    images = [],
    imageLabels = [],
    onImagesChange,
    onImageLabelsChange,
    label = "Question Text",
    placeholder = "Type here... Use $ signs for math, e.g., '$a^2 + b^2 = c^2$'"
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showMainGuide, setShowMainGuide] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-open preview when LaTeX is detected for the first time
    useEffect(() => {
      if (questionText.includes('$') && !showPreview) {
        setShowPreview(true);
      }
    }, [questionText]);

    const handleInsert = (formula: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const startPos = textarea.selectionStart ?? 0;
        const endPos = textarea.selectionEnd ?? 0;
        const currentContent = textarea.value;
        const beforeSelection = currentContent.substring(0, startPos);
        const afterSelection = currentContent.substring(endPos, currentContent.length);

        const updatedContent = beforeSelection + formula + afterSelection;
        onQuestionTextChange(updatedContent);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(startPos + formula.length, startPos + formula.length);
        }, 0);
    };

    const applyFormat = (formatType: 'bold' | 'italic' | 'bullet' | 'number' | 'heading') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const selectionStart = textarea.selectionStart;
        const selectionEnd = textarea.selectionEnd;
        const currentContent = textarea.value;
        const selectedText = currentContent.substring(selectionStart, selectionEnd);
        
        let formattedText = "";
        let selectionOffset = 0;

        // Check if cursor is at the start of a line
        const isCharAtStartOfLine = selectionStart === 0 || currentContent[selectionStart - 1] === '\n';

        switch (formatType) {
            case 'bold':
                formattedText = `**${selectedText || "text"}**`;
                selectionOffset = selectedText ? 0 : -2;
                break;
            case 'italic':
                formattedText = `_${selectedText || "text"}_`;
                selectionOffset = selectedText ? 0 : -1;
                break;
            case 'heading':
                formattedText = `${isCharAtStartOfLine ? "" : "\n"}### ${selectedText || "Heading"}`;
                break;
            case 'bullet':
                formattedText = `${isCharAtStartOfLine ? "" : "\n"}- ${selectedText || "item"}`;
                break;
            case 'number':
                formattedText = `${isCharAtStartOfLine ? "" : "\n"}1. ${selectedText || "item"}`;
                break;
        }

        const updatedContent = currentContent.substring(0, selectionStart) + formattedText + currentContent.substring(selectionEnd);
        onQuestionTextChange(updatedContent);

        setTimeout(() => {
            textarea.focus();
            const newCursorPos = selectionStart + formattedText.length + selectionOffset;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const targetFiles = event.target.files;
        if (!targetFiles || targetFiles.length === 0 || !onImagesChange) return;

        setIsUploading(true);
        try {
            const uploadPromises = Array.from(targetFiles).map(uploadFile => imageService.proxyUploadToBunny(uploadFile));
            const uploadResults = await Promise.all(uploadPromises);
            const uploadedUrls = uploadResults.map(uploadResult => uploadResult.publicUrl);
            onImagesChange([...images, ...uploadedUrls]);
            if (onImageLabelsChange) {
                onImageLabelsChange([...imageLabels, ...new Array(uploadedUrls.length).fill("")]);
            }
            toast.success(`${targetFiles.length} image(s) uploaded successfully!`);
        } catch (uploadError) {
            toast.error("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = (imageIndex: number) => {
        if (!onImagesChange) return;
        onImagesChange(images.filter((_, filterIndex) => filterIndex !== imageIndex));
        if (onImageLabelsChange) {
            onImageLabelsChange(imageLabels.filter((_, filterIndex) => filterIndex !== imageIndex));
        }
    };

    const updateLabel = (labelIndex: number, newLabelValue: string) => {
        if (!onImageLabelsChange) return;
        const updatedLabels = [...imageLabels];
        updatedLabels[labelIndex] = newLabelValue;
        onImageLabelsChange(updatedLabels);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            const textarea = textareaRef.current;
            if (!textarea) return;

            const selectionStart = textarea.selectionStart;
            const currentContent = textarea.value;

            // Get the current line text up to the cursor
            const textBeforeCursor = currentContent.substring(0, selectionStart);
            const lineStartPos = textBeforeCursor.lastIndexOf('\n') + 1;
            const currentLine = textBeforeCursor.substring(lineStartPos);

            // Match bullet lists (- , * , + )
            const bulletMatch = currentLine.match(/^(\s*)([-*+]\s+)(.*)/);
            // Match numbered lists (1. , 2. )
            const numberMatch = currentLine.match(/^(\s*)(\d+)(\.\s+)(.*)/);

            if (bulletMatch) {
              const [_, indentation, marker, content] = bulletMatch;
              
              if (content.trim() === '') {
                // If line is empty marker, end the list by clearing the marker
                e.preventDefault();
                const newContent = currentContent.substring(0, lineStartPos) + currentContent.substring(selectionStart);
                onQuestionTextChange(newContent);
              } else {
                // If line has content, continue the bullet
                e.preventDefault();
                const nextMarker = `\n${indentation}${marker}`;
                const newContent = currentContent.substring(0, selectionStart) + nextMarker + currentContent.substring(selectionStart);
                onQuestionTextChange(newContent);
                setTimeout(() => {
                  textarea.setSelectionRange(selectionStart + nextMarker.length, selectionStart + nextMarker.length);
                }, 0);
              }
            } else if (numberMatch) {
              const [_, indentation, num, marker, content] = numberMatch;
              
              if (content.trim() === '') {
                // If line is empty marker, end the list
                e.preventDefault();
                const newContent = currentContent.substring(0, lineStartPos) + currentContent.substring(selectionStart);
                onQuestionTextChange(newContent);
              } else {
                // If line has content, increment number
                e.preventDefault();
                const nextNum = parseInt(num) + 1;
                const nextMarker = `\n${indentation}${nextNum}${marker}`;
                const newContent = currentContent.substring(0, selectionStart) + nextMarker + currentContent.substring(selectionStart);
                onQuestionTextChange(newContent);
                setTimeout(() => {
                  textarea.setSelectionRange(selectionStart + nextMarker.length, selectionStart + nextMarker.length);
                }, 0);
              }
            }
        }
    };

    return (
        <TooltipProvider>
        <div className="space-y-4 font-sans group/editor">
            {/* Header with Title and Preview Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                        <Type size={18} className="stroke-[2.5]" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.15em]">
                          {label}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 -mt-0.5">Drafting Mode</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                      type="button" 
                      onClick={() => setShowPreview(!showPreview)} 
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        showPreview 
                          ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                  >
                      {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                      <span>{showPreview ? "Hide Preview" : "Show Preview"}</span>
                  </button>
                  <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                      Auto-Save Active
                  </div>
                </div>
            </div>

            {/* Main Editor Surface */}
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden focus-within:ring-4 focus-within:ring-primary/5 focus-within:border-primary/30 transition-all duration-500 shadow-sm dark:shadow-none">
                <FormulaToolbar onInsert={handleInsert} />
                
                {/* Floating-style Glass Toolbar */}
                <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-900 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-1 pr-3 border-r border-slate-200 dark:border-slate-800">
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <button type="button" onClick={() => applyFormat('bold')} className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-all active:scale-90"><Bold size={16} /></button>
                              </TooltipTrigger>
                              <TooltipContent><p className="text-[10px] font-bold uppercase">Bold (Ctrl+B)</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <button type="button" onClick={() => applyFormat('italic')} className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-all active:scale-90"><Italic size={16} /></button>
                              </TooltipTrigger>
                              <TooltipContent><p className="text-[10px] font-bold uppercase">Italic (Ctrl+I)</p></TooltipContent>
                          </Tooltip>
                      </div>
                      
                      <div className="flex items-center gap-1 px-3 border-r border-slate-200 dark:border-slate-800">
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <button type="button" onClick={() => applyFormat('bullet')} className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-all active:scale-90"><List size={16} /></button>
                              </TooltipTrigger>
                              <TooltipContent><p className="text-[10px] font-bold uppercase">Bullet List</p></TooltipContent>
                          </Tooltip>
                          <Tooltip>
                              <TooltipTrigger asChild>
                                  <button type="button" onClick={() => applyFormat('number')} className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-all active:scale-90"><ListOrdered size={16} /></button>
                              </TooltipTrigger>
                              <TooltipContent><p className="text-[10px] font-bold uppercase">Numbered List</p></TooltipContent>
                          </Tooltip>
                      </div>

                      <button 
                          type="button" 
                          onClick={() => document.getElementById(`image-upload-${label.replace(/\s+/g, '-')}`)?.click()} 
                          className="flex items-center gap-2 p-2 px-3 ml-2 rounded-xl hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-primary transition-all group/media shadow-sm bg-white/50 dark:bg-transparent"
                      >
                          <ImageIcon size={16} className="group-hover/media:scale-110 transition-transform" />
                          <span className="text-[10px] font-black uppercase tracking-widest hidden lg:inline">Add Graphic</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                         <div className="hidden sm:flex flex-col items-end mr-2">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{questionText.length} Chars</span>
                         </div>
                         {onImagesChange && (
                            <input type="file" id={`image-upload-${label.replace(/\s+/g, '-')}`} multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                         )}
                    </div>
                </div>

                <div className={`grid grid-cols-1 ${showPreview ? 'lg:grid-cols-2' : ''} transition-all duration-500`}>
                    <div className={`${showPreview ? 'border-r border-slate-100 dark:border-slate-800' : ''} transition-all`}>
                        <textarea
                            ref={textareaRef}
                            className="w-full min-h-[300px] lg:min-h-[450px] resize-y p-8 border-0 focus:ring-0 bg-transparent placeholder:text-slate-200 dark:placeholder:text-slate-800 text-slate-800 dark:text-slate-200 text-lg leading-[1.8] font-medium selection:bg-primary/10 tracking-tight"
                            placeholder={placeholder}
                            value={questionText}
                            onChange={(e) => onQuestionTextChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />

                        {/* Sub-toolbar for Image Labels */}
                        {images.length > 0 && (
                            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 flex flex-wrap gap-4 border-t border-slate-100 dark:border-slate-900 border-dashed">
                                {images.map((imgUrl, imgIndex) => (
                                    <div key={imgIndex} className="flex flex-col gap-2 w-32 animate-in zoom-in-95 duration-200">
                                        <div className="relative group w-full aspect-square rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-xl">
                                            <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                                                <button onClick={() => {
                                                        const captionLabel = imageLabels[imgIndex] || "Graphic";
                                                        navigator.clipboard.writeText(`![${captionLabel}](${imgUrl})`);
                                                        toast.success("Markdown copied!");
                                                    }}
                                                    className="bg-white p-2 rounded-full hover:bg-primary hover:text-white transition-all transform scale-75 group-hover:scale-100"
                                                ><Copy size={12} /></button>
                                                <button onClick={() => removeImage(imgIndex)}
                                                    className="bg-white p-2 rounded-full hover:bg-rose-500 hover:text-white transition-all transform scale-75 group-hover:scale-100"
                                                ><X size={12} /></button>
                                            </div>
                                        </div>
                                        <input 
                                            className="text-[9px] font-black uppercase p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900 text-center tracking-widest outline-none focus:ring-1 focus:ring-primary shadow-sm"
                                            placeholder="CAPTION..."
                                            value={imageLabels[imgIndex] || ""}
                                            onChange={(e) => updateLabel(imgIndex, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Preview Panel */}
                    {showPreview && (
                        <div ref={scrollRef} className="p-8 bg-slate-50/50 dark:bg-slate-900/20 max-h-[450px] lg:max-h-none overflow-y-auto animate-in fade-in slide-in-from-right-4 duration-500 border-t lg:border-t-0 border-slate-100 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500 shadow-lg shadow-blue-500/20 text-white text-[10px] font-black">P</div>
                                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-blue-500">Live visualization</span>
                                <div className="h-[1px] flex-1 bg-blue-100 dark:bg-blue-900/50 ml-2" />
                            </div>
                            
                            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl shadow-blue-500/5 space-y-6 min-h-[300px]">
                                {images.length > 0 && (
                                    <div className="grid grid-cols-2 gap-4">
                                        {images.map((imgUrl, previewIndex) => (
                                            <div key={previewIndex} className="space-y-2">
                                            <img src={imgUrl} className="rounded-2xl w-full border border-slate-100 dark:border-slate-800 shadow-md" alt="" />
                                            {imageLabels[previewIndex] && <p className="text-center text-[10px] font-bold text-slate-400 italic">{imageLabels[previewIndex]}</p>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {questionText ? (
                                    <LaTeXRenderer content={questionText} />
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-300 dark:text-slate-700">
                                        <Code size={40} className="mb-4 opacity-20" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Awaiting Content...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Educational Section - Outside the main Editor Card */}
            <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="max-w-4xl">
                  {/* Dropdown Header Trigger */}
                  <button 
                    type="button"
                    onClick={() => setShowMainGuide(!showMainGuide)}
                    className="flex items-center justify-between w-full group/guide transition-all active:scale-[0.99]"
                  >
                      <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${showMainGuide ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-primary/5 text-primary border-primary/10 group-hover/guide:bg-primary/10'}`}>
                              <HelpCircle size={22} className={showMainGuide ? "animate-pulse" : ""} />
                          </div>
                          <div className="text-left">
                              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                  How to Author Premium Questions
                                  <span className={`text-[9px] px-2 py-0.5 rounded-full ${showMainGuide ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'} uppercase font-bold tracking-tighter`}>
                                      {showMainGuide ? "Active" : "Closed"}
                                  </span>
                              </h3>
                              <p className="text-[11px] font-bold text-slate-400">Mastering the Math & Formatting Engine</p>
                          </div>
                      </div>
                      <div className={`w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 transition-all ${showMainGuide ? 'rotate-180 bg-slate-900 text-white' : 'group-hover/guide:bg-slate-50'}`}>
                          <ChevronDown size={18} />
                      </div>
                  </button>

                  {showMainGuide && (
                    <div className="mt-8 animate-in slide-in-from-top-4 fade-in duration-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 text-[12px] leading-relaxed">
                            <div className="space-y-3 p-6 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                <div className="flex gap-3">
                                   <div className="font-black text-primary bg-primary/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">1</div>
                                   <p className="text-slate-600 dark:text-slate-400">
                                     <span className="font-black text-slate-900 dark:text-white">Smart Formatting:</span> Simply type your question text. Highlight portions of your text and use the toolbar buttons (Bold, Italic, Lists) to apply styling instantly using standard Markdown.
                                   </p>
                                </div>
                            </div>
                            <div className="space-y-3 p-6 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                                <div className="flex gap-3">
                                   <div className="font-black text-primary bg-primary/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">2</div>
                                   <p className="text-slate-600 dark:text-slate-400">
                                     <span className="font-black text-slate-900 dark:text-white">The Math Engine:</span> Click math symbols in the toolbar to insert code. <span className="font-black underline decoration-primary/30">Crucially:</span> all math MUST be wrapped in <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-primary">$</code> signs (e.g. <code className="text-blue-500 font-bold">$num^2$</code> or <code className="text-blue-500 font-bold">$\frac{8}{9}$</code>) for it to render correctly.
                                   </p>
                                </div>
                            </div>
                        </div>
                    </div>
                  )}
              </div>
            </div>
        </div>
        </TooltipProvider>
    );
};

export default QuestionTextEditor;

