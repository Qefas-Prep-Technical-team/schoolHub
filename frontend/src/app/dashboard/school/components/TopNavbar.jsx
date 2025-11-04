"use client";
import React from "react";

const TopNavbar = () => {
    return (
        <header className="flex items-center justify-between whitespace-nowrap border-b border-[#E0E0E0] dark:border-gray-700 bg-white dark:bg-[#101622] px-6 py-3 sticky top-0 z-10">
            <div className="flex flex-1">
                <label className="flex flex-col w-full !h-10 max-w-sm">
                    <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                        <div className="text-gray-500 dark:text-gray-400 flex bg-background-light dark:bg-background-dark items-center justify-center pl-3 rounded-l-lg border-y border-l border-[#E0E0E0] dark:border-gray-700">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-gray-800 dark:text-gray-200 bg-background-light dark:bg-background-dark focus:outline-0 focus:ring-0 border-y border-r border-[#E0E0E0] dark:border-gray-700 h-full placeholder:text-gray-500 dark:placeholder:text-gray-400 px-4 text-sm font-normal"
                            placeholder="Search students, teachers..."
                        />
                    </div>
                </label>
            </div>

            <div className="flex items-center gap-4">
                <button className="flex cursor-pointer items-center justify-center rounded-full h-10 w-10 bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10">
                    <span className="material-symbols-outlined text-2xl">
                        notifications
                    </span>
                </button>
                <div className="flex items-center gap-3">
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
                        style={{
                            backgroundImage:
                                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD6Y3jzPw86-8p54CZLM4G-P14-3AXxl9w-OR6DbzSPx-B8lWjpuVGpYGvdU_SjOv0OVndNfr2r_OvYLJ6zLPVLReTpp10srUxjn92I-WTfiH2qBkKi_PlPSX8R2ZwQ3AF37nSxOJfiHbG7ZOhXDrLbf-rIHX32rO31LFt2woJMwwx8vvsV2hZbMEaVA_t-tQjdp0pCoNIla1lgxeo1cjfvhZfA9aL1G48nfVwKTWdlsQQacAlbKT9e2_53pfjjDijJj1uq2MFtM70')",
                        }}
                    />
                    <div className="flex flex-col text-right">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            Admin User
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            System Administrator
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopNavbar;
