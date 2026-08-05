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

// Track whether we know the connection is healthy
let connectionHealthy = true;

// Listen to Prisma's query events to detect connection failures
prisma.$on("error" as never, () => {
  connectionHealthy = false;
});

/**
 * Wraps a Prisma operation with automatic reconnect-and-retry logic.
 * Retries up to `maxAttempts` times with exponential backoff.
 * This handles the window where pgBouncer drops idle connections
 * before the CRON keep-alive has had a chance to re-establish them.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  label = "prisma operation",
  maxAttempts = 3
): Promise<T> {
  // If we already know the connection is broken, reconnect proactively
  if (!connectionHealthy) {
    console.warn(`[DB] Proactive reconnect before "${label}" (connection was unhealthy)...`);
    try {
      await prisma.$disconnect();
      await prisma.$connect();
      connectionHealthy = true;
      console.log(`[DB] Proactive reconnect succeeded.`);
    } catch (reconnectErr) {
      console.error(`[DB] Proactive reconnect failed:`, reconnectErr);
      // Continue anyway — the operation may still succeed if Prisma
      // auto-reconnects internally
    }
  }

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await operation();
      connectionHealthy = true;
      return result;
    } catch (error) {
      lastError = error;

      const isConnectionError =
        error instanceof Prisma.PrismaClientInitializationError ||
        (error instanceof Prisma.PrismaClientKnownRequestError &&
          (error.code === "P1001" ||
            error.code === "P1002" ||
            error.code === "P1008" ||
            error.code === "P1017")) ||
        (error instanceof Prisma.PrismaClientUnknownRequestError &&
          error.message.includes("Engine is not yet connected"));

      if (!isConnectionError || attempt === maxAttempts) {
        // Non-connection error, or we've exhausted all retries
        throw error;
      }

      connectionHealthy = false;
      const backoffMs = 500 * attempt; // 500ms, 1000ms, 1500ms ...
      console.warn(
        `[DB] Connection error on "${label}" (attempt ${attempt}/${maxAttempts}). ` +
        `Reconnecting in ${backoffMs}ms...`
      );

      await new Promise(res => setTimeout(res, backoffMs));

      try {
        await prisma.$disconnect();
        await prisma.$connect();
        connectionHealthy = true;
        console.log(`[DB] Reconnected. Retrying "${label}" (attempt ${attempt + 1})...`);
      } catch (reconnectErr) {
        console.error(`[DB] Reconnect failed on attempt ${attempt}:`, reconnectErr);
        // Try the operation anyway on next loop iteration
      }
    }
  }

  throw lastError;
}

export default prisma;
