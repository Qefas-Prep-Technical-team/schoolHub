import { create } from 'zustand';
import { UserType } from '@/app/(auth)/login/services/auth-store';

export type AuthView = 'selection' | 'login-role' | 'signup-role' | 'login-form' | 'signup-form';

interface AuthModalState {
    isOpen: boolean;
    view: AuthView;
    selectedRole: UserType | 'school' | null;
    openModal: (view?: AuthView, role?: UserType | 'school' | null) => void;
    closeModal: () => void;
    setView: (view: AuthView) => void;
    setRole: (role: UserType | 'school' | null) => void;
}

export const useAuthModalStore = create<AuthModalState>((set) => ({
    isOpen: false,
    view: 'selection',
    selectedRole: null,
    openModal: (view = 'selection', role = null) => set({ isOpen: true, view, selectedRole: role }),
    closeModal: () => set({ isOpen: false, view: 'selection', selectedRole: null }),
    setView: (view) => set({ view }),
    setRole: (role) => set({ selectedRole: role }),
}));
