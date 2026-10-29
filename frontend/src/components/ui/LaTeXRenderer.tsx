import React, { useMemo, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';

import rehypeKatex from 'rehype-katex';
import { ZoomIn } from 'lucide-react';
import Image from 'next/image';
import { Components } from 'react-markdown';

interface LaTeXRendererProps {
  content: string;
  className?: string;
  onZoom?: (src: string, alt?: string) => void;
  forceMarkdown?: boolean;
}

/** Returns true if the content contains any LaTeX math delimiters or Markdown syntax */
function hasMathOrMarkdown(text: string, forceMarkdown?: boolean): boolean {
  if (forceMarkdown) return true;
  return /\$/.test(text) || /\\[a-zA-Z]/.test(text) || /[*#_`~>|\-+]|^\s*\d+\.\s/m.test(text);
}

/**
 * Preprocess content for ReactMarkdown.
 * If forceMarkdown is enabled, it preserves standard markdown block structure.
 * Otherwise, it joins newlines with double-returns for question-style multi-line content.
 */
function preprocessForMarkdown(text: string, forceMarkdown?: boolean): string {
  if (forceMarkdown) {
    return text;
  }
  return text
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n\n');
}

const LaTeXRenderer = memo(({ content, className = "", onZoom, forceMarkdown = false }: LaTeXRendererProps) => {

  const components: Components = useMemo(() => ({
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="leading-relaxed text-inherit mb-2 last:mb-0">{children}</p>
    ),
    strong: ({ children }: { children?: React.ReactNode }) => (
      <strong className="font-bold text-inherit">{children}</strong>
    ),
    em: ({ children }: { children?: React.ReactNode }) => (
      <em className="italic text-inherit">{children}</em>
    ),
    code: ({ children, className: cls }: { children?: React.ReactNode; className?: string }) => {
      if (cls?.includes('math')) return <>{children}</>;
      return (
        <code className="font-mono text-[0.875em] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded-md">
          {children}
        </code>
      );
    },
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc pl-5 my-2 space-y-1 text-inherit">{children}</ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal pl-5 my-2 space-y-1 text-inherit">{children}</ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="leading-relaxed text-inherit">{children}</li>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-4 border-primary/40 pl-4 py-1 my-2 text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-900/50 rounded-r-lg">
        {children}
      </blockquote>
    ),
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="text-xl font-black text-slate-900 dark:text-white mt-3 mb-1">{children}</h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2 className="text-lg font-bold text-slate-800 dark:text-white mt-3 mb-1">{children}</h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mt-2 mb-1">{children}</h3>
    ),
    img: ({ src, alt }: any) => (
      <figure className="my-6 text-center group">
        <div
          className="relative inline-block cursor-zoom-in overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg min-w-[200px] min-h-[100px]"
          onClick={() => onZoom?.(src || "", alt || undefined)}
        >
          <Image
            src={src || ""}
            alt={alt || "Image"}
            width={800}
            height={500}
            className="mx-auto max-h-[500px] w-auto h-auto object-contain transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-white/80 dark:bg-black/80 p-3 rounded-full shadow-large transform scale-0 group-hover:scale-100 transition-transform duration-300">
              <ZoomIn size={20} className="text-primary" />
            </div>
          </div>
        </div>
        {alt && (
          <figcaption className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400 italic">
            {alt}
          </figcaption>
        )}
      </figure>
    ),
    script: () => null,
  }), [onZoom]);

  if (!content) return null;

  const baseClass = [
    "text-slate-800 dark:text-slate-200",
    "leading-relaxed",
    "[&_.katex]:text-slate-900 [&_.katex]:dark:text-slate-100",
    "[&_.katex-display]:my-4 [&_.katex-display]:overflow-x-auto [&_.katex-display]:overflow-y-hidden",
    "[&_.katex-display]:bg-slate-50 [&_.katex-display]:dark:bg-slate-900/60",
    "[&_.katex-display]:rounded-xl [&_.katex-display]:px-4 [&_.katex-display]:py-3",
    "[&_.katex-display]:border [&_.katex-display]:border-slate-200 [&_.katex-display]:dark:border-slate-700",
    "[&_.katex-display]:shadow-inner",
    "[&_.katex-inline]:text-primary/90",
    className,
  ].join(" ");

  // ── Plain text (no math or markdown) — preserve whitespace and newlines exactly ───────
  if (!hasMathOrMarkdown(content, forceMarkdown)) {
    return (
      <div
        className={baseClass}
        style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {content}
      </div>
    );
  }

  // ── Math & Markdown content — use ReactMarkdown + KaTeX pipeline ──────────
  return (
    <div className={baseClass}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {preprocessForMarkdown(content, forceMarkdown)}
      </ReactMarkdown>
    </div>
  );
});

LaTeXRenderer.displayName = "LaTeXRenderer";
export default LaTeXRenderer;
