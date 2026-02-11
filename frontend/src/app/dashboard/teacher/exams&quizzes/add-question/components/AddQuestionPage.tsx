'use client';

import { useState } from 'react';
import { X, Image, Plus, Bold, Italic, List, ListOrdered, Trash2 } from 'lucide-react';
import QuestionTypeTabs from './QuestionTypeTabs';
import QuestionEditor from './QuestionEditor';
import OptionsManager from './OptionsManager';
import MediaUpload from './MediaUpload';
import ActionButtons from './ActionButtons';

export default function AddQuestionPage() {
  const [activeTab, setActiveTab] = useState<'multiple-choice' | 'true-false' | 'short-answer' | 'essay'>('multiple-choice');
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([
    { id: '1', text: '', isCorrect: true },
    { id: '2', text: '', isCorrect: false },
  ]);
  const [marks, setMarks] = useState(10);
  const [addExplanation, setAddExplanation] = useState(false);
  const [explanation, setExplanation] = useState('');

  const handleAddOption = () => {
    const newOption = {
      id: Date.now().toString(),
      text: '',
      isCorrect: false,
    };
    setOptions([...options, newOption]);
  };

  const handleUpdateOption = (id: string, field: 'text' | 'isCorrect', value: string | boolean) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, [field]: value } : option
    ));
  };

  const handleDeleteOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter(option => option.id !== id));
    }
  };

  const handleSave = (action: 'save' | 'save-and-another') => {
    const questionData = {
      type: activeTab,
      question,
      options: activeTab === 'multiple-choice' ? options : undefined,
      marks,
      explanation: addExplanation ? explanation : undefined,
    };

    console.log('Saving question:', questionData);
    console.log('Action:', action);

    if (action === 'save-and-another') {
      // Reset form for next question
      setQuestion('');
      setOptions([
        { id: '1', text: '', isCorrect: true },
        { id: '2', text: '', isCorrect: false },
      ]);
      setMarks(10);
      setExplanation('');
       window.history.back();
    } else {
      // Save and redirect
      window.history.back();
    }
  };

  const handleClose = () => {
    if (confirm('Are you sure you want to close? Any unsaved changes will be lost.')) {
      window.history.back();
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 flex flex-1 justify-center py-5">
        <div className="max-w-[960px] flex-1">
          {/* Page Header */}
          <div className="flex flex-wrap justify-between items-center gap-4 p-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-200 tracking-tight">
                Add New Question
              </h1>
              <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
                Create a new question to add to the quiz.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Question Type Tabs */}
          <QuestionTypeTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Main Form Content */}
            <div className="md:col-span-2 flex flex-col gap-6">
              {/* Question Editor */}
              <QuestionEditor 
                value={question}
                onChange={setQuestion}
              />

              {/* Options (Only for MCQ) */}
              {activeTab === 'multiple-choice' && (
                <OptionsManager
                  options={options}
                  onAddOption={handleAddOption}
                  onUpdateOption={handleUpdateOption}
                  onDeleteOption={handleDeleteOption}
                />
              )}

              {/* Other question type specific components would go here */}
              {activeTab === 'true-false' && (
                <div className="flex flex-col gap-4">
                  <p className="text-base font-medium text-gray-900 dark:text-gray-200">
                    True/False Options
                  </p>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="true-false"
                        className="h-4 w-4 text-primary focus:ring-primary/50"
                      />
                      <span className="text-gray-700 dark:text-gray-300">True</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="true-false"
                        className="h-4 w-4 text-primary focus:ring-primary/50"
                      />
                      <span className="text-gray-700 dark:text-gray-300">False</span>
                    </label>
                  </div>
                </div>
              )}

              {/* For essay and short answer, show answer field */}
              {(activeTab === 'essay' || activeTab === 'short-answer') && (
                <div className="flex flex-col gap-2">
                  <label className="text-base font-medium text-gray-900 dark:text-gray-200 pb-2">
                    Model Answer
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 p-4 min-h-32 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                    placeholder="Enter model answer for reference..."
                  />
                </div>
              )}
            </div>

            {/* Right Sidebar Settings */}
            <div className="md:col-span-1 flex flex-col gap-6 pt-2">
              {/* Media Upload */}
              <MediaUpload />

              {/* Marks Input */}
              <div className="flex flex-col">
                <label className="text-base font-medium text-gray-900 dark:text-gray-200 pb-2">
                  Marks
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={marks}
                    onChange={(e) => setMarks(parseInt(e.target.value) || 1)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 h-12 px-4 text-gray-900 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                    points
                  </span>
                </div>
              </div>

              {/* Explanation Toggle */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-base font-medium text-gray-900 dark:text-gray-200">
                    Add Explanation
                  </label>
                  <button
                    onClick={() => setAddExplanation(!addExplanation)}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark ${
                      addExplanation ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                    role="switch"
                    aria-checked={addExplanation}
                  >
                    <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white dark:bg-gray-300 shadow ring-0 transition duration-200 ease-in-out transform ${
                      addExplanation ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Provide feedback for students after they answer.
                </p>
                {addExplanation && (
                  <textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 p-3 min-h-24 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y text-sm"
                    placeholder="Enter explanation for the correct answer..."
                  />
                )}
              </div>

              {/* Difficulty Level */}
              <div className="flex flex-col gap-2">
                <label className="text-base font-medium text-gray-900 dark:text-gray-200">
                  Difficulty Level
                </label>
                <div className="flex gap-2">
                  {['Easy', 'Medium', 'Hard'].map((level) => (
                    <button
                      key={level}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        level === 'Medium'
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <ActionButtons onSave={handleSave} />
        </div>
      </div>
    </div>
  );
}