import { Request, Response } from "express";
import { handleError } from "../../../utils/error-handler";
import { validateAdminSchoolAccess } from "../services/school-access.service";
import {
  getSchoolLandingPageService,
  getSchoolLandingPageBySubdomainService,
  updateSchoolLandingPageService,
  submitInquiryService,
  getInquiriesService,
} from "../services/school-billing-landing.service";

export const getSchoolLandingPage = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    if (!schoolId) {
      return res
        .status(400)
        .json({ success: false, message: "schoolId is required" });
    }

    if (!validateAdminSchoolAccess(req, schoolId as string)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const data = await getSchoolLandingPageService(schoolId as string);
    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    return handleError(res, error, "school.getSchoolLandingPage");
  }
};

export const getSchoolLandingPageBySubdomain = async (
  req: Request,
  res: Response,
) => {
  try {
    const { subdomain } = req.params;
    if (!subdomain) {
      return res
        .status(400)
        .json({ success: false, message: "subdomain is required" });
    }

    const data = await getSchoolLandingPageBySubdomainService(
      subdomain as string,
    );
    if (!data) {
      return res
        .status(404)
        .json({ success: false, message: "School not found for subdomain" });
    }

    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    return handleError(res, error, "school.getSchoolLandingPageBySubdomain");
  }
};

export const updateSchoolLandingPage = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    const updateData = req.body;

    if (!schoolId) {
      return res
        .status(400)
        .json({ success: false, message: "schoolId is required" });
    }

    if (!validateAdminSchoolAccess(req, schoolId as string)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const data = await updateSchoolLandingPageService(
      schoolId as string,
      updateData,
    );
    return res.status(200).json({ success: true, data });
  } catch (error: unknown) {
    return handleError(res, error, "school.updateSchoolLandingPage");
  }
};

export const submitInquiry = async (req: Request, res: Response) => {
  try {
    const { subdomain } = req.params;
    const { name, email, phone, subject, message } = req.body;

    if (!subdomain || !name || !email || !message) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const inquiry = await submitInquiryService({
      subdomain: subdomain as string,
      name,
      email,
      phone,
      subject,
      message,
    });

    if (!inquiry) {
      return res
        .status(404)
        .json({ success: false, message: "School not found" });
    }

    return res.status(201).json({
      success: true,
      message: "Inquiry submitted successfully",
      data: inquiry,
    });
  } catch (error: unknown) {
    return handleError(res, error, "school.submitInquiry");
  }
};

export const getInquiries = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;

    if (!schoolId) {
      return res
        .status(400)
        .json({ success: false, message: "schoolId is required" });
    }

    if (!validateAdminSchoolAccess(req, schoolId as string)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const result = await getInquiriesService(schoolId as string, page, limit);

    return res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error: unknown) {
    return handleError(res, error, "school.getInquiries");
  }
};

