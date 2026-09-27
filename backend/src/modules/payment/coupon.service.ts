import prisma from "../../config/database";
import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Zod Schemas
// ─────────────────────────────────────────────────────────────

export const createCouponSchema = z.object({
  code: z.string().min(3).max(20).toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]).default("PERCENTAGE"),
  discountValue: z.number().positive().max(100, "Percentage cannot exceed 100").or(z.number().positive()),
  maxDiscountNaira: z.number().positive().optional(),
  minAmountNaira: z.number().positive().optional(),
  applicablePlans: z.array(z.string()).optional(),
  applicableRoles: z.array(z.string()).optional(),
  maxUses: z.number().int().positive().optional(),
  maxUsesPerUser: z.number().int().positive().default(1),
  isActive: z.boolean().default(true),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

export const validateCouponSchema = z.object({
  code: z.string().min(1),
  email: z.string().email(),
  plan: z.string(),
  role: z.string(),
  amountNaira: z.number().positive(),
});

// ─────────────────────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────────────────────

export class CouponService {
  /**
   * Validate a coupon code and compute the discount.
   * Does NOT record usage — that happens at verify-payment time.
   */
  static async validate(params: {
    code: string;
    email: string;
    plan: string;
    role: string;
    amountNaira: number;
    userId?: string;
  }) {
    const code = params.code.toUpperCase().trim();

    const coupon = await prisma.coupon.findUnique({ where: { code } });

    if (!coupon) throw new Error("Invalid coupon code.");
    if (!coupon.isActive) throw new Error("This coupon is no longer active.");

    const now = new Date();
    if (coupon.startsAt > now) throw new Error("This coupon is not yet valid.");
    if (coupon.expiresAt && coupon.expiresAt < now) throw new Error("This coupon has expired.");

    // Check total usage cap
    if (coupon.maxUses !== null && coupon.currentUses >= coupon.maxUses) {
      throw new Error("This coupon has reached its maximum usage limit.");
    }

    // Check plan restriction
    if (coupon.applicablePlans) {
      const plans: string[] = JSON.parse(coupon.applicablePlans);
      if (!plans.includes(params.plan.toLowerCase()) && !plans.includes(params.plan.toUpperCase())) {
        throw new Error(`This coupon is not valid for the ${params.plan} plan.`);
      }
    }

    // Check role restriction
    if (coupon.applicableRoles) {
      const roles: string[] = JSON.parse(coupon.applicableRoles);
      if (!roles.includes(params.role.toUpperCase())) {
        throw new Error(`This coupon is not valid for ${params.role} accounts.`);
      }
    }

    // Check minimum amount
    if (coupon.minAmountNaira && params.amountNaira < coupon.minAmountNaira) {
      throw new Error(`Minimum order amount for this coupon is ₦${coupon.minAmountNaira.toLocaleString()}.`);
    }

    // Check per-user usage (by email)
    if (params.userId || params.email) {
      const existingUsages = await prisma.couponUsage.count({
        where: {
          couponId: coupon.id,
          OR: [
            { userId: params.userId || "" },
            { userEmail: params.email },
          ],
        },
      });
      if (existingUsages >= coupon.maxUsesPerUser) {
        throw new Error("You have already used this coupon.");
      }
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (params.amountNaira * coupon.discountValue) / 100;
      if (coupon.maxDiscountNaira && discount > coupon.maxDiscountNaira) {
        discount = coupon.maxDiscountNaira;
      }
    } else {
      discount = Math.min(coupon.discountValue, params.amountNaira);
    }

    const finalAmount = Math.max(0, params.amountNaira - discount);

    return {
      valid: true,
      couponId: coupon.id,
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountNaira: Math.round(discount),
      finalAmountNaira: Math.round(finalAmount),
      message:
        coupon.discountType === "PERCENTAGE"
          ? `${coupon.discountValue}% off applied!`
          : `₦${Math.round(discount).toLocaleString()} off applied!`,
    };
  }

  /**
   * Record coupon usage after a successful payment.
   */
  static async recordUsage(params: {
    couponId: string;
    userId: string;
    userEmail: string;
    discountNaira: number;
    paymentReference?: string;
  }) {
    await prisma.$transaction([
      prisma.couponUsage.create({
        data: {
          couponId: params.couponId,
          userId: params.userId,
          userEmail: params.userEmail,
          discount: params.discountNaira,
          reference: params.paymentReference,
        },
      }),
      prisma.coupon.update({
        where: { id: params.couponId },
        data: { currentUses: { increment: 1 } },
      }),
    ]);
  }

  // ─── Admin CRUD ───────────────────────────────────────────────

  static async create(data: z.infer<typeof createCouponSchema>, createdBy: string) {
    return prisma.coupon.create({
      data: {
        code: data.code,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        maxDiscountNaira: data.maxDiscountNaira,
        minAmountNaira: data.minAmountNaira,
        applicablePlans: data.applicablePlans ? JSON.stringify(data.applicablePlans) : undefined,
        applicableRoles: data.applicableRoles ? JSON.stringify(data.applicableRoles) : undefined,
        maxUses: data.maxUses,
        maxUsesPerUser: data.maxUsesPerUser,
        isActive: data.isActive,
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
        createdBy,
      },
    });
  }

  static async list(filters?: { isActive?: boolean }) {
    return prisma.coupon.findMany({
      where: filters,
      include: {
        usages: { select: { id: true, userEmail: true, usedAt: true, discount: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getById(id: string) {
    return prisma.coupon.findUnique({
      where: { id },
      include: { usages: { orderBy: { usedAt: "desc" }, take: 50 } },
    });
  }

  static async update(id: string, data: Partial<z.infer<typeof createCouponSchema>>) {
    return prisma.coupon.update({
      where: { id },
      data: {
        ...data,
        applicablePlans: data.applicablePlans ? JSON.stringify(data.applicablePlans) : undefined,
        applicableRoles: data.applicableRoles ? JSON.stringify(data.applicableRoles) : undefined,
      },
    });
  }

  static async deactivate(id: string) {
    return prisma.coupon.update({ where: { id }, data: { isActive: false } });
  }

  static async delete(id: string) {
    await prisma.couponUsage.deleteMany({ where: { couponId: id } });
    return prisma.coupon.delete({ where: { id } });
  }
}
