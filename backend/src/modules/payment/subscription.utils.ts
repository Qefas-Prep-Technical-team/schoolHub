import prisma from "../../config/database";
import { PRICING_PLANS } from "./plans.data";
import { LinkEntityType } from "@prisma/client";

/**
 * Get limits for a specific entity based on their current plan
 */
export const getEntityLimits = (role: string, plan: string) => {
    // Map role to category for lookup in plans.data
    const categoryMap: Record<string, string> = {
        'ADMIN': 'schools',
        'SCHOOL': 'schools',
        'TEACHER': 'teachers',
        'STUDENT': 'students',
        'PARENT': 'parents'
    };
    
    const category = categoryMap[role.toUpperCase()] || 'schools';
    const planGroup = PRICING_PLANS.find(p => p.category === category);
    const planData = planGroup?.tabs.find(t => t.type.toLowerCase() === plan.toLowerCase());

    // Extract limits from features text if not explicitly defined (for robustness)
    // Most limits are in the 'features' array for schools
    const limits = {
        students: 0,
        classes: 0,
        storageGB: parseFloat(planData?.storage || "1GB")
    };

    if (category === 'schools') {
        if (plan.toLowerCase() === 'free') {
            limits.students = 50;
            limits.classes = 3;
        } else if (plan.toLowerCase() === 'starter') {
            limits.students = 200;
            limits.classes = 20;
        } else if (plan.toLowerCase() === 'growth') {
            limits.students = 1000000; // Virtually unlimited
            limits.classes = 1000;
        }
    } else if (category === 'teachers') {
        if (plan.toLowerCase() === 'free') {
            limits.classes = 1;
            limits.students = 50; // Default limit for free educator
        } else if (plan.toLowerCase() === 'essential') {
            limits.classes = 5;
            limits.students = 200;
        } else {
            limits.classes = 100; // Pro
            limits.students = 1000;
        }
    } else if (category === 'parents') {
        if (plan.toLowerCase() === 'free') limits.students = 1;
        else if (plan.toLowerCase() === 'essential') limits.students = 3;
        else limits.students = 100; // Pro
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
    
    // Fetch school to get current plan
    const school = await prisma.school.findFirst({
        where: {
            OR: [
                { id: schoolId },
                { tenantId: schoolId }
            ]
        },
        select: { plan: true }
    });

    if (!school) return false;

    const limits = getEntityLimits('SCHOOL', school.plan);
    
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
