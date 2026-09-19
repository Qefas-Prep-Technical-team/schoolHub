"use client";
import StudentLoginForm from "./StudentLoginForm";
import TwoFactorForm from "../../components/TwoFactorForm";
import { useAuthStore } from "../../services/auth-store";

export default function RightPanel() {
    const user = useAuthStore((state) => state.user);
    
    return (
        <div className="flex-1 flex flex-col justify-center p-8 sm:p-10 lg:p-12">
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-10 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="w-5 h-5 rounded-sm bg-rose-500"></div>
                        <span className="text-lg font-bold text-slate-800 dark:text-white">qefas hub</span>
                    </div>
                    <h1 className="text-4xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                        Student Portal
                    </h1>
                </div>

                {user?.require2FA ? (
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden mt-6">
                        <TwoFactorForm />
                    </div>
                ) : (
                    <StudentLoginForm />
                )}

                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] italic">
                        &ldquo;Empowering students for a brighter future.&rdquo;
                    </p>
                </div>
            </div>
        </div>
    );
}
