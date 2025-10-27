import React, { FC } from 'react';
import MapPreview from './MapPreview';

const OurLocation: FC = () => {
    return (
        <section className="my-10">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_2.1fr] items-center w-full">
                <div className="flex flex-col space-y-4 w-full">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-400">Our Location</h2>
                    <p className="mt-3 text-lg text-gray-600 dark:text-gray-200">Come visit our offices or find us on the map.</p>
                    <div className="mt-8 space-y-4 text-base text-gray-600 dark:text-gray-200">
                        <p>123 SchoolHub Avenue,</p>
                        <p>Education City, EC 54321</p>
                        <p>United States</p>
                    </div>
                </div>
                <div>
                    <MapPreview />
                </div>
            </div>
        </section>
    );
};

export default OurLocation;