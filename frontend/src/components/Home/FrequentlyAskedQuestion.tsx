"use client"
import React, { FC } from 'react';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useFetchFrequentlyAsked } from './query';

const FrequentlyAskedQuestion: FC = () => {
    const { data, isLoading } = useFetchFrequentlyAsked();

    return (
        <section className="py-24 px-6 max-w-4xl mx-auto">
            <div className="text-center mb-16">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-5xl font-black mb-6 font-lexend tracking-tight"
                >
                    Frequently Asked <span className="text-blue-600">Questions</span>
                </motion.h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-light">
                    Everything you need to know about the platform and how it can help your institution.
                </p>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="w-full"
            >
                <Accordion type="single" collapsible className="w-full space-y-4">
                    {data && data.map((item, index) => (
                        <AccordionItem 
                            value={`item-${index}`} 
                            key={index}
                            className="border border-slate-200 dark:border-slate-800 rounded-2xl px-6 bg-white dark:bg-slate-900/50 overflow-hidden"
                        >
                            <AccordionTrigger className="text-left font-bold text-lg py-6 hover:no-underline hover:text-blue-600 transition-colors">
                                {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-slate-600 dark:text-slate-400 text-base leading-relaxed pb-6">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </motion.div>
        </section>
    );
};

export default FrequentlyAskedQuestion;