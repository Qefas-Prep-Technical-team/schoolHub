// src/components/Dashboard/QuizPurpose.tsx
import React from 'react';

const QuizPurpose: React.FC = () => {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
        Quiz Purpose
      </h3>
      <div className="rounded-xl bg-primary/5 p-5 text-center dark:bg-primary/10">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          This quiz helps measure your understanding of key algebra concepts. 
          The best score will be recorded. Just do your best!
        </p>
      </div>
    </div>
  );
};

export default QuizPurpose;