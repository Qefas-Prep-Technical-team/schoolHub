import prisma from "../../config/database";
import { UserRole } from "@prisma/client";
import { checkSchoolFeatureAccess } from "./schoolChecker";

/**
 * Checks if a user has access to a specific premium feature.
 * 
 * @param userId The ID of the user.
 * @param userType The role/type of the user.
 * @param featureKey The unique key of the platform feature.
 * @param schoolId Optional. The school ID the user is associated with (for fallback checking).
 * @returns boolean indicating if the user has access.
 */
export const checkUserFeatureAccess = async (
  userId: string, 
  userType: UserRole, 
  featureKey: string,
  schoolId?: string
): Promise<boolean> => {
  try {
    // 1. Find the feature by featureKey
    const feature = await prisma.platformFeature.findUnique({
      where: { featureKey }
    });

    if (!feature) {
      console.warn(`[UserChecker] Feature key not found: ${featureKey}`);
      return false;
    }

    // 2. Find the active user subscription (personal subscription)
    const userSubscription = await prisma.userSubscription.findUnique({
      where: { userId }
    });

    // 3. If they have a personal active subscription, check its feature access
    if (userSubscription && userSubscription.status === "ACTIVE" && (!userSubscription.expiresAt || userSubscription.expiresAt >= new Date())) {
      const planFeatureAccess = await prisma.planFeatureAccess.findUnique({
        where: {
          planId_featureId: {
            planId: userSubscription.subscriptionPlanId,
            featureId: feature.id
          }
        }
      });

      if (planFeatureAccess && planFeatureAccess.enabled) {
        return true;
      }
    }

    // 4. Fallback: If personal subscription doesn't exist or lacks the feature,
    //    and a schoolId is provided, check if the school has the feature.
    if (schoolId) {
      return await checkSchoolFeatureAccess(schoolId, featureKey);
    }

    return false;
  } catch (error) {
    console.error(`[UserChecker] Error checking feature access for user ${userId}:`, error);
    return false;
  }
};
