import React, { useRef } from 'react';
import { QuestionOption } from "./type";
import FormulaToolbar from './FormulaToolbar';
import LaTeXRenderer from '@/components/ui/LaTeXRenderer';
import { Trash2 } from 'lucide-react';

interface OptionItemProps {
    option: QuestionOption;
    onRemove: () => void;
    onTextChange: (text: string) => void;
    onSetCorrect: () => void;
}

const OptionItem: React.FC<OptionItemProps> = ({
    option,
    onRemove,
    onTextChange,
    onSetCorrect,
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleInsert = (formula: string) => {
        const input = inputRef.current;
        if (!input) return;

        const start = input.selectionStart || 0;
        const end = input.selectionEnd || 0;
        const text = input.value;
        const before = text.substring(0, start);
        const after = text.substring(end, text.length);

        const newText = before + formula + after;
        onTextChange(newText);

        setTimeout(() => {
            input.focus();
            input.setSelectionRange(start + formula.length, start + formula.length);
        }, 0);
    };

    return (
        <div className="group space-y-2">
            <div className="flex items-center gap-3">
                <div className="relative group/radio">
                    <input
                        className="peer h-6 w-6 cursor-pointer appearance-none rounded-full border-2 border-slate-300 dark:border-slate-700 checked:border-blue-600 transition-all checked:bg-blue-600 focus:outline-none"
                        name="correct-answer"
                        type="radio"
                        checked={option.correct}
                        onChange={onSetCorrect}
                    />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 transition-opacity">
                        <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                </div>

                <div className="relative flex-grow group/input transition-all">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 group-focus-within/input:text-blue-500 transition-colors">
                        {option.letter}
                    </span>
                    <input
                        ref={inputRef}
                        className="w-full h-12 rounded-2xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 pl-10 pr-4 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-500 transition-all text-sm font-medium"
                        placeholder={`Enter option ${option.letter}`}
                        type="text"
                        value={option.text}
                        onChange={(e) => onTextChange(e.target.value)}
                    />
                    {option.text && option.text.includes('$') && (
                        <div className="mt-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-inner">
                            <div className="text-[10px] uppercase font-black tracking-widest text-blue-500 mb-1">Option Preview</div>
                            <LaTeXRenderer content={option.text} />
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    className="p-3 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-all active:scale-95"
                    onClick={onRemove}
                >
                    <Trash2 size={18} />
                </button>
            </div>
            
            <div className="hidden group-focus-within:block animate-in fade-in slide-in-from-top-1 duration-200 ml-9">
                <FormulaToolbar onInsert={handleInsert} />
            </div>
        </div>
    );
};

export default OptionItem;
