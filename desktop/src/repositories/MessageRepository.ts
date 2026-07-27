import { BaseRepository } from "./BaseRepository";
import { MessageRecord } from "../types/database";

export class MessageRepository extends BaseRepository<MessageRecord> {
  constructor() {
    super("Messages");
  }

  public async getConversation(userA: string, userB: string): Promise<MessageRecord[]> {
    return await this.findMany({
      where: "(senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)",
      params: [userA, userB, userB, userA],
      orderBy: "createdAt ASC",
    });
  }
}
