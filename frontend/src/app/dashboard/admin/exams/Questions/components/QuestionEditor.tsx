'use client';

import { useState } from 'react';
import { QuestionOption, QuestionType } from './type';
import QuestionTypeSelector from './QuestionTypeSelector';
import QuestionTextEditor from './QuestionTextEditor';
import AnswerOptions from './AnswerOptions';

const QuestionEditor: React.FC = () => {
    const [questionType, setQuestionType] = useState<QuestionType>('Multiple Choice');
    const [questionText, setQuestionText] = useState<string>('');
    const [options, setOptions] = useState<QuestionOption[]>([
        { id: 1, text: '', correct: true, letter: 'A' },
        { id: 2, text: '', correct: false, letter: 'B' },
        { id: 3, text: '', correct: false, letter: 'C' },
    ]);

    const addOption = (): void => {
        const newLetter = String.fromCharCode(65 + options.length);
        const newOption: QuestionOption = {
            id: options.length + 1,
            text: '',
            correct: false,
            letter: newLetter,
        };
        setOptions([...options, newOption]);
    };

    const removeOption = (id: number): void => {
        if (options.length > 2) {
            setOptions(options.filter(option => option.id !== id));
        }
    };

    const updateOptionText = (id: number, text: string): void => {
        setOptions(options.map(option =>
            option.id === id ? { ...option, text } : option
        ));
    };

    const setCorrectAnswer = (id: number): void => {
        setOptions(options.map(option => ({
            ...option,
            correct: option.id === id
        })));
    };

    return (
        <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Question Input Form Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
                <QuestionTypeSelector
                    questionType={questionType}
                    onQuestionTypeChange={setQuestionType}
                />
                <QuestionTextEditor
                    questionText={questionText}
                    onQuestionTextChange={setQuestionText}
                />
            </div>

            {/* Answer Options Card */}
            <AnswerOptions
                options={options}
                onAddOption={addOption}
                onRemoveOption={removeOption}
                onUpdateOptionText={updateOptionText}
                onSetCorrectAnswer={setCorrectAnswer}
            />
        </div>
    );
};

export default QuestionEditor;