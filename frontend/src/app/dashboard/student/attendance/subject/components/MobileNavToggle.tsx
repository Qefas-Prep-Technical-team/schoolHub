// src/components/Header/MobileNavToggle.tsx
import React from 'react';

const MobileNavToggle: React.FC = () => {
    return (
        <button className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
            <span className="material-symbols-outlined">menu</span>
        </button>
    );
};

export default MobileNavToggle;