import prisma from "../../../config/database";
import { PRICING_PLANS } from "../../payment/plans.data";

export class PricingService {
    /**
     * Resolve all pricing plans
     * Returns DB plans if they exist and are active, otherwise returns hardcoded fallbacks
     */
    static async resolveAllPlans() {
        const dbPlans = await prisma.subscriptionPlan.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' }
        });

        if (dbPlans && dbPlans.length > 0) {
            // Group by category to match the expected format of PRICING_PLANS
            const categories = [...new Set(dbPlans.map(p => p.category))];
            return categories.map(cat => ({
                category: cat,
                tabs: dbPlans.filter(p => p.category === cat).map(p => ({
                    id: p.id,
                    type: p.type,
                    name: p.name,
                    pricing: {
                        monthly: p.monthlyPrice,
                        yearly: p.yearlyPrice
                    },
                    description: p.description || '',
                    features: p.features,
                    hasTrial: p.hasTrial,
                    trialDays: p.trialDays,
                    isPopular: p.isPopular,
                    storage: p.maxStorageGb ? `${p.maxStorageGb}GB` : undefined,
                    maxStudents: p.maxStudents,
                    maxStorageGb: p.maxStorageGb
                }))
            }));
        }

        return PRICING_PLANS;
    }

    /**
     * Get a specific plan by type and category
     */
    static async getPlan(type: string, category: string) {
        let plan = await prisma.subscriptionPlan.findFirst({
            where: { 
                type: type.toLowerCase(), 
                category: category.toLowerCase(),
                isActive: true 
            }
        });

        if (!plan) {
            // Fallback to constants
            const catGroup = PRICING_PLANS.find(p => p.category === category.toLowerCase());
            const fallback = catGroup?.tabs.find(t => t.type.toLowerCase() === type.toLowerCase());
            if (!fallback) return null;
            
            return {
                ...fallback,
                monthlyPrice: fallback.pricing.monthly,
                yearlyPrice: fallback.pricing.yearly,
                maxStorageGb: parseFloat(fallback.storage || "1")
            };
        }

        return plan;
    }

    /**
     * CRUD: Create or Update a plan
     */
    static async savePlan(data: any) {
        // Sanitize data: remove non-model fields and read-only/relational fields
        const { 
            id, pricing, tabs, storage, 
            schools, schoolSubscriptions, userSubscriptions, histories,
            createdAt, updatedAt, 
            ...cleanData 
        } = data;

        // Check if ID is a UUID (length 36, contains dashes)
        const isUuid = id && typeof id === 'string' && id.length === 36 && id.includes('-');

        if (isUuid) {
            const exists = await prisma.subscriptionPlan.findUnique({ where: { id }});
            if (exists) {
                return await prisma.subscriptionPlan.update({
                    where: { id },
                    data: cleanData
                });
            }
        }

        // If it's an unsynced hardcoded plan or a new plan with category and type
        if (data.category && data.type) {
            // Ensure ID is not passed to upsert if it's not a UUID
            return await prisma.subscriptionPlan.upsert({
                where: { category_type: { category: data.category, type: data.type } },
                update: cleanData,
                create: { ...cleanData, category: data.category, type: data.type }
            });
        }

        // Fallback for completely new manual creations without ID
        return await prisma.subscriptionPlan.create({
            data: cleanData
        });
    }

    /**
     * CRUD: Delete a plan (soft delete by setting isActive to false)
     */
    static async togglePlanStatus(id: string, isActive: boolean) {
        return await prisma.subscriptionPlan.update({
            where: { id },
            data: { isActive }
        });
    }

    /**
     * Seed database with provided constants or local fallbacks if empty
     */
    static async seedFromConstants(customPlans?: any[]) {
        const plansToSeed = customPlans || PRICING_PLANS;
        
        // Wait, instead of just checking if count > 0, we should probably allow an overwrite? 
        // The user asked to "sync it to the database so I can edit it later".
        // Let's first delete existing plans OR just add if not present? 
        // Actually, if they want to sync it to the database, maybe we do an upsert or clear and create.
        // Let's clear and create for a true "sync", or just add missing.
        // Let's keep it simple: if count > 0, we can clear them and re-seed, but maybe soft-delete instead?
        
        // For simplicity and to match existing logic, if they send customPlans, we force sync.
        if (customPlans) {
            await prisma.subscriptionPlan.updateMany({ data: { isActive: false }});
        } else {
            const count = await prisma.subscriptionPlan.count({ where: { isActive: true }});
            if (count > 0) return { message: "Database already has active plans" };
        }

        const creations = [];
        for (const catGroup of plansToSeed) {
            for (const tab of catGroup.tabs) {
                creations.push(
                    prisma.subscriptionPlan.upsert({
                        where: { category_type: { category: catGroup.category, type: tab.type } },
                        update: {
                            name: tab.name,
                            category: catGroup.category,
                            monthlyPrice: tab.pricing.monthly,
                            yearlyPrice: tab.pricing.yearly,
                            description: tab.description,
                            features: tab.features,
                            hasTrial: tab.hasTrial,
                            trialDays: tab.trialDays,
                            isPopular: tab.isPopular,
                            maxStorageGb: parseFloat(tab.storage || "1"),
                            isActive: true,
                            maxStudents: this.parseLimit(tab.features, "student"),
                            maxClasses: this.parseLimit(tab.features, "class"),
                            maxExams: this.parseLimit(tab.features, "exam"),
                            maxTeachers: this.parseLimit(tab.features, "teacher"),
                        },
                        create: {
                            name: tab.name,
                            type: tab.type,
                            category: catGroup.category,
                            monthlyPrice: tab.pricing.monthly,
                            yearlyPrice: tab.pricing.yearly,
                            description: tab.description,
                            features: tab.features,
                            hasTrial: tab.hasTrial,
                            trialDays: tab.trialDays,
                            isPopular: tab.isPopular,
                            maxStorageGb: parseFloat(tab.storage || "1"),
                            isActive: true,
                            maxStudents: this.parseLimit(tab.features, "student"),
                            maxClasses: this.parseLimit(tab.features, "class"),
                            maxExams: this.parseLimit(tab.features, "exam"),
                            maxTeachers: this.parseLimit(tab.features, "teacher"),
                        }
                    })
                );
            }
        }

        await Promise.all(creations);
        return { message: "Seeded successfully from constants" };
    }

    static async getDefaults() {
        return PRICING_PLANS;
    }

    private static parseLimit(features: string[], keyword: string): number {
        const feat = features.find(f => f.toLowerCase().includes(keyword.toLowerCase()));
        if (!feat) return 0;
        
        // Handle "Unlimited" cases
        if (feat.toLowerCase().includes('unlimited')) {
            return 999999;
        }

        const match = feat.match(/\d+/);
        if (match) return parseInt(match[0]);

        // Default if keyword exists but no number (e.g. "Core Examination Tools")
        if (keyword.toLowerCase().includes("exam")) return 10;
        if (keyword.toLowerCase().includes("teacher")) return 5;
        if (keyword.toLowerCase().includes("class")) return 5;
        if (keyword.toLowerCase().includes("student")) return 50;

        return 0;
    }
}
