import { LazyStore } from "@tauri-apps/plugin-store";

export class StorageService {
  private static store: LazyStore | null = null;

  private static getStore(): LazyStore {
    if (!this.store) {
      this.store = new LazyStore(".qefashub_secure.dat");
    }
    return this.store;
  }

  public static async setItem(key: string, value: unknown): Promise<void> {
    try {
      const store = this.getStore();
      await store.set(key, value);
      await store.save();
    } catch (error) {
      console.warn(`[StorageService] Store fallback write for key "${key}":`, error);
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  public static async getItem<T>(key: string): Promise<T | null> {
    try {
      const store = this.getStore();
      const value = await store.get<T>(key);
      if (value !== undefined && value !== null) {
        return value;
      }
    } catch (error) {
      console.warn(`[StorageService] Store fallback read for key "${key}":`, error);
    }

    const fallback = localStorage.getItem(key);
    return fallback ? (JSON.parse(fallback) as T) : null;
  }

  public static async removeItem(key: string): Promise<void> {
    try {
      const store = this.getStore();
      await store.delete(key);
      await store.save();
    } catch (error) {
      console.warn(`[StorageService] Store fallback delete for key "${key}":`, error);
    }
    localStorage.removeItem(key);
  }

  public static async setAuthToken(token: string): Promise<void> {
    await this.setItem("auth_token", token);
  }

  public static async getAuthToken(): Promise<string | null> {
    return await this.getItem<string>("auth_token");
  }

  public static async clearAuthToken(): Promise<void> {
    await this.removeItem("auth_token");
  }
}
