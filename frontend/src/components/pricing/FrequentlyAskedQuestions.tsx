"use client"
import { Box } from '@mui/material';
import React, { FC } from 'react';
import { useFetchPricingFAQ } from './query';
import { useTheme } from 'next-themes';

const FrequentlyAskedQuestions: FC = () => {
    const { data } = useFetchPricingFAQ()
    const { theme } = useTheme();
    return (
        <Box className="container mx-auto px-6 py-16 flex flex-col items-center">
            <Box className="md:mt-24 max-w-4xl mx-auto w-full">
                <h2 className="text-center text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">Frequently asked questions</h2>
                <div className="mt-10 space-y-4">
                    {data && data.map((items) => (<details key={items.question} className={`group rounded-lg border  ${theme === "dark" ? "bg-black " : "bg-white border-white"} p-6 [&amp;_summary::-webkit-details-marker]:hidden shadow-sm`}>
                        <summary className="flex cursor-pointer items-center justify-between">
                            <h3 className="text-lg font-medium text-[var(--text-primary)]">{items.question}</h3>
                            <svg className="h-6 w-6 transform transition-transform duration-300 group-open:rotate-180" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.5 8.25l-7.5 7.5-7.5-7.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>
                        </summary>
                        <p className="mt-4 text-base text-[var(--text-secondary)]">{items.answer}</p>
                    </details>))}
                </div>
            </Box>
            <div className="mt-16 text-center">
                <h2 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">Still have questions?</h2>
                <p className="mt-4 text-lg text-[var(--text-secondary)]">Our team is here to help you find the perfect plan for your school.</p>
                <div className="mt-8 flex justify-center">
                    <a className="rounded-md bg-gray-500 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600" href="#">Contact Sales</a>
                </div>
            </div>
        </Box>
    );
};

export default FrequentlyAskedQuestions;