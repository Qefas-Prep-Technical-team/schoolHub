import GetInTouch from '@/components/contact/GetInTouch';
import OurLocation from '@/components/contact/OurLocation';
import React, { FC } from 'react';

const page: FC = () => {
    return (
        <main className="w-full min-h-screen pt-32 bg-[#FAFAFA] dark:bg-slate-950 transition-colors">
            <GetInTouch />
            <OurLocation />
        </main>
    );
};

export default page;
