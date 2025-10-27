"use client"
import React, { FC } from 'react';
import { useFetchFeatuersinFeaturesPage } from './query';
import Box from '@mui/material/Box';

const Features: FC = () => {
    const { data, isLoading, error } = useFetchFeatuersinFeaturesPage();
    const formatText = (text: string, code: string) => {
        const [before, after] = text.split('{{code}}');
        return (
            <p className="text-gray-600 dark:text-gray-400">
                {before}
                <code className="bg-gray-200  text-sm p-1 rounded-md text-gray-600 ">{code}</code>
                {after}
            </p>
        );
    };
    return (
        <Box component={"div"} className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {data && data.map((data) => (
                <div key={data.title} className=" dark:bg-[var(--primary-foreground)] cursor-pointer rounded-lg shadow-md p-8 flex flex-col items-center text-center transform hover:-translate-y-2 transition-transform duration-300">
                    <div className="bg-blue-100   text-blue-500 rounded-full p-4 mb-6">
                        <svg fill="currentColor" height="32" viewBox="0 0 256 256" width="32" xmlns="http://www.w3.org/2000/svg"><path d={data.path}></path></svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-200 mb-2">{data.title}</h3>
                    {data.code ? formatText(data.description, data.code) : <p className="text-gray-600 dark:text-gray-400">{data.description}</p>}
                </div>
            ))
            }
        </Box>
    );
};

export default Features;