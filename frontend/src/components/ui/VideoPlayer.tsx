'use client';

import React, { useState } from 'react';
import { Video, ExternalLink, Play, Loader2, Sparkles, MonitorPlay, Film } from 'lucide-react';

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

export interface VideoPlayerProps {
  videoUrl: string;
  title?: string;
  className?: string;
  poster?: string;
  variant?: 'card' | 'cinema' | 'frameless';
}

export default function VideoPlayer({
  videoUrl,
  title = 'Video Lesson',
  className = '',
  poster,
  variant = 'card'
}: VideoPlayerProps) {
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const parsed = parseVideoUrl(videoUrl);

  if (!videoUrl) return null;

  // Provider branding color helper
  const getProviderDot = (type: VideoSourceType) => {
    switch (type) {
      case 'youtube':
        return 'bg-red-500';
      case 'vimeo':
        return 'bg-sky-400';
      case 'drive':
        return 'bg-amber-400';
      case 'loom':
        return 'bg-purple-500';
      default:
        return 'bg-emerald-400';
    }
  };

  const renderVideoContent = () => {
    if (parsed.embedUrl) {
      return (
        <>
          {isIframeLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3 z-10">
              <Loader2 className="size-9 animate-spin text-blue-500" />
              <span className="text-xs font-semibold tracking-wider text-slate-300">Loading video player...</span>
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
      );
    }

    if (parsed.type === 'direct') {
      return (
        <video
          src={parsed.directUrl}
          poster={poster}
          controls
          preload="metadata"
          className="absolute inset-0 w-full h-full object-contain bg-black"
        >
          Your browser does not support playing this video inline.
        </video>
      );
    }

    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="size-16 rounded-full bg-slate-800/90 text-blue-400 border border-slate-700/60 flex items-center justify-center mb-4 shadow-xl">
          <Play className="size-8 ml-1 fill-current" />
        </div>
        <p className="text-slate-200 font-bold text-base mb-1">External Lesson Video</p>
        <p className="text-slate-400 text-xs max-w-sm mb-5 leading-relaxed">
          This hosted video can be streamed directly in high definition.
        </p>
        <a
          href={parsed.directUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm rounded-xl transition-all shadow-md hover:shadow-blue-500/20 active:scale-95"
        >
          <ExternalLink className="size-4" />
          <span>Open Video Stream</span>
        </a>
      </div>
    );
  };

  // 1. FRAMELESS VARIANT (Pure 16:9 video player without surrounding bars)
  if (variant === 'frameless') {
    return (
      <div className={`relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group ${className}`}>
        {renderVideoContent()}
      </div>
    );
  }

  // 2. CINEMA VARIANT (Dedicated video tutorials, preview modals, and hero players)
  if (variant === 'cinema') {
    return (
      <div className={`w-full flex flex-col rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-2xl relative transition-all duration-300 ${className}`}>
        {/* Top Glassmorphic Control Bar */}
        <div className="px-4 sm:px-6 py-3 sm:py-3.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700/80 text-white font-bold text-[11px] shrink-0 shadow-sm">
              <span className={`size-2 rounded-full ${getProviderDot(parsed.type)} ring-2 ring-white/10`} />
              <span>{parsed.providerName}</span>
            </span>
            <span className="font-bold text-slate-200 truncate text-xs sm:text-sm">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold text-[10px] uppercase tracking-wider">
              <Sparkles size={11} className="text-blue-400" />
              <span>1080p Full HD</span>
            </span>
            {parsed.directUrl && (
              <a
                href={parsed.directUrl}
                target="_blank"
                rel="noreferrer"
                title="Open in new window"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        {/* 16:9 Viewport */}
        <div className="relative aspect-video w-full bg-black overflow-hidden group">
          {renderVideoContent()}
        </div>
      </div>
    );
  }

  // 2. STANDARD CARD VARIANT (For assignment submissions and dashboard cards)
  return (
    <div className={`w-full max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5 min-w-0">
          <div className="size-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Video className="size-5" />
          </div>
          <span className="truncate">{title}</span>
        </h3>
        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 flex items-center gap-1.5">
          <span className={`size-2 rounded-full ${getProviderDot(parsed.type)}`} />
          <span>{parsed.providerName}</span>
        </span>
      </div>

      {/* Main Video Viewport */}
      <div className="rounded-2xl overflow-hidden bg-slate-950 aspect-video relative shadow-inner border border-slate-800/80 group">
        {renderVideoContent()}
      </div>

      {/* Footer Link */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
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
