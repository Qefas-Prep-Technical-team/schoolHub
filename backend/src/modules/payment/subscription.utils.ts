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
    if (dbPlanData) {
        return {
            students: dbPlanData.maxStudents || 0,
            classes: dbPlanData.maxClasses || 0,
            storageGB: dbPlanData.maxStorageGb || 1
        };
    }

    // Fallback to constants if no DB data provided
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

    const limits = {
        students: 0,
        classes: 0,
        storageGB: parseFloat(planData?.storage || "1GB")
    };

    if (category === 'schools') {
        if (planName.toLowerCase() === 'free') {
            limits.students = 50;
            limits.classes = 3;
        } else if (planName.toLowerCase() === 'starter') {
            limits.students = 200;
            limits.classes = 20;
        } else if (planName.toLowerCase() === 'growth') {
            limits.students = 1000000;
            limits.classes = 1000;
        }
    } else if (category === 'teachers') {
        if (planName.toLowerCase() === 'free') {
            limits.classes = 1;
            limits.students = 50;
        } else if (planName.toLowerCase() === 'essential') {
            limits.classes = 5;
            limits.students = 200;
        } else {
            limits.classes = 100;
            limits.students = 1000;
        }
    } else if (category === 'parents') {
        if (planName.toLowerCase() === 'free') limits.students = 1;
        else if (planName.toLowerCase() === 'essential') limits.students = 3;
        else limits.students = 100;
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
 * Checks if an entity can accept a link based on its type
 */
export const checkLinkCapacity = async (entityId: string, entityType: LinkEntityType) => {
    if (entityType === LinkEntityType.SCHOOL) {
        return await canSchoolAcceptStudent(entityId);
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
