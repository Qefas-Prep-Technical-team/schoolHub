// src/components/Dashboard/StartQuizButton.tsx
'use client';

import React, { useState } from 'react';
import Button from './ui/Button';
import ConfirmationModal from './ConfirmationModal';
import Link from 'next/link';

const StartQuizButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirmStart = () => {
    console.log('Starting quiz...');
    setIsModalOpen(false);
    // Add navigation to quiz page here
  };

  return (
    <>
      <div className="flex justify-center pt-6">
        <Link href={"/Exams&Quizzes/quizzes/1/start"}>

          <Button
            variant="primary"
            size="lg"
            icon="arrow_forward"
            onClick={handleOpenModal}
            className="w-full max-w-sm shadow-lg shadow-primary/30 cursor-pointer"
          >
            Start Quiz
          </Button>
        </Link>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmStart}
      />
    </>
  );
};

export default StartQuizButton;