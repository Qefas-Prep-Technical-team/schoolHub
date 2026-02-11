'use client';

import { useState } from 'react';
import MarksInput from './MarksInput';
import DifficultySelector from './DifficultySelector';
import ShuffleToggle from './ShuffleToggle';
import { Difficulty } from './type';


const SettingsPanel: React.FC = () => {
    const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
    const [shuffleOptions, setShuffleOptions] = useState<boolean>(true);
    const [marks, setMarks] = useState<number>(10);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Settings
            </h3>

            <MarksInput marks={marks} onMarksChange={setMarks} />
            <DifficultySelector difficulty={difficulty} onDifficultyChange={setDifficulty} />
            <ShuffleToggle shuffleOptions={shuffleOptions} onShuffleChange={setShuffleOptions} />
        </div>
    );
};

export default SettingsPanel;