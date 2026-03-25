// src/types/express.d.ts
import { Request } from "express";

declare global {
  namespace Express {
       interface User {
      id: string;
      userType: UserRole;
    }

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
