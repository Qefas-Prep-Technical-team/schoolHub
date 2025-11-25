// src/types/express.d.ts
import { Request } from "express";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      school?: {
        id: string;
        name: string;
        tenantId: string;
      }; // You can replace 'any' with a specific type later
    }
  }
}
