"use client"
import React, { FC, useEffect, useState } from 'react';
import * as motion from "motion/react-client"
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
import Box from '@mui/material/Box';
import Image from 'next/image';
import { useFetchWhatUsersSay } from './query';





const UsersSay: FC = () => {
    const { data, isLoading } = useFetchWhatUsersSay()

    return (
        <>
            <Box sx={{ display: { xs: "none", md: "flex" } }} component={"section"} className=" py-8 items-center justify-center flex-col  w-ful mb-26">
                <div className=" text-center space-y-10 justify-center items-center">
                    <h1 className="md:text-4xl text-1xl font-semibold">What Our Users Say</h1>
                </div>
                <Box component={"div"} className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-20 w-4/4 px-26 h-70 ">
                    {data &&
                        data.map((user, index) => (
                            <div key={index} className="cursor-pointer testimonial-card flex flex-col items-center text-center p-8 bg-slate-50 dark:bg-[var(--primary-foreground)] rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300">
                                <div className="testimonial-image w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-white shadow-lg transition-transform duration-300 relative">
                                    <Image
                                        src={user.image}
                                        alt={`${user.name} image`}
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>
                                <blockquote className="text-slate-700 dark:text-[var(--text-secondary)] text-lg italic mb-4">`{user.comment}`</blockquote>
                                <cite className="font-semibold text-slate-900 dark:text-[var(--Secondary)]">{user.name}, <span className="font-normal text-slate-500 dark:text-[var(--text-secondary)]">{user.role}</span></cite>
                            </div>
                        ))
                    }
                </Box>
            </Box>
            <Box sx={{ display: { xs: "flex", md: "none" } }} component={"section"} className="  flex items-center justify-center flex-col  w-full pb-10">
                <div className=" text-center space-y-5 justify-center items-center">
                    <h1 className="md:text-4xl text-2xl font-semibold">What Our Users Say</h1>
                </div>
                <Box component={"div"} className="w-full px-1 md:px-0 " >
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
                        {data && data.map((user, index) => (
                            <SwiperSlide style={{ paddingBottom: 10 }} key={index}>
                                <Box key={index} className="flex flex-col items-center justify-center h-80 dark:bg-black rounded-lg hover:shadow-lg transition-shadow duration-300 text-center">
                                    <Box sx={{ position: "relative", borderColor: "#E0E1E0", border: "4px solid ", width: 100, height: 100, borderRadius: "50%", overflow: 'hidden' }}>
                                        <Image src={user.image} alt={`${user.name} image`} fill style={{ objectFit: 'cover', }} />
                                    </Box>
                                    <h2 className="text-gray-500 dark:text-gray-400 mb-4 text-xl"><i>″{user.comment}″</i></h2>
                                    <h3 className="text-xl font-semibold"><i>{user.name},<em className='text-gray-400 ml-1'>{user.role}</em></i></h3>
                                </Box>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </Box>
            </Box>
        </>
    );
};

export default UsersSay;