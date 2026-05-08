import prisma from "../../config/database";
import { PRICING_PLANS } from "./plans.data";
import { LinkEntityType } from "@prisma/client";

// Unused import removed


/**
 * Get limits for a specific entity based on their current plan
 * If planData is provided (already fetched from DB), uses it. 
 * Otherwise falls back to PRICING_PLANS constants.
 */
export const getEntityLimits = (role: string, planName: string, dbPlanData?: any) => {
    // Initial defaults
    const limits = {
        students: 0,
        classes: 0,
        schools: 0,
        storageGB: 1
    };

    // 1. Load basic limits from SubscriptionPlan fields
    if (dbPlanData) {
        limits.students = dbPlanData.maxStudents || 0;
        limits.classes = dbPlanData.maxClasses || 0;
        limits.storageGB = parseFloat(dbPlanData.maxStorageGb || "1");
    }

    // 2. Prioritize dynamic overrides from PlanFeatureAccess
    if (dbPlanData?.featureAccess) {
        dbPlanData.featureAccess.forEach((fa: any) => {
            const key = fa.feature?.featureKey?.toLowerCase();
            const val = fa.limitValue;
            if (val !== null && val !== undefined) {
                // Students mapping
                if (['max_students', 'student_limit', 'student_connections', 'link_to_users'].includes(key)) {
                    limits.students = val;
                }
                // Classes mapping
                if (['max_classes', 'class_limit', 'class_management'].includes(key)) {
                    limits.classes = val;
                }
                // Schools mapping
                if (['institutional_links', 'school_limit', 'max_schools'].includes(key)) {
                    limits.schools = val;
                }
            }
        });
    }

    // 3. Fallback to hardcoded PRICING_PLANS logic ONLY for missing values
    const categoryMap: Record<string, string> = {
        'ADMIN': 'schools',
        'SCHOOL': 'schools',
        'TEACHER': 'teachers',
        'STUDENT': 'students',
        'PARENT': 'parents'
    };

    const category = categoryMap[role.toUpperCase()] || 'schools';
    const planGroup = PRICING_PLANS.find(p => p.category === category);
    const planData = planGroup?.tabs.find(t => t.type.toLowerCase() === planName.toLowerCase());
    
    if (limits.storageGB === 1) limits.storageGB = parseFloat(planData?.storage || "1GB");

    if (category === 'schools') {
        if (planName.toLowerCase() === 'free') {
            if (limits.students === 0) limits.students = 20;
            if (limits.classes === 0) limits.classes = 3;
        } else if (planName.toLowerCase() === 'starter') {
            if (limits.students === 0) limits.students = 200;
            if (limits.classes === 0) limits.classes = 20;
        } else if (planName.toLowerCase() === 'growth') {
            if (limits.students === 0) limits.students = 1000000;
            if (limits.classes === 0) limits.classes = 1000;
        }
    } else if (category === 'teachers') {
        if (planName.toLowerCase() === 'free') {
            if (limits.classes === 0) limits.classes = 1;
            if (limits.students === 0) limits.students = 10;
            if (limits.schools === 0) limits.schools = 1;
        } else if (planName.toLowerCase() === 'essential') {
            if (limits.classes === 0) limits.classes = 5;
            if (limits.students === 0) limits.students = 200;
            if (limits.schools === 0) limits.schools = 3;
        } else {
            if (limits.classes === 0) limits.classes = 100;
            if (limits.students === 0) limits.students = 1000;
            if (limits.schools === 0) limits.schools = 10;
        }
    } else if (category === 'parents') {
        if (planName.toLowerCase() === 'free') limits.students = limits.students || 1;
        else if (planName.toLowerCase() === 'essential') limits.students = limits.students || 3;
        else limits.students = limits.students || 100;
    }

    return limits;
};

/**
 * Checks if a school has space for more students
 */
export const canSchoolAcceptStudent = async (schoolId: string) => {
    const { getSchoolStatsService } = require("../school/school.service");

    // Use the robust stats service that handles ID resolution and diverse links
    const stats = await getSchoolStatsService(schoolId);

    // Fetch school to get current plan and its limits
    const school = await prisma.school.findFirst({
        where: {
            OR: [
                { id: schoolId },
                { tenantId: schoolId }
            ]
        },
        include: { subscriptionPlan: true }
    });

    if (!school) return false;

    const limits = getEntityLimits('SCHOOL', school.plan, school.subscriptionPlan);

    return stats.students < limits.students;
};

