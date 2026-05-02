import prisma from "../../config/database";

export class FeatureService {
  /**
   * List all features in the registry
   */
  static async listFeatures() {
    return await prisma.platformFeature.findMany({
      include: {
        planAccesses: {
          include: {
            plan: {
              select: {
                id: true,
                name: true,
                category: true,
                type: true
              }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  /**
   * Create or update a feature in the registry
   */
  static async saveFeature(data: any) {
    const { id, planAccesses, ...cleanData } = data;
    
    if (id) {
      return await prisma.platformFeature.update({
        where: { id },
        data: cleanData
      });
    }

    return await prisma.platformFeature.create({
      data: cleanData
    });
  }

  /**
   * Delete a feature from the registry
   */
  static async deleteFeature(id: string) {
    return await prisma.platformFeature.delete({
      where: { id }
    });
  }

  /**
   * Get a feature by its key
   */
  static async getFeatureByTag(tag: string) {
    return await prisma.platformFeature.findUnique({
      where: { featureKey: tag }
    });
  }
}
