import { adminRoleOptions } from "@/lib/constants/adminOptions";
import { useState } from "react";


export default function LoginForm() {
  const [selectedRole, setSelectedRole] = useState('');

  const getBadgeColor = (roleValue: string) => {
    const role = adminRoleOptions.find(r => r.value === roleValue);
    return role?.badgeColor || 'gray';
  };

  return (
    <form className="space-y-6">
      <div>
        <label className="flex flex-col">
          <p className="text-sm font-medium text-[#525F7F] dark:text-gray-300 pb-2">
            Email Address
          </p>
          <input
            type="email"
            placeholder="Enter your email address"
            className="flex w-full rounded-lg border border-[#CFD8E3] dark:border-gray-600 bg-white dark:bg-[#101622] text-[#0A2540] dark:text-white h-12 px-4 focus:border-[#6B7FD7] focus:ring-2 focus:ring-[#6B7FD7]/30 outline-none transition-colors duration-200"
          />
        </label>
      </div>

      <div>
        <label className="flex flex-col">
          <p className="text-sm font-medium text-[#525F7F] dark:text-gray-300 pb-2">
            Role Type
          </p>

          {/* Select dropdown */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="flex w-full rounded-lg border border-[#CFD8E3] dark:border-gray-600 bg-white dark:bg-[#101622] text-[#0A2540] dark:text-white h-12 px-4 focus:border-[#6B7FD7] focus:ring-2 focus:ring-[#6B7FD7]/30 outline-none transition-colors duration-200"
          >
            <option value="">Select a role</option>
            {adminRoleOptions.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </label>

        {/* Blinking badge that appears below the select */}
        {selectedRole && (
          <div className="mt-3 flex items-center space-x-2 animate-fade-in">
            <div className={`w-3 h-3 rounded-full bg-${getBadgeColor(selectedRole)}-500 animate-pulse`}></div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${getBadgeColor(selectedRole)}-100 text-${getBadgeColor(selectedRole)}-800 dark:bg-${getBadgeColor(selectedRole)}-900 dark:text-${getBadgeColor(selectedRole)}-300 border border-${getBadgeColor(selectedRole)}-200 dark:border-${getBadgeColor(selectedRole)}-700`}>
              {adminRoleOptions.find(role => role.value === selectedRole)?.label}
            </span>
          </div>
        )}
      </div>
      <div>
        <label className="flex flex-col">
          <div className="flex justify-between items-baseline">
            <p className="text-sm font-medium text-[#525F7F] dark:text-gray-300 pb-2">
              Password
            </p>
            <a
              href="#"
              className="text-sm font-medium text-[#6B7FD7] hover:text-[#0A2540] dark:hover:text-blue-400 transition-colors duration-200"
            >
              Forgot Password?
            </a>
          </div>

          <div className="relative flex w-full items-stretch">
            <input
              type="password"
              placeholder="Enter your password"
              className="flex w-full rounded-lg border border-[#CFD8E3] dark:border-gray-600 bg-white dark:bg-[#101622] text-[#0A2540] dark:text-white h-12 pl-4 pr-12 focus:border-[#6B7FD7] focus:ring-2 focus:ring-[#6B7FD7]/30 outline-none transition-colors duration-200"
            />
            <button
              type="button"
              aria-label="Toggle password visibility"
              className="absolute inset-y-0 right-0 flex items-center justify-center pr-4 text-gray-500 dark:text-gray-400 hover:text-[#0A2540] dark:hover:text-white"
            >
              <span className="material-symbols-outlined text-xl">
                visibility
              </span>
            </button>
          </div>
        </label>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="flex h-12 w-full items-center justify-center rounded-lg bg-[#0A2540] text-base font-semibold text-white shadow-sm transition-all duration-200 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A2540] dark:focus:ring-offset-[#1C2431]"
        >
          Login as Admin
        </button>
      </div>
    </form>
  );
}
