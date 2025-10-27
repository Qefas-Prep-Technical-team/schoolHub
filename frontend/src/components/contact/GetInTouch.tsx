import React, { FC } from 'react';

const GetInTouch: FC = () => {
    return (
        <section className="py-16 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
                    <div className="flex flex-col">
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl dark:text-gray-400">Get in touch</h1>
                            <p className="mt-4 text-lg text-gray-600 dark:text-gray-200">We&#39;d love to hear from you. Whether you have a question about features, trials, pricing, or anything else, our team is ready to answer all your questions.</p>
                        </div>
                        <div className="space-y-8">
                            <div className="flex items-start gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-blue-100 dark:bg-[var(--primary-foreground)]  text-blue-500">
                                    <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M224,48H32a8,8,0,0,0-8,8V192a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A8,8,0,0,0,224,48Zm-96,85.15L52.57,64H203.43ZM98.71,128,40,181.81V74.19Zm11.84,10.85,12,11.05a8,8,0,0,0,10.82,0l12-11.05,58,53.15H52.57ZM157.29,128,216,74.18V181.82Z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-400">Email</h3>
                                    <p className="text-gray-600 dark:text-gray-200">Our support team will get back to you within 24 hours.</p>
                                    <a className="font-medium text-blue-500 hover:underline" href="mailto:support@schoolhub.com">support@schoolhub.com</a>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-blue-100 dark:bg-[var(--primary-foreground)]  text-blue-500">
                                    <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M222.37,158.46l-47.11-21.11-.13-.06a16,16,0,0,0-15.17,1.4,8.12,8.12,0,0,0-.75.56L134.87,160c-15.42-7.49-31.34-23.29-38.83-38.51l20.78-24.71c.2-.25.39-.5.57-.77a16,16,0,0,0,1.32-15.06l0-.12L97.54,33.64a16,16,0,0,0-16.62-9.52A56.26,56.26,0,0,0,32,80c0,79.4,64.6,144,144,144a56.26,56.26,0,0,0,55.88-48.92A16,16,0,0,0,222.37,158.46ZM176,208A128.14,128.14,0,0,1,48,80,40.2,40.2,0,0,1,82.87,40a.61.61,0,0,0,0,.12l21,47L83.2,111.86a6.13,6.13,0,0,0-.57.77,16,16,0,0,0-1,15.7c9.06,18.53,27.73,37.06,46.46,46.11a16,16,0,0,0,15.75-1.14,8.44,8.44,0,0,0,.74-.56L168.89,152l47,21.05h0s.08,0,.11,0A40.21,40.21,0,0,1,176,208Z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-400">Phone</h3>
                                    <p className="text-gray-600 dark:text-gray-200">Mon-Fri from 8am to 5pm.</p>
                                    <a className="font-medium text-blue-500 hover:underline" href="tel:+15551234567">+1 (555) 123-4567</a>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-blue-100 dark:bg-[var(--primary-foreground)]  text-blue-500">
                                    <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M187.58,144.84l-32-16a8,8,0,0,0-8,.5l-14.69,9.8a40.55,40.55,0,0,1-16-16l9.8-14.69a8,8,0,0,0,.5-8l-16-32A8,8,0,0,0,104,64a40,40,0,0,0-40,40,88.1,88.1,0,0,0,88,88,40,40,0,0,0,40-40A8,8,0,0,0,187.58,144.84ZM152,176a72.08,72.08,0,0,1-72-72A24,24,0,0,1,99.29,80.46l11.48,23L101,118a8,8,0,0,0-.73,7.51,56.47,56.47,0,0,0,30.15,30.15A8,8,0,0,0,138,155l14.61-9.74,23,11.48A24,24,0,0,1,152,176ZM128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a87.87,87.87,0,0,1-44.06-11.81,8,8,0,0,0-6.54-.67L40,216,52.47,178.6a8,8,0,0,0-.66-6.54A88,88,0,1,1,128,216Z"></path>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-400">WhatsApp</h3>
                                    <p className="text-gray-600 dark:text-gray-200">Chat with us live for instant support.</p>
                                    <a className="font-medium text-blue-500 hover:underline" href="#">Start a chat</a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-[var(--primary-foreground)]  p-8 shadow-2xl lg:p-12">
                        <form action="#" className="space-y-6" method="POST">
                            <div>
                                <label className="sr-only" htmlFor="name">Your Name</label>
                                <input autoComplete="name" className="dark:shadow-[0_1px_3px_0_rgba(255,255,255,0.08)] form-input block w-full rounded-md border-gray-300  dark:border-[var(--primary-foreground)]  py-3 px-4 shadow-sm focus:border-blue-500 focus:ring-blue-500" id="name" name="name" placeholder="Your Name" type="text" />
                            </div>
                            <div>
                                <label className="sr-only" htmlFor="email">Your Email</label>
                                <input autoComplete="email" className=" dark:shadow-[0_1px_3px_0_rgba(255,255,255,0.08)] form-input block w-full rounded-md border-gray-300 py-3 px-4 shadow-sm focus:border-blue-500 focus:ring-blue-500" id="email" name="email" placeholder="Your Email" type="email" />
                            </div>
                            <div>
                                <label className="sr-only" htmlFor="message">Your Message</label>
                                <textarea className=" dark:shadow-[0_1px_3px_0_rgba(255,255,255,0.08)] form-textarea block w-full rounded-md border-gray-300 py-3 px-4 shadow-sm focus:border-blue-500 focus:ring-blue-500" id="message" name="message" placeholder="Your Message" rows={6}></textarea>
                            </div>
                            <div>
                                <button className="flex w-full justify-center rounded-md border border-transparent bg-blue-500 py-3 px-4 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer" type="submit">
                                    Send Message
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default GetInTouch;