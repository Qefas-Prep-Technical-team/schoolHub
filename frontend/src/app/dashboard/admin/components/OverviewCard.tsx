"use client";
import React from "react";

interface OverviewCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
}

const OverviewCard: React.FC<OverviewCardProps> = ({ title, value, subtitle }) => {
    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#101622] p-4 shadow-sm hover:shadow-md transition">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h4>
            <p className="text-2xl font-semibold text-gray-800 dark:text-gray-100">{value}</p>
            {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
        </div>
    );
};

export default OverviewCard;
