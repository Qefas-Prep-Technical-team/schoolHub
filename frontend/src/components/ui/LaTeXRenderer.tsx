import React, { useState, useMemo, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import ImageLightbox from './ImageLightbox';
import { ZoomIn } from 'lucide-react';

interface LaTeXRendererProps {
  content: string;
  className?: string;
  onZoom?: (src: string, alt?: string) => void;
}

const LaTeXRenderer = memo(({ content, className = "", onZoom }: LaTeXRendererProps) => {

  if (!content) return null;
  const components: any = useMemo(() => ({
    // Add custom list rendering since Tailwind Typography (prose) is not active
    ul: ({ children }: any) => (
      <ul className="list-disc pl-6 my-4 space-y-1.5 text-slate-700 dark:text-slate-300">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal pl-6 my-4 space-y-1.5 text-slate-700 dark:text-slate-300">
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="leading-relaxed">
        {children}
      </li>
    ),
    img: ({ src, alt }: { src?: any; alt?: any }) => (
      <figure className="my-6 text-center group">
        <div 
          className="relative inline-block cursor-zoom-in overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg"
          onClick={() => onZoom?.((src as string) || "", (alt as string) || undefined)}
        >
          <img 
            src={src as string} 
            alt={alt} 
            className="mx-auto max-h-[500px] object-contain transition-transform duration-500 group-hover:scale-105" 
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
    )
  }), [onZoom]);

  return (
    <div className={`prose dark:prose-invert max-w-none prose-p:leading-relaxed prose-li:my-0 prose-ol:list-decimal prose-ul:list-disc ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>

    </div>
  );
});

LaTeXRenderer.displayName = "LaTeXRenderer";
export default LaTeXRenderer;
