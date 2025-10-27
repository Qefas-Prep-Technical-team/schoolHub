"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function TeacherRegisterImageSlider() {
  const images = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCTw1hYnqj5nLCF72Ao6gC2p5Te8AzCtSWvNMAQgbxzpvnHyAkHy0N6_fcYnFa3DwISc5ClU2BnbTBJTeSbQzZnQQ7kdlJ-76zdSApeGYD5VVEFt0wEr5O6DlIB6TPEL_lVoUWU9fkHRNjTrWBVPxLiwd3goOVY77ffNwKmQjG-06ZMhH6jp9x3JY61Dq5netFQQBzteLCpiCkzwOH-Doejk_FI0eyO4MIQByKQn8IXPVm-YRI3CEM1O0BcehoOjLG8IpgAh5SzV4s",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
  ];

  return (
    <div className="hidden md:flex w-1/2 bg-primary/20 items-center justify-center p-8">
      <div className="w-full max-w-lg h-[500px] overflow-hidden rounded-xl shadow-lg">
        <Swiper
          modules={[Autoplay, Pagination]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop
          className="w-full h-full"
        >
          {images.map((src, i) => (
            <SwiperSlide key={i}>
              <div
                className="w-full h-full bg-center bg-no-repeat bg-contain rounded-xl"
                style={{ backgroundImage: `url(${src})` }}
              ></div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
