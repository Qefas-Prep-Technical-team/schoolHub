import Header from "./components/Header";
import AuthImageSection from "./components/AuthImageSection";
import LoginForm from "./components/LoginForm";

export default function ParentLoginPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#F6F9FC] dark:bg-background-dark">
    
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-[95vw] lg:w-[65vw] max-w-[1200px] bg-white dark:bg-[#1C2431] md:rounded-[2rem] rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col md:flex-row min-h-[650px]">
          <div className="flex-1 flex flex-col justify-center">
            <LoginForm />
          </div>
          <div className="hidden md:block md:w-[45%] lg:w-1/2 relative bg-primary/5 dark:bg-gray-800 p-2 lg:p-4">
            <AuthImageSection />
          </div>
        </div>
      </main>
    </div>
  );
}
