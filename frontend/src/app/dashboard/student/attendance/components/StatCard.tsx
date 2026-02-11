// src/components/Dashboard/StatCard.tsx
import React from 'react';
import { StatCardData } from './types';

const StatCard: React.FC<StatCardData> = ({
    title,
    value,
    icon,
    iconColor,
    trend,
    description
}) => {
    return (
        <div className="flex flex-col gap-2 rounded-xl p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark shadow-sm">
            <div className="flex items-center gap-2 text-text-light-secondary dark:text-dark-secondary">
                <span className={`material-symbols-outlined ${iconColor}`}>
                    {icon}
                </span>
                <p className="text-sm font-medium">{title}</p>
            </div>
            <p className="text-text-light-primary dark:text-dark-primary text-4xl font-bold">
                {value}
            </p>
            {trend && (
                <p className={`${trend.color} text-sm font-medium`}>
                    {trend.isPositive ? '+' : ''}{trend.value} from last month
                </p>
            )}
            {description && (
                <p className="text-text-light-secondary dark:text-dark-secondary text-sm font-medium">
                    {description}
                </p>
            )}
        </div>
    );
};

export default StatCard;