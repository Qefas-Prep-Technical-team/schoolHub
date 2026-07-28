import React from "react";
import { Outlet } from "react-router-dom";
import { TitleBar } from "../components/titlebar/TitleBar";

export const AuthLayout: React.FC = () => {

  return (
    <div className="flex h-screen w-screen flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans relative transition-colors duration-300">
      <TitleBar />
      

      {/* Background Glowing Gradient Shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 dark:bg-indigo-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-emerald-500/10 dark:bg-emerald-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-[400px] h-[400px] rounded-full bg-violet-500/10 dark:bg-violet-600/15 blur-[100px] pointer-events-none" />
      
      <div className="flex-1 overflow-y-auto relative z-10">
        <Outlet />
      </div>
    </div>
  );
};
