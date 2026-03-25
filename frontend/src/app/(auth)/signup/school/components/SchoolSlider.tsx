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
    <div className="relative w-full h-full min-h-[600px] overflow-hidden rounded-2xl shadow-2xl">
      {/* Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent z-10 pointer-events-none" />

      {/* Swiper */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          pagination={{ 
            clickable: true,
          }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop={true}
          slidesPerView={1}
          spaceBetween={0}
          className="w-full h-full"
        >
          {images.map((src, i) => (
            <SwiperSlide key={i} className="h-full w-full">
              <img
                src={src}
                alt={`School slide ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Floating Modern Information Card */}
      <div className="absolute bottom-10 left-6 right-6 lg:left-10 lg:right-10 z-20 bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 p-6 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/10">
            <span className="material-symbols-outlined text-white text-2xl">school</span>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg leading-tight">SchoolHub Cloud</h3>
            <p className="text-white/80 text-sm font-medium">Empowering modern education</p>
          </div>
        </div>
        <p className="text-white/90 text-sm leading-relaxed font-light">
          "Join thousands of modern schools revolutionizing their campus management, communication, and learning experience in one seamless platform."
        </p>
      </div>
    </div>
  );
}
