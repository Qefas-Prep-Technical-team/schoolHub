import * as React from 'react';
import Image from 'next/image';
import { mainTab } from '../Types/Nav';
import Link from 'next/link';
import { 
    LayoutDashboard, 
    Rocket, 
    Menu, 
    FileText, 
    CreditCard, 
    Info, 
    Shield, 
    LogIn, 
    Phone 
} from 'lucide-react';
import { useAuthStore } from '@/app/(auth)/login/services/auth-store';
import { useAuthModalStore } from '@/utils/AuthModalStore';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';

interface NavBarDrawerProps {
    pages: mainTab[];
}

export default function NavBarDrawer(props: NavBarDrawerProps) {
    const { isAuthenticated } = useAuthStore();
    const { openModal } = useAuthModalStore();
    const { pages } = props;
    const [open, setOpen] = React.useState(false);

    const handleIcon = (type: string) => {
        if (type === "Features") {
            return <FileText size={20} className="text-blue-500" />
        } else if (type === "Pricing") {
            return <CreditCard size={20} className="text-purple-500" />
        } else if (type === "About Us") {
            return <Info size={20} className="text-emerald-500" />
        } else {
            return <Shield size={20} className="text-orange-500" />
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button
                    aria-label="Open menu"
                    className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <Menu size={24} />
                </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[340px] p-0 bg-white/95 dark:bg-[#0a0f1e]/95 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-800/60 flex flex-col">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">Mobile navigation menu</SheetDescription>
                
                {/* Header Section */}
                <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-100 dark:border-slate-800/60">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white dark:bg-slate-900 shadow-lg shadow-blue-600/10 border border-slate-200 dark:border-slate-800 p-1.5 relative">
                        <Image src="/logo/favicon.svg" alt="Qefas Hub" fill className="object-contain p-1.5" />
                    </div>
                    <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-lexend">
                        Qefas <span className="text-blue-600">Hub</span>
                    </span>
                </div>
                
                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
                    {pages.map((page) => (
                        <Link 
                            key={page.name} 
                            href={page.href} 
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all font-medium group"
                        >
                            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 group-hover:bg-white dark:group-hover:bg-slate-800 shadow-sm border border-transparent dark:border-slate-800/50 transition-colors">
                                {handleIcon(page.name)}
                            </div>
                            {page.name}
                        </Link>
                    ))}

                    <div className="my-4 h-px w-full bg-slate-100 dark:bg-slate-800/60" />

                    {!isAuthenticated ? (
                        <>
                            <button 
                                onClick={() => { setOpen(false); openModal('login-role'); }}
                                className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all font-medium group w-full text-left"
                            >
                                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 group-hover:bg-white dark:group-hover:bg-slate-800 shadow-sm border border-transparent dark:border-slate-800/50 transition-colors text-slate-500 dark:text-slate-400">
                                    <LogIn size={20} />
                                </div>
                                Login
                            </button>
                            <Link 
                                href="/contact" 
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all font-medium group"
                            >
                                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 group-hover:bg-white dark:group-hover:bg-slate-800 shadow-sm border border-transparent dark:border-slate-800/50 transition-colors text-slate-500 dark:text-slate-400">
                                    <Phone size={20} />
                                </div>
                                Contact Us
                            </Link>
                        </>
                    ) : (
                        <Link 
                            href="/dashboard" 
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-4 px-4 py-3 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all font-medium group"
                        >
                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 shadow-sm transition-colors text-blue-600 dark:text-blue-400">
                                <LayoutDashboard size={20} />
                            </div>
                            Dashboard
                        </Link>
                    )}
                </div>

                {/* Footer / CTA Section */}
                <div className="p-6 mt-auto border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#0a0f1e]">
                    {!isAuthenticated && (
                        <button 
                            onClick={() => { setOpen(false); openModal('signup-role'); }}
                            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            <Rocket size={20} />
                            Get Started
                        </button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
