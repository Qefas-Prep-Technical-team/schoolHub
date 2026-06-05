"use client";

import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useAcknowledgePrefectCelebration } from '@/lib/api/hooks/useStudent';

interface PrefectCelebrationProps {
  studentId: string;
  studentName: string;
  roleName: string;
  hasSeenCelebration: boolean;
  onAcknowledge: () => void;
}

const getMotivationalText = (role: string) => {
  const lowerRole = role.toLowerCase();
  if (lowerRole.includes('head')) {
    return "Leadership is not about being in charge, it is about taking care of those in your charge. Lead with integrity and set the standard for others.";
  }
  if (lowerRole.includes('class')) {
    return "You are now a role model in your class. Your actions set the tone for discipline and excellence.";
  }
  if (lowerRole.includes('library')) {
    return "Knowledge is power, and you are its guardian. Keep the library a haven for learning and curiosity.";
  }
  return "This is a recognition of your leadership, discipline, and academic excellence. Wear your badge with pride and lead by example.";
};

export default function PrefectCelebration({ studentId, studentName, roleName, hasSeenCelebration, onAcknowledge }: PrefectCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { width, height } = useWindowSize();
  const acknowledgeMutation = useAcknowledgePrefectCelebration(studentId);

  useEffect(() => {
    if (!hasSeenCelebration && roleName) {
      setShowConfetti(true);
      setShowModal(true);
      
      // Stop confetti after 7 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [hasSeenCelebration, roleName]);

  const handleClose = async () => {
    setShowModal(false);
    setShowConfetti(false);
    try {
      await acknowledgeMutation.mutateAsync();
      onAcknowledge();
    } catch (e) {
      console.error(e);
    }
  };

  if (hasSeenCelebration || !roleName) return null;

  return (
    <>
      {showConfetti && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          <Confetti width={width} height={height} recycle={false} numberOfPieces={500} gravity={0.15} />
        </div>
      )}

      <Dialog open={showModal} onOpenChange={(open) => {
        if (!open) handleClose();
      }}>
        <DialogContent className="sm:max-w-md text-center border-none shadow-2xl bg-gradient-to-br from-amber-50 to-orange-100 dark:from-slate-900 dark:to-slate-800">
          <DialogHeader>
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.8, bounce: 0.5 }}
              className="mx-auto bg-amber-500 text-white p-4 rounded-full shadow-lg mb-4"
            >
              <span className="text-5xl">👑</span>
            </motion.div>
            <DialogTitle className="text-2xl font-bold text-amber-900 dark:text-amber-400">
              Congratulations, {studentName}! 🎉
            </DialogTitle>
          </DialogHeader>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="py-4"
          >
            <p className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">
              You have been appointed as <span className="font-bold text-amber-600 dark:text-amber-400">{roleName}</span>.
            </p>
            <div className="bg-white/60 dark:bg-slate-800/60 p-4 rounded-xl border border-amber-200 dark:border-slate-700 italic text-slate-700 dark:text-slate-300">
              "{getMotivationalText(roleName)}"
            </div>
          </motion.div>

          <DialogFooter className="sm:justify-center mt-2">
            <Button onClick={handleClose} className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-full px-8 shadow-md">
              Accept Responsibility
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
