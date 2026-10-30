import { PrismaClient, Prisma } from "@prisma/client";

declare global {
  // allow global var for dev hot-reload (Next/ts-node/etc.)
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });

if (process.env.NODE_ENV === "development") global.prisma = prisma;

// Single-flight reconnect promise: guarantees only one reconnect is ever in flight
let reconnectPromise: Promise<void> | null = null;
let consecutiveConnectionErrors = 0;

/**
 * Returns true if a database reconnect is currently in progress.
 */
export function isReconnecting(): boolean {
  return reconnectPromise !== null;
}

/**
 * Single-flight reconnect handler.
 * If a reconnect is already running, callers await the same promise instead of starting another.
 * Catches disconnect errors so engine tear-down does not abort reconnect, then connects with no short timeout.
 */
export async function performReconnect(): Promise<void> {
  if (reconnectPromise) return reconnectPromise;

  reconnectPromise = (async () => {
    try {
      console.warn("[DB] Performing single-flight database reconnection...");
      await prisma.$disconnect().catch((discErr) => {
        console.warn("[DB] prisma.$disconnect() caught error during reconnect:", discErr);
      });
      await prisma.$connect();
      console.log("[DB] ✅ Database reconnected successfully.");
      consecutiveConnectionErrors = 0;
    } catch (connErr) {
      console.error("[DB] ❌ Reconnect attempt failed:", connErr);
      throw connErr;
    } finally {
      reconnectPromise = null;
    }
  })();

  return reconnectPromise;
}

// Listen to Prisma's error events for observability
prisma.$on("error" as never, (err: unknown) => {
  console.error("[DB Event] Prisma engine error encountered:", err);
});

/**
 * Identifies whether an error is a genuine connection/network issue.
 * Explicitly excludes validation, unique constraints, and business logic errors.
 */
export function isPrismaConnectionError(error: unknown): boolean {
  if (!error) return false;

  // Initialization errors (e.g. engine binary crash, startup failure)
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  // Known Request Errors with connection-specific codes
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P1001: Can't reach database server
    // P1002: The database server was reached but timed out
    // P1008: Operations timed out
    // P1017: Server has closed the connection
    if (["P1001", "P1002", "P1008", "P1017"].includes(error.code)) {
      return true;
    }
  }

  // Unknown Request Errors (e.g. socket drops mid-query)
  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return true;
  }

  const errObj = error as Record<string, unknown>;
  const errName = typeof errObj.name === "string" ? errObj.name : "";
  if (
    errName === "PrismaClientInitializationError" ||
    errName === "PrismaClientUnknownRequestError"
  ) {
    return true;
  }

  const errorMessage =
    error instanceof Error ? error.message : typeof error === "string" ? error : JSON.stringify(error);

  const connectionKeywords = [
    "Engine is not yet connected",
    "Server has closed the connection",
    "Can't reach database server",
    "too many connections",
    "Connection terminated unexpectedly",
    "terminating connection",
    "Connection lost",
    "socket has been closed",
    "ECONNRESET",
    "ETIMEDOUT",
    "EHOSTUNREACH",
    "ENETUNREACH"
  ];

  return connectionKeywords.some((keyword) =>
    errorMessage.toLowerCase().includes(keyword.toLowerCase())
  );
}

/**
 * Wraps a Prisma operation with single-flight automatic reconnect-and-retry logic.
 * Retries up to `maxAttempts` times with exponential backoff and randomized jitter.
 * Exclusively triggers reconnection for real connection errors.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  label = "prisma operation",
  maxAttempts = 3
): Promise<T> {
  // If a reconnect is currently running, wait for it first
  if (reconnectPromise) {
    console.log(`[DB] Operation "${label}" waiting for existing single-flight reconnect to finish...`);
    try {
      await reconnectPromise;
    } catch {
      // If it failed, loop below will attempt its own guarded reconnect cycle
    }
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await operation();
      consecutiveConnectionErrors = 0;
      return result;
    } catch (error) {
      lastError = error;

      const isConnError = isPrismaConnectionError(error);

      // Log full error details on first failure or when connection error occurs
      if (attempt === 1 || isConnError) {
        console.error(`[DB] Operation "${label}" failed on attempt ${attempt}/${maxAttempts}. (isConnectionError: ${isConnError})`, {
          name: (error as Error)?.name,
          message: (error as Error)?.message,
          code: (error as Record<string, unknown>)?.code,
          meta: (error as Record<string, unknown>)?.meta,
          stack: (error as Error)?.stack,
        });
      }

      // Do NOT retry or reconnect if this is not a connection-level error
      if (!isConnError || attempt === maxAttempts) {
        throw error;
      }

      consecutiveConnectionErrors++;

      // Exponential backoff with jitter: (500 * 2^(attempt - 1)) + (0 to 300ms random)
      const baseDelay = 500 * Math.pow(2, attempt - 1); // 500ms, 1000ms, 2000ms
      const jitter = Math.floor(Math.random() * 300);
      const backoffMs = baseDelay + jitter;

      console.warn(
        `[DB] Connection error on "${label}" (attempt ${attempt}/${maxAttempts}). Waiting ${backoffMs}ms before single-flight reconnect...`
      );

      await new Promise((res) => setTimeout(res, backoffMs));

      try {
        await performReconnect();
        console.log(`[DB] Reconnect complete. Retrying "${label}" (attempt ${attempt + 1}/${maxAttempts})...`);
      } catch (reconnectErr) {
        console.error(`[DB] Single-flight reconnect failed on attempt ${attempt}:`, reconnectErr);
      }
    }
  }

  throw lastError;
}

export default prisma;

