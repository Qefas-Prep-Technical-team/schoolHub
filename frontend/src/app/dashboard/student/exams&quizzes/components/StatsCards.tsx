import { StatCard } from "./types";
import Card from "./ui/Card";
import Link from "next/link"



interface StatsCardsProps {
    cards: StatCard[];
}

export default function StatsCards({ cards }: StatsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card) => (
                <Card key={card.label}>
                    <Link href={`/dashboard/student/exams&quizzes/${card.link}`} className="flex flex-col gap-2 cursor-pointer">
                        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                            <span className="material-symbols-outlined text-lg">{card.icon}</span>
                            <p className="text-sm font-medium">{card.label}</p>
                        </div>
                        <div className="flex items-end gap-2">
                            <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                {card.value}
                            </p>
                            {card.trend && (
                                <p className={`pb-1 text-sm font-medium leading-tight ${card.trend.color === 'green'
                                        ? 'text-green-600 dark:text-green-500'
                                        : 'text-red-600 dark:text-red-500'
                                    }`}>
                                    {card.trend.value}
                                </p>
                            )}
                        </div>
                    </Link>
                </Card>
            ))}
        </div>
    );
}