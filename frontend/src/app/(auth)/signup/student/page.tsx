import StudentRegisterForm from "./components/StudentRegisterForm";
import StudentRegisterImageSlider from "./components/StudentRegisterImageSlider";

export default function StudentRegisterPage() {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-[95vw] lg:w-[80vw] mx-auto bg-white dark:bg-gray-900 md:rounded-[2.5rem] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[700px]">
          <StudentRegisterForm />
          <StudentRegisterImageSlider />
        </div>
      </div>
    </div>
  );
}
