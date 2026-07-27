import { BaseRecord } from "../types/database";
import { ConflictContext, ConflictResolutionResult, IConflictStrategy } from "../types/sync";

export class LastUpdatedWinsStrategy implements IConflictStrategy {
  public name = "LastUpdatedWins";

  public resolve<T extends BaseRecord>(context: ConflictContext<T>): ConflictResolutionResult<T> {
    const localTime = new Date(context.localRecord.updatedAt || 0).getTime();
    const remoteTime = new Date(context.remoteRecord.updatedAt || 0).getTime();

    if (localTime >= remoteTime) {
      return {
        resolvedRecord: context.localRecord,
        winner: "local",
      };
    } else {
      return {
        resolvedRecord: context.remoteRecord,
        winner: "remote",
      };
    }
  }
}

export class ConflictResolver {
  private defaultStrategy: IConflictStrategy;
  private customEntityStrategies: Map<string, IConflictStrategy> = new Map();

  constructor(defaultStrategy?: IConflictStrategy) {
    this.defaultStrategy = defaultStrategy || new LastUpdatedWinsStrategy();
  }

  /**
   * Registers a custom conflict resolution strategy for a specific entity table (e.g. 'Todos').
   */
  public registerCustomStrategy(entityName: string, strategy: IConflictStrategy): void {
    this.customEntityStrategies.set(entityName, strategy);
  }

  /**
   * Resolves a conflict between local SQLite record and remote API record.
   */
  public resolve<T extends BaseRecord>(
    entityName: string,
    localRecord: T,
    remoteRecord: T
  ): ConflictResolutionResult<T> {
    const strategy = this.customEntityStrategies.get(entityName) || this.defaultStrategy;

    return strategy.resolve<T>({
      entityName,
      localRecord,
      remoteRecord,
    });
  }
}
