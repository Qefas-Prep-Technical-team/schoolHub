import Toggle from './ui/Toggle';

interface ToggleCardProps {
    showAnswers: boolean;
    onToggle: (show: boolean) => void;
}

export default function ToggleCard({ showAnswers, onToggle }: ToggleCardProps) {
    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
            <div className="flex items-center justify-between">
                <label htmlFor="show-answers" className="font-medium text-gray-900 dark:text-white">
                    Show Correct Answers
                </label>
                <Toggle
                    id="show-answers"
                    checked={showAnswers}
                    onChange={onToggle}
                />
            </div>
        </div>
    );
}