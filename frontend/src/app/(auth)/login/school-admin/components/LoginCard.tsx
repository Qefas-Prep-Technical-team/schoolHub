import LoginForm from "./LoginForm";
import PreviewImage from "./PreviewImage";



export default function LoginCard() {
  return (
    <div className="rounded-xl border border-gray-200/80 bg-white dark:bg-[#1C2431] dark:border-gray-700/50 shadow-sm p-8 sm:p-10 md:p-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[#0A2540] dark:text-white tracking-tight">
          Admin Portal
        </h1>
        <p className="mt-2 text-base text-[#525F7F] dark:text-gray-400">
          Oversee, Analyze, and Lead with Insight.
        </p>
      </div>

      <div className="my-8 flex w-full justify-center">
        <PreviewImage />
      </div>

      <LoginForm />
    </div>
  );
}
