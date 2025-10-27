"use client"
import React, { FC } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { useTheme } from 'next-themes';

const IntroSection: FC = () => {
    const { theme, setTheme } = useTheme();
    return (
        <section
            style={{
                backgroundImage: "url('/image/backgroundSchool.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "100vh",
                width: "100%",
                position: "relative",
            }}
        >
            <div className='absolute inset-0 bg-black  z-10' style={{ opacity: 0.5 }} />
            <Box className='absolute inset-0 flex items-center justify-center z-20 text-white p-4 flex-col'>
                <div className="max-w-3xl text-center space-y-10">
                    <h1 className="md:text-6xl text-3xl font-semibold"> Simplify Your School Management </h1>
                    <p className='md:text-xl sm:text-lg'>SchoolHub offers a comprehensive platform to streamline
                        administrative tasks, enhance communication, and improve student outcomes.</p>
                </div>

                <Box className="flex items-center justify-between w-75  mt-10">
                    <Button variant='contained' sx={{ backgroundColor: theme === "dark" ? 'black' : "white", color: theme === "dark" ? 'lightBlue' : "blue", }} className='bg-white dark:bg-black text-blue-400'> Try for Free </Button>
                    <Button variant="outlined" sx={{ borderColor: theme === "dark" ? 'black' : "white", color: theme === "dark" ? 'black' : "white" }} className='bg-white dark:bg-black'> Request a Demo</Button>
                </Box>

            </Box>
        </section>
    );
};

export default IntroSection;