import { Response } from "express";

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
  } else {
    console.error(error);
  }
  console.error(`======================================================\n`);

  // 3. Custom error message sent to the frontend for safety
  // If it is a known validation error from our app (like a 400), we should ideally handle it earlier in the controller.
  // By the time it reaches this 500 catch-all, we should mask the raw error entirely.

  return res.status(500).json({
    success: false,
    message: "An unexpected error occurred. Please try again later."
  });
};
