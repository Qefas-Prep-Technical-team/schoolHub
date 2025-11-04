"use client";
import Header from "./components/Header";
import LoginCard from "./components/LoginCard";
import Footer from "./components/Footer";

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#F6F9FC] dark:bg-background-dark p-4 sm:p-6 lg:p-8">
      <Header />
      <main className="w-full max-w-lg">
        <LoginCard />
      </main>
      <Footer />
    </div>
  );
}
