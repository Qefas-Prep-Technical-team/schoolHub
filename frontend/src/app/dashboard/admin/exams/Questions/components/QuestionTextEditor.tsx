import React, { useState, useRef } from 'react';
import FormulaToolbar from './FormulaToolbar';
import LaTeXRenderer from '@/components/ui/LaTeXRenderer';
import { Eye, EyeOff, Image as ImageIcon, X, Upload, Loader2, Copy } from 'lucide-react';
import { imageService } from '@/lib/api/services/imageService';
import { toast } from 'react-toastify';

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

const toolbarButtons = [
    'format_bold',
    'format_italic',
    'format_list_bulleted',
    'format_list_numbered',
    'image',
];

const QuestionTextEditor: React.FC<QuestionTextEditorProps> = ({
    questionText,
    onQuestionTextChange,
    images = [],
    imageLabels = [],
    onImagesChange,
    onImageLabelsChange,
    label = "Question Text",
    placeholder = "Type here... e.g., 'Solve for $x$: $x^2 + 2x + 1 = 0$'"
}) => {
    const [isUploading, setIsUploading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleInsert = (formula: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart ?? 0;
        const end = textarea.selectionEnd ?? 0;
        const text = textarea.value;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);

        const newText = before + formula + after;
        onQuestionTextChange(newText);

        // Reset focus and move cursor after insertion
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + formula.length, start + formula.length);
        }, 0);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !onImagesChange) return;

        setIsUploading(true);
        try {
            const uploadPromises = Array.from(files).map(file => imageService.proxyUploadToBunny(file));
            const results = await Promise.all(uploadPromises);
            const newUrls = results.map(res => res.publicUrl);
            onImagesChange([...images, ...newUrls]);
            if (onImageLabelsChange) {
                onImageLabelsChange([...imageLabels, ...new Array(newUrls.length).fill("")]);
            }
            toast.success(`${files.length} image(s) uploaded successfully!`);
        } catch (error) {
            toast.error("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = (index: number) => {
        if (!onImagesChange) return;
        onImagesChange(images.filter((_, i) => i !== index));
        if (onImageLabelsChange) {
            onImageLabelsChange(imageLabels.filter((_, i) => i !== index));
        }
    };

    const updateLabel = (index: number, newLabel: string) => {
        if (!onImageLabelsChange) return;
        const next = [...imageLabels];
        next[index] = newLabel;
        onImageLabelsChange(next);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {label}
                </p>
                <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        showPreview 
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" 
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                >
                    {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                    {showPreview ? "Hide Preview" : "Show LaTeX Preview"}
                </button>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden focus-within:ring-4 focus-within:ring-blue-500/10 transition-all shadow-sm">
                <FormulaToolbar onInsert={handleInsert} />
                
                <div className="p-2 flex items-center gap-1 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950">
                    {toolbarButtons.map((icon) => (
                        <button
                            key={icon}
                            type="button"
                            onClick={() => {
                                if (icon === 'image') {
                                    document.getElementById(`image-upload-${label.replace(/\s+/g, '-')}`)?.click();
                                }
                            }}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">{icon}</span>
                        </button>
                    ))}
                    {onImagesChange && (
                        <input
                            type="file"
                            id={`image-upload-${label.replace(/\s+/g, '-')}`}
                            multiple
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageUpload}
                        />
                    )}
                </div>

                <textarea
                    ref={textareaRef}
                    className="w-full min-h-[160px] resize-y p-5 border-0 focus:ring-0 bg-white dark:bg-slate-950 placeholder:text-slate-400 text-slate-900 dark:text-slate-100 text-base leading-relaxed font-medium"
                    placeholder={placeholder}
                    value={questionText}
                    onChange={(e) => onQuestionTextChange(e.target.value)}
                />

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/30 flex flex-wrap gap-4 border-t border-slate-50 dark:border-slate-900 min-h-[4rem]">
                        {isUploading && (
                            <div className="flex flex-col items-center justify-center gap-2 w-32 aspect-square rounded-lg border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                                <Loader2 size={24} className="animate-spin text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Uploading...</span>
                            </div>
                        )}
                        {images.map((url, idx) => (
                            <div key={idx} className="flex flex-col gap-2 w-32">
                                <div className="relative group w-full aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800">
                                    <img src={url} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                        <button
                                            onClick={() => {
                                                const label = imageLabels[idx] || "Question Image";
                                                const markdown = `![${label}](${url})`;
                                                navigator.clipboard.writeText(markdown);
                                                toast.success("Markdown copied! Paste it in the text area.");
                                            }}
                                            className="bg-white/90 dark:bg-slate-900 p-1.5 rounded-full hover:bg-white transition-colors"
                                            title="Copy Markdown"
                                        >
                                            <Copy size={12} className="text-primary" />
                                        </button>
                                        <button
                                            onClick={() => removeImage(idx)}
                                            className="bg-white/90 dark:bg-slate-900 p-1.5 rounded-full hover:bg-white transition-colors"
                                            title="Remove Image"
                                        >
                                            <X size={12} className="text-red-500" />
                                        </button>
                                    </div>
                                </div>
                                <input 
                                    className="text-[10px] p-1 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-1 focus:ring-primary"
                                    placeholder="Add label..."
                                    value={imageLabels[idx] || ""}
                                    onChange={(e) => updateLabel(idx, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                {showPreview && (questionText || images.length > 0) && (
                    <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="text-[10px] uppercase font-black tracking-widest text-blue-500 mb-3 ml-1">
                            Live Render Preview
                        </div>
                        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                            {images.length > 0 && (
                                <div className="grid grid-cols-2 gap-2">
                                    {images.map((url, i) => (
                                        <img key={i} src={url} className="rounded-lg w-full" alt="" />
                                    ))}
                                </div>
                            )}
                            <LaTeXRenderer content={questionText} />
                        </div>
                    </div>
                )}
            </div>
            <p className="text-[10px] text-slate-500 font-medium ml-1">
                Use <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-blue-600">$...$</code> for inline and <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-blue-600">$$...$$</code> for block formulas.
            </p>
        </div>
    );
};

export default QuestionTextEditor;