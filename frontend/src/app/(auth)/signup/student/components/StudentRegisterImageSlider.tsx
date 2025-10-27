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
    <div className="hidden lg:flex w-full lg:w-1/2 items-center justify-center p-8 lg:p-12 bg-primary/10 dark:bg-primary/20">
      <div className="w-full h-full max-w-lg rounded-xl overflow-hidden shadow-lg">
        <Swiper
          modules={[Autoplay, Pagination]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          loop
          className="w-full h-full"
        >
          {images.map((src, i) => (
            <SwiperSlide key={i}>
              <div
                className="w-full h-full bg-center bg-no-repeat bg-contain aspect-square rounded-xl"
                style={{ backgroundImage: `url(${src})` }}
                data-alt={`Student learning slide ${i + 1}`}
              ></div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
