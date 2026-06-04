"use client"
import React, { FC, useState } from 'react';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

/** Extract the YouTube video ID from any standard YouTube URL format. */
function getYouTubeId(url: string): string | null {
    try {
        const parsed = new URL(url.trim());
        // youtu.be/<id>
        if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1);
        // youtube.com/watch?v=<id>
        if (parsed.searchParams.has('v')) return parsed.searchParams.get('v');
        // youtube.com/embed/<id>
        const embedMatch = parsed.pathname.match(/\/embed\/([^/?]+)/);
        if (embedMatch) return embedMatch[1];
    } catch {
        // fall through
    }
    return null;
}

const InAction: FC = () => {
    const [playing, setPlaying] = useState(false);
    const [iframeLoaded, setIframeLoaded] = useState(false);

    const rawUrl = process.env.NEXT_PUBLIC_SHOWCASE_VIDEO_URL || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    const videoId = getYouTubeId(rawUrl);
    const thumbnailUrl = videoId
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        : null;
    const embedUrl = videoId
        ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`
        : null;

    const handlePlay = () => {
        setIframeLoaded(false);
        setPlaying(true);
    };

    return (
        <section className="py-32 px-6 max-w-7xl mx-auto overflow-hidden">
            <div className="text-center mb-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center px-6 py-2 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-[0.2em] mb-6 border border-blue-200 dark:border-blue-800/50 shadow-sm"
                >
                    Qefas Hub in Action
                </motion.div>
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-6xl font-black mb-8 font-lexend tracking-tight"
                >
                    See How <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Qefas Hub</span> Works
                </motion.h2>
                <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">
                    Watch a quick walkthrough of how schools use Qefas Hub to manage students, grades, attendance, and communication — all from one dashboard.
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative aspect-video max-w-5xl mx-auto rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(37,99,235,0.2)] dark:shadow-[0_20px_50px_rgba(37,99,235,0.1)] border-4 border-slate-100 dark:border-slate-800 bg-slate-900"
            >
                {playing && embedUrl ? (
                    <>
                        {/* iframe — always rendered once playing is true */}
                        <iframe
                            src={embedUrl}
                            title="Qefas Hub showcase video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            onLoad={() => setIframeLoaded(true)}
                            className="absolute inset-0 w-full h-full border-0"
                        />

                        {/* Loading overlay — shown until the iframe fires onLoad */}
                        {!iframeLoaded && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950/95 z-10">
                                {/* Spinner ring */}
                                <div className="relative w-16 h-16">
                                    <div className="absolute inset-0 rounded-full border-4 border-blue-500/20" />
                                    <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 animate-spin" />
                                    <div
                                        className="absolute inset-2 rounded-full border-4 border-transparent border-t-indigo-400 animate-spin"
                                        style={{ animationDuration: '0.75s', animationDirection: 'reverse' }}
                                    />
                                </div>
                                <p className="text-sm font-semibold text-slate-400 tracking-wide animate-pulse">
                                    Loading video…
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    /* Thumbnail + play button overlay */
                    <button
                        onClick={handlePlay}
                        aria-label="Play showcase video"
                        className="group absolute inset-0 w-full h-full flex items-center justify-center focus:outline-none"
                    >
                        {/* Thumbnail */}
                        {thumbnailUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={thumbnailUrl}
                                alt="Qefas Hub video thumbnail"
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        )}
                        {/* Dark scrim */}
                        <span className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
                        {/* Play icon */}
                        <span className="relative z-10 flex items-center justify-center w-20 h-20 rounded-full bg-white/90 shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:bg-white">
                            <Play className="w-8 h-8 text-blue-600 fill-blue-600 ml-1" />
                        </span>
                    </button>
                )}
            </motion.div>
        </section>
    );
};

export default InAction;
