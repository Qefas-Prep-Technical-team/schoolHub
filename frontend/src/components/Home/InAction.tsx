"use client"
import React, { FC } from 'react';
import dynamic from 'next/dynamic';
const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as React.ComponentType<Record<string, unknown>>;
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useFetchInAction } from './query';
import { Play } from 'lucide-react';

const InAction: FC = () => {
    const { data, isLoading } = useFetchInAction();
    const [hasMounted, setHasMounted] = React.useState(false);
    const [isPlaying, setIsPlaying] = React.useState(false);

    React.useEffect(() => {
        setHasMounted(true);
    }, []);

    if (!hasMounted) return <div className="aspect-video max-w-5xl mx-auto rounded-[2.5rem] bg-slate-100 dark:bg-slate-800 animate-pulse" />;

    return (
        <section className="py-32 px-6 max-w-7xl mx-auto overflow-hidden">
            <div className="text-center mb-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-6 border border-blue-100 dark:border-blue-800"
                >
                    Showcase
                </motion.div>
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-4xl md:text-5xl font-black mb-8 font-lexend tracking-tight"
                >
                    Experience <span className="text-blue-600">Qefas Hub</span>
                </motion.h2>
                <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
                    A short demonstration of how our platform simplifies complex institutional tasks.
                </p>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative aspect-video max-w-5xl mx-auto rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(37,99,235,0.15)] border border-slate-200 dark:border-slate-800 bg-slate-900 group"
            >
                {isLoading ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                ) : data && data.length > 0 ? (
                    <div className="w-full h-full relative">
                        {!isPlaying ? (
                            <div 
                                className="absolute inset-0 z-30 cursor-pointer flex items-center justify-center"
                                onClick={() => setIsPlaying(true)}
                            >
                                <Image
                                    src={data[0].thumbnail}
                                    alt="Video Thumbnail"
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 transition-colors duration-500 z-10" />
                                
                                <motion.div 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="relative z-20 flex items-center justify-center rounded-full size-24 bg-blue-600 text-white shadow-2xl shadow-blue-600/40"
                                >
                                    <Play className="w-10 h-10 fill-current ml-1" />
                                </motion.div>

                                <div className="absolute bottom-8 left-8 z-20">
                                    <p className="text-white text-sm font-bold uppercase tracking-[0.2em] opacity-80 mb-1">Watch Video</p>
                                    <p className="text-white text-2xl font-bold font-lexend">Platform Overview</p>
                                </div>
                            </div>
                        ) : (
                            <ReactPlayer
                                url={data[0].videoLink}
                                controls={true}
                                width="100%"
                                height="100%"
                                playing={true}
                                pip={true}
                            />
                        )}
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                        Video currently unavailable
                    </div>
                )}
            </motion.div>
        </section>
    );
};

export default InAction;
