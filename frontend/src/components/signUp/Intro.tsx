import React, { FC } from 'react';

const Intro: FC = () => {
    return (
        <div>
            <div className="flex flex-wrap gap-3 p-4">
                <label
                    className="text-sm font-medium leading-normal flex items-center justify-center rounded-xl border border-[#dbe0e6] px-4 h-11 text-[#111418] has-[:checked]:border-[3px] has-[:checked]:px-3.5 has-[:checked]:border-[#3d98f4] relative cursor-pointer"
                >
                    🏫 School
                    <input type="radio" className="invisible absolute" name="bd23aca6-4272-4a9d-b194-ab02d7b956f7" />
                </label>
                <label
                    className="text-sm font-medium leading-normal flex items-center justify-center rounded-xl border border-[#dbe0e6] px-4 h-11 text-[#111418] has-[:checked]:border-[3px] has-[:checked]:px-3.5 has-[:checked]:border-[#3d98f4] relative cursor-pointer"
                >
                    👤 Individual
                    <input type="radio" className="invisible absolute" name="bd23aca6-4272-4a9d-b194-ab02d7b956f7" />
                </label>
                <label
                    className="text-sm font-medium leading-normal flex items-center justify-center rounded-xl border border-[#dbe0e6] px-4 h-11 text-[#111418] has-[:checked]:border-[3px] has-[:checked]:px-3.5 has-[:checked]:border-[#3d98f4] relative cursor-pointer"
                >
                    👩‍🏫 Teacher
                    <input type="radio" className="invisible absolute" name="bd23aca6-4272-4a9d-b194-ab02d7b956f7" />
                </label>
            </div>
            <p className="text-[#111418] text-base font-normal leading-normal pb-3 pt-1 px-4">Create an account for your institution to manage staff, students, and academic data.</p>
            <p className="text-[#111418] text-base font-normal leading-normal pb-3 pt-1 px-4">Sign up as a student or parent to stay updated with results and activities.</p>
            <p className="text-[#111418] text-base font-normal leading-normal pb-3 pt-1 px-4">Create an account to manage your classes and connect with schools.</p>
        </div>
    );
};

export default Intro;