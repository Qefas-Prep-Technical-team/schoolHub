import { BaseRepository } from "./BaseRepository";
import { TodoRecord } from "../types/database";

export class TodoRepository extends BaseRepository<TodoRecord> {
  constructor() {
    super("Todos");
  }

  public async getByUser(userId: string): Promise<TodoRecord[]> {
    return await this.findMany({
      where: "userId = ?",
      params: [userId],
      orderBy: "createdAt DESC",
    });
  }

  public async toggleComplete(id: string, isCompleted: boolean): Promise<TodoRecord | null> {
    return await this.update(id, { isCompleted: isCompleted ? 1 : 0 });
  }

  public async getPendingSyncTodos(): Promise<TodoRecord[]> {
    return await this.findMany({
      where: "syncStatus != 'SYNCED'",
    });
  }
}
