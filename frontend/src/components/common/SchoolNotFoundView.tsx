"use client";

import React from "react";
import Link from "next/link";
import { 
  Building, 
  School, 
  ArrowLeft, 
  Home, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink,
  Sparkles,
  HelpCircle
} from "lucide-react";

interface SchoolNotFoundViewProps {
  subdomain?: string | null;
  customPath?: string | null;
  type?: "school_not_found" | "page_not_found_on_school";
  schoolName?: string;
}

export default function SchoolNotFoundView({
  subdomain,
  customPath,
  type = "school_not_found",
  schoolName,
}: SchoolNotFoundViewProps) {
  // Determine apex home URL (supports both localhost and production)
  const getApexHomeUrl = () => {
    if (typeof window === "undefined") {
      return process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
    }

    const { protocol, host, port } = window.location;
    if (host.includes("localhost") || host.includes("127.0.0.1") || host.includes("lvh.me")) {
      return `${protocol}//localhost${port ? `:${port}` : ""}`;
    }

    // For production / staging apex domain
    const parts = host.split(".");
    if (parts.length > 2) {
      parts.shift(); // remove subdomain
      return `${protocol}//${parts.join(".")}`;
    }

    return `${protocol}//${host}`;
  };

  const apexHomeUrl = getApexHomeUrl();
  const apexRegisterUrl = `${apexHomeUrl}/signup/school`;

  const isSchoolNotFound = type === "school_not_found";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-slate-950 font-sans relative overflow-hidden select-none">
      {/* Background ambient radial gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-orange-500/10 via-amber-500/10 to-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-red-600/10 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-xl w-full text-center space-y-6">
        
        {/* Animated Icon Badge */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl bg-orange-500/20 blur-2xl animate-pulse" />
            <div className="size-20 sm:size-24 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-center text-orange-500 relative z-10">
              {isSchoolNotFound ? (
                <Building size={42} className="stroke-[1.75]" />
              ) : (
                <School size={42} className="stroke-[1.75]" />
              )}
            </div>
          </div>
        </div>

        {/* Status Tag */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-black uppercase tracking-wider">
          <AlertCircle size={14} />
          <span>{isSchoolNotFound ? "Institution Subdomain Unresolved" : "School Route 404"}</span>
        </div>

        {/* Headings */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            {isSchoolNotFound
              ? "School Institution Not Found"
              : `Page Not Found on ${schoolName || "School Portal"}`}
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-lg mx-auto">
            {isSchoolNotFound ? (
              <>
                The school subdomain{" "}
                <span className="font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md">
                  {subdomain || "unknown-subdomain"}
                </span>{" "}
                could not be located on the Qefas Hub network. It may have been renamed, deactivated, or misspelled.
              </>
            ) : (
              <>
                The page{" "}
                <span className="font-mono font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md">
                  {customPath || "unknown-path"}
                </span>{" "}
                does not exist on {schoolName || "this school's website"}.
              </>
            )}
          </p>
        </div>

        {/* Helpful Diagnostic Cards */}
        {isSchoolNotFound && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm space-y-1.5">
              <div className="flex items-center gap-1.5 text-orange-400 text-xs font-bold uppercase tracking-wider">
                <Search size={13} />
                <span>Verify Spelling</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Confirm your institution&apos;s exact code (e.g. <span className="font-mono text-slate-300">kingscollege</span>).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm space-y-1.5">
              <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <CheckCircle2 size={13} />
                <span>Student / Staff</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Log in via the central portal and connect your student or teacher profile directly.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles size={13} />
                <span>Register School</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                New school? Register your institution and claim a custom branded subdomain.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft size={15} />
            <span>Go Back</span>
          </button>

          <a
            href={apexHomeUrl}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-black shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Home size={15} />
            <span>Go to Qefas Hub Home</span>
          </a>

          {isSchoolNotFound && (
            <a
              href={apexRegisterUrl}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 border border-orange-500/30 text-orange-400 hover:bg-orange-500/10 text-xs font-bold flex items-center justify-center gap-2 transition-all"
            >
              <span>Register School</span>
              <ExternalLink size={13} />
            </a>
          )}
        </div>

        {/* Footer Brand Credit */}
        <p className="text-[11px] text-slate-600 pt-6 uppercase tracking-widest font-semibold">
          Qefas Hub Academic Network • Multi-Tenant Enterprise Architecture
        </p>
      </div>
    </div>
  );
}
