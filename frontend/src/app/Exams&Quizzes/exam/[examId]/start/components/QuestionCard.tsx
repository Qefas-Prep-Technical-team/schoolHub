// src/components/Dashboard/QuestionCard.tsx
'use client';

import React, { memo } from 'react';
import QuestionOptionComponent from './QuestionOption';
import Button from './ui/Button';
import LaTeXRenderer from '@/components/ui/LaTeXRenderer';
import NextImage from 'next/image';
import { ZoomIn } from 'lucide-react';

interface QuestionCardProps {
    id: string;
    number: number;
    totalQuestions: number;
    text: string;
    type?: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER";
    equation?: string;
    images?: string[];
    imageLabels?: string[];
    options: { id: string; text: string }[];
    selectedOptionId?: string;
    onSelectOption?: (optionId: string) => void;
    onNext?: () => void;
    onZoom?: (src: string, alt?: string) => void;
    showNextButton?: boolean;
    hasReadingContent?: boolean;
    onOpenReadingModal?: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = memo(({
    id,
    number,
    totalQuestions,
    text,
    type = "MULTIPLE_CHOICE",
    equation,
    images = [],
    imageLabels = [],
    options,
    selectedOptionId,
    onSelectOption,
    onNext,
    onZoom,
    showNextButton = true,
    hasReadingContent,
    onOpenReadingModal
}) => {
    return (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 backdrop-blur-sm p-6 sm:p-8 shadow-sm">
            <div className="flex flex-wrap justify-between gap-3 items-center mb-6">
                <h1 className="text-xl sm:text-2xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
                    Question {number} <span className="text-sm font-normal text-slate-400 dark:text-slate-500">/ {totalQuestions}</span>
                </h1>
                <div className="flex items-center gap-2">
                    {hasReadingContent && onOpenReadingModal && (
                        <button
                            type="button"
                            onClick={onOpenReadingModal}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-xs active:scale-95 cursor-pointer"
                        >
                            <span className="material-symbols-outlined text-base">menu_book</span>
                            <span>Read Passage</span>
                        </button>
                    )}
                    {showNextButton && (
                        <Button
                            variant="primary"
                            size="md"
                            icon="arrow_forward"
                            onClick={onNext}
                            disabled={number === totalQuestions}
                        >
                            Next
                        </Button>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {images.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        {images.map((url, i) => (
                            <figure key={i} className="flex flex-col gap-2 group">
                                <div 
                                    className="relative aspect-video cursor-zoom-in overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm w-full bg-white dark:bg-slate-900"
                                    onClick={() => onZoom?.(url, imageLabels[i])}
                                >
                                    <NextImage 
                                        src={url} 
                                        alt={imageLabels[i] || `Question Image ${i + 1}`} 
                                        fill
                                        className="object-contain transition-transform duration-500 group-hover:scale-105" 
                                    />
                                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white/80 dark:bg-black/80 p-3 rounded-full shadow-large transform scale-0 group-hover:scale-110 transition-transform duration-300">
                                            <ZoomIn size={20} className="text-primary" />
                                        </div>
                                    </div>
                                </div>
                                {imageLabels[i] && (
                                    <figcaption className="text-center text-[10px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 italic">
                                        {imageLabels[i]}
                                    </figcaption>
                                )}
                            </figure>
                        ))}
                    </div>
                )}

                <LaTeXRenderer 
                    content={text}
                    className="mt-4 text-base leading-relaxed text-gray-800 dark:text-gray-200"
                    onZoom={onZoom}
                />
            </div>
            
            {equation && (
                <div className="mt-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 p-4 text-center">
                    <p className="font-mono text-lg text-slate-800 dark:text-slate-100">{equation}</p>
                </div>
            )}
            {type === "SHORT_ANSWER" ? (
                <div className="mt-6">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Your Answer</label>
                    <textarea 
                        className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none min-h-[120px]"
                        placeholder="Type your answer here..."
                        value={selectedOptionId || ""}
                        onChange={(e) => onSelectOption?.(e.target.value)}
                    />
                </div>
            ) : (
                <div className="mt-6 space-y-4">
                    {options.map((option) => (
                        <QuestionOptionComponent 
                            key={option.id} 
                            {...option} 
                            isSelected={selectedOptionId === option.id}
                            onSelect={onSelectOption}
                            name={`question_${id}`}
                        />
                    ))}
                </div>
            )}

        </div>
    );
});

QuestionCard.displayName = "QuestionCard";
export default QuestionCard;