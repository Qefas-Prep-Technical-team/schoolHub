import { DatabaseService } from "./connection";
import { ALL_SCHEMAS } from "./schema";

export class MigrationRunner {
  /**
   * Initializes all required database tables and default indices.
   */
  public static async runMigrations(): Promise<void> {
    console.log("[MigrationRunner] Starting database schema initialization...");

    try {
      const db = await DatabaseService.getInstance();

      // Execute each table creation & indexing DDL statement sequentially
      for (const ddlScript of ALL_SCHEMAS) {
        // Split DDL script by semicolon to handle multiple CREATE TABLE and CREATE INDEX statements
        const statements = ddlScript
          .split(";")
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        for (const statement of statements) {
          await db.execute(statement);
        }
      }

      // Seed initial metadata defaults if not exists
      const now = new Date().toISOString();
      await db.execute(
        `INSERT OR IGNORE INTO Metadata (id, key, value, lastSyncedAt, createdAt, updatedAt, syncStatus)
         VALUES ('meta_last_sync', 'last_sync_timestamp', '', NULL, ?, ?, 'SYNCED')`,
        [now, now]
      );

      await db.execute(
        `INSERT OR IGNORE INTO Settings (id, key, value, category, createdAt, updatedAt, syncStatus)
         VALUES ('set_theme', 'theme_mode', 'dark', 'appearance', ?, ?, 'SYNCED')`,
        [now, now]
      );

      await db.execute(
        `INSERT OR IGNORE INTO Settings (id, key, value, category, createdAt, updatedAt, syncStatus)
         VALUES ('set_sync_freq', 'sync_frequency_seconds', '30', 'sync', ?, ?, 'SYNCED')`,
        [now, now]
      );

      console.log("[MigrationRunner] Database schema migrations completed successfully.");
    } catch (error) {
      console.error("[MigrationRunner] Migration execution failed:", error);
      throw error;
    }
  }
}
