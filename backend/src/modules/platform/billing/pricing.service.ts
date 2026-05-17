import prisma from "../../../config/database";
import { PRICING_PLANS } from "../../payment/plans.data";

export class PricingService {
    /**
     * Resolve all pricing plans
     * Returns DB plans if they exist and are active, otherwise returns hardcoded fallbacks
     */
    static async resolveAllPlans() {
        const [dbPlans, settings] = await Promise.all([
            prisma.subscriptionPlan.findMany({
                where: { isActive: true },
                include: {
                    featureAccess: {
                        include: { feature: true }
                    }
                },
                orderBy: { sortOrder: 'asc' }
            }),
            prisma.platformSettings.findMany({
                where: { key: { startsWith: "sub_enforced_" } }
            })
        ]);

        const settingsMap = settings.reduce((acc: any, s: any) => {
            acc[s.key] = s.value;
            return acc;
        }, {});

        if (dbPlans && dbPlans.length > 0) {
            // Group by category to match the expected format of PRICING_PLANS
            const categories = [...new Set(dbPlans.map(p => p.category))];
            return categories.map(cat => {
                const settingKey = `sub_enforced_${cat.toLowerCase()}`;
                const isEnforced = settingsMap[settingKey] !== "false"; // Default to true

                return {
                    category: cat,
                    isSubscriptionEnforced: isEnforced,
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
                        maxStorageGb: p.maxStorageGb,
                        featureAccess: p.featureAccess.map(fa => ({
                            featureId: fa.featureId,
                            tag: fa.feature.featureKey,
                            name: fa.feature.name,
                            enabled: fa.enabled,
                            limitValue: fa.limitValue,
                            meta: fa.meta
                        }))
                    }))
                };
            });
        }

        return PRICING_PLANS.map(cat => ({
            ...cat,
            isSubscriptionEnforced: true // Default for constants
        }));
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
            featureAccess, // Extract featureAccess to handle manually
            createdAt, updatedAt, 
            ...cleanData 
        } = data;

        // Check if ID is a UUID (length 36, contains dashes)
        const isUuid = id && typeof id === 'string' && id.length === 36 && id.includes('-');

        console.log(`[PricingService] Saving plan: ${data.name} (${data.category}/${data.type})`);
        
        const plan = isUuid 
            ? await prisma.subscriptionPlan.update({ where: { id }, data: cleanData })
            : data.category && data.type
                ? await prisma.subscriptionPlan.upsert({
                    where: { category_type: { category: data.category, type: data.type } },
                    update: cleanData,
                    create: { ...cleanData, category: data.category, type: data.type }
                })
                : await prisma.subscriptionPlan.create({ data: cleanData });

        console.log(`[PricingService] Plan saved successfully: ${plan.id}`);

        try {
            // Handle relational feature mapping if provided
            if (featureAccess && Array.isArray(featureAccess)) {
                for (const access of featureAccess) {
                    const feature = access.featureId 
                        ? await prisma.platformFeature.findUnique({ where: { id: access.featureId } })
                        : await prisma.platformFeature.findUnique({ where: { featureKey: access.tag } });

                    if (feature) {
                        await prisma.planFeatureAccess.upsert({
                            where: { planId_featureId: { planId: plan.id, featureId: feature.id } },
                            update: {
                                enabled: access.enabled,
                                limitValue: access.limitValue,
                                meta: access.meta
                            },
                            create: {
                                planId: plan.id,
                                featureId: feature.id,
                                enabled: access.enabled,
                                limitValue: access.limitValue,
                                meta: access.meta
                            }
                        });
                    }
                }
            }

            return plan;
        } catch (error) {
            console.error("[PricingService] savePlan feature mapping failed:", error);
            throw error;
        }
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
                            maxStorageGb: tab.maxStorageGb || parseFloat(tab.storage || "1"),
                            isActive: true,
                            maxStudents: tab.maxStudents ?? 0,
                            maxClasses: tab.maxClasses ?? 0,
                            maxExams: tab.maxExams ?? 0,
                            maxTeachers: tab.maxTeachers ?? 0,
                            maxParents: tab.maxParents ?? 0,
                            maxAiUsage: tab.maxAiUsage ?? 0,
                            planScope: tab.planScope,
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
                            maxStorageGb: tab.maxStorageGb || parseFloat(tab.storage || "1"),
                            isActive: true,
                            maxStudents: tab.maxStudents ?? 0,
                            maxClasses: tab.maxClasses ?? 0,
                            maxExams: tab.maxExams ?? 0,
                            maxTeachers: tab.maxTeachers ?? 0,
                            maxParents: tab.maxParents ?? 0,
                            maxAiUsage: tab.maxAiUsage ?? 0,
                            planScope: tab.planScope,
                        }
                    })
                );
            }
        }

        await Promise.all(creations);
        return { message: "Seeded successfully from constants" };
    }

    /**
     * Harvest unique features from plans and sync them to the registry (PlatformFeature)
     */
    static async harvestLegacyFeatures() {
        const plans = await prisma.subscriptionPlan.findMany({
            where: { isActive: true }
        });

        const allFeatures = new Set<string>();
        plans.forEach(p => {
            p.features.forEach(f => allFeatures.add(f));
        });

        const results = { created: 0, skipped: 0, linked: 0 };

        for (const featName of allFeatures) {
            // Generate a tag
            const tag = featName.toLowerCase().trim().replace(/\s+/g, '_').replace(/[^\w]/g, '');
            
            // Check if exists in PlatformFeature
            let featureEntry = await prisma.platformFeature.findFirst({
                where: { OR: [{ name: featName }, { featureKey: tag }] }
            });

            if (!featureEntry) {
                featureEntry = await prisma.platformFeature.create({
                    data: {
                        name: featName,
                        featureKey: tag,
                        label: featName,
                        description: `Automatically harvested from legacy plan: ${featName}`
                    }
                });
                results.created++;
            } else {
                results.skipped++;
            }

            // Now link this feature entry to all plans that have this string
            for (const plan of plans) {
                if (plan.features.includes(featName)) {
                    const existingLink = await prisma.planFeatureAccess.findUnique({
                        where: { planId_featureId: { planId: plan.id, featureId: featureEntry.id } }
                    });

                    if (!existingLink) {
                        await prisma.planFeatureAccess.create({
                            data: {
                                planId: plan.id,
                                featureId: featureEntry.id,
                                enabled: true
                            }
                        });
                        results.linked++;
                    }
                }
            }
        }

        return { 
            message: `Harvest complete: ${results.created} new features registered, ${results.linked} links established.`,
            stats: results
        };
    }

    static async getDefaults() {
        return PRICING_PLANS;
    }

    /**
     * Console: Get billing metrics
     */
    static async getBillingStats() {
        const [activeSubs, totalSubs, paidSubs] = await Promise.all([
            prisma.schoolSubscription.count({ where: { status: "ACTIVE" } }),
            prisma.schoolSubscription.count(),
            prisma.schoolSubscription.count({ 
                where: { 
                    status: "ACTIVE",
                    subscriptionType: { in: ["PAID", "TRIAL"] }
                } 
            })
        ]);

        // Calculate Revenue: Sum of monthly prices of active paid plans
        const activePaidPlans = await prisma.schoolSubscription.findMany({
            where: { status: "ACTIVE", subscriptionType: "PAID" },
            include: { subscriptionPlan: true }
        });

        const monthlyRevenue = activePaidPlans.reduce((acc, sub) => {
            return acc + (sub.subscriptionPlan.monthlyPrice || 0);
        }, 0);

        // Calculate Upgrade Rate
        const upgradeRate = activeSubs > 0 ? (paidSubs / activeSubs) * 100 : 0;

        return {
            activeSubscriptions: activeSubs,
            totalRevenue: monthlyRevenue,
            upgradeRate: upgradeRate.toFixed(1),
            apiHealth: "99.9" // Standard availability metric
        };
    }

    private static parseLimit(features: string[], keyword: string): number {
        const feat = features.find(f => f.toLowerCase().includes(keyword.toLowerCase()));
        if (!feat) return 0;
        
        if (feat.toLowerCase().includes('unlimited')) {
            return 999999;
        }

        const match = feat.match(/\d+/);
        if (match) return parseInt(match[0]);

        if (keyword.toLowerCase().includes("exam")) return 10;
        if (keyword.toLowerCase().includes("teacher")) return 5;
        if (keyword.toLowerCase().includes("class")) return 5;
        if (keyword.toLowerCase().includes("student")) return 50;

        return 0;
    }

    /**
     * Synchronize all subscription related tables in one transaction
     */
    static async recordSubscriptionChange(params: {
        entityId: string,
        entityType: 'SCHOOL' | 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN',
        planId: string,
        status: string,
        type: string,
        expiresAt?: Date | null,
        note?: string,
        staffId?: string,
        billingCycle?: string
    }) {
        const { entityId, entityType, planId, status, type, expiresAt, note, staffId, billingCycle = 'monthly' } = params;

        console.log(`[PricingService] Recording subscription change for ${entityType}: ${entityId} (Plan: ${planId}, Cycle: ${billingCycle})`);

        // Normalize subscription type to enum values (FREE, TRIAL, PAID)
        const normalizedType = 
            type?.toUpperCase() === 'FREE' ? 'FREE' : 
            type?.toUpperCase() === 'TRIAL' ? 'TRIAL' : 
            'PAID';

        return await prisma.$transaction(async (tx) => {
            // Fetch plan details to get the name string
            const planRecord = await tx.subscriptionPlan.findUnique({
                where: { id: planId }
            });
            const planName = planRecord?.type?.toUpperCase() || normalizedType;

            // 1. Update/Upsert the appropriate subscription record
            if (entityType === 'SCHOOL') {
                // A. Update SchoolSubscription table
                await tx.schoolSubscription.upsert({
                    where: { schoolId: entityId },
                    update: {
                        subscriptionPlanId: planId,
                        subscriptionType: normalizedType as any,
                        status: status as any,
                        expiresAt: expiresAt || null,
                        startedAt: new Date(), // Reset starting period
                        updatedAt: new Date()
                    },
                    create: {
                        schoolId: entityId,
                        subscriptionPlanId: planId,
                        subscriptionType: normalizedType as any,
                        status: status as any,
                        expiresAt: expiresAt || null,
                        startedAt: new Date()
                    }
                });

                // B. Sync main School record
                await tx.school.update({
                    where: { id: entityId },
                    data: {
                        plan: planName,
                        planId: planId,
                        subscriptionPlanId: planId,
                        subscriptionStatus: status,
                        subscriptionEnd: expiresAt || null,
                        billingCycle: billingCycle,
                        isTrialActive: normalizedType === 'TRIAL',
                        trialEndsAt: normalizedType === 'TRIAL' ? expiresAt : undefined
                    }
                });

                // C. Sync all associated Admins
                const schoolAdmins = await tx.schoolAdmin.findMany({
                    where: { schoolId: entityId }
                });

                for (const sa of schoolAdmins) {
                    // Update main Admin record
                    await tx.admin.update({
                        where: { id: sa.adminId },
                        data: {
                            plan: planName,
                            planId: planId,
                            subscriptionPlanId: planId,
                            subscriptionStatus: status,
                            subscriptionEnd: expiresAt || null,
                            billingCycle: billingCycle,
                            isTrialActive: normalizedType === 'TRIAL',
                            trialEndsAt: normalizedType === 'TRIAL' ? expiresAt : undefined
                        }
                    });

                    // Sync UserSubscription if it exists (even if no Prisma relation)
                    await tx.userSubscription.updateMany({
                        where: { userId: sa.adminId },
                        data: {
                            subscriptionPlanId: planId,
                            subscriptionType: normalizedType as any,
                            status: status as any,
                            expiresAt: expiresAt || null,
                            startedAt: new Date()
                        }
                    });

                    // Create history entry for each admin
                    await tx.subscriptionHistory.create({
                        data: {
                            userId: sa.adminId,
                            userType: 'ADMIN',
                            subscriptionPlanId: planId,
                            subscriptionType: normalizedType as any,
                            status: status as any,
                            startedAt: new Date(),
                            expiresAt: expiresAt || null,
                            note: note || `Subscription synced from school (${entityId}) update`,
                            activatedBy: staffId
                        }
                    });
                }
            } else if (entityType === 'ADMIN') {
                // Update Admin model directly
                await tx.admin.update({
                    where: { id: entityId },
                    data: {
                        plan: planName,
                        planId: planId,
                        subscriptionPlanId: planId,
                        subscriptionStatus: status,
                        subscriptionEnd: expiresAt || null,
                        billingCycle: billingCycle,
                        isTrialActive: normalizedType === 'TRIAL',
                        trialEndsAt: normalizedType === 'TRIAL' ? expiresAt : undefined
                    }
                });
            } else {
                // Handle Teacher, Student, Parent
                await tx.userSubscription.upsert({
                    where: { userId: entityId },
                    update: {
                        subscriptionPlanId: planId,
                        subscriptionType: normalizedType as any,
                        status: status as any,
                        expiresAt: expiresAt || null,
                        updatedAt: new Date()
                    },
                    create: {
                        userId: entityId,
                        userType: entityType as any,
                        subscriptionPlanId: planId,
                        subscriptionType: normalizedType as any,
                        status: status as any,
                        expiresAt: expiresAt || null,
                        startedAt: new Date()
                    }
                });

                // Update the main user model (Teacher/Student/Parent)
                const modelMap: Record<string, any> = {
                    'TEACHER': tx.teacher,
                    'STUDENT': tx.student,
                    'PARENT': tx.parent
                };

                const model = modelMap[entityType];
                if (model) {
                    await model.update({
                        where: { id: entityId },
                        data: {
                            plan: planName,
                            planId: planId,
                            subscriptionPlanId: planId,
                            subscriptionStatus: status,
                            subscriptionEnd: expiresAt || null,
                            billingCycle: billingCycle
                        }
                    });
                }
            }

            // 2. Add entry to SubscriptionHistory
            return await tx.subscriptionHistory.create({
                data: {
                    schoolId: entityType === 'SCHOOL' ? entityId : null,
                    userId: entityType !== 'SCHOOL' ? entityId : null,
                    userType: entityType !== 'SCHOOL' ? (entityType === 'ADMIN' ? 'ADMIN' : entityType) as any : null,
                    subscriptionPlanId: planId,
                    subscriptionType: normalizedType as any,
                    status: status as any,
                    startedAt: new Date(),
                    expiresAt: expiresAt || null,
                    note: note || `Administrative subscription update via console`,
                    activatedBy: staffId
                }
            });
        });
    }
}
