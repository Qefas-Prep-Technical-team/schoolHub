import prisma from "../../config/database";

/**
 * Checks if a school has access to a specific premium feature.
 * 
 * @param schoolId The ID of the school.
 * @param featureKey The unique key of the platform feature.
 * @returns boolean indicating if the school has access.
 */
export const checkSchoolFeatureAccess = async (schoolId: string, featureKey: string): Promise<boolean> => {
  try {
    // Inline resolution: accept UUID or tenantId (avoids circular import with school.service)
    const school = await prisma.school.findFirst({
      where: { OR: [{ id: schoolId }, { tenantId: schoolId }] },
      select: { id: true, subscriptionEnd: true }
    });
    const canonicalId = school?.id;

    if (!canonicalId) {
      console.warn(`[SchoolChecker] Could not resolve schoolId: ${schoolId}`);
      return false;
    }
    
    if (school?.subscriptionEnd && new Date(school.subscriptionEnd) < new Date()) {
      return false;
    }

    // 1. Find the feature by featureKey
    const feature = await prisma.platformFeature.findUnique({
      where: { featureKey }
    });

    if (!feature) {
      console.warn(`[SchoolChecker] Feature key not found: ${featureKey}`);
      return false; // Fail secure if feature doesn't exist
    }

    // 2. Find the active school subscription using the resolved canonical UUID
    const schoolSubscription = await prisma.schoolSubscription.findUnique({
      where: { schoolId: canonicalId },
      include: {
        subscriptionPlan: true
      }
    });

    if (!schoolSubscription || schoolSubscription.status !== "ACTIVE") {
      return false;
    }
    
    if (schoolSubscription.expiresAt && schoolSubscription.expiresAt < new Date()) {
      return false;
    }

    // 3. Check PlanFeatureAccess
    const planFeatureAccess = await prisma.planFeatureAccess.findUnique({
      where: {
        planId_featureId: {
          planId: schoolSubscription.subscriptionPlanId,
          featureId: feature.id
        }
      }
    });

    console.log(`[SchoolChecker DEBUG] planFeatureAccess result:`, planFeatureAccess);

    // 4. Return true if access exists and is enabled
    return !!(planFeatureAccess && planFeatureAccess.enabled);
  } catch (error) {
    console.error(`[SchoolChecker] Error checking feature access for school ${schoolId}:`, error);
    return false;
  }
};
