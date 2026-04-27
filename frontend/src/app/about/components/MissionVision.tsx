"use client"
import React from 'react';
import { motion } from 'framer-motion';

const MissionVision: React.FC = () => {
    return (
        <section className="py-24 bg-white dark:bg-slate-950 font-['Lexend'] overflow-hidden">
            <div className="max-w-7xl mx-auto px-8">
                <div className="grid md:grid-cols-12 gap-8">
                    {/* Mission */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="md:col-span-7 bg-slate-50 dark:bg-slate-900/50 p-12 rounded-[3.5rem] border border-slate-200/60 dark:border-slate-800 flex flex-col justify-between group hover:shadow-2xl transition-all duration-700 shadow-sm"
                    >
                        <div>
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-8 group-hover:rotate-6 transition-transform">
                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-3xl font-light">target</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6">Our Mission</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                Empowering schools to focus on teaching by simplifying administration. We strip away the complexity of logistics, data silos, and paperwork, replacing them with fluid, automated systems that work silently in the background.
                            </p>
                        </div>
                        <div className="mt-12 flex items-center gap-4 border-t border-slate-200 dark:border-slate-800 pt-8">
                            <div className="flex -space-x-3">
                                {[
                                    "https://lh3.googleusercontent.com/aida-public/AB6AXuAzEGeDYNv99dHw7ckwcqcD2TxTpLz-q-6lLRzEeUVs2AB0ux6X1AFa0QOIHGm2zWOiJgiRg9pxvY9-FWppPhbkSxTcW1gUrgE7BX65uzgnqm9bNZ6emrZnu-6uYylTYc1-zMqIrYl2KIYEIEc9LmI6gKdgjQUtVRiN6HMo6gwrzomILg21CADUG0niYywsbLBaSDzU3NRG-EMv5ERB21QbSl1iJC2RCn9ROqiiGRIsQLfPV0-aZf-ox6FpYRVrgQYhRMbsuXIRUuE",
                                    "https://lh3.googleusercontent.com/aida-public/AB6AXuDB9OECR3HVcmbs8An73CjPu9fW1IA0bnuubmrxgqsIpj8G39vLPATg6IOuPHiCIm71j7SDzdu9Q6D5aWACRLeQYm7-VNrZFRvXekRDU3jw2Vd2hg0sA8IvJNJZ2Jdaz1KFo0Ao-vbkc1rokl1V-5_gkd8va_7Cr99MoXVAwlIJLw9VJWaNfmWaXdUP25WKkrePVIxZsRGBlyl5olcrj52nzzeGn3HoCWe7Za1oWfj8JzU-kiMJfjzc21BO7vDdE8yarAIjoYWN1VI",
                                    "https://lh3.googleusercontent.com/aida-public/AB6AXuBbh4oF9X2zOYGBGCFumnsW7pl9uPzYhQMyuBexQ41jhNSNm-XqeQgpX_S-rcUYzHmyqewz7iXXNCDVuSK1XqIWJHzEWEnTC3jECGgx8pLb64PCg6I5jD_Sy26yKGabD2G9R6tnT_1sMYV_BpR87T1hLgalYBbw7I2Ew5bV2Xzfum_Y7OYBbBQRe_c-QdB15MQih_JD61Gpt0fOEETAL5w4HXgxKjPKlwbUPruvx43UNfjjymCGjMHtHsDrw9BF2QNZwfnKtSAtHFo"
                                ].map((src, i) => (
                                    <img key={i} src={src} alt="Team" className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-800 object-cover" />
                                ))}
                            </div>
                            <span className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tighter">Built by educators, for educators.</span>
                        </div>
                    </motion.div>

                    {/* Vision */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="md:col-span-5 bg-blue-600 p-12 rounded-[3.5rem] shadow-2xl shadow-blue-600/20 flex flex-col justify-center relative overflow-hidden group"
                    >
                        <div className="z-10">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 border border-white/20 backdrop-blur-sm group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-white text-3xl font-light">visibility</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-6">Our Vision</h2>
                            <p className="text-lg text-white/90 font-medium leading-relaxed">
                                A unified ecosystem where schools, teachers, parents, and students thrive in a seamless digital continuum, fostering a culture of academic excellence and lifelong learning.
                            </p>
                            <div className="mt-12">
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: "75%" }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, delay: 0.5 }}
                                        className="h-full bg-white"
                                    ></motion.div>
                                </div>
                                <p className="mt-4 text-sm text-white/70 font-bold italic tracking-wide">75% through our 2030 Global Literacy Initiative</p>
                            </div>
                        </div>
                        {/* Static shape */}
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default MissionVision;
