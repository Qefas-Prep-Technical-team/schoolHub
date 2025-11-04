import AuthLayout from "./components/AuthLayout";
import Header from "./components/Header";
import AuthImageSection from "./components/AuthImageSection";
import LoginForm from "./components/LoginForm";

export default function ParentLoginPage() {
  return (
    <AuthLayout>
      <Header />
      <main className="flex min-h-screen flex-1 items-center justify-center p-4">
        <div className="grid w-full max-w-6xl grid-cols-1 overflow-hidden rounded-xl bg-card-light dark:bg-card-dark shadow-xl lg:grid-cols-2">
          <AuthImageSection />
          <LoginForm />
        </div>
      </main>
    </AuthLayout>
  );
}
