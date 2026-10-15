"use client";
import ParentLoginForm from "./ParentLoginForm";
import TwoFactorForm from "../../components/TwoFactorForm";
import { useAuthStore } from "../../services/auth-store";
import { HeaderTooltip } from "@/app/dashboard/parent/components/dashboard/HeaderTooltip";

export default function RightPanel() {
    const user = useAuthStore((state) => state.user);
    
    return (
        <div className="flex-1 flex flex-col justify-center p-0 sm:p-2">
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8 sm:mb-10 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-6 sm:mb-8">
                        <div className="w-5 h-5 rounded-sm bg-orange-500"></div>
                        <span className="text-base sm:text-lg font-bold text-slate-800 dark:text-white">qefas hub</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Parent Portal
                        </h1>
                        <HeaderTooltip
                            content="Welcome to the Parent Portal. Sign in using your registered parent email address or linked social accounts to access real-time attendance tracking, published exam grades, teacher feedback, and direct school communication for all your enrolled children."
                            size={18}
                            side="bottom"
                        />
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">
                        Access student grades, attendance, and school updates
                    </p>
                </div>

                {user?.require2FA ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden mt-6">
                        <TwoFactorForm />
                    </div>
                ) : (
                    <ParentLoginForm />
                )}

                <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] italic text-center">
                        &ldquo;Engaging parents in their child's success.&rdquo;
                    </p>
                </div>
            </div>
        </div>
    );
}
