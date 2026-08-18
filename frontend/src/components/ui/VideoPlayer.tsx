'use client';

import React, { useState } from 'react';
import { Video, ExternalLink, Play, Loader2 } from 'lucide-react';

export type VideoSourceType = 'youtube' | 'drive' | 'vimeo' | 'loom' | 'direct' | 'unknown';

export interface ParsedVideoInfo {
  type: VideoSourceType;
  embedUrl: string | null;
  directUrl: string;
  providerName: string;
}

export function parseVideoUrl(url: string | null | undefined): ParsedVideoInfo {
  if (!url || typeof url !== 'string') {
    return { type: 'unknown', embedUrl: null, directUrl: '', providerName: 'Video' };
  }

  const cleanUrl = url.trim();

  // 1. YouTube Shorts: youtube.com/shorts/VIDEO_ID
  const shortsMatch = cleanUrl.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/i);
  if (shortsMatch && shortsMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${shortsMatch[1]}?rel=0&modestbranding=1`,
      directUrl: cleanUrl,
      providerName: 'YouTube Shorts',
    };
  }

  // 2. Standard YouTube: watch?v=ID, youtu.be/ID, embed/ID, v/ID
  const ytMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/#\s]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`,
      directUrl: cleanUrl,
      providerName: 'YouTube',
    };
  }

  // 3. Google Drive: file/d/FILE_ID or open?id=FILE_ID or uc?id=FILE_ID
  const driveFileMatch = cleanUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (driveFileMatch && driveFileMatch[1]) {
    return {
      type: 'drive',
      embedUrl: `https://drive.google.com/file/d/${driveFileMatch[1]}/preview`,
      directUrl: cleanUrl,
      providerName: 'Google Drive',
    };
  }
  const driveIdMatch = cleanUrl.match(/drive\.google\.com\/(?:open|uc)\?[^#]*id=([a-zA-Z0-9_-]+)/i);
  if (driveIdMatch && driveIdMatch[1]) {
    return {
      type: 'drive',
      embedUrl: `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`,
      directUrl: cleanUrl,
      providerName: 'Google Drive',
    };
  }

  // 4. Vimeo: vimeo.com/12345678 or player.vimeo.com/video/12345678
  const vimeoMatch = cleanUrl.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      directUrl: cleanUrl,
      providerName: 'Vimeo',
    };
  }

  // 5. Loom: loom.com/share/ID or loom.com/embed/ID
  const loomMatch = cleanUrl.match(/loom\.com\/(?:share|embed)\/([a-zA-Z0-9_-]+)/i);
  if (loomMatch && loomMatch[1]) {
    return {
      type: 'loom',
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
      directUrl: cleanUrl,
      providerName: 'Loom',
    };
  }

  // 6. Direct Video Files (.mp4, .webm, .ogg, .mov, .m4v) or cloud storage video paths
  const isDirectFile = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(cleanUrl) || 
                       /\/uploads\/.*(video|\.mp4|\.webm)/i.test(cleanUrl) ||
                       /cloudinary\.com\/.*\/video\//i.test(cleanUrl);
  if (isDirectFile) {
    return {
      type: 'direct',
      embedUrl: null,
      directUrl: cleanUrl,
      providerName: 'Video File',
    };
  }

  // Fallback
  return {
    type: 'unknown',
    embedUrl: null,
    directUrl: cleanUrl,
    providerName: 'External Video',
  };
}

interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  className?: string;
}

export default function VideoPlayer({ videoUrl, title = 'Video Lesson', className = '' }: VideoPlayerProps) {
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const parsed = parseVideoUrl(videoUrl);

  if (!videoUrl) return null;

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 md:p-8 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
          <div className="size-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Video className="size-5" />
          </div>
          <span>{title}</span>
        </h3>
        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-600/50 shrink-0">
          {parsed.providerName}
        </span>
      </div>

      {/* Main Video Viewport */}
      <div className="rounded-2xl overflow-hidden bg-slate-950 aspect-video relative shadow-inner border border-slate-800/80 group">
        {parsed.embedUrl ? (
          <>
            {isIframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-slate-400 gap-3 z-10">
                <Loader2 className="size-8 animate-spin text-blue-500" />
                <span className="text-xs font-medium tracking-wide">Loading video stream...</span>
              </div>
            )}
            <iframe
              src={parsed.embedUrl}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onLoad={() => setIsIframeLoading(false)}
              className="absolute inset-0 w-full h-full border-0"
              loading="lazy"
            />
          </>
        ) : parsed.type === 'direct' ? (
          <video
            src={parsed.directUrl}
            controls
            preload="metadata"
            className="absolute inset-0 w-full h-full object-contain bg-black"
          >
            Your browser does not support playing this video inline.
          </video>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="size-16 rounded-full bg-slate-800/80 text-blue-400 border border-slate-700/60 flex items-center justify-center mb-4 shadow-lg">
              <Play className="size-8 ml-1 fill-current" />
            </div>
            <p className="text-slate-200 font-semibold text-base mb-1">External Lesson Video</p>
            <p className="text-slate-400 text-xs max-w-sm mb-5 leading-relaxed">
              This video link can be viewed directly in a new browser tab.
            </p>
            <a
              href={parsed.directUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition-all shadow-md hover:shadow-blue-500/20 active:scale-95"
            >
              <ExternalLink className="size-4" />
              Open Video in New Tab
            </a>
          </div>
        )}
      </div>

      {/* Footer Link */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span className="truncate max-w-[70%] text-slate-400">
          Source: <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">{parsed.directUrl}</span>
        </span>
        <a
          href={parsed.directUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400 hover:underline shrink-0"
        >
          Open link <ExternalLink className="size-3" />
        </a>
      </div>
    </div>
  );
}
