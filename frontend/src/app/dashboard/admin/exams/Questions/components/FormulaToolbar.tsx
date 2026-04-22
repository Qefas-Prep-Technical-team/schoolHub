"use client";

import React from 'react';

interface FormulaToolbarProps {
  onInsert: (formula: string) => void;
}

const symbols = [
  { label: '$  $', value: '$ $', tooltip: 'Inline Formula' },
  { label: '$$  $$', value: '$$\n\n$$', tooltip: 'Block Formula' },
  { label: '÷ Fraction', value: '$\\frac{}{}$', tooltip: 'Fraction a/b' },
  { label: '√ Root', value: '$\\sqrt{}$', tooltip: 'Square Root' },
  { label: 'nⁿ Power', value: '$^{}$', tooltip: 'Exponent/Power' },
  { label: 'n₁ Sub', value: '$_{}$', tooltip: 'Subscript' },
  { label: '± pm', value: '$\\pm$', tooltip: 'Plus-Minus' },
  { label: 'π Pi', value: '$\\pi$', tooltip: 'Pi' },
  { label: 'θ Theta', value: '$\\theta$', tooltip: 'Theta' },
  { label: 'Σ Sum', value: '$\\sum_{}^{}$', tooltip: 'Summation' },
  { label: '∞ Inf', value: '$\\infty$', tooltip: 'Infinity' },
];

export default function FormulaToolbar({ onInsert }: FormulaToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-xl mb-0.5 border-b-0 backdrop-blur-sm">
      {symbols.map((symbol) => (
        <button
          key={symbol.label}
          type="button"
          onClick={() => onInsert(symbol.value)}
          title={symbol.tooltip}
          className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg transition-all border border-transparent hover:border-blue-200 dark:hover:border-blue-800 bg-white dark:bg-slate-800 shadow-sm"
        >
          <span>{symbol.label}</span>
        </button>
      ))}
    </div>
  );
}
