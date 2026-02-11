// src/components/Header/PageHeader.tsx
import React from 'react';
import Button from './ui/Button';
import Breadcrumbs from './Breadcrumbs';

const PageHeader: React.FC = () => {
    return (
        <header className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-3xl font-bold tracking-tight">
                    Exam Preview: Algebra Fundamentals
                </p>

            </div>
            <Breadcrumbs />
        </header>
    );
};

export default PageHeader;