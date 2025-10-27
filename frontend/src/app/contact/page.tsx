import GetInTouch from '@/components/contact/GetInTouch';
import OurLocation from '@/components/contact/OurLocation';
import React, { FC } from 'react';

const page: FC = () => {
    return (
        <main className="flex h-full w-full items-center justify-center flex-col gap-8 px-4 sm:px-6 lg:px-8">
            <GetInTouch />
            <OurLocation />
        </main>
    );
};

export default page;