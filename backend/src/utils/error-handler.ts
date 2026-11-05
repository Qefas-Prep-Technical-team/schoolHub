import { Response } from "express";
import fs from "fs";

/**
 * A centralized error handler that logs the error securely to the console
 * with a timestamp and location, while returning a sanitized response to the frontend.
 *
 * @param res - The Express response object
 * @param error - The error object caught in the try/catch block
 * @param location - A string describing where the error occurred (e.g. "student.controller.ts -> createStudent")
 */
export const handleError = (res: Response, error: unknown, location: string) => {
  const timestamp = new Date().toISOString();

  console.error(`\n======================================================`);
  console.error(`[${timestamp}] ERROR in ${location}`);
  console.error(`======================================================`);

  if (error instanceof Error) {
    console.error(error.stack || error.message);
    fs.appendFileSync("error-log.txt", (error.stack || error.message) + "\n");
  } else {
    console.error(error);
    fs.appendFileSync("error-log.txt", JSON.stringify(error) + "\n");
  }
  console.error(`======================================================\n`);

  let statusCode = 500;
  let errorMessage = "An unexpected error occurred. Please try again later.";

  const errObj = error as {
    statusCode?: number;
    code?: string;
    detectedRole?: string;
    correctPortal?: string;
  } | null;

  if (error instanceof Error) {
    if (error.name.includes("Prisma") || error.message.toLowerCase().includes("prisma")) {
      if (
        error.message.includes("connection pool") ||
        error.message.includes("timed out") ||
        error.message.includes("connect to the database")
      ) {
        statusCode = 503;
        errorMessage = "Network issue: Unable to connect to the database. Please try again.";
      }
    } else {
      statusCode = typeof errObj?.statusCode === "number" ? errObj.statusCode : 400;
      errorMessage = error.message;
    }
  }

  const responsePayload: Record<string, unknown> = {
    success: false,
    message: errorMessage,
  };

  if (errObj?.code) {
    responsePayload.code = errObj.code;
  }
  if (errObj?.detectedRole) {
    responsePayload.detectedRole = errObj.detectedRole;
  }
  if (errObj?.correctPortal) {
    responsePayload.correctPortal = errObj.correctPortal;
  }

  const finalStatus = errObj?.code === "WRONG_PORTAL" ? 403 : statusCode;

  return res.status(finalStatus).json(responsePayload);
};
