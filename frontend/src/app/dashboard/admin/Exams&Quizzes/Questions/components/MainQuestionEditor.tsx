/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import QuestionList from "../../exam-preview/components/QuestionList";
import QuestionEditor from "./QuestionEditor";
import SettingsPanel from "./SettingsPanel";
import Header from './Header';
import Footer from './Footer';

const MainQuestionEditor: React.FC = () => {
    const [questions, setQuestions] = useState<any[]>([]);

    const handleEditQuestion = (question: any) => {
        // TODO: implement edit behavior (e.g. open editor, navigate, or set state)
        console.log("Edit question:", question);
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200">
            <div className="relative flex min-h-screen w-full flex-col">
                <div className="flex-grow pb-28">
                    <Header
                        title="Add Questions – Biology Midterm"
                        subtitle="Grade 10 Biology Midterm Exam"
                    />

                    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                            <QuestionEditor />

                            {/* Right Column: Settings & Question List */}
                            <div className="lg:col-span-1 flex flex-col gap-6">
                                <SettingsPanel />
                                <QuestionList questions={questions} onEditQuestion={handleEditQuestion} />
                            </div>
                        </div>
                    </main>
                </div>

                <Footer />
            </div>
        </div>
    );
};

export default MainQuestionEditor;