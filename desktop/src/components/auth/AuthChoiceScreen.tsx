import React from "react";
import { UserRole } from "../../services/AuthService";
import { ROLE_OPTIONS } from "./RoleSelector";
import { LogIn, UserPlus, RefreshCcw, ArrowRight } from "lucide-react";
import { getRoleTheme } from "../../theme/roleTheme";
import { AuthHeaderControls } from "./AuthHeaderControls";

interface AuthChoiceScreenProps {
  role: UserRole;
  onChangeRole: () => void;
  onChooseSignIn: () => void;
  onChooseRegister: () => void;
}

export const AuthChoiceScreen: React.FC<AuthChoiceScreenProps> = ({
  role,
  onChangeRole,
  onChooseSignIn,
  onChooseRegister,
}) => {
  const roleOption = ROLE_OPTIONS.find((r) => r.role === role) || ROLE_OPTIONS[0];
  const Icon = roleOption.icon;
  const roleTheme = getRoleTheme(role);

  return (
    <div className="w-full max-w-xl mx-auto py-8 px-4 space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* Top Header Card with Change Role Action */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-4 shadow-lg dark:shadow-xl">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-xl ${roleTheme.avatarBg} flex items-center justify-center shadow-md`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{roleOption.title} Portal</h3>
            <p className={`text-[10px] font-semibold uppercase tracking-wider ${roleTheme.activeNavText}`}>{roleTheme.label} Theme ({roleTheme.colorName})</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <AuthHeaderControls />
          <button
            onClick={onChangeRole}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 transition cursor-pointer"
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${roleTheme.activeNavIcon}`} />
            <span className="hidden sm:inline">Change Role</span>
          </button>
        </div>
      </div>

      {/* Hero Welcome Text */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome to {roleOption.title} Workspace</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Choose how you want to proceed with your authentication.</p>
      </div>

      {/* Choice Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* Sign In Choice */}
        <button
          onClick={onChooseSignIn}
          className={`group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 text-left shadow-lg dark:shadow-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition duration-300 cursor-pointer`}
        >
          <div className="space-y-4">
            <div className={`h-12 w-12 rounded-xl ${roleTheme.activeNavBg} border ${roleTheme.activeNavBorder} flex items-center justify-center ${roleTheme.activeNavIcon} shadow-md group-hover:scale-105 transition`}>
              <LogIn className="h-6 w-6" />
            </div>
            <div>
              <h3 className={`text-base font-bold text-slate-900 dark:text-slate-100 group-hover:${roleTheme.activeNavText} transition`}>
                Sign In
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Already have an account? Sign in with your email and password.
              </p>
            </div>
          </div>

          <div className={`mt-6 flex items-center text-xs font-semibold ${roleTheme.activeNavText} group-hover:translate-x-1 transition`}>
            <span>Proceed to Sign In</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </button>

        {/* Register Choice */}
        <button
          onClick={onChooseRegister}
          className={`group flex flex-col justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/80 p-6 text-left shadow-lg dark:shadow-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition duration-300 cursor-pointer`}
        >
          <div className="space-y-4">
            <div className={`h-12 w-12 rounded-xl ${roleTheme.activeNavBg} border ${roleTheme.activeNavBorder} flex items-center justify-center ${roleTheme.activeNavIcon} shadow-md group-hover:scale-105 transition`}>
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <h3 className={`text-base font-bold text-slate-900 dark:text-slate-100 group-hover:${roleTheme.activeNavText} transition`}>
                Register Account
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                New to QefasHub? Create your individual {roleOption.title} account.
              </p>
            </div>
          </div>

          <div className={`mt-6 flex items-center text-xs font-semibold ${roleTheme.activeNavText} group-hover:translate-x-1 transition`}>
            <span>Create New Account</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </div>
        </button>
      </div>
    </div>
  );
};
