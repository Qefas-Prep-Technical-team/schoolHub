import { Request, Response } from "express";
import { handleError } from "../../../utils/error-handler";
import {
  validateSchoolAccess,
  validateAdminSchoolAccess,
  validateAdminSubRoleAccess,
  validateMemberOrParentSchoolAccess,
} from "../services/school-access.service";
import {
  getSchoolProfileService,
  updateSchoolProfileService,
  getSchoolSettingsService,
  updateSchoolSettingsService,
} from "../services/school-profile.service";
import { getSchoolBillingService } from "../services/school-billing-landing.service";

export {
  getSchoolLandingPage,
  getSchoolLandingPageBySubdomain,
  updateSchoolLandingPage,
  submitInquiry,
  getInquiries,
} from "./school-landing-inquiry.controller";

export const getSchoolProfile = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    if (!schoolId) {
      return res
        .status(400)
        .json({ success: false, message: "schoolId is required" });
    }

    if (!(await validateMemberOrParentSchoolAccess(req, schoolId as string))) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const isAdminOrSuperAdmin =
      req.user?.userType === "ADMIN" ||
      req.user?.userType === "SUPER_ADMIN" ||
      req.user?.role === "SUPER_ADMIN";

    const data = await getSchoolProfileService(
      schoolId as string,
      isAdminOrSuperAdmin,
    );
    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    return handleError(res, error, "school.getSchoolProfile");
  }
};

export const updateSchoolProfile = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    const updateData = req.body;

    if (!schoolId) {
      return res
        .status(400)
        .json({ success: false, message: "schoolId is required" });
    }

    if (
      !validateAdminSubRoleAccess(req, schoolId as string, [
        "SCHOOL_OWNER",
        "PRINCIPAL",
      ])
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied: Only School Owners and Principals can update the school profile.",
      });
    }

    const data = await updateSchoolProfileService(
      schoolId as string,
      updateData,
    );
    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    return handleError(res, error, "school.updateSchoolProfile");
  }
};

export const getSchoolSettings = async (req: Request, res: Response) => {
  const { schoolId } = req.params;
  try {
    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "School ID is required in the request parameters.",
      });
    }

    if (!(await validateMemberOrParentSchoolAccess(req, schoolId as string))) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const data = await getSchoolSettingsService(schoolId as string);
    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    return handleError(res, error, "school.getSchoolSettings");
  }
};

export const updateSchoolSettings = async (req: Request, res: Response) => {
  const { schoolId } = req.params;
  try {
    const updateData = req.body;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message:
          "School ID is required in the request parameters to perform an update.",
      });
    }

    if (
      !validateAdminSubRoleAccess(req, schoolId as string, [
        "SCHOOL_OWNER",
        "PRINCIPAL",
        "ACCOUNTANT",
      ])
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied: Only School Owners, Principals, or Accountants can update school settings.",
      });
    }

    const data = await updateSchoolSettingsService(
      schoolId as string,
      updateData,
    );

    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    return handleError(res, error, "school.updateSchoolSettings");
  }
};

export const getSchoolBilling = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 5;

    if (!schoolId) {
      return res
        .status(400)
        .json({ success: false, message: "schoolId is required" });
    }

    if (schoolId === "default-tenant-id") {
      return res.status(200).json({
        success: true,
        data: {
          subscription: {
            status: "ACTIVE",
            plan: "PLATFORM",
            billingCycle: "yearly",
            amount: 0,
            features: [],
          },
          usage: {
            studentCount: 0,
            teacherCount: 0,
            classCount: 0,
            examCount: 0,
            storageBytes: 0,
          },
          transactions: [],
          totalTransactions: 0,
        },
      });
    }

    if (
      !validateAdminSubRoleAccess(req, schoolId as string, [
        "SCHOOL_OWNER",
        "PRINCIPAL",
        "ACCOUNTANT",
      ])
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied: Only School Owners, Principals, or Accountants can update school settings.",
      });
    }

    const data = await getSchoolBillingService(schoolId as string, page, limit);
    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    return handleError(res, error, "school.getSchoolBilling");
  }
};
