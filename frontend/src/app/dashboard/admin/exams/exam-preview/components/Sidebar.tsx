/* eslint-disable @typescript-eslint/no-explicit-any */

import NavigationCard from "./NavigationCard";
import StatisticsCard from "./StatisticsCard";
import ToggleCard from "./ToggleCard";

interface SidebarProps {
    statistics: any;
    totalQuestions: number;
    showAnswers: boolean;
    onToggleAnswers: (show: boolean) => void;
}

export default function Sidebar({ statistics, totalQuestions, showAnswers, onToggleAnswers }: SidebarProps) {
    return (
        <aside className="col-span-12 lg:col-span-4">
            <div className="sticky top-24 flex flex-col gap-6">
                <StatisticsCard statistics={statistics} />
                <NavigationCard totalQuestions={totalQuestions} />
                <ToggleCard
                    showAnswers={showAnswers}
                    onToggle={onToggleAnswers}
                />
            </div>
        </aside>
    );
}