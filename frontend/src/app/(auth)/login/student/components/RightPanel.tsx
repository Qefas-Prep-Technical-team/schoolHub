"use client";

import StudentLoginForm from "./StudentLoginForm";
import TwoFactorForm from "../../components/TwoFactorForm";
import { useAuthStore } from "../../services/auth-store";

export default function RightPanel() {
    const user = useAuthStore((state) => state.user);
    
    return (
        <div className="w-full flex flex-col justify-center">
            <div className="w-full">
                <div className="text-center mb-6 sm:mb-8 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <div className="w-7 h-7 rounded-xl bg-rose-500 flex items-center justify-center text-white font-black text-xs shadow-md shadow-rose-500/30">
                            Q
                        </div>
                        <span className="text-base sm:text-lg font-black text-slate-800 dark:text-white tracking-tight">
                            Qefas Hub
                        </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        Student Portal
                    </h1>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                        Sign in to access your grades, assignments, timetable and learning portal
                    </p>
                </div>

                {user?.require2FA ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden mt-6">
                        <TwoFactorForm />
                    </div>
                ) : (
                    <StudentLoginForm />
                )}

                <div className="mt-8 sm:mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">
                        &ldquo;Empowering students for a brighter future.&rdquo;
                    </p>
                </div>
            </div>
        </div>
    );
}
