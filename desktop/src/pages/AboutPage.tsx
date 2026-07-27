import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { ShieldCheck, HardDrive, Cpu, Terminal } from "lucide-react";

export const AboutPage: React.FC = () => {
  const [appVersion, setAppVersion] = useState("1.0.0");

  useEffect(() => {
    try {
      invoke<string>("get_app_version").then(setAppVersion);
    } catch {
      // Fallback
    }
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">About QefasHub Desktop</h1>
        <p className="text-xs text-slate-400 mt-1">
          Technical specifications & system architecture info.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl">
            Q
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">QefasHub Desktop Client</h3>
            <p className="text-xs text-slate-400 font-mono">Version {appVersion} (Production Build)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-3 rounded-xl bg-slate-950 p-3 border border-slate-800">
            <Cpu className="h-5 w-5 text-indigo-400" />
            <div>
              <p className="font-semibold text-slate-200">Framework Engine</p>
              <p className="text-slate-500">Tauri v2 + Rust Core</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-950 p-3 border border-slate-800">
            <HardDrive className="h-5 w-5 text-emerald-400" />
            <div>
              <p className="font-semibold text-slate-200">Local Database</p>
              <p className="text-slate-500">SQLite 3 (tauri-plugin-sql)</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-950 p-3 border border-slate-800">
            <ShieldCheck className="h-5 w-5 text-blue-400" />
            <div>
              <p className="font-semibold text-slate-200">Offline Architecture</p>
              <p className="text-slate-500">UI → SQLite → Sync Engine → API</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl bg-slate-950 p-3 border border-slate-800">
            <Terminal className="h-5 w-5 text-amber-400" />
            <div>
              <p className="font-semibold text-slate-200">Conflict Resolver</p>
              <p className="text-slate-500">Last-Updated-Wins Engine</p>
            </div>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 pt-4 border-t border-slate-800">
          © 2026 Flexiti Studio. Built with Tauri v2, React, TypeScript, and SQLite.
        </div>
      </div>
    </div>
  );
};
