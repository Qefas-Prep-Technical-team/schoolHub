import React, { FC } from 'react';
import Link from 'next/link';
import MapPreview from './MapPreview';

const OurLocation: FC = () => {
    return (
        <section className="py-24 bg-[#FAFAFA] dark:bg-slate-950 font-['Inter',sans-serif] w-full transition-colors">
            <div className="max-w-[1440px] mx-auto px-4 md:px-8">
                
                {/* CTA Card */}
                <div className="bg-[#F3F3F3] dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-10 md:p-16 mb-24 transition-colors">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="flex flex-col items-start">
                            <div className="inline-flex items-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-full px-4 py-1.5 text-xs font-semibold text-gray-800 dark:text-gray-200 mb-8 shadow-sm transition-colors">
                                Start now
                            </div>
                            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-black dark:text-white leading-[1.1] mb-6 transition-colors">
                                Discover your next<br />perfect school solution
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm leading-relaxed max-w-sm mb-10 transition-colors">
                                Plan your implementation in minutes and enjoy every moment of your school's digital transformation.
                            </p>
                            <Link href="/signup">
                                <button className="bg-black dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-200 text-white dark:text-black rounded-full px-8 py-3.5 text-sm font-semibold transition-colors flex items-center gap-2">
                                    Get Started
                                </button>
                            </Link>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="rounded-[2rem] overflow-hidden h-[200px] sm:h-[300px] md:h-[400px]">
                                <img src="/about/classrooom 2.jpeg" alt="School" className="w-full h-full object-cover" />
                            </div>
                            <div className="rounded-[2rem] overflow-hidden h-[200px] sm:h-[300px] md:h-[400px] translate-y-4 sm:translate-y-8">
                                <img src="/about/about user 1.jpeg" alt="Students" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="flex flex-col space-y-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-semibold tracking-tight text-black dark:text-white transition-colors">Our Location</h2>
                        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 transition-colors">Come visit our offices or find us on the map.</p>
                        <div className="mt-4 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors">
                            19 Oke St, Akowonjo, Lagos 102213, Nigeria
                        </div>
                    </div>
                    <div className="rounded-[2rem] overflow-hidden shadow-sm h-[250px] sm:h-[350px] md:h-[450px] w-full border border-gray-200 dark:border-slate-800 transition-colors">
                        <MapPreview />
                    </div>
                </div>

            </div>
        </section>
    );
};

export default OurLocation;
