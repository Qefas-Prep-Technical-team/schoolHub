'use client';

import { Users } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface AbsentStaff {
    id: string;
    name: string;
    department: string;
    leaveType: 'sick' | 'personal' | 'vacation' | 'unexcused' | 'other';
    imageUrl: string;
    notes?: string;
}

export default function AbsentStaffList() {
    const [staff] = useState<AbsentStaff[]>([
        {
            id: '1',
            name: 'Mr. Anderson',
            department: 'Mathematics Dept.',
            leaveType: 'sick',
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCy3EoI-nMTqa6J8BL8D19cdjQKfq2fecDiylNZp5xdVb3uBFF2RkrzIU__BVIwjGX1jwQxzDVnggxR99aQloh1IWCjOzgCPqt-I-o1tyeAg9e7FwPraWOgeh9nvmtc85P3tWfAbapNConIdcV3egS6oYvRtwjJLxtS_MEOil-0hSI8PAr5fVn3muuNs_3h9jjSr2nk_6ByP0E5bBozUgO0qhPf3iLZvandDh-z2lIoZDwO7ZmMoC1hbSiVfUe7g383rBlkYXIU7k0',
        },
        {
            id: '2',
            name: 'Ms. Davis',
            department: 'Science Dept.',
            leaveType: 'unexcused',
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuARWQO6EcB4srQApqesWj-urhWTuFSwSJIEnnf-Ccu8_PKZmGlPKVdKYvijbHW_lnLadd2gEtHJnliCWFRlBYVZzlD0wgXAZGxXCTb6tnucC4Yshn-KpiNFhHNt-kLsKjz_-atAi_lM8O_B7nfJZJEeZyMRh5q_mctobLkgsyt9eNqGQR67FOfw5sU1F13GIlFIrRh6GAdlq20aPDTp1ieQIcv4StxEoRjgWoOLJRxbbDk8hE4yMj-vauZOzbCrTITnfbU-b4aEsFM',
        },
        {
            id: '3',
            name: 'Mr. Roberts',
            department: 'History Dept.',
            leaveType: 'personal',
            imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBNUjnw6LH526XZ5ExD4CR2pcyVCsAj-SKNXxaugoC927CD6P1UbK2m2az0NAfypq8EU0wIz9YxqkM3W9QDJdsW_1Qlomt9MQjYuOJCVkk8XXgpjT9SeIqOjDsM2YanTh1VgoKxDDYA6uXHTiOmOMMhPkkDAG2mgU8YtTRBy6UjxIW5cDOW2Z3Rthv9prqccJVZ1ejCYiDkSKasjujVMd1GiZSIG-aJZaO79tOA3J7jJ20N8KIXNc_pKn4GEfNMToSP-wvj2XFiUPw',
        },
    ]);

    const getLeaveTypeConfig = (type: AbsentStaff['leaveType']) => {
        switch (type) {
            case 'sick':
                return {
                    color: 'text-yellow-700 dark:text-yellow-400',
                    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
                    label: 'Sick Leave',
                };
            case 'personal':
                return {
                    color: 'text-blue-700 dark:text-blue-400',
                    bg: 'bg-blue-100 dark:bg-blue-900/30',
                    label: 'Personal',
                };
            case 'vacation':
                return {
                    color: 'text-green-700 dark:text-green-400',
                    bg: 'bg-green-100 dark:bg-green-900/30',
                    label: 'Vacation',
                };
            case 'unexcused':
                return {
                    color: 'text-red-700 dark:text-red-400',
                    bg: 'bg-red-100 dark:bg-red-900/30',
                    label: 'Unexcused',
                };
            default:
                return {
                    color: 'text-gray-700 dark:text-gray-400',
                    bg: 'bg-gray-100 dark:bg-gray-900/30',
                    label: 'Other',
                };
        }
    };

    return (
        <div className="flex flex-col rounded-xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-5 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-text-primary-light dark:text-text-primary-dark text-base font-bold flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    Absent Staff Today
                </h3>
                <button className="text-primary text-xs font-bold hover:underline">
                    View All
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {staff.map((person) => {
                    const leaveConfig = getLeaveTypeConfig(person.leaveType);
                    return (
                        <div key={person.id} className="flex items-center gap-3">
                            {/* Profile Image */}
                            <div className="relative size-10 flex-shrink-0">
                                <Image
                                    src={person.imageUrl}
                                    alt={`Portrait of ${person.name}`}
                                    fill
                                    className="rounded-full object-cover"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark truncate">
                                    {person.name}
                                </p>
                                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">
                                    {person.department}
                                </p>
                                {person.notes && (
                                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                                        {person.notes}
                                    </p>
                                )}
                            </div>

                            {/* Leave Badge */}
                            <span className={`px-2 py-1 ${leaveConfig.bg} ${leaveConfig.color} text-xs font-medium rounded-lg whitespace-nowrap`}>
                                {leaveConfig.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t border-border-light dark:border-border-dark">
                <div className="flex items-center justify-between">
                    <div className="text-sm">
                        <span className="text-text-secondary-light dark:text-text-secondary-dark">
                            Total Absent:
                        </span>
                        <span className="font-bold text-text-primary-light dark:text-text-primary-dark ml-2">
                            {staff.length} staff members
                        </span>
                    </div>
                    <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                        Manage Substitutes
                    </button>
                </div>
            </div>
        </div>
    );
}