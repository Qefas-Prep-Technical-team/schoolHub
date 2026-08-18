"use client";

import { useState } from "react";
import { X, Check, ChevronDown, ChevronRight, FlaskConical } from "lucide-react";
import LaTeXRenderer from "@/components/ui/LaTeXRenderer";

// ─── Formula definitions ────────────────────────────────────────────────────
// Each formula has:
//   display  — what users see on the button
//   label    — friendly name
//   fields   — array of inputs to collect. If empty → insert directly (symbol)
//   build    — function that takes field values and returns the raw LaTeX string
//              (already wrapped in $ or $$ where needed)

interface FormulaField {
  key: string;
  placeholder: string;
  hint?: string;
}

interface FormulaDefinition {
  display: string;
  label: string;
  fields: FormulaField[];
  build: (vals: Record<string, string>) => string;
}

const FORMULA_GROUPS: { label: string; items: FormulaDefinition[] }[] = [
  {
    label: "Math Structures",
    items: [
      {
        display: "a/b",
        label: "Fraction",
        fields: [
          { key: "num", placeholder: "Numerator", hint: "Top number / expression" },
          { key: "den", placeholder: "Denominator", hint: "Bottom number / expression" },
        ],
        build: (v) => `$\\frac{${v.num}}{${v.den}}$`,
      },
      {
        display: "√x",
        label: "Square Root",
        fields: [{ key: "val", placeholder: "Expression inside root", hint: "e.g. x+1" }],
        build: (v) => `$\\sqrt{${v.val}}$`,
      },
      {
        display: "ⁿ√x",
        label: "N-th Root",
        fields: [
          { key: "n", placeholder: "Root degree (n)", hint: "e.g. 3 for cube root" },
          { key: "val", placeholder: "Expression inside root" },
        ],
        build: (v) => `$\\sqrt[${v.n}]{${v.val}}$`,
      },
      {
        display: "xⁿ",
        label: "Power / Exponent",
        fields: [
          { key: "base", placeholder: "Base", hint: "e.g. x or 2" },
          { key: "exp", placeholder: "Exponent", hint: "e.g. 2 or n" },
        ],
        build: (v) => `$${v.base}^{${v.exp}}$`,
      },
      {
        display: "x₁",
        label: "Subscript",
        fields: [
          { key: "base", placeholder: "Base symbol", hint: "e.g. x or v" },
          { key: "sub", placeholder: "Subscript", hint: "e.g. 1 or max" },
        ],
        build: (v) => `$${v.base}_{${v.sub}}$`,
      },
      {
        display: "xₙⁿ",
        label: "Both Sub & Superscript",
        fields: [
          { key: "base", placeholder: "Base symbol" },
          { key: "sub", placeholder: "Subscript (bottom)" },
          { key: "sup", placeholder: "Superscript (top)" },
        ],
        build: (v) => `$${v.base}_{${v.sub}}^{${v.sup}}$`,
      },
    ],
  },
  {
    label: "Calculus",
    items: [
      {
        display: "∫",
        label: "Integral",
        fields: [
          { key: "from", placeholder: "Lower limit", hint: "e.g. 0 or a" },
          { key: "to", placeholder: "Upper limit", hint: "e.g. ∞ or b" },
          { key: "expr", placeholder: "Expression", hint: "e.g. x² dx" },
        ],
        build: (v) => `$$\\int_{${v.from}}^{${v.to}} ${v.expr}$$`,
      },
      {
        display: "∑",
        label: "Summation (Σ)",
        fields: [
          { key: "from", placeholder: "Start (e.g. i=1)" },
          { key: "to", placeholder: "End (e.g. n)" },
          { key: "expr", placeholder: "Expression (e.g. xᵢ)" },
        ],
        build: (v) => `$$\\sum_{${v.from}}^{${v.to}} ${v.expr}$$`,
      },
      {
        display: "lim",
        label: "Limit",
        fields: [
          { key: "var", placeholder: "Variable (e.g. x)" },
          { key: "to", placeholder: "Approaches (e.g. 0 or ∞)" },
          { key: "expr", placeholder: "Expression" },
        ],
        build: (v) => `$$\\lim_{${v.var} \\to ${v.to}} ${v.expr}$$`,
      },
      {
        display: "d/dx",
        label: "Derivative",
        fields: [
          { key: "expr", placeholder: "Expression to differentiate" },
          { key: "var", placeholder: "Variable (e.g. x)" },
        ],
        build: (v) => `$\\frac{d}{d${v.var}}\\left(${v.expr}\\right)$`,
      },
    ],
  },
  {
    label: "Greek Letters",
    items: [
      { display: "α", label: "Alpha", fields: [], build: () => "$\\alpha$" },
      { display: "β", label: "Beta", fields: [], build: () => "$\\beta$" },
      { display: "γ", label: "Gamma", fields: [], build: () => "$\\gamma$" },
      { display: "Δ", label: "Delta (Δ)", fields: [], build: () => "$\\Delta$" },
      { display: "δ", label: "delta (δ)", fields: [], build: () => "$\\delta$" },
      { display: "θ", label: "Theta", fields: [], build: () => "$\\theta$" },
      { display: "λ", label: "Lambda", fields: [], build: () => "$\\lambda$" },
      { display: "μ", label: "Mu", fields: [], build: () => "$\\mu$" },
      { display: "π", label: "Pi", fields: [], build: () => "$\\pi$" },
      { display: "Σ", label: "Sigma (Σ)", fields: [], build: () => "$\\Sigma$" },
      { display: "σ", label: "Sigma (σ)", fields: [], build: () => "$\\sigma$" },
      { display: "φ", label: "Phi", fields: [], build: () => "$\\phi$" },
      { display: "ω", label: "Omega (ω)", fields: [], build: () => "$\\omega$" },
      { display: "Ω", label: "Omega (Ω)", fields: [], build: () => "$\\Omega$" },
      { display: "∞", label: "Infinity", fields: [], build: () => "$\\infty$" },
    ],
  },
  {
    label: "Operators & Relations",
    items: [
      { display: "±", label: "Plus-Minus (±)", fields: [], build: () => "$\\pm$" },
      { display: "×", label: "Multiplication (×)", fields: [], build: () => "$\\times$" },
      { display: "÷", label: "Division (÷)", fields: [], build: () => "$\\div$" },
      { display: "·", label: "Dot product (·)", fields: [], build: () => "$\\cdot$" },
      { display: "≠", label: "Not equal (≠)", fields: [], build: () => "$\\neq$" },
      { display: "≈", label: "Approximately (≈)", fields: [], build: () => "$\\approx$" },
      { display: "≤", label: "Less or equal (≤)", fields: [], build: () => "$\\leq$" },
      { display: "≥", label: "Greater or equal (≥)", fields: [], build: () => "$\\geq$" },
      { display: "∝", label: "Proportional (∝)", fields: [], build: () => "$\\propto$" },
    ],
  },
  {
    label: "Trigonometry",
    items: [
      {
        display: "sin",
        label: "Sine",
        fields: [{ key: "angle", placeholder: "Angle (e.g. θ or 30°)" }],
        build: (v) => `$\\sin(${v.angle})$`,
      },
      {
        display: "cos",
        label: "Cosine",
        fields: [{ key: "angle", placeholder: "Angle" }],
        build: (v) => `$\\cos(${v.angle})$`,
      },
      {
        display: "tan",
        label: "Tangent",
        fields: [{ key: "angle", placeholder: "Angle" }],
        build: (v) => `$\\tan(${v.angle})$`,
      },
      {
        display: "sin⁻¹",
        label: "Inverse Sine",
        fields: [{ key: "val", placeholder: "Value" }],
        build: (v) => `$\\sin^{-1}(${v.val})$`,
      },
      {
        display: "log",
        label: "Logarithm",
        fields: [
          { key: "base", placeholder: "Base (e.g. 10 or b)" },
          { key: "val", placeholder: "Value (e.g. x)" },
        ],
        build: (v) => `$\\log_{${v.base}}(${v.val})$`,
      },
      {
        display: "ln",
        label: "Natural Log",
        fields: [{ key: "val", placeholder: "Value" }],
        build: (v) => `$\\ln(${v.val})$`,
      },
    ],
  },
];

