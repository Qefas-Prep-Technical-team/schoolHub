import { ApiService } from "./ApiService";
import { StorageService } from "./StorageService";
import { UserRepository } from "../repositories/UserRepository";
import { NetworkMonitor } from "./NetworkMonitor";
import { UserRecord } from "../types/database";

export type UserRole = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

export interface LoginCredentials {
  email: string;
  password?: string;
  userType: UserRole;
  preAuthToken?: string;
}

export interface RegisterAdminData {
  schoolName: string;
  adminName: string;
  email: string;
  password: string;
  confirmPassword: string;
  subdomain?: string;
}

export interface RegisterTeacherData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  tenantId?: string;
  schoolCode?: string;
}

export interface RegisterStudentData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  schoolCode?: string;
  classCode?: string;
}

export interface RegisterParentData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  studentCode?: string;
}

export interface AuthResponseData {
  accessToken?: string;
  token?: string;
  userRole?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    fullName?: string;
    role?: string;
    avatar?: string | null;
  };
}

export class AuthService {
  private static userRepo = new UserRepository();

  /**
   * Persistently stores the user's preferred role type (like mobile app).
   */
  public static async setSelectedUserType(role: UserRole): Promise<void> {
    await StorageService.setItem("selected_user_type", role);
  }

  /**
   * Retrieves the stored preferred role type.
   */
  public static async getSelectedUserType(): Promise<UserRole | null> {
    return await StorageService.getItem<UserRole>("selected_user_type");
  }

  /**
   * Clears the stored user type preference.
   */
  public static async clearSelectedUserType(): Promise<void> {
    await StorageService.removeItem("selected_user_type");
  }

  /**
   * Performs authentication supporting both online API verification and offline SQLite session login.
   */
  public static async login(credentials: LoginCredentials): Promise<{
    success: boolean;
    user?: UserRecord;
    error?: string;
    isOfflineLogin?: boolean;
    isUnverified?: boolean;
    preAuthToken?: string;
  }> {
    const isOnline = NetworkMonitor.getInstance().isOnline;

    if (isOnline) {
      console.log("[AuthService] Network online. Authenticating with remote API...");
      const response = await ApiService.post<any>("/auth/login", {
        email: credentials.email,
        password: credentials.password,
        userType: credentials.userType,
        preAuthToken: credentials.preAuthToken,
      });

      if (!response.success || !response.data) {
        const errorMsg = response.error || "Authentication failed. Please check your credentials.";
        const rawData = (response as any).rawData as any;
        
        const isUnverified =
          response.status === 403 ||
          errorMsg.toLowerCase().includes("verify") ||
          errorMsg.toLowerCase().includes("verification") ||
          rawData?.requiresVerification === true;

        // preAuthToken comes in the error response body (rawData), not response.data
        const preAuthToken = rawData?.preAuthToken || (response.data as any)?.preAuthToken;

        return {
          success: false,
          error: errorMsg,
          isUnverified,
          preAuthToken,
        };
      }

      const resPayload = response.data.data || response.data;
      const token = resPayload.accessToken || resPayload.token || "token_placeholder";
      const userObj = resPayload.user || {};
      const name = userObj.name || userObj.fullName || credentials.email.split("@")[0];
      const role = resPayload.userRole || userObj.role || credentials.userType;

      await StorageService.setAuthToken(token);

      const existingUser = await this.userRepo.findByEmail(credentials.email);
      let userRecord: UserRecord;

      if (existingUser) {
        userRecord = (await this.userRepo.update(
          existingUser.id,
          {
            name,
            role,
            avatar: userObj.avatar || null,
            token,
          },
          true
        ))!;
      } else {
        userRecord = await this.userRepo.create(
          {
            id: userObj.id || `usr_${Date.now()}`,
            email: credentials.email,
            name,
            role,
            avatar: userObj.avatar || null,
            token,
          },
          true
        );
      }

      return {
        success: true,
        user: userRecord,
        isOfflineLogin: false,
      };
    }

    // OFFLINE FALLBACK
    console.log("[AuthService] Network offline. Attempting local SQLite authentication fallback...");
    const localUser = await this.userRepo.findByEmail(credentials.email);

    if (!localUser) {
      return {
        success: false,
        error: "Offline login failed. No local user account cached. Please connect to the internet to sign in first.",
      };
    }

    await StorageService.setAuthToken(localUser.token || "offline_session_token");

    return {
      success: true,
      user: localUser,
      isOfflineLogin: true,
    };
  }

