
import Box from '@mui/material/Box';
import React, { FC, useEffect, useState } from 'react';
import ReactPlayer from 'react-player'
import Image from 'next/image';
import { useFetchInAction } from './query';

const InAction: FC = () => {
    const { data, isLoading } = useFetchInAction()


    return (
        <Box component={"section"} style={{ width: "100%" }} className="md:mt-30 md:mb-30 w-100 items-center justify-center flex-col">
            <div className=" text-center space-y-10 justify-center items-center mb-8 md:mb-10">
                <h1 className=" text-2xl md:text-4xl text-1xl font-semibold">See SchoolHub in Action</h1>
            </div>
            <Box style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", borderRadius: 20, overflow: "hidden", position: "relative" }} className="mb-10">
                {data && (
                    <ReactPlayer
                        playIcon={
                            <span style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                zIndex: 2
                            }}>
                                <button className="relative flex shrink-0 items-center justify-center rounded-full size-20 bg-white/30 text-white backdrop-blur-sm group-hover:bg-white/50 group-hover:scale-110 transition-all duration-300 ">
                                    <svg className="w-10 h-10 cursor-pointer" fill="currentColor" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z"></path>
                                    </svg>
                                </button>
                            </span>
                        }
                        src={data[0].videoLink}
                        controls
                        style={{ position: "relative", width: '80%', height: 'auto', aspectRatio: '16/9', margin: "0 auto", borderRadius: 15, backgroundColor: "#E0E1E0" }}
                        light={
                            <Image
                                className=' bg-white/30 text-white backdrop-blur-sm'
                                src={data[0].thumbnail}
                                alt='Thumbnail'
                                width={1280}
                                height={720}
                                style={{
                                    width: '80%',
                                    height: 'auto',
                                    aspectRatio: '16/9',
                                    margin: "0 auto",
                                    borderRadius: 15,
                                    backgroundColor: "#E0E1E0",
                                    objectFit: "cover"
                                }}
                            />
                        }
                    />
                )}
            </Box>
        </Box>
    );
};

export default InAction;