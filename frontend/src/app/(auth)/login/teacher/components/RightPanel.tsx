import TeacherLoginForm from "./TeacherLoginForm";

export default function RightPanel() {
    return (
        <div className="flex-1 flex flex-col justify-center p-8 sm:p-10 lg:p-12">
            <div className="w-full max-w-md mx-auto">
                <div className="text-left mb-10">
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">
                        Teacher Portal
                    </h1>
                    <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm">
                        Welcome back, Instructor. Access your educational workspace to inspire and track every learner's journey.
                    </p>
                </div>

                <TeacherLoginForm />

                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] italic">
                        &ldquo;Educating the next generation of global innovators.&rdquo;
                    </p>
                </div>
            </div>
        </div>
    );
}
