"use client";
import Box from '@mui/material/Box';
import React, { FC, useEffect, useState } from 'react';
import { GoPeople } from "react-icons/go";
import { IoCalendarNumberOutline } from "react-icons/io5";
import { PiPresentationChart } from "react-icons/pi";
import { PiFileDocLight } from "react-icons/pi";
import { PiShootingStar } from "react-icons/pi";
import AOS from 'aos';
import 'aos/dist/aos.css';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

import './styles.css';

// import required modules
import { Pagination, Autoplay } from 'swiper/modules';


interface Benefit {
    title: string;
    icon: string;
}
const KeyBenefits: FC = () => {
    const [benefits, setBenefits] = useState<Benefit[]>([]);
    const iconSelector = (type: string) => {
        if (type === "people") {
            return <GoPeople />
        } else if (type === "calender") {
            return <IoCalendarNumberOutline />

        } else if (type === "chart") {
            return <PiPresentationChart />
        } else if (type === "document") {
            return <PiFileDocLight />
        } else {
            return <PiShootingStar />;
        }
    }
    useEffect(() => {
        AOS.init();
        const fetchBenefits = async () => {
            const res = await fetch('/json/KeyBenefits.json');
            const data = await res.json();
            setBenefits(data);
        }
        fetchBenefits()
    }, []);
    return (
        <>
            <Box sx={{ display: { xs: "none", md: "flex" } }} component={"section"} className=" py-16 flex items-center justify-center flex-col  w-full">
                <div className=" text-center space-y-10 justify-center items-center">
                    <h1 className="md:text-4xl text-1xl font-semibold"> Key Benefits </h1>
                    <p className='md:text-xl sm:text-lg w-3/4 text-center  mx-auto'>Discover how SchoolHub empowers your institution to achieve excellence through
                        efficiency and collaboration.</p>
                </div>
                <Box component={"div"} className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-10 w-4/4 px-26  ">
                    {benefits.map((benefit, index) => (
                        <Box key={index} className="flex flex-col items-center justify-center p-6 py-10 bg-white dark:bg-[var(--primary-foreground)] rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 w-4/4 text-center">
                            <div
                                data-aos="zoom-in"
                                className="text-4xl mb-4 text-blue-500 rounded-full bg-blue-100 p-4">
                                {iconSelector(benefit.icon)}
                            </div>
                            <h2 className="text-xl font-semibold mb-2 mt-4">{benefit.title}</h2>
                        </Box>
                    ))}
                </Box>
            </Box>
            <Box sx={{ display: { xs: "flex", md: "none" } }} component={"section"} className=" py-16 flex items-center justify-center flex-col  w-full">
                <div className=" text-center space-y-10 justify-center items-center">
                    <h1 className="md:text-4xl text-2xl font-semibold"> Key Benefits </h1>
                    <p className='md:text-xl sm:text-lg w-3/4 text-center  mx-auto'>Discover how SchoolHub empowers your institution to achieve excellence through
                        efficiency and collaboration.</p>
                </div>
                <Box component={"div"} className="w-full px-4 md:px-0 pt-10" >
                    <Swiper
                        autoplay={{
                            delay: 5000,
                        }}

                        pagination={{
                            dynamicBullets: true,
                        }}
                        modules={[Pagination, Autoplay]}
                        className="mySwiper"
                    >
                        {benefits.map((benefit, index) => (
                            <SwiperSlide key={index}>
                                <Box className="flex flex-col items-center justify-center px-6 py-15  dark:bg-black rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 w-3/4 h-70 text-center">
                                    <div
                                        data-aos="zoom-in"
                                        className="text-4xl mb-4 text-blue-500 rounded-full bg-blue-100 p-4">
                                        {iconSelector(benefit.icon)}
                                    </div>
                                    <h2 className="text-xl font-semibold mb-2 mt-4">{benefit.title}</h2>
                                </Box>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </Box>
            </Box>
        </>
    );
};

export default KeyBenefits;