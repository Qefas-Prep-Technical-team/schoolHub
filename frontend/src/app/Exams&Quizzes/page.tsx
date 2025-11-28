"use client"
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StudentExamHeader from './components/StudentExamHeader';
import Header from './components/Header';
import ExamDetailsGrid from './components/ExamDetailsGrid';
import InstructionsCard from './components/InstructionsCard';
import Footer from './components/Footer';
import QuestionPreview from './components/QuestionPreview';


const mockExamData = {
    id: '1',
    title: 'Biology Midterm Exam',
    subject: 'Biology',
    className: 'Grade 10 - Section B',
    dateTime: 'Oct 26, 2024, 10:00 AM',
    duration: '90 Minutes',
    totalQuestions: 50,
    totalMarks: 100,
    teacher: 'Mr. Alan Turing',
    attempts: '1 of 1',
    instructions: [
        'You have only <span class="font-bold text-primary-text dark:text-white">one attempt</span> for this exam.',
        'The timer will start as soon as you click \'Start Exam\' and will not pause.',
        'The exam will be <span class="font-bold text-primary-text dark:text-white">automatically submitted</span> when the time is over.',
        'Do not refresh the page or use the browser\'s back button during the exam.',
        'Ensure you adhere to all academic honesty policies. Any malpractice will be flagged.'
    ],
    startTime: '2024-10-26T10:00:00' // ISO string for countdown
};

const sampleQuestion = {
    number: 1,
    text: 'What is the powerhouse of the cell?',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Endoplasmic Reticulum']
};

const breadcrumbs = [
    { label: 'Dashboard', href: '/' },
    { label: 'Exams', href: '/exams' },
    { label: 'Biology Midterm Exam' }
];

export default function StudentExamPreview() {
    const router = useRouter();
    const id = '1'; // In real scenario, get this from route params
    const [countdown, setCountdown] = useState({ hours: 0, minutes: 15, seconds: 30 });

    // Simulate countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                const { hours, minutes, seconds } = prev;

                if (seconds > 0) {
                    return { hours, minutes, seconds: seconds - 1 };
                } else if (minutes > 0) {
                    return { hours, minutes: minutes - 1, seconds: 59 };
                } else if (hours > 0) {
                    return { hours: hours - 1, minutes: 59, seconds: 59 };
                } else {
                    clearInterval(timer);
                    return { hours: 0, minutes: 0, seconds: 0 };
                }
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleStartExam = () => {
        // Navigate to actual exam page
        router.push(`/exams/${id}/take`);
    };

    const handleNotifications = () => {
        console.log('Open notifications');
    };

    const handleHelp = () => {
        console.log('Open help');
    };

    if (!id) {
        return <div>Loading...</div>;
    }

    return (
        <main>
            {/* <Header
                onNotifications={handleNotifications}
                onHelp={handleHelp}
            /> */}

            <main className="layout-container flex h-full grow flex-col">
                <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-1 justify-center">
                    <div className="layout-content-container flex flex-col max-w-4xl flex-1 gap-6 sm:gap-8">
                        <StudentExamHeader
                            title={mockExamData.title}
                            breadcrumbs={breadcrumbs}
                        />

                        <ExamDetailsGrid details={mockExamData} />

                        <InstructionsCard instructions={mockExamData.instructions} />

                        <QuestionPreview question={sampleQuestion} />
                    </div>
                </div>
            </main>

            <Footer
                countdown={countdown}
                onStartExam={handleStartExam}
                examStartTime={mockExamData.startTime}
            />
        </main>
    );
}