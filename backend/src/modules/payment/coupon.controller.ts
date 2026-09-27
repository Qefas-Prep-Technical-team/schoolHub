import { Request, Response } from "express";
import { CouponService, createCouponSchema, validateCouponSchema } from "./coupon.service";

const handleError = (res: Response, error: unknown, context: string) => {
  const err = error as { message?: string };
  console.error(`[${context}]`, err.message);
  const msg = err.message || "An unexpected error occurred";
  const status = msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("expired") ? 400 : 500;
  return res.status(status).json({ success: false, error: msg });
};

// ─── Public ──────────────────────────────────────────────────

/**
 * POST /api/v1/payment/coupon/validate
 * Validates a coupon code and returns the discount amount.
 * Does NOT record usage.
 */
export const validateCoupon = async (req: Request, res: Response) => {
  try {
    const parsed = validateCouponSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }
    const userId = (req as Request & { user?: { id: string } }).user?.id;
    const result = await CouponService.validate({ ...parsed.data, userId });
    return res.json({ success: true, data: result });
  } catch (error) {
    return handleError(res, error, "coupon.validate");
  }
};

// ─── Admin ───────────────────────────────────────────────────

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const parsed = createCouponSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }
    const adminId = (req as Request & { user?: { id: string } }).user?.id || "system";
    const coupon = await CouponService.create(parsed.data, adminId);
    return res.status(201).json({ success: true, data: coupon });
  } catch (error) {
    return handleError(res, error, "coupon.create");
  }
};

export const listCoupons = async (req: Request, res: Response) => {
  try {
    const isActive = req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined;
    const coupons = await CouponService.list(isActive !== undefined ? { isActive } : undefined);
    return res.json({ success: true, data: coupons });
  } catch (error) {
    return handleError(res, error, "coupon.list");
  }
};

export const getCoupon = async (req: Request, res: Response) => {
  try {
    const coupon = await CouponService.getById(req.params.id as string);
    if (!coupon) return res.status(404).json({ success: false, error: "Coupon not found" });
    return res.json({ success: true, data: coupon });
  } catch (error) {
    return handleError(res, error, "coupon.get");
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const parsed = createCouponSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: parsed.error.issues[0].message });
    }
    const coupon = await CouponService.update(req.params.id as string, parsed.data);
    return res.json({ success: true, data: coupon });
  } catch (error) {
    return handleError(res, error, "coupon.update");
  }
};

export const deactivateCoupon = async (req: Request, res: Response) => {
  try {
    await CouponService.deactivate(req.params.id as string);
    return res.json({ success: true, message: "Coupon deactivated" });
  } catch (error) {
    return handleError(res, error, "coupon.deactivate");
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    await CouponService.delete(req.params.id as string);
    return res.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    return handleError(res, error, "coupon.delete");
  }
};
