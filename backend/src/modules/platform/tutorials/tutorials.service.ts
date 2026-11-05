import prisma, { withRetry } from "../../../config/database";
import { TutorialItem, TutorialItemSchema } from "./tutorials.schema";
import { DEFAULT_TUTORIALS } from "./tutorials.defaults";

export const TUTORIALS_SETTING_KEY = "platform_tutorials_catalog";

export class TutorialService {
  /**
   * Resolve all tutorials from the database (via platformSettings).
   * Automatically initializes defaults in DB if not yet saved.
   */
  static async getAllTutorials(): Promise<TutorialItem[]> {
    const setting = await withRetry(
      () =>
        prisma.platformSettings.findUnique({
          where: { key: TUTORIALS_SETTING_KEY },
        }),
      "TutorialService_findUnique"
    );

    if (setting && setting.value) {
      try {
        const parsed = JSON.parse(setting.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as TutorialItem[];
        }
      } catch (e) {
        console.error("Failed to parse stored tutorials from database:", e);
      }
    }

    // Auto-seed database with institutional defaults on first access
    await this.seedDefaults();
    return DEFAULT_TUTORIALS;
  }

  /**
   * Get single tutorial by ID
   */
  static async getTutorialById(id: string): Promise<TutorialItem | null> {
    const tutorials = await this.getAllTutorials();
    return tutorials.find((t) => t.id === id) || null;
  }

  /**
   * Save or update the entire tutorials list in the database
   */
  static async saveTutorials(tutorials: TutorialItem[]): Promise<TutorialItem[]> {
    const value = JSON.stringify(tutorials);
    await withRetry(
      () =>
        prisma.platformSettings.upsert({
          where: { key: TUTORIALS_SETTING_KEY },
          update: { value },
          create: { key: TUTORIALS_SETTING_KEY, value },
        }),
      "TutorialService_saveTutorials"
    );
    return tutorials;
  }

  /**
   * Create or update a single tutorial in the database
   */
  static async upsertSingleTutorial(item: TutorialItem): Promise<TutorialItem[]> {
    const validated = TutorialItemSchema.parse(item);
    const tutorials = await this.getAllTutorials();
    const existingIndex = tutorials.findIndex((t) => t.id === validated.id);

    let updated: TutorialItem[];
    if (existingIndex >= 0) {
      updated = [...tutorials];
      updated[existingIndex] = validated;
    } else {
      updated = [validated, ...tutorials];
    }

    await this.saveTutorials(updated);
    return updated;
  }

  /**
   * Delete a tutorial by ID from the database
   */
  static async deleteTutorial(id: string): Promise<TutorialItem[]> {
    const tutorials = await this.getAllTutorials();
    const updated = tutorials.filter((t) => t.id !== id);
    await this.saveTutorials(updated);
    return updated;
  }

  /**
   * Reset the database tutorial catalog back to default institutional catalog
   */
  static async resetToDefaults(): Promise<TutorialItem[]> {
    const value = JSON.stringify(DEFAULT_TUTORIALS);
    await withRetry(
      () =>
        prisma.platformSettings.upsert({
          where: { key: TUTORIALS_SETTING_KEY },
          update: { value },
          create: { key: TUTORIALS_SETTING_KEY, value },
        }),
      "TutorialService_resetToDefaults"
    );
    return DEFAULT_TUTORIALS;
  }

  /**
   * Helper to seed defaults if setting row is absent
   */
  private static async seedDefaults(): Promise<void> {
    try {
      const value = JSON.stringify(DEFAULT_TUTORIALS);
      await withRetry(
        () =>
          prisma.platformSettings.upsert({
            where: { key: TUTORIALS_SETTING_KEY },
            update: {},
            create: { key: TUTORIALS_SETTING_KEY, value },
          }),
        "TutorialService_seedDefaults"
      );
    } catch (e) {
      console.error("Failed to seed default tutorials to database:", e);
    }
  }
}

