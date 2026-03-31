'use client';

import { useState, useRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import FormulaToolbar from '@/app/dashboard/admin/exams/Questions/components/FormulaToolbar';
import LaTeXRenderer from '@/components/ui/LaTeXRenderer';

interface QuestionEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function QuestionEditor({ value, onChange }: QuestionEditorProps) {
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
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + formula.length, start + formula.length);
    }, 0);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between pb-1">
        <label className="text-base font-medium text-gray-900 dark:text-gray-200">
          Question
        </label>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            showPreview
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          {showPreview ? <EyeOff size={13} /> : <Eye size={13} />}
          {showPreview ? 'Hide Preview' : 'Show LaTeX Preview'}
        </button>
      </div>

      <div className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
        {/* Formula Toolbar */}
        <FormulaToolbar onInsert={handleInsert} />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-none text-gray-900 dark:text-gray-200 focus:outline-none border-0 bg-transparent min-h-36 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-4 text-base font-normal"
          placeholder="Enter the question text here... Use $...$ for inline math, $$...$$ for block equations."
          rows={6}
        />

        {/* LaTeX Live Preview */}
        {showPreview && value && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="text-[10px] uppercase font-black tracking-widest text-blue-500 mb-2">
              Live Render Preview
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <LaTeXRenderer content={value} />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Use <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-blue-600">$...$</code> for inline and <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded text-blue-600">$$...$$</code> for block formulas.
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {value.length}/5000 characters
        </span>
      </div>
    </div>
  );
}