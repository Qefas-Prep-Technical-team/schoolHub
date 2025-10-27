

import Buttons from '@/components/signUp/Buttons';
import GetStartedRoleSelect from '@/components/signUp/GetStartedRoleSelect';
import HeroSection from '@/components/signUp/HeroSection';
import React, { FC } from 'react';

const page: FC = () => {
    return (
        <div className=" mx-auto px-4 py-12">
            <HeroSection />
           <GetStartedRoleSelect/>
           <div className="flex flex-col items-center gap-4 mt-8 px-4">
<p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal text-center underline hover:text-primary dark:hover:text-primary transition-colors">Already have an account? Login</p>
<p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal text-center underline hover:text-primary dark:hover:text-primary transition-colors">Terms of service and privacy policy</p>
</div>
        </div>
    );
};

export default page;