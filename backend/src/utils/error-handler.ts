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
export const handleError = (res: Response, error: any, location: string) => {
  // 1. Time tracking
  const timestamp = new Date().toISOString();

  // 2. Exact area / location tracking and logging to the console log
  console.error(`\n======================================================`);
  console.error(`[${timestamp}] ERROR in ${location}`);
  console.error(`======================================================`);
  
  if (error instanceof Error) {
    console.error(error.stack || error.message);
    fs.appendFileSync('error-log.txt', error.stack || error.message + '\n');
  } else {
    console.error(error);
    fs.appendFileSync('error-log.txt', JSON.stringify(error) + '\n');
  }
  console.error(`======================================================\n`);

  // 3. Custom error message sent to the frontend for safety
  let statusCode = 500;
  let errorMessage = "An unexpected error occurred. Please try again later.";

  if (error instanceof Error) {
    // Detect Prisma network/connection timeout issues
    if (error.name.includes("Prisma") || error.message.toLowerCase().includes("prisma")) {
      if (error.message.includes("connection pool") || error.message.includes("timed out") || error.message.includes("connect to the database")) {
        statusCode = 503;
        errorMessage = "Network issue: Unable to connect to the database. Please try again.";
      }
    } else {
      // Pass through business logic errors (not Prisma/DB errors)
      statusCode = 400;
      errorMessage = error.message;
    }
  }

  return res.status(statusCode).json({
    success: false,
    message: errorMessage
  });
};
