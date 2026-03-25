import LoginForm from "./LoginForm";

export default function LoginCard() {
  return (
    <div className="flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-3xl lg:text-4xl font-extrabold text-[#0A2540] dark:text-white tracking-tight">
          Admin Portal
        </h1>
        <p className="mt-2 text-base text-[#525F7F] dark:text-gray-400">
          Oversee, Analyze, and Lead with Insight.
        </p>
      </div>

      <LoginForm />
    </div>
  );
}
