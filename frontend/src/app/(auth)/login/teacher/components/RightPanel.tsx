import TeacherLoginForm from "./TeacherLoginForm";

export default function RightPanel() {
    return (
        <div className="flex-1 flex flex-col justify-center p-8 sm:p-10 lg:p-12">
            <div className="w-full max-w-md mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-[#0A2540] dark:text-white tracking-tight pb-2">
                        Teacher Portal
                    </h1>
                    <p className="text-[#525F7F] dark:text-gray-400 text-base">
                        Inspire, Teach, and Track Every Learner’s Journey.
                    </p>
                </div>

                <h2 className="text-[#0A2540] dark:text-white text-[20px] font-bold pb-6 text-center">
                    Welcome back, Teacher!
                </h2>

                <TeacherLoginForm />

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        “Over 200 teachers inspiring daily.”
                    </p>
                </div>
            </div>
        </div>
    );
}
