import prisma from "../../config/database";

export class FeatureService {
  /**
   * List all features in the manifest
   */
  static async listFeatures() {
    return await prisma.featureManifest.findMany({
      include: {
        planAccesses: {
          where: { enabled: true },
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
   * Create or update a feature in the manifest
   */
  static async saveFeature(data: any) {
    const { id, planAccesses, ...cleanData } = data;
    
    if (id) {
      return await prisma.featureManifest.update({
        where: { id },
        data: cleanData
      });
    }

    return await prisma.featureManifest.create({
      data: cleanData
    });
  }

  /**
   * Delete a feature from the manifest
   */
  static async deleteFeature(id: string) {
    return await prisma.featureManifest.delete({
      where: { id }
    });
  }

  /**
   * Get a feature by its tag
   */
  static async getFeatureByTag(tag: string) {
    return await prisma.featureManifest.findUnique({
      where: { tag }
    });
  }
}
