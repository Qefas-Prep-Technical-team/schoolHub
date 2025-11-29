interface ShuffleToggleProps {
    shuffleOptions: boolean;
    onShuffleChange: (shuffle: boolean) => void;
}

const ShuffleToggle: React.FC<ShuffleToggleProps> = ({
    shuffleOptions,
    onShuffleChange,
}) => {
    return (
        <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor="shuffle">
                Shuffle Options
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    className="sr-only peer"
                    id="shuffle"
                    type="checkbox"
                    checked={shuffleOptions}
                    onChange={(e) => onShuffleChange(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
            </label>
        </div>
    );
};

export default ShuffleToggle;