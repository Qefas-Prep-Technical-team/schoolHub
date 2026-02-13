"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Confetti from "react-confetti";
import { motion } from "framer-motion";

function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const update = () =>
      setSize({
        width: document.documentElement.clientWidth,
        height: window.innerHeight,
      });

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return size;
}

export default function CheerAnimation({
  children,
  duration = 10_000,
  pieces = 250,
}: {
  children: React.ReactNode;
  duration?: number;
  pieces?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(true);
  const { width, height } = useWindowSize();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const t = setTimeout(() => setShowConfetti(false), duration);
    return () => clearTimeout(t);
  }, [duration]);

  const confettiNode = useMemo(() => {
    if (!mounted || !showConfetti || width <= 0 || height <= 0) return null;

    // Portal to body prevents z-index / transform stacking issues
    return createPortal(
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 2147483647 }} // highest practical z-index
      >
        <Confetti
          width={width}
          height={height}
          numberOfPieces={pieces}
          recycle={false}
          run={true}
          gravity={0.25}
          initialVelocityY={12}
          style={{ position: "absolute", inset: 0 }}
        />
      </div>,
      document.body
    );
  }, [mounted, showConfetti, width, height, pieces]);

  return (
    <motion.div
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative w-full"
    >
      {confettiNode}
      {children}
    </motion.div>
  );
}
