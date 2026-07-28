import React from "react";
import { UserRole } from "../../services/AuthService";
import { ShieldCheck, GraduationCap, User, Users } from "lucide-react";

interface RoleOption {
  role: UserRole;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeColor: string;
}

export const ROLE_OPTIONS: RoleOption[] = [
  {
    role: "ADMIN",
    title: "School Admin",
    description: "Oversee entire school operations, staff, and analytics.",
    icon: ShieldCheck,
    badgeColor: "from-blue-600 to-indigo-600 text-white",
  },
  {
    role: "TEACHER",
    title: "Teacher",
    description: "Manage classes, assignments, grades, and student progress.",
    icon: GraduationCap,
    badgeColor: "from-emerald-600 to-teal-600 text-white",
  },
  {
    role: "STUDENT",
    title: "Student",
    description: "Access courses, submit assignments, and track performance.",
    icon: User,
    badgeColor: "from-pink-600 to-rose-500 text-white",
  },
  {
    role: "PARENT",
    title: "Parent",
    description: "Stay updated on your child's academic journey and news.",
    icon: Users,
    badgeColor: "from-orange-600 to-amber-500 text-white",
  },
];

interface RoleSelectorProps {
  selectedRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onSelectRole }) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
      {ROLE_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const isSelected = selectedRole === opt.role;
        return (
          <button
            type="button"
            key={opt.role}
            onClick={() => onSelectRole(opt.role)}
            className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
              isSelected
                ? "border-indigo-500 bg-indigo-950/40 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500"
                : "border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900"
            }`}
          >
            <div
              className={`h-8 w-8 rounded-lg bg-gradient-to-tr ${opt.badgeColor} flex items-center justify-center mb-2 shadow-md`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <h4 className="text-xs font-bold text-slate-100">{opt.title}</h4>
            <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">{opt.description}</p>
          </button>
        );
      })}
    </div>
  );
};
