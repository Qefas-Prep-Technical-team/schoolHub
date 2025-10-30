"use client"
import React, { useRef, useState, FC } from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './styles.css';
// import required modules
import { Navigation, Pagination, Mousewheel, Keyboard } from 'swiper/modules';
import { Container, Stepper } from '@mui/material';
import SuccessPage from './components/SuccessPage';
import Page1 from './components/Step1';
import Step1 from './components/Step1';
import Step2 from './components/Step2';
import Step3 from './components/Step3';
import CompletionPage from './components/CompletionPage';
import StepperMain from './components/Stepper';


const page: FC = () => {
  return (
    <Container maxWidth="lg"  sx={{display:"flex",flex:1,height:"100%",mx:10,width:"90%",overflow:"hidden",flexDirection:"column"}}  >
      <StepperMain/>
      <Swiper
        cssMode={true}
        navigation={true}
        // pagination={true}
        mousewheel={true}
        keyboard={true}
        modules={[Navigation, Pagination, Mousewheel, Keyboard]}
        className="mySwiper"
      >
        <SwiperSlide>
            <SuccessPage/>
        </SwiperSlide>
        <SwiperSlide>
             <Step1/>
        </SwiperSlide>
        <SwiperSlide>
             <Step2/>
        </SwiperSlide>
        <SwiperSlide> 
             <Step3/>
        </SwiperSlide>
        <SwiperSlide>
             <CompletionPage/>
        </SwiperSlide>
      </Swiper>
    </Container>
  );
};

export default page;