'use client';
import { Divider } from '@mui/material';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useState } from 'react';

export default function GetStartedRoleSelect() {
  const [selected, setSelected] = useState<'school' | 'teacher' | 'student' | 'parent' | null>(null);
  const { theme } = useTheme();

  const roles = [
    {
      key: 'school',
      icon: 'school',
      title: 'School',
      description: 'Manage school, staff, and students',
    },
    {
      key: 'teacher',
      icon: 'menu_book',
      title: 'Teacher',
      description: 'Manage classes, assignments, and communicate with students and parents',
    },
    {
      key: 'student',
      icon: 'backpack',
      title: 'Student',
      description: 'Access class materials, submit assignments, and check grades',
    },
    {
      key: 'parent',
      icon: 'groups',
      title: 'Parent',
      description: "Monitor your child's progress, communicate with teachers, and stay informed",
    },
  ];

  return (
    <div className="mb-20 w-full">
      <div className="flex flex-row flex-wrap justify-center gap-6 p-4 overflow-x-auto">
        {roles.map((role) => (
          <Link
          href={`/signup/${role.key}`}
            key={role.key}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={() => setSelected(role.key as any)}
            className={`flex flex-col min-w-[150px] max-w-[200px] 
              gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 
              bg-white dark:bg-slate-900 p-8 text-center items-center 
              hover:shadow-2xl hover:border-primary/50 dark:hover:border-primary/50 
              transition-all duration-300 cursor-pointer flex-shrink-0
              ${selected === role.key ? 'border-primary bg-primary/5 shadow-lg' : ''}
            `}
          >
            <div className="text-primary">
              <span className="material-symbols-outlined text-5xl">{role.icon}</span>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="text-slate-900 dark:text-white text-xl font-bold leading-tight">
                {role.title}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-normal leading-normal">
                {role.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
