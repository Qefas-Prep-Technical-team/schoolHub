import React, { useState, useRef } from 'react';
import FormulaToolbar from './FormulaToolbar';
import LaTeXRenderer from '@/components/ui/LaTeXRenderer';
import { Eye, EyeOff } from 'lucide-react';

interface QuestionTextEditorProps {
    questionText: string;
    onQuestionTextChange: (text: string) => void;
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
    label = "Question Text",
    placeholder = "Type here... e.g., 'Solve for $x$: $x^2 + 2x + 1 = 0$'"
}) => {
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
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">{icon}</span>
                        </button>
                    ))}
                </div>

                <textarea
                    ref={textareaRef}
                    className="w-full min-h-[160px] resize-y p-5 border-0 focus:ring-0 bg-white dark:bg-slate-950 placeholder:text-slate-400 text-slate-900 dark:text-slate-100 text-base leading-relaxed font-medium"
                    placeholder={placeholder}
                    value={questionText}
                    onChange={(e) => onQuestionTextChange(e.target.value)}
                />

                {showPreview && questionText && (
                    <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="text-[10px] uppercase font-black tracking-widest text-blue-500 mb-3 ml-1">
                            Live Render Preview
                        </div>
                        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
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