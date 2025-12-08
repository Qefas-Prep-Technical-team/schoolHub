// src/components/Header/Header.tsx
import React from 'react';
import Button from './ui/Button';

const Header: React.FC = () => {
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-col gap-2">
                <p className="text-3xl font-black leading-tight tracking-[-0.033em] text-[#0e121b] dark:text-white">
                    Class Position
                </p>
                <p className="text-sm font-normal leading-normal text-[#506795] dark:text-gray-400">
                    Dashboard → Results → Class Position
                </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <Button variant="outline" icon="expand_more">
                    Term: 1st Term
                </Button>
                <Button variant="outline" icon="expand_more">
                    Session: 2023/2024
                </Button>
                <div className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary px-4">
                    <p className="text-sm font-bold leading-normal">
                        Position: 7th <span className="font-medium opacity-80">out of 42 students</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Header;