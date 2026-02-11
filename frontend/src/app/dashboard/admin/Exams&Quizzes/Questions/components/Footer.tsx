import React from 'react';
import FooterActions from './FooterActions'; // keep same-case filename
// if your tooling still complains, try './FooterActions.tsx' temporarily

const Footer: React.FC = () => {
    return (
        <footer className="fixed bottom-0 left-0 right-0 z-10">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
                    <FooterActions />
                </div>
            </div>
        </footer>
    );
};

export default Footer;