// ─── Mini Formula Builder Dialog ─────────────────────────────────────────────
function FormulaBuilderDialog({
  formula,
  onInsert,
  onClose,
}: {
  formula: FormulaDefinition;
  onInsert: (latex: string) => void;
  onClose: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(formula.fields.map((f) => [f.key, ""]))
  );

  const built = (() => {
    try { return formula.build(values); } catch { return ""; }
  })();

  const handleInsert = () => {
    onInsert(built);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-black text-base">
              {formula.display}
            </div>
            <div>
              <div className="font-black text-slate-900 dark:text-white text-sm">{formula.label}</div>
              <div className="text-[10px] text-slate-400 font-medium">Fill in the values below</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X size={14} />
          </button>
        </div>

        {/* Fields */}
        <div className="px-5 py-4 space-y-3">
          {formula.fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {field.placeholder}
              </label>
              {field.hint && (
                <p className="text-[10px] text-slate-400">{field.hint}</p>
              )}
              <input
                type="text"
                value={values[field.key]}
                onChange={(e) => setValues({ ...values, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                autoFocus={formula.fields[0]?.key === field.key}
                onKeyDown={(e) => { if (e.key === "Enter") handleInsert(); }}
                className="w-full h-10 px-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono text-slate-800 dark:text-slate-200 focus:border-violet-400 dark:focus:border-violet-500 focus:outline-none transition-colors placeholder:text-slate-300"
              />
            </div>
          ))}

          {/* Live preview */}
          {built && (
            <div className="mt-3 space-y-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-violet-500">
                Preview
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[44px] flex items-center">
                <LaTeXRenderer content={built} className="text-sm" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleInsert}
            disabled={formula.fields.some((f) => !values[f.key]?.trim())}
            className="flex-1 h-10 rounded-xl text-sm font-bold bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-violet-200 dark:shadow-violet-900/30"
          >
            <Check size={14} /> Insert
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Palette Component ───────────────────────────────────────────────────
export default function FormulaPalette({ onInsert }: { onInsert: (latex: string) => void }) {
  const [openGroup, setOpenGroup] = useState<string | null>("Math Structures");
  const [activeFormula, setActiveFormula] = useState<FormulaDefinition | null>(null);

  const handleClick = (formula: FormulaDefinition) => {
    if (formula.fields.length === 0) {
      // Symbol — insert immediately, no dialog
      onInsert(formula.build({}));
    } else {
      // Compound formula — open builder dialog
      setActiveFormula(formula);
    }
  };

  return (
    <>
      <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-500">
            <FlaskConical size={13} />
          </div>
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Formula Builder
          </span>
        </div>

        <div className="p-2 space-y-1">
          {FORMULA_GROUPS.map((group) => (
            <div key={group.label} className="rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setOpenGroup(openGroup === group.label ? null : group.label)}
                className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                {group.label}
                {openGroup === group.label ? (
                  <ChevronDown size={12} className="text-slate-400" />
                ) : (
                  <ChevronRight size={12} className="text-slate-400" />
                )}
              </button>
              {openGroup === group.label && (
                <div className="flex flex-wrap gap-1.5 p-2.5 bg-white/60 dark:bg-slate-800/40">
                  {group.items.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      title={item.label}
                      onClick={() => handleClick(item)}
                      className={`px-2.5 py-1.5 rounded-lg text-[12px] font-mono font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 dark:hover:bg-violet-900/20 dark:hover:border-violet-700 dark:hover:text-violet-300 transition-all shadow-sm ${
                        item.fields.length > 0
                          ? "after:content-[''] after:absolute after:bottom-0.5 after:right-0.5 after:h-1 after:w-1 after:rounded-full after:bg-violet-400 relative"
                          : ""
                      }`}
                    >
                      {item.display}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Tip */}
        <div className="px-4 py-2.5 border-t border-slate-200 dark:border-slate-700 bg-violet-50/50 dark:bg-violet-900/10">
          <p className="text-[10px] text-violet-700 dark:text-violet-400 font-semibold">
            💡 Buttons with a <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-400 align-middle mx-0.5" /> dot open a builder — just fill in your values.
            Plain symbols insert instantly.
          </p>
        </div>
      </div>

      {/* Builder Dialog */}
      {activeFormula && (
        <FormulaBuilderDialog
          formula={activeFormula}
          onInsert={onInsert}
          onClose={() => setActiveFormula(null)}
        />
      )}
    </>
  );
}
