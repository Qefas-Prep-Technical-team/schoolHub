import StudentRegisterForm from "./components/StudentRegisterForm";
import StudentRegisterImageSlider from "./components/StudentRegisterImageSlider";

export default function StudentRegisterPage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4 lg:p-8">
      <div className="flex w-full max-w-6xl flex-col lg:flex-row rounded-xl overflow-hidden shadow-lg bg-white dark:bg-gray-800">
        <StudentRegisterImageSlider />
        <StudentRegisterForm />
      </div>
    </div>
  );
}
