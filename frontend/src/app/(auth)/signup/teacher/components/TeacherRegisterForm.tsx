"use client";

import TeacherRegisterInput from "./TeacherRegisterInput";
import TeacherRegisterDivider from "./TeacherRegisterDivider";
import { useState } from "react";

export default function TeacherRegisterForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form className="space-y-4">
      <TeacherRegisterInput label="Full Name" placeholder="Enter your full name" />
      <TeacherRegisterInput label="Email" type="email" placeholder="Enter your email address" />

      {/* Password */}
      <label className="flex flex-col">
        <span className="text-sm font-medium pb-2 text-slate-700 dark:text-slate-300">
          Password
        </span>
        <div className="relative flex items-center">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            className="form-input w-full rounded-lg border-slate-300 dark:border-slate-700 
            bg-slate-50 dark:bg-slate-800 h-12 px-4 text-slate-800 dark:text-white 
            placeholder:text-slate-400 dark:placeholder:text-slate-500 
            focus:border-primary focus:ring-primary/50"
          />
          <span
            className="material-symbols-outlined absolute right-3 text-slate-400 dark:text-slate-500 cursor-pointer"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "visibility" : "visibility_off"}
          </span>
        </div>
      </label>

      <TeacherRegisterInput
        label="Confirm Password"
        type="password"
        placeholder="Confirm your password"
      />

      <TeacherRegisterDivider />

      {/* Tenant ID */}
      <label className="flex flex-col">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium pb-2 text-slate-700 dark:text-slate-300">
            Tenant ID (Optional)
          </span>
          <div className="relative group">
            <span className="material-symbols-outlined text-slate-400 dark:text-slate-500 cursor-pointer text-base">
              help_outline
            </span>
            <div className="absolute bottom-full mb-2 w-48 bg-slate-800 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              This ID connects you to your school`&apos;`s portal. Ask your administrator for it.
            </div>
          </div>
        </div>
        <input
          type="text"
          placeholder="Enter your school's Tenant ID"
          className="form-input w-full rounded-lg border-slate-300 dark:border-slate-700 
          bg-slate-50 dark:bg-slate-800 h-12 px-4 text-slate-800 dark:text-white 
          placeholder:text-slate-400 dark:placeholder:text-slate-500 
          focus:border-primary focus:ring-primary/50"
        />
      </label>

      <div className="flex items-center">
        <input
          id="independent-teacher-checkbox"
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 
          bg-slate-50 dark:bg-slate-800 text-primary focus:ring-primary/50"
        />
        <label
          htmlFor="independent-teacher-checkbox"
          className="ml-2 block text-sm text-slate-700 dark:text-slate-300"
        >
          I want to create an independent teaching account
        </label>
      </div>

      <button className="w-full h-12 mt-6 rounded-lg bg-accent hover:bg-accent/90 text-white font-bold text-base transition-colors">
        Sign Up as Teacher
      </button>

      <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-4">
        Already have an account?
        <a href="#" className="font-medium text-primary hover:underline">
          {" "}
          Log in
        </a>
      </p>
    </form>
  );
}
