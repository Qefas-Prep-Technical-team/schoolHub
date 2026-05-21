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
}

const LaTeXRenderer = memo(({ content, className = "", onZoom }: LaTeXRendererProps) => {

  const components: Components = useMemo(() => ({
    // Add custom list rendering since Tailwind Typography (prose) is not active
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc pl-6 my-4 space-y-1.5 text-slate-700 dark:text-slate-300">
        {children}
      </ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal pl-6 my-4 space-y-1.5 text-slate-700 dark:text-slate-300">
        {children}
      </ol>
    ),
    li: ({ children }: { children?: React.ReactNode }) => (
      <li className="leading-relaxed">
        {children}
      </li>
    ),
    img: ({ src, alt, ...props }: any) => (
      <figure className="my-6 text-center group">
        <div 
          className="relative inline-block cursor-zoom-in overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg min-w-[200px] min-h-[100px]"
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
    // Suppress React's warning about <script> tags injected by rehype-katex
    script: () => null,
  }), [onZoom]);

  if (!content) return null;

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
