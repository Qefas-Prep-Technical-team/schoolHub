import { LucideIcon, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface KPICardProps {
    title: string;
    value: string;
    subtitle?: string;
    icon: LucideIcon;
    iconColor: string;
    iconBg: string;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    progress?: number;
    progressColor?: string;
    showProgress: boolean;
    warning?: boolean;
    link?: {
        label: string;
        href: string;
    };
}

export default function KPICard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColor,
    iconBg,
    trend,
    progress = 0,
    progressColor = 'bg-primary',
    showProgress,
    warning = false,
    link,
}: KPICardProps) {
    // Map traditional colors to console style classes if needed, 
    // but here we will mostly rely on the passed iconColor for the icon itself.
    
    return (
        <div className={cn(
            "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all shadow-sm relative overflow-hidden group",
            warning && "ring-1 ring-primary/20"
        )}>
            {/* Background Decorative Icon */}
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all pointer-events-none">
                <Icon size={100} className="text-slate-500" />
            </div>

            <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", iconBg)}>
                        <Icon size={20} className={iconColor} />
                    </div>
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-tighter",
                            trend.isPositive 
                                ? "bg-emerald-500/10 text-emerald-600" 
                                : "bg-red-500/10 text-red-600"
                        )}>
                            {trend.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                            {trend.value}
                        </div>
                    )}
                </div>

                <div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {value}
                        </h3>
                        {subtitle && (
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                {subtitle}
                            </span>
                        )}
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.15em] mt-1">
                        {title}
                    </p>
                </div>

                {showProgress && (
                    <div className="space-y-1.5">
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div 
                                className={cn("h-full transition-all duration-1000", progressColor)}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                            {progress}% OF CAPACITY
                        </p>
                    </div>
                )}

                {link && (
                    <Link 
                        href={link.href}
                        className="flex items-center gap-2 text-[10px] font-black text-primary dark:text-primary uppercase tracking-widest hover:gap-3 transition-all pt-2"
                    >
                        {link.label}
                        <ArrowRight size={12} />
                    </Link>
                )}
            </div>
        </div>
    );
}