/**
 * Checks if a teacher has space for more students
 */
export const canTeacherAcceptStudent = async (teacherId: string) => {
    const teacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
        select: { plan: true }
    });

    if (!teacher) return false;

    const limits = getEntityLimits('TEACHER', teacher.plan);

    // Count students linked directly to this teacher
    const currentCount = await prisma.relationshipLink.count({
        where: {
            linkType: 'TEACHER_STUDENT',
            status: 'ACTIVE',
            OR: [
                { leftEntityType: 'TEACHER', leftEntityId: teacherId },
                { rightEntityType: 'TEACHER', rightEntityId: teacherId }
            ]
        }
    });

    return currentCount < limits.students;
};


/**
 * Checks if a school has space for more teachers
 */
export const canSchoolAcceptTeacher = async (schoolId: string) => {
    const { getSchoolStatsService } = require("../school/school.service");

    // Use the robust stats service
    const stats = await getSchoolStatsService(schoolId);

    // Fetch school to get current plan and its limits
    const school = await prisma.school.findFirst({
        where: {
            OR: [
                { id: schoolId },
                { tenantId: schoolId }
            ]
        },
        include: { subscriptionPlan: true }
    });

    if (!school) return false;

    // Use DB plan data if available, otherwise use defaults
    let maxTeachers = school.subscriptionPlan?.maxTeachers;

    if (maxTeachers === undefined || maxTeachers === null) {
        // Fallback for FREE tier if no plan data in DB
        const normalizedPlan = school.plan?.toUpperCase() || "";
        if (normalizedPlan === 'FREE' || normalizedPlan.includes('FREE')) {
            maxTeachers = 10; // Default limit for free tier
        } else {
            maxTeachers = 1000000; // Large number for paid tiers without explicit limit
        }
    }

    return stats.teachers < maxTeachers;
};

/**
 * Checks if a teacher has space for more school links
 */
export const canTeacherLinkToSchool = async (teacherId: string) => {
    const teacher = await prisma.teacher.findUnique({
        where: { id: teacherId },
        select: { plan: true }
    });

    if (!teacher) return false;

    const limits = getEntityLimits('TEACHER', teacher.plan);

    // Count schools this teacher is already linked to
    const currentCount = await prisma.relationshipLink.count({
        where: {
            linkType: 'SCHOOL_TEACHER',
            status: 'ACTIVE',
            OR: [
                { leftEntityType: 'TEACHER', leftEntityId: teacherId },
                { rightEntityType: 'TEACHER', rightEntityId: teacherId }
            ]
        }
    });

    return currentCount < (limits as any).schools;
};

/**
 * Checks if the teacher hub feature is enabled platform-wide or for the specific school
 */
export const isTeacherHubEnabled = async (schoolId?: string) => {
    // Check platform-wide setting first
    const platformSetting = await prisma.platformSettings.findUnique({
        where: { key: "teacher_hub_enabled" }
    });

    // If platform explicitly disabled it, return false
    if (platformSetting && platformSetting.value === "false") {
        return false;
    }

    // You could also add a per-school setting check here if needed
    // const schoolSetting = await prisma.schoolSetting.findUnique({ where: { schoolId } });
    // if (schoolSetting && !schoolSetting.enableTeacherHub) return false;

    return true;
};

/**
 * Checks if an entity can accept a link based on its type
 */
export const checkLinkCapacity = async (entityId: string, entityType: LinkEntityType) => {
    if (entityType === LinkEntityType.SCHOOL) {
        const hasStudentSpace = await canSchoolAcceptStudent(entityId);
        const hasTeacherSpace = await canSchoolAcceptTeacher(entityId);
        // This is a generic check, specific link types will handle their own fine-grained checks
        return hasStudentSpace && hasTeacherSpace;
    }
    if (entityType === LinkEntityType.TEACHER) {
        return await canTeacherAcceptStudent(entityId);
    }
    // Parents also have student limits
    if (entityType === LinkEntityType.PARENT) {
        const parent = await prisma.parent.findUnique({
            where: { id: entityId },
            select: { plan: true }
        });
        if (!parent) return false;
        const limits = getEntityLimits('PARENT', parent.plan);
        const currentCount = await prisma.parentChildLink.count({
            where: { parentId: entityId, status: 'active' }
        });
        return currentCount < limits.students;
    }
    return true; // Other types don't have strict student-linking limits yet
};
