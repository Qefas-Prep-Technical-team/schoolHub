// src/components/UI/Timer.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface TimerProps {
  initialTime: number; // in seconds
}

const Timer: React.FC<TimerProps> = ({ initialTime }) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <p className="mt-1 text-4xl font-bold tracking-tighter">
      {formatTime(timeLeft)}
    </p>
  );
};

export default Timer;