import LogoTitle from "./components/LogoTitle";
import VerificationCard from "./components/VerificationCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Email Address | QefasHub",
  description: "Enter your 6-digit confirmation code to verify your QefasHub account.",
};

const getGlowColors = (type?: string) => {
  switch (type?.toUpperCase()) {
    case 'STUDENT': return 'from-pink-500/10 via-rose-500/10 to-transparent';
    case 'TEACHER': return 'from-emerald-500/10 via-green-500/10 to-transparent';
    case 'PARENT': return 'from-orange-500/10 via-amber-500/10 to-transparent';
    default: return 'from-indigo-500/10 via-blue-500/10 to-transparent';
  }
};

const getSecondaryGlowColors = (type?: string) => {
  switch (type?.toUpperCase()) {
    case 'STUDENT': return 'from-fuchsia-500/10 via-pink-500/10 to-transparent';
    case 'TEACHER': return 'from-teal-500/10 via-emerald-500/10 to-transparent';
    case 'PARENT': return 'from-amber-500/10 via-yellow-500/10 to-transparent';
    default: return 'from-violet-500/10 via-purple-500/10 to-transparent';
  }
};

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const userType = params.userType as string;

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30 overflow-hidden font-sans transition-colors duration-500">
      {/* Background Ambient Glow Lights */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className={`absolute -top-[15%] -left-[15%] w-[50%] h-[50%] bg-gradient-to-br ${getGlowColors(userType)} rounded-full blur-[140px] animate-pulse`} />
        <div className={`absolute top-[30%] -right-[15%] w-[45%] h-[45%] bg-gradient-to-tl ${getSecondaryGlowColors(userType)} rounded-full blur-[140px] animate-pulse delay-1000`} />
      </div>

      <div className="w-full max-w-lg space-y-6 z-10 animate-in fade-in zoom-in-95 duration-500">
        <LogoTitle />
        <VerificationCard />
      </div>
    </div>
  );
}
