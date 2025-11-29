import { Difficulty } from "./type";


interface DifficultySelectorProps {
    difficulty: Difficulty;
    onDifficultyChange: (difficulty: Difficulty) => void;
}

const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];

const DifficultySelector: React.FC<DifficultySelectorProps> = ({
    difficulty,
    onDifficultyChange,
}) => {
    return (
        <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty
            </p>
            <div className="flex h-10 w-full items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-900/50 p-1">
                {difficulties.map((diff) => (
                    <label
                        key={diff}
                        className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 ${difficulty === diff
                                ? 'bg-white dark:bg-primary shadow-sm text-primary dark:text-white'
                                : 'text-gray-500 dark:text-gray-400'
                            } text-sm font-medium`}
                    >
                        <span>{diff}</span>
                        <input
                            className="sr-only"
                            name="difficulty"
                            type="radio"
                            value={diff}
                            checked={difficulty === diff}
                            onChange={() => onDifficultyChange(diff)}
                        />
                    </label>
                ))}
            </div>
        </div>
    );
};

export default DifficultySelector;