// src/components/Header/Header.tsx
import React from 'react';
import Breadcrumbs from './Breadcrumbs';
import Button from "./ui/Button"


const Header: React.FC = () => {
    return (
        <div className="flex flex-col gap-4">
            <Breadcrumbs />
            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-slate-900 dark:text-white text-3xl font-bold leading-tight tracking-tight min-w-72">
                    Average Score
                </p>
                <div className="flex flex-wrap items-center gap-3">
                    <Button variant="outline" icon="expand_more">
                        2023/2024 - Term 2
                    </Button>
                    <Button variant="primary" icon="download">
                        Download Report
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Header;