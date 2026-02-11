"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const SegmentedControl = () => {
    const router = useRouter();
    const pathname = usePathname();

    const options = [
        { label: "This Month", route: "/dashboard/student/attendance/monthly-attendance/1" },
        { label: "Last Month", route: "/dashboard/student/attendance/monthly-attendance/2" },
        { label: "This Term", route: "/dashboard/student/attendance/term/1" },
    ];

    return (
        <div className="w-full flex justify-center">
            <div className="
        inline-flex items-center gap-1 
        p-1 rounded-xl 
        bg-card-light dark:bg-card-dark 
        border border-border-light dark:border-border-dark
      ">
                {options.map((option) => {
                    const isActive = pathname === option.route;

                    return (
                        <Link
                            key={option.route}
                            href={option.route}
                        >
                            <button
                                // onClick={() => router.push(option.route)}
                                className={`
                px-4 py-2 text-sm font-medium rounded-lg
                transition-all whitespace-nowrap cursor-pointer
                ${isActive
                                        ? "bg-primary text-white shadow"
                                        : "text-foreground hover:bg-muted"
                                    }
                                `}
                            >
                                {option.label}
                            </button>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default SegmentedControl;
