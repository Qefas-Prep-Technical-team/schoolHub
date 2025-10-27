import React, { FC } from 'react';

const HeroSection: FC = () => {
    return (
        <section className="relative flex min-h-[100vh] items-center justify-center bg-cover bg-center py-20 text-white bg-red-500 w-full h-60vh mb-5" style={{ backgroundImage: "url(https://lh3.googleusercontent.com/aida-public/AB6AXuClQplq3oAjKvKhSJcOfa1hoJ0dlSQZZk86h8GAMnz4aqWknH3-GmRRFMybwuHsFUFZEHrcN7HrVlE56WOHjjoI2tvGDIscbWE3iplmIsGR3JcBWpSZBq8i74Nzg6wzBY6KgN6JwUs_WYdwePNW61bPtWElUMsWtABBDlp36ejRf_6cHp2LbcA0oroly_KCZu2InSVLR1-2227d4_FpumqKzVFrt5pJe995EL56-fDkGBfS8gm-huXXxlPNqazg5vz15Y4grQulbuA)" }}>
            <div className="absolute inset-0 hero-gradient"></div>
            <div className="relative z-10 mx-auto max-w-4xl text-center">
                <h1 className="text-4xl font-black leading-tight tracking-tighter md:text-6xl">Our Mission</h1>
                <p className="mt-4 text-lg font-medium md:text-xl">Empowering African schools through digital transformation.</p>
                <button className="mt-8 inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-md h-12 px-6 bg-blue-500 text-base font-bold leading-normal tracking-wide text-white transition-transform hover:scale-105">
                    <span className="truncate">Get Started Today</span>
                </button>
            </div>
        </section>
    );
};

export default HeroSection;