'use client';

import { useState } from 'react';
import { Bold, Italic, List, ListOrdered, Link, Image as ImageIcon } from 'lucide-react';

interface QuestionEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function QuestionEditor({ value, onChange }: QuestionEditorProps) {
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  const handleFormat = (format: 'bold' | 'italic') => {
    if (format === 'bold') {
      setIsBold(!isBold);
      // In a real app, you would insert formatting into the text
    } else {
      setIsItalic(!isItalic);
    }
  };

  return (
    <div className="flex flex-col">
      <label className="text-base font-medium text-gray-900 dark:text-gray-200 pb-2">
        Question
      </label>
      <div className="rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 border-b border-gray-300 dark:border-gray-600">
          <button
            onClick={() => handleFormat('bold')}
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isBold ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={() => handleFormat('italic')}
            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
              isItalic ? 'bg-gray-100 dark:bg-gray-700' : ''
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          <button
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Bulleted List"
          >
            <List className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
          <button
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Insert Link"
          >
            <Link className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Insert Image"
          >
            <ImageIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
        
        {/* Textarea */}
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full resize-none text-gray-900 dark:text-gray-200 focus:outline-none border-0 bg-transparent min-h-36 placeholder:text-gray-400 dark:placeholder:text-gray-500 p-4 text-base font-normal"
          placeholder="Enter the question text here..."
          rows={6}
        />
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          You can format text, add lists, and insert media
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {value.length}/5000 characters
        </span>
      </div>
    </div>
  );
}