// ...existing code...
import { PrismaClient } from "../generated/prisma";

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

export default prisma;
// ...existing code...
