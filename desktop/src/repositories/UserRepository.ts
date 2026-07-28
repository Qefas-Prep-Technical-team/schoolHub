import { BaseRepository } from "./BaseRepository";
import { UserRecord } from "../types/database";

export class UserRepository extends BaseRepository<UserRecord> {
  constructor() {
    super("Users");
  }

  public async findByEmail(email: string): Promise<UserRecord | null> {
    const users = await this.findMany({
      where: "email = ?",
      params: [email],
      limit: 1,
    });
    return users[0] || null;
  }

  public async getCurrentUser(): Promise<UserRecord | null> {
    const users = await this.findMany({
      where: "token IS NOT NULL AND token != ''",
      orderBy: "updatedAt DESC",
      limit: 1,
    });
    return users[0] || null;
  }
}
