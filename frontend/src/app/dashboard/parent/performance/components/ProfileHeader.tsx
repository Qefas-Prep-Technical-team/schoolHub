import Image from 'next/image';
import { Download, Mail, Calendar } from 'lucide-react';

interface StudentProfile {
    name: string;
    class: string;
    studentId: string;
    session: string;
    status: 'active' | 'inactive';
}

export default function ProfileHeader() {
    const student: StudentProfile = {
        name: 'Alex Johnson',
        class: 'Class 5-B',
        studentId: '893201',
        session: '2023-2024',
        status: 'active',
    };

    return (
        <section className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center justify-between bg-surface-light dark:bg-surface-dark p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start text-center sm:text-left w-full md:w-auto">
                <div className="relative">
                    <div className="relative size-24">
                        <Image
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhZhwPZpq9xdHvSPbRbd3ubgxrBfdre47-RCAaqZKO0_GA5lPeYJPQyss0C9DUczNT-DQffXM3RQfGC1tZ-CH5SyUKrePTmF9yloP5hJRd-kv3o59zUeX3Hl4Ehd5uQNNLIYZU0fyeSCk9wGzwz72F21jRtP96XbamibjUqSt7kHj7FcHDBl3OxyugNYgutZOagCKLwvD32nfAm9Dj0UYdsCyKlOq_DLWcnbqOeIiV7XsjebP0WpGLfCY0FTsuWUiFQiUzZyPYWNc"
                            alt={`Portrait of student ${student.name}`}
                            fill
                            className="rounded-full border-4 border-primary/10 object-cover"
                        />
                    </div>
                    <div className="absolute bottom-0 right-0 bg-success text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white dark:border-surface-dark">
                        Active
                    </div>
                </div>

                <div className="flex flex-col justify-center py-1">
                    <h2 className="text-2xl font-bold text-text-main dark:text-white leading-tight">
                        {student.name}
                    </h2>
                    <p className="text-text-secondary dark:text-text-secondary-dark font-medium">
                        {student.class} • ID: {student.studentId}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 bg-background-light dark:bg-background-dark px-3 py-1 rounded-full w-fit mx-auto sm:mx-0">
                        <Calendar className="h-3 w-3 text-primary" />
                        <span className="text-xs font-semibold text-text-secondary dark:text-text-secondary-dark">
                            Session {student.session}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 w-full md:w-auto justify-center sm:justify-start">
                <button className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20">
                    <Download className="h-5 w-5" />
                    <span>Download Report</span>
                </button>
                <button className="flex items-center gap-2 bg-background-light dark:bg-gray-800 text-text-main dark:text-white border border-gray-200 dark:border-gray-700 px-5 py-2.5 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <Mail className="h-5 w-5" />
                    <span>Contact Teacher</span>
                </button>
            </div>
        </section>
    );
}