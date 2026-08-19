"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { apiClient } from "@/lib/api/client";
import { examService } from "@/lib/api/services/examService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import LaTeXRenderer from "@/components/ui/LaTeXRenderer";
import { imageService } from "@/lib/api/services/imageService";
import {
  Check,
  Plus,
  X,
  Loader2,
  Save,
  Upload,
  Image as ImageIcon,
  Eye,
  Pencil,
} from "lucide-react";
import FormulaPalette from "./FormulaPalette";

// ─── Question Editor — Normal/Math tab switcher ───────────────────────────────
function QuestionEditorPane({
  value,
  onChange,
  placeholder,
  label,
  textareaRef: externalRef,
  editorMode,
  onEditorModeChange,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  editorMode: 'normal' | 'math';
  onEditorModeChange: (m: 'normal' | 'math') => void;
}) {
  const innerRef = useRef<HTMLTextAreaElement>(null);
  const ref = externalRef || innerRef;

  // Auto-grow textarea in both modes
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <div className="space-y-1.5">
      {/* Label row + tab switcher */}
      <div className="flex items-center justify-between gap-3">
        {label && (
          <Label className="font-bold text-slate-700 dark:text-slate-200 text-sm">{label}</Label>
        )}
        {/* Tab switcher — right-aligned */}
        <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800/60 flex-shrink-0 ml-auto">
          <button
            type="button"
            onClick={() => onEditorModeChange('normal')}
            className={`px-3 py-1.5 text-[11px] font-black tracking-wide transition-all ${
              editorMode === 'normal'
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            ✏️ Normal
          </button>
          <button
            type="button"
            onClick={() => onEditorModeChange('math')}
            className={`px-3 py-1.5 text-[11px] font-black tracking-wide transition-all border-l border-slate-200 dark:border-slate-700 ${
              editorMode === 'math'
                ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            𝑓(𝑥) Math
          </button>
        </div>
      </div>

      {editorMode === 'normal' ? (
        /* ── NORMAL MODE: plain auto-growing textarea only ── */
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus-within:border-primary/40 transition-all overflow-hidden">
          <textarea
            ref={ref}
            value={value}
            rows={5}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.stopPropagation();
            }}
            placeholder={placeholder || "Type your question here…"}
            className="w-full resize-none p-4 text-sm leading-relaxed text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 block"
          />
        </div>
      ) : (
        /* ── MATH MODE: textarea + live LaTeX preview + resize ── */
        <div className="rounded-2xl border-2 border-slate-200 dark:border-slate-700 focus-within:border-primary/40 transition-all overflow-hidden">
          <div
            className="flex flex-col overflow-auto"
            style={{ resize: 'vertical', minHeight: '300px' }}
          >
            {/* Auto-growing textarea */}
            <textarea
              ref={ref}
              value={value}
              rows={5}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.stopPropagation();
              }}
              placeholder={placeholder || "Type your question. Use the formula builder to add math…"}
              className="w-full resize-none p-4 text-sm font-mono leading-relaxed text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 focus:outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 block flex-shrink-0"
            />

            {/* Divider */}
            <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 dark:bg-slate-800 border-t border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
              <Eye size={10} className="text-primary/70" />
              <span className="text-[9px] uppercase font-black tracking-widest text-primary/70">Live Preview</span>
              <span className="ml-auto text-[9px] text-slate-400 font-medium">↕ drag corner to resize</span>
            </div>

            {/* Preview — fills remaining space */}
            <div className="flex-1 px-4 py-3 bg-white dark:bg-slate-900 overflow-y-auto">
              {value ? (
                <LaTeXRenderer content={value} className="text-sm" />
              ) : (
                <p className="text-slate-300 dark:text-slate-600 text-xs font-medium italic py-2">
                  Your rendered math appears here as you type…
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ─── Option Row — Preview-first, click-to-edit ────────────────────────────────
function OptionRow({
  letter,
  value,
  isCorrect,
  onSelect,
  onChange,
}: {
  letter: string;
  value: string;
  isCorrect: boolean;
  onSelect: () => void;
  onChange: (v: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) setTimeout(() => inputRef.current?.focus(), 20);
  }, [editing]);

  return (
    <div
      className={`rounded-2xl border-2 transition-all ${
        isCorrect
          ? "border-emerald-400 dark:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-900/10"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
      }`}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Correct answer toggle */}
        <button
          type="button"
          onClick={onSelect}
          title={isCorrect ? "Correct answer" : "Mark as correct"}
          className={`h-9 w-9 rounded-xl flex-shrink-0 flex items-center justify-center border-2 font-black text-sm transition-all ${
            isCorrect
              ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200/60 dark:shadow-emerald-900/40"
              : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-400 hover:border-emerald-300 hover:text-emerald-600"
          }`}
        >
          {isCorrect ? <Check size={15} /> : letter}
        </button>

        {/* Preview or input area */}
        <div
          className="flex-1 min-w-0 cursor-text"
          onClick={() => !editing && setEditing(true)}
        >
          {editing ? (
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={() => setEditing(false)}
              placeholder={`Option ${letter}…`}
              className="w-full text-sm bg-transparent border-none outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 font-medium font-mono"
            />
          ) : value ? (
            <div className="text-sm">
              <LaTeXRenderer content={value} className="text-sm leading-snug" />
            </div>
          ) : (
            <span className="text-sm text-slate-300 dark:text-slate-600 italic font-medium">
              Option {letter} — click to type…
            </span>
          )}
        </div>

        {/* Edit hint */}
        {!editing && value && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex-shrink-0 h-6 w-6 rounded-lg flex items-center justify-center text-slate-300 hover:text-primary hover:bg-primary/5 transition-all"
          >
            <Pencil size={11} />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Form ─────────────────────────────────────────────────────────────────
export default function ManualAddForm({
  paperId,
  examId,
  onCancel,
  initialData,
}: {
  paperId: string;
  examId: string;
  onCancel: () => void;
  initialData?: any;
}) {
  const queryClient = useQueryClient();
  const [type, setType] = useState(initialData?.type || "MULTIPLE_CHOICE");
  const [question, setQuestion] = useState(initialData?.question || "");
  const [marks, setMarks] = useState(initialData?.marks || 1);
  const [correctAnswer, setCorrectAnswer] = useState(initialData?.correctAnswer || "A");
  const [options, setOptions] = useState({
    A: initialData?.optionA || "",
    B: initialData?.optionB || "",
    C: initialData?.optionC || "",
    D: initialData?.optionD || "",
  });
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [imageLabels, setImageLabels] = useState<string[]>(initialData?.imageLabels || []);
  const [isUploading, setIsUploading] = useState(false);
  const [explanation, setExplanation] = useState(initialData?.explanation || "");
  const [showPalette, setShowPalette] = useState(true);
  const [editorMode, setEditorMode] = useState<'normal' | 'math'>('normal');
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const isEditing = !!initialData;


  const addQuestionMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isEditing) return examService.updateQuestion(initialData.id, data);
      const response = await apiClient.post(`/exams/${examId}/papers/${paperId}/questions/manual`, {
        questions: [data],
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paper", paperId] });
      toast.success(isEditing ? "Question updated!" : "Question added!");
      onCancel();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? "update" : "add"} question`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error("Question text is required");
      return;
    }
    if (type === "MULTIPLE_CHOICE" && (!options.A.trim() || !options.B.trim())) {
      toast.error("At least options A and B are required");
      return;
    }
    addQuestionMutation.mutate({
      type: type === "ESSAY" ? "SHORT_ANSWER" : type,
      question,
      marks,
      correctAnswer,
      explanation,
      images,
      imageLabels,
      ...(type === "MULTIPLE_CHOICE"
        ? { optionA: options.A, optionB: options.B, optionC: options.C, optionD: options.D }
        : {}),
    });
  };

  // ── QUESTION TYPE CHIPS ───────────────────────────────────────────────────
  const TYPES = [
    { value: "MULTIPLE_CHOICE", label: "Multiple Choice" },
    { value: "TRUE_FALSE",      label: "True / False" },
    { value: "SHORT_ANSWER",    label: "Short Answer" },
    { value: "ESSAY",           label: "Essay / Theory" },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-0">
      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            {isEditing ? <Pencil size={16} /> : <Plus size={16} />}
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-base leading-none">
              {isEditing ? "Edit Question" : "Add New Question"}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {editorMode === 'math' ? 'Supports plain text and LaTeX math formulas' : 'Plain text editor — switch to Math mode for formulas'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="h-8 w-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className={`grid grid-cols-1 divide-y divide-slate-200 dark:divide-slate-800 ${
        editorMode === 'math' ? 'xl:grid-cols-[1fr_320px] xl:divide-y-0 xl:divide-x' : ''
      }`}>
        
        {/* Left: Question editor */}
        <div className="p-6 space-y-6">
          
          {/* Type + Marks row — all in one flex row */}
          <div className="space-y-2">
            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Question Type
            </Label>
            <div className="flex items-center gap-2">
              {/* Type chips */}
              <div className="flex-1 flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden divide-x divide-slate-200 dark:divide-slate-700 bg-slate-50 dark:bg-slate-800/60">
                {TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setType(t.value)}
                    className={`flex-1 py-2 px-2 text-[11px] font-bold transition-all whitespace-nowrap ${
                      type === t.value
                        ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900"
                        : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {/* Marks — inline on same row */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  Marks
                </Label>
                <Input
                  type="number"
                  value={marks}
                  onChange={(e) => setMarks(parseInt(e.target.value) || 1)}
                  min={1}
                  className="h-9 w-20 rounded-xl font-bold text-center text-sm"
                />
              </div>
            </div>
          </div>

          {/* Question Text */}
          <QuestionEditorPane
            label="Question Text"
            value={question}
            onChange={setQuestion}
            textareaRef={questionRef}
            editorMode={editorMode}
            onEditorModeChange={setEditorMode}
            placeholder={editorMode === 'math'
              ? "Type your question. Use the formula builder to add math."
              : "Type your question here…"
            }
          />

          {/* Question images */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                Question Images <span className="normal-case font-medium text-slate-400">(optional)</span>
              </Label>
              <div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  id="question-images"
                  className="hidden"
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (!files || files.length === 0) return;
                    setIsUploading(true);
                    try {
                      const results = await Promise.all(
                        Array.from(files).map((f) => imageService.proxyUploadToBunny(f))
                      );
                      setImages((prev) => [...prev, ...results.map((r) => r.publicUrl)]);
                      toast.success(`${files.length} image${files.length > 1 ? "s" : ""} uploaded`);
                    } catch {
                      toast.error("Upload failed");
                    } finally {
                      setIsUploading(false);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  onClick={() => document.getElementById("question-images")?.click()}
                  className="h-8 rounded-xl text-xs font-bold gap-2 border-dashed"
                >
                  {isUploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload size={13} />}
                  {isUploading ? "Uploading…" : "Upload Image"}
                </Button>
              </div>
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.map((url, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <img src={url} alt="" className="w-full h-28 object-cover" />
                    <input
                      type="text"
                      placeholder="Add caption…"
                      value={imageLabels[i] || ""}
                      onChange={(e) => {
                        const next = [...imageLabels];
                        next[i] = e.target.value;
                        setImageLabels(next);
                      }}
                      className="absolute bottom-0 left-0 right-0 text-[10px] px-2 py-1 bg-black/50 text-white placeholder:text-white/50 border-none outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImages((prev) => prev.filter((_, idx) => idx !== i));
                        setImageLabels((prev) => prev.filter((_, idx) => idx !== i));
                      }}
                      className="absolute top-1.5 right-1.5 h-6 w-6 rounded-lg bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Options section ─────────────────────────────────────── */}
          {type === "MULTIPLE_CHOICE" && (
            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                Answer Options — click the letter to mark it as correct
              </Label>
              <div className="space-y-2.5">
                {(["A", "B", "C", "D"] as const).map((letter) => (
                  <OptionRow
                    key={letter}
                    letter={letter}
                    value={options[letter]}
                    isCorrect={correctAnswer === letter}
                    onSelect={() => setCorrectAnswer(letter)}
                    onChange={(v) => setOptions({ ...options, [letter]: v })}
                  />
                ))}
              </div>
            </div>
          )}

          {type === "TRUE_FALSE" && (
            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                Correct Answer
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {["TRUE", "FALSE"].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setCorrectAnswer(val)}
                    className={`py-4 rounded-2xl border-2 font-black text-lg transition-all ${
                      correctAnswer === val
                        ? val === "TRUE"
                          ? "bg-emerald-50 border-emerald-400 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-500 dark:text-emerald-400"
                          : "bg-red-50 border-red-400 text-red-700 dark:bg-red-900/20 dark:border-red-500 dark:text-red-400"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    {val === "TRUE" ? "✓ True" : "✗ False"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {(type === "SHORT_ANSWER" || type === "ESSAY") && (
            <div className="space-y-2">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-500">
                Model Answer / Key Points
              </Label>
              <Textarea
                placeholder="Enter the correct answer or marking rubric…"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                className="rounded-xl min-h-[100px] font-medium"
              />
            </div>
          )}

          {/* Explanation */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Explanation <span className="normal-case font-medium">(optional — shown after submission)</span>
            </Label>
            <Textarea
              placeholder="Explain why this is the correct answer…"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              className="rounded-xl text-sm min-h-[80px]"
            />
          </div>
        </div>

        {/* Right: Formula palette — only shown in Math mode */}
        {editorMode === 'math' && (
          <div className="p-4 bg-slate-50/50 dark:bg-slate-900/30 space-y-4">
            <FormulaPalette
              onInsert={(formula) => {
                const textarea = questionRef.current;
                if (textarea) {
                  const start = textarea.selectionStart ?? 0;
                  const end = textarea.selectionEnd ?? 0;
                  const before = question.substring(0, start);
                  const after = question.substring(end);
                  const newVal = before + formula + after;
                  setQuestion(newVal);
                  setTimeout(() => {
                    textarea.focus();
                    textarea.setSelectionRange(start + formula.length, start + formula.length);
                  }, 0);
                } else {
                  setQuestion((q: string) => q + formula);
                }
              }}
            />

            {/* Quick example */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="px-4 py-2.5 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 text-[11px] font-black uppercase tracking-widest text-slate-400">
                Example Preview
              </div>
              <div className="p-4 bg-white dark:bg-slate-900">
                <LaTeXRenderer
                  content="Solve for $x$: $$x^2 + 3x - 4 = 0$$"
                  className="text-sm text-slate-700 dark:text-slate-300"
                />
                <div className="mt-2 text-[10px] text-slate-400 font-mono">
                  {`Solve for $x$: $$x^2 + 3x - 4 = 0$$`}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="rounded-xl font-bold"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={addQuestionMutation.isPending}
          className="rounded-xl gap-2 min-w-[160px] font-bold shadow-lg"
        >
          {addQuestionMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isEditing ? "Saving…" : "Adding…"}
            </>
          ) : (
            <>
              {isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {isEditing ? "Save Changes" : "Add Question"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
