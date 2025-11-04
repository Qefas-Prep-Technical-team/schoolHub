"use client";
import HeaderSection from "./components/HeaderSection";
import RoleGrid from "./components/RoleGrid";
import SupportText from "./components/SupportText";

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background-light dark:bg-background-dark p-4 transition-colors duration-300">
      <div className="layout-container flex h-full grow flex-col items-center justify-center">
        <div className="layout-content-container flex w-full max-w-lg flex-col items-center justify-center gap-6">
          <HeaderSection />
          <RoleGrid />
          <SupportText />
        </div>
      </div>
    </div>
  );
}
