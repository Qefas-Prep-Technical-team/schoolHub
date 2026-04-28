import { PricingService } from "./src/modules/platform/billing/pricing.service";
import prisma from "./src/config/database";

async function main() {
    console.log("Starting pricing plans synchronization...");
    try {
        const result = await PricingService.seedFromConstants();
        console.log("Sync status:", result.message);
        
        const plans = await prisma.subscriptionPlan.findMany();
        console.log(`Verified ${plans.length} plans in database.`);
    } catch (error) {
        console.error("Critical failure during sync:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
