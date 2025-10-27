import { create } from 'zustand';

type FocusMode = 'none' | 'hover' | 'click' | 'keyboard';

interface CardFocusStore {
  // Single card focus
  focusedCardId: string | null;
  setFocusedCardId: (id: string | null) => void;

  // Hover tracking
  hoveredCardId: string | null;
  setHoveredCardId: (id: string | null) => void;

  // Multi-card selection
  activeCardIds: string[];
  toggleActiveCardId: (id: string) => void;
  clearActiveCards: () => void;

  // Interaction type
  focusMode: FocusMode;
  setFocusMode: (mode: FocusMode) => void;
}

export const usePricingFocusStore = create<CardFocusStore>((set, get) => ({
  focusedCardId: null,
  setFocusedCardId: (id) => set({ focusedCardId: id }),

  hoveredCardId: null,
  setHoveredCardId: (id) => set({ hoveredCardId: id }),

  activeCardIds: [],
  toggleActiveCardId: (id) => {
    const { activeCardIds } = get();
    const isActive = activeCardIds.includes(id);
    set({
      activeCardIds: isActive
        ? activeCardIds.filter((cardId) => cardId !== id)
        : [...activeCardIds, id],
    });
  },
  clearActiveCards: () => set({ activeCardIds: [] }),

  focusMode: 'none',
  setFocusMode: (mode) => set({ focusMode: mode }),
}));
