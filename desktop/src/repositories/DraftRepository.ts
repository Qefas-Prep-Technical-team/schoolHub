import { BaseRepository } from "./BaseRepository";
import { DraftRecord } from "../types/database";

export class DraftRepository extends BaseRepository<DraftRecord> {
  constructor() {
    super("Drafts");
  }

  public async getDraft(userId: string, entityType: string): Promise<DraftRecord | null> {
    const drafts = await this.findMany({
      where: "userId = ? AND entityType = ?",
      params: [userId, entityType],
      limit: 1,
    });
    return drafts[0] || null;
  }

  public async saveDraft(
    userId: string,
    entityType: string,
    body: string,
    title?: string,
    payload?: Record<string, unknown>
  ): Promise<DraftRecord> {
    const existing = await this.getDraft(userId, entityType);
    const payloadStr = payload ? JSON.stringify(payload) : null;

    if (existing) {
      const updated = await this.update(existing.id, {
        title: title || null,
        body,
        payload: payloadStr,
      });
      return updated!;
    } else {
      return await this.create({
        userId,
        entityType,
        title: title || null,
        body,
        payload: payloadStr,
      });
    }
  }
}
