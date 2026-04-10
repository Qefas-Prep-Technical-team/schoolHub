"use client";

import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useState } from 'react';
import ImageLightbox from './ImageLightbox';
import { ZoomIn } from 'lucide-react';

interface LaTeXRendererProps {
  content: string;
  className?: string;
}

export default function LaTeXRenderer({ content, className = "" }: LaTeXRendererProps) {
  const [lightboxImage, setLightboxImage] = useState<{ src: string, alt?: string } | null>(null);

  if (!content) return null;
  return (
    <div className={`prose dark:prose-invert max-w-none whitespace-pre-wrap ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          img: ({ src, alt }) => (
            <figure className="my-6 text-center group">
              <div 
                className="relative inline-block cursor-zoom-in overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg"
                onClick={() => setLightboxImage({ src: (src as string) || "", alt: (alt as string) || undefined })}
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
        }}
      >
        {content}
      </ReactMarkdown>

      <ImageLightbox 
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
        src={lightboxImage?.src || ""}
        alt={lightboxImage?.alt}
      />
    </div>
  );
}
