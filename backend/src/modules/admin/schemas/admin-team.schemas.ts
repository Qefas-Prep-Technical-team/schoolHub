import { z } from "zod";
import { AdminRole } from "@prisma/client";

export const ASSIGNABLE_ADMIN_ROLES = [
  AdminRole.PRINCIPAL,
  AdminRole.REGISTRAR,
  AdminRole.ACCOUNTANT,
  AdminRole.SUPPORT,
] as const;

export const checkAdminStatusParamsSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const adminIdParamsSchema = z.object({
  adminId: z.string().min(1, "Admin ID is required"),
});

export const approveAdminBodySchema = z.object({
  role: z.enum(
    [AdminRole.PRINCIPAL, AdminRole.REGISTRAR, AdminRole.ACCOUNTANT, AdminRole.SUPPORT],
    {
      message: `A role must be assigned. Valid roles: ${ASSIGNABLE_ADMIN_ROLES.join(", ")}.`,
    },
  ),
});

export const rejectAdminBodySchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

export const updateAdminRoleBodySchema = z.object({
  role: z.enum(
    [AdminRole.PRINCIPAL, AdminRole.REGISTRAR, AdminRole.ACCOUNTANT, AdminRole.SUPPORT],
    {
      message: `Invalid role. Valid roles: ${ASSIGNABLE_ADMIN_ROLES.join(", ")}.`,
    },
  ),
});

