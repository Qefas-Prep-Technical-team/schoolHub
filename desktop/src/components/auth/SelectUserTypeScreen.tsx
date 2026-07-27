import React from "react";
import { UserRole } from "../../services/AuthService";
import { ROLE_OPTIONS } from "./RoleSelector";
import { ArrowRight, Shield } from "lucide-react";
import { AuthHeaderControls } from "./AuthHeaderControls";

interface SelectUserTypeScreenProps {
  onSelectRole: (role: UserRole) => void;
}

export const SelectUserTypeScreen: React.FC<SelectUserTypeScreenProps> = ({ onSelectRole }) => {
  return (
    <div className="w-full max-w-4xl mx-auto py-12 px-4 space-y-8 animate-in fade-in duration-500 relative">
      <div className="absolute top-0 right-4">
        <AuthHeaderControls />
      </div>
      {/* Hero Header */}
      <div className="text-center space-y-3 pt-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800/60 px-4 py-1.5 text-xs text-indigo-700 dark:text-indigo-300 font-semibold shadow-sm">
          <Shield className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>SchoolHub Desktop Ecosystem</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Select Your User Portal
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          Choose your account type to proceed. Your choice will be saved automatically until you change it.
        </p>
      </div>

      {/* Role Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ROLE_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.role}
              onClick={() => onSelectRole(opt.role)}
              className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white/90 dark:bg-slate-900/80 p-6 text-left shadow-lg dark:shadow-xl hover:border-indigo-500/60 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
            >
              <div className="space-y-4">
                <div
                  className={`h-12 w-12 rounded-xl bg-gradient-to-tr ${opt.badgeColor} flex items-center justify-center shadow-lg group-hover:scale-105 transition`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition">
                    {opt.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition">
                <span>Continue</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
