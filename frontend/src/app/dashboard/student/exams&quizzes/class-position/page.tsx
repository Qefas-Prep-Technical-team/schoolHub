// src/app/page.tsx

import ImprovementInsights from "./components/ImprovementInsights";
import PositionTrend from "./components/PositionTrend";
import StatsCard from "./components/StatsCard";
import SubjectBreakdown from "./components/SubjectBreakdown";
import Header from "./components/Header"
import Leaderboard from "./components/Leaderboard";

export default function Home() {
    const stats = [
        { title: 'Your Average Score', value: '88.2%' },
        { title: 'Class Average Score', value: '75.6%' },
        { title: 'Highest Score in Class', value: '97.1%' },
        { title: 'Lowest Score in Class', value: '52.4%' },
    ];

    return (
        <div className="relative flex min-h-screen w-full">
            <main className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    <Header />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {stats.map((stat, index) => (
                            <StatsCard key={index} {...stat} />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        <div className="lg:col-span-3">
                            <SubjectBreakdown />
                        </div>
                        <div className="lg:col-span-2 flex flex-col gap-8">
                            <ImprovementInsights />
                            <PositionTrend />
                        </div>
                    </div>

                    <div className="mt-8">
                        <Leaderboard />
                    </div>
                </div>
            </main>
        </div>
    );
}