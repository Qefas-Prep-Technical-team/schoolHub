import { BaseRepository } from "./BaseRepository";
import { SettingRecord } from "../types/database";

export class SettingsRepository extends BaseRepository<SettingRecord> {
  constructor() {
    super("Settings");
  }

  public async getByKey(key: string): Promise<string | null> {
    const settings = await this.findMany({
      where: "key = ?",
      params: [key],
      limit: 1,
    });
    return settings[0]?.value || null;
  }

  public async setKey(key: string, value: string, category = "general"): Promise<SettingRecord> {
    const existing = await this.findMany({
      where: "key = ?",
      params: [key],
      limit: 1,
    });

    if (existing.length > 0) {
      const updated = await this.update(existing[0].id, { value, category });
      return updated!;
    } else {
      return await this.create({ key, value, category });
    }
  }
}
