import TeacherLoginForm from "./TeacherLoginForm";

export default function RightPanel() {
    return (
        <div className="flex w-full lg:w-1/2 min-h-screen flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md">
                <div className="mb-8 block lg:hidden text-center">
                    <h1 className="text-text-light dark:text-text-dark text-[32px] font-bold pb-3">
                        Teacher Portal
                    </h1>
                    <p className="text-text-light dark:text-text-dark text-base">
                        Inspire, Teach, and Track Every Learner’s Journey.
                    </p>
                </div>

                <h2 className="text-text-light dark:text-text-dark text-[22px] font-bold pb-8">
                    Welcome back, Teacher!
                </h2>

                <TeacherLoginForm />

                <div className="mt-8 text-center">
                    <p className="text-sm text-placeholder-light dark:text-placeholder-dark">
                        “Over 200 teachers inspiring daily.”
                    </p>
                </div>
            </div>
        </div>
    );
}
