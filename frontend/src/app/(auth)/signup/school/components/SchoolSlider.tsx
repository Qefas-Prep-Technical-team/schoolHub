"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function SchoolImageSlider() {
  const images = [
    "/image/signup/school1.jpg",
    "/image/signup/school2.jpg",
    "/image/signup/school3.jpg",
   
  
  ];

  return (
    <div className="hidden md:flex items-center justify-center flex-1">
      <div className="relative w-full max-w-md aspect-square overflow-hidden rounded-2xl shadow-lg">
        {/* Background glow effects */}
        <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-full blur-3xl"></div>
        <div className="absolute inset-8 bg-green-500/10 dark:bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute inset-16 bg-yellow-400/10 dark:bg-yellow-400/20 rounded-full blur-3xl animate-pulse [animation-delay:1s]"></div>

        {/* Swiper */}
        <div className="relative z-10 w-full h-full">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            // navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop={true}
            slidesPerView={1}
            spaceBetween={0}
            className="w-full h-full"
          >
            {images.map((src, i) => (
              <SwiperSlide key={i} className="flex justify-center items-center">
                <img
                  src={src}
                  alt={`School slide ${i + 1}`}
                  className="w-full h-full object-cover rounded-2xl transition-all duration-500"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
