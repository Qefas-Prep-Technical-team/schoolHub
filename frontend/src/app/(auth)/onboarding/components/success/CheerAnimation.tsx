'use client';
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';

export default function CheerAnimation({ children }: { children: React.ReactNode }) {
  const [showConfetti, setShowConfetti] = useState(true);

  // Stop confetti after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="relative flex flex-col items-center justify-center"
    >
      {showConfetti && (
        // fixed full-viewport container prevents confetti canvas from causing scrollbars
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-50">
          <Confetti
            recycle={false}
            numberOfPieces={250}
            // ensure canvas fills viewport and doesn't overflow
            style={{ position: 'absolute', inset: 0, width: '90%', height: '100%', overflow: 'hidden' }}
          />
        </div>
      )}
      {children}
    </motion.div>
  );
}
