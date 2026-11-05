import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma, { withRetry } from "../../../config/database";
import { getSingleString } from "../../../utils/request-utils";
import { handleError } from "../../../utils/error-handler";
import { FinanceService } from "../finance.service";
import { canUserAccessStudentTranscript } from "../services/finance-access.service";
import {
  initiateTranscriptPaymentSchema,
  emailTranscriptPassSchema,
} from "../schemas/finance.schemas";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-change-in-production";

/**
 * Extracts an optional authenticated user from the Authorization header when
 * an endpoint can be called either with a session or via direct email link.
 */
function resolveOptionalAuthUser(req: Request): {
  id?: string;
  userType?: string;
  role?: string;
} | null {
  if (req.user?.id) {
    return req.user;
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  try {
    const token = authHeader.slice(7).trim();
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id?: string;
      userId?: string;
      userType?: string;
      role?: string;
    };
    return {
      id: decoded.id || decoded.userId,
      userType: decoded.userType,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

/**
 * Initiate transcript or graduated student session portal access payment
 */
export async function initiateTranscriptPayment(req: Request, res: Response) {
  try {
    const schoolId = getSingleString(req.params.schoolId);
    const parsed = initiateTranscriptPaymentSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues[0]?.message || "studentId is required",
      });
    }

    const { studentId, sessionId, term, amount, email, name } = parsed.data;
    const user = req.user;

    const authorized = await canUserAccessStudentTranscript(
      req,
      studentId,
      schoolId,
    );
    if (!authorized) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied: You can only initiate transcript clearance for your own student record",
      });
    }

    const result = await FinanceService.initiateTranscriptPayment({
      schoolId,
      studentId,
      sessionId,
      term,
      amount: amount ? Number(amount) : undefined,
      email: email || user?.email || "guest@student.edu",
      name: name || user?.name || "Student Payer",
      parentId: user?.userType === "PARENT" ? user.id : undefined,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    return handleError(res, error, "finance.initiateTranscriptPayment");
  }
}

/**
 * Verify a 30-day access pass token (Student / Public verification)
 * Enforces that if a student is logged in, the pass MUST belong to that student.
 */
export async function verifyTranscriptPass(req: Request, res: Response) {
  try {
    const token = String(req.query.token || req.body?.token || "");
    const expectedStudentId = String(
      req.query.studentId || req.body?.studentId || "",
    ).trim();

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Pass token is required",
      });
    }

    const verified = FinanceService.verifyTranscriptPass(token);
    if (!verified.valid) {
      return res.status(400).json({
        success: false,
        message: verified.error || "Invalid or expired access pass",
      });
    }

    const authUser = resolveOptionalAuthUser(req);
    if (
      authUser?.userType === "STUDENT" &&
      authUser.id &&
      verified.studentId &&
      authUser.id !== verified.studentId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Security violation: This 30-day access pass belongs to a different student record.",
      });
    }

    if (
      expectedStudentId &&
      verified.studentId &&
      expectedStudentId !== verified.studentId
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Security violation: Pass token does not match the active student profile.",
      });
    }

    return res.status(200).json({
      success: true,
      data: verified,
    });
  } catch (error: unknown) {
    return handleError(res, error, "finance.verifyTranscriptPass");
  }
}

/**
 * Resend or send 30-day transcript access pass to email
 */
export async function emailTranscriptPass(req: Request, res: Response) {
  try {
    const parsed = emailTranscriptPassSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message:
          parsed.error.issues[0]?.message ||
          "studentId and schoolId are required",
      });
    }

    const { studentId, schoolId, token, reference } = parsed.data;
    let email = parsed.data.email;

    const authorized = await canUserAccessStudentTranscript(
      req,
      studentId,
      schoolId,
    );
    if (!authorized) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied: You can only request access passes for your own student record",
      });
    }

    if (!email) {
      const student = await withRetry(
        () =>
          prisma.student.findUnique({
            where: { id: studentId },
            include: { parentLinks: { include: { parent: true } } },
          }),
        "finance.emailTranscriptPass.findStudent",
      );
      email =
        student?.email ||
        student?.parentLinks?.[0]?.parent?.email ||
        req.user?.email;
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "No registered email address found for this scholar.",
      });
    }

    await FinanceService.sendTranscriptPassEmail({
      studentId,
      schoolId,
      email,
      token: token || "",
      reference,
    });

    return res.status(200).json({
      success: true,
      message:
        "Your 30-day transcript preview and download link has been sent to your email address.",
    });
  } catch (error: unknown) {
    return handleError(res, error, "finance.emailTranscriptPass");
  }
}

