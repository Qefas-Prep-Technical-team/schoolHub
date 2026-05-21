import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { checkSchoolFeatureAccess } from "./schoolChecker";
import { checkUserFeatureAccess } from "./userChecker";

/**
 * Interface representing the structure of the authenticated user in the request.
 * Expected to be populated by authMiddleware.
 */
export interface AuthenticatedUserContext {
  id: string;
  userType: UserRole;
  schoolId?: string;
  tenantId?: string;
}

/**
 * Programmatically checks if the given user context has access to a specific premium feature.
 * 
 * @param user Context object usually found on req.user
 * @param featureKey The unique key of the feature to check
 * @returns boolean indicating if they have access
 */
export const hasFeatureAccess = async (user: AuthenticatedUserContext, featureKey: string): Promise<boolean> => {
  console.log(`[hasFeatureAccess DEBUG] Checking access for feature: ${featureKey}`);
  console.log(`[hasFeatureAccess DEBUG] User Context:`, JSON.stringify(user, null, 2));

  if (!user) {
    console.log(`[hasFeatureAccess DEBUG] No user context, returning false.`);
    return false;
  }

  // If the user is an ADMIN, they represent the school level
  if (user.userType === "ADMIN") {
    if (!user.schoolId) {
      console.log(`[hasFeatureAccess DEBUG] User is ADMIN but has no schoolId, returning false.`);
      return false;
    }
    const result = await checkSchoolFeatureAccess(user.schoolId, featureKey);
    console.log(`[hasFeatureAccess DEBUG] checkSchoolFeatureAccess result: ${result}`);
    return result;
  }

  // Otherwise, they are a teacher, student, parent, etc.
  const result = await checkUserFeatureAccess(user.id, user.userType, featureKey, user.schoolId);
  console.log(`[hasFeatureAccess DEBUG] checkUserFeatureAccess result: ${result}`);
  return result;
};

/**
 * Express Middleware to block routes if the user/school lacks the required premium feature.
 * 
 * @param featureKey The unique key of the platform feature required for this route
 */
export const requireFeatureAccess = (featureKey: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Ensure user exists on request (requires authMiddleware to run first)
      const user = (req as any).user as AuthenticatedUserContext;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User context not found. Authentication required."
        });
      }

      // Check for feature access
      const hasAccess = await hasFeatureAccess(user, featureKey);

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: "Feature requires an upgrade"
        });
      }

      // User has access, proceed to the route controller
      next();
    } catch (error) {
      console.error(`[requireFeatureAccess] Middleware error checking ${featureKey}:`, error);
      return res.status(500).json({
        success: false,
        message: "Internal server error while verifying feature access."
      });
    }
  };
};

export { checkSchoolFeatureAccess } from "./schoolChecker";
export { checkUserFeatureAccess } from "./userChecker";
