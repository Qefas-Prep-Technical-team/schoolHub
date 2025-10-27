"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function ParentImageSlider() {
  const images = [
  "/image/signup/parent1.jpg",
  "/image/signup/parent2.jpg",
  "/image/signup/parent3.jpg",
  "/image/signup/parent4.jpg",
  ];

  return (
    <div className="hidden lg:flex items-center justify-center">
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
        {/* Aesthetic glow layers */}
        <div className="absolute inset-0 bg-primary/10 dark:bg-primary/20 blur-3xl"></div>
        <div className="absolute inset-8 bg-green-500/10 dark:bg-green-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute inset-16 bg-yellow-400/10 dark:bg-yellow-400/20 blur-3xl animate-pulse [animation-delay:1s]"></div>

        {/* Swiper Slider */}
        <div className="relative z-10 w-full h-full">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            // navigation
            pagination={{ clickable: true }}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop
            slidesPerView={1}
            className="w-full h-full"
          >
            {images.map((src, index) => (
              <SwiperSlide
                key={index}
                className="flex justify-center items-center bg-center bg-cover"
              >
                <img
                  src={src}
                  alt={`Parent slide ${index + 1}`}
                  className="w-full h-full object-cover rounded-xl"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
