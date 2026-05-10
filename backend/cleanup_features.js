const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const featuresToDelete = await prisma.platformFeature.findMany({
      where: {
        OR: [
          { name: { contains: 'Behavior', mode: 'insensitive' } },
          { label: { contains: 'Behavior', mode: 'insensitive' } },
          { label: { contains: 'Linking Hub', mode: 'insensitive' } },
          { label: { contains: 'Teacher Management', mode: 'insensitive' } }
        ]
      }
    });

    console.log(`Found ${featuresToDelete.length} features to delete:`, featuresToDelete.map(f => f.label));

    if (featuresToDelete.length > 0) {
      const featureIds = featuresToDelete.map(f => f.id);
      
      // Delete from plan_feature_access first
      const accessRes = await prisma.planFeatureAccess.deleteMany({
        where: { featureId: { in: featureIds } }
      });
      console.log(`Deleted ${accessRes.count} access links.`);

      // Now delete the features
      const featureRes = await prisma.platformFeature.deleteMany({
        where: { id: { in: featureIds } }
      });
      console.log(`Deleted ${featureRes.count} platform features.`);
    }

  } catch (error) {
    console.error('Error during deletion:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
