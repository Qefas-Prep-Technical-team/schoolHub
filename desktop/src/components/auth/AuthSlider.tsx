import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { GraduationCap } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export const AuthSlider: React.FC = () => {
  const images = [
    "/image/signup/school1.jpg",
    "/image/signup/school2.jpg",
    "/image/signup/school3.jpg",
  ];

  return (
    <div className="relative w-full h-full overflow-hidden shadow-2xl">
      {/* Gradient Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent z-10 pointer-events-none" />

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
      <div className="absolute bottom-12 left-8 right-8 z-20 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-indigo-500/30">
            <GraduationCap className="h-6 w-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-slate-100 font-bold text-lg leading-tight">QefasHub Desktop</h3>
            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-0.5">Empowering modern education</p>
          </div>
        </div>
        <p className="text-slate-300 text-sm leading-relaxed font-light">
          "Join thousands of modern schools revolutionizing their campus management, communication, and learning experience in one seamless offline-first native platform."
        </p>
      </div>
    </div>
  );
};
