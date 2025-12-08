// src/app/page.tsx
import QuizHeader from '../components/QuizHeader';
import CountdownTimer from '../components/CountdownTimer';
import StatsGrid from '../components/StatsGrid';
import QuizPurpose from '../components/QuizPurpose';
import InstructionsList from '../components/InstructionsList';
import AttemptHistory from '../components/AttemptHistory';
import StartQuizButton from '../components/StartQuizButton';

export default function Home() {
    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
            <div className="flex h-full grow flex-col">
                <div className="flex flex-1 justify-center py-5">
                    <div className="flex w-full max-w-4xl flex-col px-4">
                        <main className="flex-1 space-y-6 md:space-y-8">
                            <QuizHeader />
                            <CountdownTimer />
                            <StatsGrid />

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
                                <QuizPurpose />
                                <InstructionsList />
                            </div>

                            <AttemptHistory />
                            <StartQuizButton />
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}