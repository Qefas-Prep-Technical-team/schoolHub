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
 * If the connection is known to be unhealthy, it reconnects FIRST before
 * even attempting the query, preventing the request from failing mid-flight.
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  label = "prisma operation"
): Promise<T> {
  // If we know the connection is broken, reconnect proactively
  if (!connectionHealthy) {
    console.warn(`[DB] Proactive reconnect before "${label}" (connection was unhealthy)...`);
    try {
      await prisma.$disconnect();
      await prisma.$connect();
      connectionHealthy = true;
      console.log(`[DB] Proactive reconnect succeeded.`);
    } catch (reconnectErr) {
      console.error(`[DB] Proactive reconnect failed:`, reconnectErr);
    }
  }

  try {
    const result = await operation();
    connectionHealthy = true; // Mark healthy on success
    return result;
  } catch (error) {
    const isConnectionError =
      error instanceof Prisma.PrismaClientInitializationError ||
      (error instanceof Prisma.PrismaClientKnownRequestError &&
        (error.code === "P1001" ||
          error.code === "P1002" ||
          error.code === "P1008" ||
          error.code === "P1017")) ||
      (error instanceof Prisma.PrismaClientUnknownRequestError &&
        error.message.includes("Engine is not yet connected"));

    if (isConnectionError) {
      connectionHealthy = false;
      console.warn(
        `[DB] Connection error on "${label}". Reconnecting and retrying...`
      );
      try {
        await prisma.$disconnect();
        await prisma.$connect();
        connectionHealthy = true;
        console.log(`[DB] Reconnected. Retrying "${label}"...`);
        const result = await operation();
        return result;
      } catch (retryError) {
        connectionHealthy = false;
        console.error(`[DB] Retry failed for "${label}":`, retryError);
        throw retryError;
      }
    }

    throw error;
  }
}

export default prisma;
