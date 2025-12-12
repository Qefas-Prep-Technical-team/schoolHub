"use client";

import { useState, useCallback } from "react";
import { ChildData } from "../ChildDetailsDrawer";
 // update path if needed

export function useChildDetailsDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<ChildData | null>(null);

  const openDrawer = useCallback((child: ChildData) => {
    setSelectedChild(child);
    setIsOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsOpen(false);
    // clear after animation completes (match Transition leave duration)
    setTimeout(() => setSelectedChild(null), 260);
  }, []);

  return {
    isOpen,
    selectedChild,
    openDrawer,
    closeDrawer,
  };
}
