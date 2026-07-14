"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

const FinalCTA: React.FC = () => {
    const router = useRouter();
    return (
        <section className="py-24 bg-white dark:bg-slate-950 font-['Lexend'] overflow-hidden">
            <div className="max-w-5xl mx-auto px-6 text-center relative">
                {/* Decorative background blur */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>
                
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="relative z-10"
                >
                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-8 leading-tight">
                        Ready to Transform <br />
                        <span className="text-blue-600">Your Institution?</span>
                    </h2>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
                        Join over 500 schools globally that are already leveraging Qefas Hub to drive academic excellence and administrative ease.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-6">
                        <motion.button 
                            onClick={() => router.push('/contact')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all cursor-pointer"
                        >
                            Request a Private Demo
                        </motion.button>
                        <motion.button 
                            onClick={() => router.push('/contact')}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-10 py-5 bg-slate-900 dark:bg-slate-800 text-white rounded-[2rem] font-black text-lg hover:bg-slate-800 dark:hover:bg-slate-700 transition-all border border-slate-800 cursor-pointer"
                        >
                            Contact Sales
                        </motion.button>
                    </div>
                </motion.div>
                
                {/* School Statistics */}
                <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: "Active Schools", value: "500+" },
                        { label: "Students Empowered", value: "2M+" },
                        { label: "Success Rate", value: "99.9%" },
                        { label: "Support", value: "24/7" }
                    ].map((stat, i) => (
                        <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4 + i * 0.1 }}
                            className="text-center"
                        >
                            <p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-1">{stat.value}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FinalCTA;
