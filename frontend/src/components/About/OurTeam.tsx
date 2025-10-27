import React, { FC } from 'react';

const OurTeam: FC = () => {
    return (
        <section className="py-16 sm:py-24">
            <div className="container mx-auto max-w-6xl px-4">
                <div className="text-center">
                    <h2 className="text-3xl font-bold leading-tight tracking-tighter sm:text-4xl">Meet Our Team</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-[var(--text-secondary)]">
                        We&apos;re a passionate group of educators and technologists dedicated to making a difference.
                    </p>
                </div>
                <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="text-center">
                        <div className="mx-auto h-40 w-40">
                            <div className="h-full w-full rounded-full bg-cover bg-center" style={{ backgroundImage: "url(/image/team-1.png)" }}></div>
                        </div>
                        <h3 className="mt-4 text-lg font-bold">Sarah Johnson</h3>
                        <p className="text-[var(--text-secondary)]">CEO</p>
                    </div>
                    <div className="text-center">
                        <div className="mx-auto h-40 w-40">
                            <div className="h-full w-full rounded-full bg-cover bg-center" style={{ backgroundImage: 'url("/image/team-2.png")' }}></div>
                        </div>
                        <h3 className="mt-4 text-lg font-bold">David Lee</h3>
                        <p className="text-[var(--text-secondary)]">CTO</p>
                    </div>
                    <div className="text-center">
                        <div className="mx-auto h-40 w-40">
                            <div className="h-full w-full rounded-full bg-cover bg-center" style={{ backgroundImage: 'url("/image/team-3.png")' }}></div>
                        </div>
                        <h3 className="mt-4 text-lg font-bold">Emily Chen</h3>
                        <p className="text-[var(--text-secondary)]">Head of Product</p>
                    </div>
                    <div className="text-center">
                        <div className="mx-auto h-40 w-40">
                            <div className="h-full w-full rounded-full bg-cover bg-center" style={{ backgroundImage: 'url("/image/team-4.png")' }}></div>
                        </div>
                        <h3 className="mt-4 text-lg font-bold">Michael Brown</h3>
                        <p className="text-[var(--text-secondary)]">Head of Sales</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default OurTeam;