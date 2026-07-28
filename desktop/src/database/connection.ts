import Database from "@tauri-apps/plugin-sql";

/**
 * Checks if the application is running inside a native Tauri desktop container.
 */
export const isTauri = (): boolean => {
  return (
    typeof window !== "undefined" &&
    ((window as any).__TAURI_INTERNALS__ !== undefined ||
      (window as any).__TAURI_IPC__ !== undefined ||
      (window as any).__TAURI__ !== undefined)
  );
};

/**
 * In-browser Web Storage Database Fallback for development in regular web browsers.
 * Simulates SQLite table storage using browser localStorage.
 */
class WebDatabaseFallback {
  private getStorageKey(table: string): string {
    return `qefashub_web_db_${table.toLowerCase()}`;
  }

  private getTableData(table: string): any[] {
    const raw = localStorage.getItem(this.getStorageKey(table));
    return raw ? JSON.parse(raw) : [];
  }

  private saveTableData(table: string, data: any[]): void {
    localStorage.setItem(this.getStorageKey(table), JSON.stringify(data));
  }

  public async execute(query: string, bindValues: unknown[] = []): Promise<any> {
    const cleanQuery = query.trim();

    // 1. CREATE TABLE
    if (cleanQuery.toUpperCase().startsWith("CREATE TABLE")) {
      const match = cleanQuery.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/i);
      if (match) {
        const table = match[1];
        if (!localStorage.getItem(this.getStorageKey(table))) {
          this.saveTableData(table, []);
        }
      }
      return { rowsAffected: 0 };
    }

    // 2. INSERT INTO / INSERT OR IGNORE
    if (cleanQuery.toUpperCase().startsWith("INSERT")) {
      const match = cleanQuery.match(/INSERT (?:OR IGNORE )?INTO (\w+)\s*\(([^)]+)\)/i);
      if (match) {
        const table = match[1];
        const columns = match[2].split(",").map((c) => c.trim());
        const data = this.getTableData(table);

        const newRecord: Record<string, any> = {};
        columns.forEach((col, idx) => {
          newRecord[col] = bindValues[idx] !== undefined ? bindValues[idx] : null;
        });

        // Unique key check for IGNORE
        if (cleanQuery.toUpperCase().includes("OR IGNORE")) {
          const existing = data.find((r) => r.id === newRecord.id || r.key === newRecord.key);
          if (existing) return { rowsAffected: 0 };
        }

        // Handle ON CONFLICT(id) DO UPDATE SET ...
        const conflictIndex = data.findIndex((r) => r.id === newRecord.id);
        if (conflictIndex >= 0 && cleanQuery.toUpperCase().includes("ON CONFLICT")) {
          data[conflictIndex] = { ...data[conflictIndex], ...newRecord };
        } else {
          data.push(newRecord);
        }

        this.saveTableData(table, data);
        return { rowsAffected: 1 };
      }
    }

    // 3. UPDATE
    if (cleanQuery.toUpperCase().startsWith("UPDATE")) {
      const match = cleanQuery.match(/UPDATE (\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
      if (match) {
        const table = match[1];
        const setClause = match[2];
        const data = this.getTableData(table);

        // Simple ID or Key matcher
        const lastBind = bindValues[bindValues.length - 1];
        const setKeys = setClause.split(",").map((s) => s.split("=")[0].trim());

        let updatedCount = 0;
        const updatedData = data.map((item) => {
          if (item.id === lastBind || item.key === lastBind || item.userId === lastBind) {
            updatedCount++;
            const newItem = { ...item };
            setKeys.forEach((key, idx) => {
              if (idx < bindValues.length - 1) {
                newItem[key] = bindValues[idx];
              }
            });
            return newItem;
          }
          return item;
        });

        this.saveTableData(table, updatedData);
        return { rowsAffected: updatedCount };
      }
    }

    // 4. DELETE
    if (cleanQuery.toUpperCase().startsWith("DELETE")) {
      const match = cleanQuery.match(/DELETE FROM (\w+)\s+WHERE\s+id\s*=\s*\?/i);
      if (match) {
        const table = match[1];
        const targetId = bindValues[0];
        const data = this.getTableData(table);
        const filtered = data.filter((item) => item.id !== targetId);
        this.saveTableData(table, filtered);
        return { rowsAffected: data.length - filtered.length };
      }
    }

    return { rowsAffected: 0 };
  }

  public async select<T>(query: string, bindValues: unknown[] = []): Promise<T[]> {
    const cleanQuery = query.trim();
    const match = cleanQuery.match(/FROM (\w+)/i);
    if (!match) return [];

    const table = match[1];
    let data = this.getTableData(table);

    // Apply soft delete filter if present
    if (cleanQuery.includes("deletedAt IS NULL")) {
      data = data.filter((item) => !item.deletedAt);
    }

    // Apply basic parameter matching
    if (bindValues.length > 0) {
      if (cleanQuery.includes("id = ?")) {
        data = data.filter((item) => item.id === bindValues[0]);
      } else if (cleanQuery.includes("key = ?")) {
        data = data.filter((item) => item.key === bindValues[0]);
      } else if (cleanQuery.includes("email = ?")) {
        data = data.filter((item) => item.email === bindValues[0]);
      } else if (cleanQuery.includes("userId = ?")) {
        data = data.filter((item) => item.userId === bindValues[0]);
      } else if (cleanQuery.includes("syncStatus = ?")) {
        data = data.filter((item) => item.syncStatus === bindValues[0]);
      }
    }

    return data as T[];
  }
}

export class DatabaseService {
  private static instance: any = null;
  private static isInitializing = false;

  /**
   * Returns singleton instance of native SQLite (Tauri desktop) or WebStorage database (Web browser).
   */
  public static async getInstance(): Promise<any> {
    if (this.instance) {
      return this.instance;
    }

    if (this.isInitializing) {
      while (this.isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      if (this.instance) return this.instance;
    }

    try {
      this.isInitializing = true;

      if (isTauri()) {
        console.log("[DatabaseService] Running in Tauri Container. Loading native SQLite driver...");
        this.instance = await Database.load("sqlite:qefashub_local.db");
      } else {
        console.warn(
          "[DatabaseService] Running in Web Browser mode (window.__TAURI_INTERNALS__ missing). Activating Web Storage Fallback DB..."
        );
        this.instance = new WebDatabaseFallback();
      }

      return this.instance;
    } catch (error) {
      console.warn("[DatabaseService] Native SQLite load fallback to Web Storage DB:", error);
      this.instance = new WebDatabaseFallback();
      return this.instance;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Helper utility to execute parameterized raw SQL queries safely.
   */
  public static async execute(query: string, bindValues: unknown[] = []): Promise<unknown> {
    const db = await this.getInstance();
    return await db.execute(query, bindValues);
  }

  /**
   * Helper utility to execute select queries with type casting.
   */
  public static async select<T>(query: string, bindValues: unknown[] = []): Promise<T[]> {
    const db = await this.getInstance();
    const results = await db.select(query, bindValues);
    return results as T[];
  }
}
