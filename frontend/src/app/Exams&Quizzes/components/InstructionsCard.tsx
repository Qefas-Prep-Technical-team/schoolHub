import {
    RotateCcw,
    Hourglass,
    Send,
    Shield,
    Gavel
} from 'lucide-react';

interface InstructionsCardProps {
    instructions: string[];
}

export default function InstructionsCard({ instructions }: InstructionsCardProps) {
    const instructionIcons = [
        RotateCcw,    // One attempt
        Hourglass,    // Timer starts
        Send,         // Auto submit
        Shield,       // Don't refresh
        Gavel         // Academic honesty
    ];

    return (
        <div className="p-4 sm:p-6 bg-card-background dark:bg-background-dark/50 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <div className="flex flex-col items-stretch justify-start">
                <h3 className="text-primary-text dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                    Before you begin
                </h3>
                <p className="text-secondary-text dark:text-gray-400 text-base font-normal leading-normal mt-1 mb-4">
                    Please read the following instructions carefully before starting the exam.
                </p>

                <ul className="space-y-3">
                    {instructions.map((instruction, index) => {
                        const Icon = instructionIcons[index] || Shield;
                        return (
                            <li key={index} className="flex items-start gap-3">
                                <Icon className="text-primary-action mt-0.5" size={20} />
                                <p
                                    className="text-secondary-text dark:text-gray-300 text-base font-normal leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: instruction }}
                                />
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}