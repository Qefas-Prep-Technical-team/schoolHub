import React, { FC } from 'react';

const CoreValues: FC = () => {
    return (
        <section className="py-16 sm:py-24">
            <div className="container mx-auto max-w-6xl px-4">
                <div className="text-center">
                    <h2 className="text-3xl font-bold leading-tight tracking-tighter sm:text-4xl">Our Core Values</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-[var(--text-secondary)]">
                        At SchoolHub, our core values guide everything we do. We are dedicated to providing a platform that is not only effective but also aligns with the needs and values
                        of the schools we serve.
                    </p>
                </div>
                <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
                    <div className="flex flex-col items-center rounded-lg border border-gray-200  p-8 text-center shadow-sm transition-all hover:shadow-lg">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
                            <svg fill="currentColor" height="32" viewBox="0 0 256 256" width="32" xmlns="http://www.w3.org/2000/svg"><path d="M169.64,134.33l44.77-19.46A16,16,0,0,0,213,85.07L52.92,32.8A16,16,0,0,0,32.8,52.92L85.07,213a15.83,15.83,0,0,0,14.41,11l.79,0a15.83,15.83,0,0,0,14.6-9.59h0l19.46-44.77L184,219.31a16,16,0,0,0,22.63,0l12.68-12.68a16,16,0,0,0,0-22.63Zm-69.48,73.76.06-.05Zm95.15-.09-49.66-49.67a16,16,0,0,0-26,4.94l-19.42,44.65L48,48l159.87,52.21-44.64,19.41a16,16,0,0,0-4.94,26L208,195.31ZM88,24V16a8,8,0,0,1,16,0v8a8,8,0,0,1-16,0ZM8,96a8,8,0,0,1,8-8h8a8,8,0,0,1,0,16H16A8,8,0,0,1,8,96ZM120.85,28.42l8-16a8,8,0,0,1,14.31,7.16l-8,16a8,8,0,1,1-14.31-7.16Zm-81.69,96a8,8,0,0,1-3.58,10.74l-16,8a8,8,0,0,1-7.16-14.31l16-8A8,8,0,0,1,39.16,124.42Z"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold">Simplicity</h3>
                        <p className="mt-2 text-[var(--text-secondary)]">
                            We believe in intuitive design and user-friendly interfaces that make our platform easy to use for everyone.
                        </p>
                    </div>
                    <div className="flex flex-col items-center rounded-lg border border-gray-200  p-8 text-center shadow-sm transition-all hover:shadow-lg">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
                            <svg fill="currentColor" height="32" viewBox="0 0 256 256" width="32" xmlns="http://www.w3.org/2000/svg"><path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold">Transparency</h3>
                        <p className="mt-2 text-[var(--text-secondary)]">We are committed to open communication and honest practices in all our interactions.</p>
                    </div>
                    <div className="flex flex-col items-center rounded-lg border border-gray-200  p-8 text-center shadow-sm transition-all hover:shadow-lg">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
                            <svg fill="currentColor" height="32" viewBox="0 0 256 256" width="32" xmlns="http://www.w3.org/2000/svg"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm88,104a87.62,87.62,0,0,1-6.4,32.94l-44.7-27.49a15.92,15.92,0,0,0-6.24-2.23l-22.82-3.08a16.11,16.11,0,0,0-16,7.86h-8.72l-3.8-7.86a15.91,15.91,0,0,0-11-8.67l-8-1.73L96.14,104h16.71a16.06,16.06,0,0,0,7.73-2l12.25-6.76a16.62,16.62,0,0,0,3-2.14l26.91-24.34A15.93,15.93,0,0,0,166,49.1l-.36-.65A88.11,88.11,0,0,1,216,128ZM143.31,41.34,152,56.9,125.09,81.24,112.85,88H96.14a16,16,0,0,0-13.88,8l-8.73,15.23L63.38,84.19,74.32,58.32a87.87,87.87,0,0,1,69-17ZM40,128a87.53,87.53,0,0,1,8.54-37.8l11.34,30.27a16,16,0,0,0,11.62,10l21.43,4.61L96.74,143a16.09,16.09,0,0,0,14.4,9h1.48l-7.23,16.23a16,16,0,0,0,2.86,17.37l.14.14L128,205.94l-1.94,10A88.11,88.11,0,0,1,40,128Zm102.58,86.78,1.13-5.81a16.09,16.09,0,0,0-4-13.9,1.85,1.85,0,0,1-.14-.14L120,174.74,133.7,144l22.82,3.08,45.72,28.12A88.18,88.18,0,0,1,142.58,214.78Z"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold">Accessibility</h3>
                        <p className="mt-2 text-[var(--text-secondary)]">We strive to make our platform accessible to all schools, regardless of their size or resources.</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CoreValues;