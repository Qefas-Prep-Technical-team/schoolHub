import Box from '@mui/material/Box';
import React, { FC } from 'react';

const HeroHead: FC = () => {
    return (
        <Box component={"div"} className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-amber-50 leading-tight">Explore SchoolHub&#39;s Powerful Modules</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-amber-50">A comprehensive suite of tools designed to streamline every aspect of school management, making education more efficient and effective for everyone involved.</p>
        </Box>
    );
};
export default HeroHead;