import { currentName } from '@/utils/data';
import React, { FC } from 'react';

const HeroSection: FC = () => {
    return (
        <section>
            <div className="flex flex-col items-center justify-center gap-4 text-center p-4">
                <h1 className="text-slate-900 dark:text-white text-5xl font-black leading-tight tracking-tighter">Join                     {currentName}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-normal leading-normal">Select your role to get started</p>
            </div>

        </section>
    );
};

export default HeroSection;