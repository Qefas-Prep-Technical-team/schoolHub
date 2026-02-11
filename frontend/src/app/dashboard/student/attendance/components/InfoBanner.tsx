// src/components/Dashboard/InfoBanner.tsx
import React from 'react';
import Button from './ui/Button';

const InfoBanner: React.FC = () => {
    return (
        <div className="p-1 mb-6">
            <div className="flex w-full items-center justify-between gap-4 rounded-xl bg-primary/10 dark:bg-primary/20 p-4">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">info</span>
                    <p className="text-text-light-primary dark:text-dark-primary text-sm font-normal">
                        Your attendance affects your overall academic performance score.
                    </p>
                </div>
                <Button size="sm" variant="primary">
                    Learn More
                </Button>
            </div>
        </div>
    );
};

export default InfoBanner;