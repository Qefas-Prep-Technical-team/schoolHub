'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface RedirectOverlayProps {
  isVisible: boolean;
  message?: string;
  subtext?: string;
}

const RedirectOverlay: React.FC<RedirectOverlayProps> = ({
  isVisible,
  message = "Registration Successful!",
  subtext = "Redirecting you to the verification page..."
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="flex flex-col items-center p-8 text-center"
          >
            {/* Animated Spinner/Icon */}
            <div className="relative mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary"
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-4xl text-primary font-bold">
                  verified
                </span>
              </motion.div>
            </div>

            {/* Content */}
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-black text-gray-900 dark:text-white mb-2"
            >
              {message}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-gray-600 dark:text-gray-400 font-medium"
            >
              {subtext}
            </motion.p>

            {/* Progress indicator */}
            <div className="mt-8 w-48 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="h-full bg-primary"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RedirectOverlay;
