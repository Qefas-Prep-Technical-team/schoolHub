"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Lock, Loader2 } from "lucide-react";
import { useAuthStore } from "@/app/(auth)/login/services/auth-store";

export default function PingOverlay() {
  const { userType } = useAuthStore();

  const getThemeVars = () => {
    switch (userType) {
      case "STUDENT":
        return {
          textColor: "text-pink-600",
          textLight: "text-pink-600/70",
          orb1: "bg-pink-600/20",
          orb2: "bg-purple-500/20",
          ring: "border-pink-600/50",
          gradientCore: "from-pink-600/20 to-purple-500/20",
          loaderGradient: "from-transparent via-pink-600 to-transparent",
          lockColor: "text-purple-500"
        };
      case "PARENT":
        return {
          textColor: "text-orange-500",
          textLight: "text-orange-500/70",
          orb1: "bg-orange-500/20",
          orb2: "bg-amber-500/20",
          ring: "border-orange-500/50",
          gradientCore: "from-orange-500/20 to-amber-500/20",
          loaderGradient: "from-transparent via-orange-500 to-transparent",
          lockColor: "text-amber-500"
        };
      case "TEACHER":
        return {
          textColor: "text-purple-600",
          textLight: "text-purple-600/70",
          orb1: "bg-purple-600/20",
          orb2: "bg-indigo-500/20",
          ring: "border-purple-600/50",
          gradientCore: "from-purple-600/20 to-indigo-500/20",
          loaderGradient: "from-transparent via-purple-600 to-transparent",
          lockColor: "text-indigo-500"
        };
      case "ADMIN":
      default:
        return {
          textColor: "text-primary",
          textLight: "text-primary/70",
          orb1: "bg-primary/20",
          orb2: "bg-indigo-500/20",
          ring: "border-primary/50",
          gradientCore: "from-primary/20 to-indigo-500/20",
          loaderGradient: "from-transparent via-primary to-transparent",
          lockColor: "text-indigo-500"
        };
    }
  };

  const theme = getThemeVars();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 overflow-hidden"
      >
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[#F8FAFC]/80 dark:bg-slate-950/80 backdrop-blur-xl" />
        
        {/* Moving Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className={`absolute -top-24 -left-24 w-96 h-96 ${theme.orb1} rounded-full blur-[120px]`}
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className={`absolute -bottom-24 -right-24 w-96 h-96 ${theme.orb2} rounded-full blur-[120px]`}
        />

        {/* Central Content Card */}
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="relative z-10 w-full max-w-md p-8 text-center"
        >
          {/* Main Illustration */}
          <div className="relative mb-10 flex justify-center">
            {/* Outer Pulsing Rings */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: [0, 0.4, 0],
                  scale: [0.5, 2, 2.5] 
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 1,
                  ease: "easeOut"
                }}
                className={`absolute w-20 h-20 rounded-full border ${theme.ring}`}
              />
            ))}
            
            {/* Core Icon Container */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative w-24 h-24 flex items-center justify-center rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-white/20"
            >
              <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${theme.gradientCore} animate-pulse`} />
              <ShieldCheck size={48} className={`${theme.textColor} relative z-10`} />
              
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute -right-2 -top-2 w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center border border-white/10"
              >
                <Lock size={14} className={theme.lockColor} />
              </motion.div>
            </motion.div>
          </div>

          {/* Text Content */}
          <motion.h1 
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="text-2xl font-bold mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/70 to-foreground"
          >
            Connecting to Secure Servers
          </motion.h1>
          
          <p className="text-muted-foreground text-sm font-medium mb-8 max-w-[280px] mx-auto leading-relaxed">
            Initializing your personalized environment and synchronizing security protocols.
          </p>

          {/* Loading Indicator */}
          <div className="flex flex-col items-center gap-3">
            <div className="h-1.5 w-48 bg-muted rounded-full overflow-hidden relative">
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute top-0 bottom-0 w-1/2 bg-gradient-to-r ${theme.loaderGradient}`}
              />
            </div>
            <div className={`flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest ${theme.textLight}`}>
              <Loader2 size={12} className="animate-spin" />
              Establishing Handshake
            </div>
          </div>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-10 text-[12px] text-muted-foreground/50 font-medium"
        >
          Secure Session Initializing &bull; Qefas Hub Infrastructure
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
