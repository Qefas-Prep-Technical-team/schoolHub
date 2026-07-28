import { create } from "zustand";
import { UserRecord } from "../types/database";
import { UserRepository } from "../repositories/UserRepository";
import {
  AuthService,
  LoginCredentials,
  UserRole,
  RegisterAdminData,
  RegisterTeacherData,
  RegisterStudentData,
  RegisterParentData,
} from "../services/AuthService";
import { StorageService } from "../services/StorageService";

export interface VerificationPendingState {
  email: string;
  userType: UserRole;
  preAuthToken?: string;
  isDeviceVerification?: boolean;
}

interface AuthState {
  user: UserRecord | null;
  selectedUserType: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  isOfflineMode: boolean;
  verificationPending: VerificationPendingState | null;
  initAuth: () => Promise<void>;
  selectUserType: (role: UserRole) => Promise<void>;
  clearSelectedUserType: () => Promise<void>;
  clearVerificationPending: () => void;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; isUnverified?: boolean }>;
  register: (
    role: UserRole,
    data: RegisterAdminData | RegisterTeacherData | RegisterStudentData | RegisterParentData
  ) => Promise<{ success: boolean; isUnverified?: boolean }>;
  requestCode: (email: string, userType: UserRole) => Promise<boolean>;
  verifyCode: (code: string) => Promise<boolean>;
  resendCode: () => Promise<boolean>;
  logout: () => Promise<void>;
}

const userRepo = new UserRepository();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  selectedUserType: null,
  isAuthenticated: false,
  isLoading: true,
  authError: null,
  isOfflineMode: false,
  verificationPending: null,

  initAuth: async () => {
    try {
      const storedRole = await AuthService.getSelectedUserType();
      const token = await StorageService.getAuthToken();
      
      if (!token) {
        set({
          user: null,
          selectedUserType: storedRole,
          isAuthenticated: false,
          isLoading: false,
        });
        return;
      }

      const currentUser = await userRepo.getCurrentUser();
      if (currentUser) {
        set({
          user: currentUser,
          selectedUserType: (currentUser.role as UserRole) || storedRole,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({
          user: null,
          selectedUserType: storedRole,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  selectUserType: async (role: UserRole) => {
    await AuthService.setSelectedUserType(role);
    set({ selectedUserType: role });
  },

  clearSelectedUserType: async () => {
    await AuthService.clearSelectedUserType();
    set({ selectedUserType: null });
  },

  clearVerificationPending: () => {
    set({ verificationPending: null, authError: null });
  },

  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, authError: null });
    const result = await AuthService.login(credentials);

    if (result.success && result.user) {
      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        authError: null,
        verificationPending: null,
        isOfflineMode: !!result.isOfflineLogin,
      });
      return { success: true };
    } else if (result.isUnverified) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        authError: null,
        verificationPending: {
          email: credentials.email,
          userType: credentials.userType,
          preAuthToken: result.preAuthToken,
          isDeviceVerification: result.error?.toLowerCase().includes("device"),
        },
      });
      // Trigger verification code email
      await AuthService.requestCode(credentials.email, credentials.userType);
      return { success: false, isUnverified: true };
    } else {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        authError: result.error || "Login failed",
      });
      return { success: false };
    }
  },

  register: async (role, data) => {
    set({ isLoading: true, authError: null });
    const result = await AuthService.register(role, data);

    if (result.success && result.user && !result.isUnverified) {
      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        authError: null,
        verificationPending: null,
      });
      return { success: true };
    } else if (result.isUnverified || result.preAuthToken) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        authError: null,
        verificationPending: {
          email: data.email,
          userType: role,
          preAuthToken: result.preAuthToken,
          isDeviceVerification: result.error?.toLowerCase().includes("device"),
        },
      });
      // Trigger verification code email
      await AuthService.requestCode(data.email, role);
      return { success: false, isUnverified: true };
    } else {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        authError: result.error || "Registration failed",
      });
      return { success: false };
    }
  },

  requestCode: async (email: string, userType: UserRole) => {
    const res = await AuthService.requestCode(email, userType);
    if (!res.success) {
      set({ authError: res.error || "Failed to send code" });
      return false;
    }
    return true;
  },

  verifyCode: async (code: string) => {
    const pending = get().verificationPending;
    if (!pending) return false;

    set({ isLoading: true, authError: null });
    const res = await AuthService.verifyCode(pending.email, code, pending.userType);

    if (!res.success) {
      set({ isLoading: false, authError: res.error || "Invalid verification code" });
      return false;
    }

    // Auto-login with preAuthToken after successful verification
    const loginRes = await AuthService.login({
      email: pending.email,
      userType: pending.userType,
      preAuthToken: pending.preAuthToken,
    });

    if (loginRes.success && loginRes.user) {
      set({
        user: loginRes.user,
        isAuthenticated: true,
        isLoading: false,
        authError: null,
        verificationPending: null,
      });
      return true;
    }

    set({ 
      isLoading: false, 
      authError: loginRes.error || "Failed to complete login after verification"
    });
    return false;
  },

  resendCode: async () => {
    const pending = get().verificationPending;
    if (!pending) return false;
    const res = await AuthService.resendCode(pending.email, pending.userType);
    if (!res.success) {
      set({ authError: res.error || "Failed to resend code" });
      return false;
    }
    return true;
  },

  logout: async () => {
    await AuthService.logout();
    set({ user: null, isAuthenticated: false, isOfflineMode: false, authError: null, verificationPending: null });
  },
}));
