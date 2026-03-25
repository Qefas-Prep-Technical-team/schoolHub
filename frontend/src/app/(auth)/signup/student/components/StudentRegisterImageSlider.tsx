"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function StudentRegisterImageSlider() {
  const images = [
    "/image/signup/student1.jpg",
    "/image/signup/student2.jpg",
    "/image/signup/student3.jpg",
    "/image/signup/student4.jpg",
  ];

  return (
    <div className="hidden lg:block lg:w-[45%] xl:w-1/2 relative bg-gray-50 dark:bg-gray-800 p-2 lg:p-4">
      <div className="relative w-full h-full min-h-[600px] overflow-hidden rounded-2xl shadow-2xl">
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent z-10 pointer-events-none" />

        {/* Swiper */}
        <div className="absolute inset-0 z-0 w-full h-full">
          <Swiper
            modules={[Autoplay, Pagination]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            loop={true}
            className="w-full h-full"
          >
            {images.map((src, i) => (
              <SwiperSlide key={i} className="w-full h-full">
                <img
                  src={src}
                  alt={`Student learning slide ${i + 1}`}
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
              <span className="material-symbols-outlined text-white text-2xl">menu_book</span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">Unlock Potential</h3>
              <p className="text-white/80 text-sm font-medium">Learn anywhere, anytime</p>
            </div>
          </div>
          <p className="text-white/90 text-sm leading-relaxed font-light">
            "Join your classmates and access all your courses, assignments, and grades in a single beautifully designed modern learning platform."
          </p>
        </div>
      </div>
    </div>
  );
}
