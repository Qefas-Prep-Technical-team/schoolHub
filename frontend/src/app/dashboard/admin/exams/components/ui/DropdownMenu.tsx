'use client';

import { MoreVertical } from 'lucide-react';
import Link from 'next/link';
import {
    DropdownMenu as ShadcnDropdown,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

interface DropdownItem {
    label: string;
    onClick?: () => void;
    href?: string;
    destructive?: boolean;
}

interface DropdownMenuProps {
    items: DropdownItem[];
}

export default function DropdownMenu({ items }: DropdownMenuProps) {
    return (
        <ShadcnDropdown>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    aria-label="Actions"
                >
                    <MoreVertical size={18} />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent 
                align="end" 
                side="bottom"
                sideOffset={6}
                className="w-36 p-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-[999]"
                onClick={(e) => e.stopPropagation()}
            >
                {items.map((item, index) => {
                    const itemClass = `flex items-center w-full px-3 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors outline-none select-none ${
                        item.destructive
                            ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 focus:bg-rose-50 dark:focus:bg-rose-950/40 focus:text-rose-700'
                            : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 focus:bg-slate-100 dark:focus:bg-slate-800/80'
                    }`;

                    if (item.href) {
                        return (
                            <DropdownMenuItem key={index} asChild className="p-0">
                                <Link
                                    href={item.href}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (item.onClick) item.onClick();
                                    }}
                                    className={itemClass}
                                >
                                    {item.label}
                                </Link>
                            </DropdownMenuItem>
                        );
                    }

                    return (
                        <DropdownMenuItem
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (item.onClick) item.onClick();
                            }}
                            className={itemClass}
                        >
                            {item.label}
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </ShadcnDropdown>
    );
}