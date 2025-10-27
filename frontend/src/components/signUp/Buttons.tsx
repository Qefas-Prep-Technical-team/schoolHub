'use client';
import React, { FC, useState } from 'react';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import CastForEducationIcon from '@mui/icons-material/CastForEducation';
import { useRouter } from 'next/navigation'; // ✅ App Router
import Link from 'next/link';


const Buttons: FC = () => {
    const [activeRole, setActiveRole] = useState<'school' | 'individual' | 'teacher' | null>(null);
    const router = useRouter();
    const roles = [
        { key: 'school', icon: <SchoolIcon fontSize="large" />, label: 'School' },
        { key: 'individual', icon: <PersonIcon fontSize="large" />, label: 'Individual' },
        { key: 'teacher', icon: <CastForEducationIcon fontSize="large" />, label: 'Teacher' },
    ] as const;

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {roles.map(({ key, icon, label }) => (
                    <label key={key} className="relative cursor-pointer group">
                        <input
                            type="radio"
                            name="role"
                            className="sr-only peer"
                            onChange={() => setActiveRole(key)}
                            checked={activeRole === key}
                        />
                        <div
                            className={`
                flex flex-col items-center justify-center p-6 border rounded-xl text-center transition-all duration-300
                peer-checked:bg-blue-100 peer-checked:border-blue-500 peer-checked:text-blue-700
                border-gray-300 hover:bg-blue-50
                hover:border-blue-400 hover:text-blue-600
              `}
                        >
                            <div className="text-gray-500 peer-checked:text-blue-600 mb-2">
                                {icon}
                            </div>
                            <span className="font-medium text-sm">{label}</span>
                        </div>
                    </label>
                ))}
            </div>
            <button
                type="button"
                className=" cursor-pointer w-full py-3 rounded-xl text-white font-bold text-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled={!activeRole}
                onClick={() => {
                    if (activeRole) {
                        router.push(`/signup/${activeRole}`);
                    }
                }}
            >
                Continue
            </button>

        </div>
    );
};

export default Buttons;
