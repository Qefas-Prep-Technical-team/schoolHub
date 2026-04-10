// src/components/Dashboard/QuestionCard.tsx
'use client';

import React from 'react';
import { Question } from './types';
import QuestionOptionComponent from './QuestionOption';
import Button from './ui/Button';
import LaTeXRenderer from '@/components/ui/LaTeXRenderer';
import ImageLightbox from '@/components/ui/ImageLightbox';
import { useState } from 'react';
import { ZoomIn } from 'lucide-react';

interface QuestionCardProps extends Question {
    onNext?: () => void;
    showNextButton?: boolean;
}

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
    showNextButton?: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
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
    showNextButton = true
}) => {
    const [lightboxImage, setLightboxImage] = useState<{ src: string, alt?: string } | null>(null);
    return (
        <div className="rounded-xl border border-[#E5E7EB] dark:border-[#374151] bg-white dark:bg-[#1F2937] p-6">
            <div className="flex justify-between gap-4 items-center mb-4">
                <h1 className="text-[22px] font-bold leading-tight tracking-tight">
                    Question {number} of {totalQuestions}
                </h1>
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

            <div className="space-y-6">
                {images.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        {images.map((url, i) => (
                            <figure key={i} className="flex flex-col gap-2 group">
                                <div 
                                    className="relative cursor-zoom-in overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm w-full h-auto bg-white dark:bg-slate-900"
                                    onClick={() => setLightboxImage({ src: url, alt: imageLabels[i] })}
                                >
                                    <img 
                                        src={url} 
                                        alt={imageLabels[i] || `Question Image ${i + 1}`} 
                                        className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105" 
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
                />
            </div>
            
            {equation && (
                <div className="mt-4 rounded-lg bg-gray-100 dark:bg-gray-800 p-4 text-center">
                    <p className="font-mono text-lg">{equation}</p>
                </div>
            )}
            {type === "SHORT_ANSWER" ? (
                <div className="mt-6">
                    <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Your Answer</label>
                    <textarea 
                        className="w-full p-4 rounded-xl border border-[#E5E7EB] dark:border-[#374151] bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none min-h-[120px]"
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

            <ImageLightbox 
                isOpen={!!lightboxImage}
                onClose={() => setLightboxImage(null)}
                src={lightboxImage?.src || ""}
                alt={lightboxImage?.alt}
            />
        </div>
    );
};

export default QuestionCard;