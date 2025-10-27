"use client";
import Box from '@mui/material/Box';
import React, { FC, useEffect, useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Image from 'next/image';

interface Features {
    title: string;
    description: string;
    image: string;
}
const Features: FC = () => {
    const [Features, setFeatures] = useState<Features[]>([]);

    useEffect(() => {
        AOS.init();
        const fetchBenefits = async () => {
            const res = await fetch('/json/Features.json');
            const data = await res.json();
            setFeatures(data);
        }
        fetchBenefits()
    }, []);
    return (
        <Box component={"section"} className=" md:py-16 flex items-center justify-center flex-col  w-full py-10">
            <div className=" text-center space-y-10 justify-center items-center">
                <h1 className="md:text-4xl text-2xl font-semibold"> Comprehensive Features </h1>
                <p className='md:text-xl sm:text-lg w-3/4 text-center  mx-auto'>SchoolHub provides a suite of tools to manage all aspects of your school, from Student
                    information to academic reporting.</p>
            </div>
            <Box component={"div"} className="grid grid-cols-1 md:grid-cols-3 md:gap-10 py-10 md:w-full md:px-26 ">
                {Features.map((feature, index) => (
                    <div key={index} className="flex flex-col gap-4">
                        <div className="overflow-hidden rounded-lg shadow-lg group">
                            <div className="w-full aspect-video relative">
                                <Image
                                    src={feature.image}
                                    alt={feature.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-400">{feature.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
                        </div>
                    </div>
                ))}
            </Box>
        </Box>
    );
};

export default Features;