  /**
   * Registers a new account depending on the user role.
   */
  public static async register(
    role: UserRole,
    data: RegisterAdminData | RegisterTeacherData | RegisterStudentData | RegisterParentData
  ): Promise<{ success: boolean; user?: UserRecord; error?: string; preAuthToken?: string; isUnverified?: boolean }> {
    const isOnline = NetworkMonitor.getInstance().isOnline;

    let endpoint = "/auth/register/school";
    if (role === "TEACHER") endpoint = "/auth/register/teacher";
    if (role === "STUDENT") endpoint = "/auth/register/student";
    if (role === "PARENT") endpoint = "/auth/register/parents";

    if (isOnline) {
      const response = await ApiService.post<any>(endpoint, data);

      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || "Registration failed. Please try again.",
        };
      }

      const resPayload = response.data.data || response.data;
      const token = resPayload.accessToken || resPayload.token;
      const preAuthToken = resPayload.preAuthToken;
      const userObj = resPayload.user || {};
      const name = (data as any).adminName || (data as any).fullName || userObj.name || "User";

      if (token) {
        await StorageService.setAuthToken(token);
      }

      const userRecord = await this.userRepo.create(
        {
          id: userObj.id || `usr_${Date.now()}`,
          email: data.email,
          name,
          role,
          avatar: null,
          token: token || preAuthToken || "pending_token",
        },
        true
      );

      return {
        success: true,
        user: userRecord,
        preAuthToken,
        isUnverified: !token && !!preAuthToken,
      };
    }

    // Offline registration cache fallback
    const name = (data as any).adminName || (data as any).fullName || "Offline User";
    const userRecord = await this.userRepo.create(
      {
        email: data.email,
        name,
        role,
        avatar: null,
        token: "offline_session_token",
      },
      false
    );

    return { success: true, user: userRecord };
  }

  /**
   * Requests a 6-digit email verification code.
   */
  public static async requestCode(email: string, userType: UserRole): Promise<{ success: boolean; error?: string }> {
    const response = await ApiService.post<any>("/auth/request-code", { email, userType });
    if (!response.success) {
      return { success: false, error: response.error || "Failed to send verification code." };
    }
    return { success: true };
  }

  /**
   * Verifies a 6-digit OTP confirmation code.
   */
  public static async verifyCode(
    email: string,
    code: string,
    userType: UserRole
  ): Promise<{ success: boolean; isNewUser?: boolean; error?: string }> {
    const response = await ApiService.post<any>("/auth/verify-code", { email, code, userType });
    if (!response.success) {
      return { success: false, error: response.error || "Invalid verification code." };
    }

    const isNewUser = (response.data as any)?.data?.isNewUser ?? false;
    return { success: true, isNewUser };
  }

  /**
   * Resends a 6-digit confirmation code. Reuses the request-code endpoint.
   */
  public static async resendCode(email: string, userType: UserRole): Promise<{ success: boolean; error?: string }> {
    const response = await ApiService.post<any>("/auth/request-code", { email, userType });
    if (!response.success) {
      return { success: false, error: response.error || "Failed to resend code." };
    }
    return { success: true };
  }

  public static async logout(): Promise<void> {
    const currentUser = await this.userRepo.getCurrentUser();
    if (currentUser) {
      await this.userRepo.update(currentUser.id, { token: null }, true);
    }
    await ApiService.post("/auth/logout").catch(() => {});
    await StorageService.clearAuthToken();
  }
}
