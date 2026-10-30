import prisma, { withRetry } from "../../../config/database";
import { UserRole } from "@prisma/client";
import { generateRandomSixDigit } from "../../../utils/code-generator";
import { sendVerificationEmail } from "../auth.service";
import UAParser from "ua-parser-js";

export interface RequestVerificationCodeInput {
  email?: string;
  userType?: string;
  isDeviceVerification?: boolean;
  userAgent?: string;
  ipAddress?: string;
  deviceModelHeader?: string;
}

export interface RequestVerificationCodeResult {
  status: number;
  data: {
    success: boolean;
    message: string;
  };
}

export class RequestCodeService {
  static async requestCode(
    input: RequestVerificationCodeInput
  ): Promise<RequestVerificationCodeResult> {
    const { email: rawEmail, userType, isDeviceVerification, userAgent, ipAddress, deviceModelHeader } = input;
    const email = rawEmail?.toLowerCase().trim();

    if (!email || !userType) {
      return {
        status: 400,
        data: {
          success: false,
          message: "Email and user type are required",
        },
      };
    }

    const normalizedRole = (userType as string)?.toUpperCase().trim() as UserRole;

    if (!Object.values(UserRole).includes(normalizedRole)) {
      return {
        status: 400,
        data: {
          success: false,
          message: "Invalid user type",
        },
      };
    }

    // Delete old unused codes for same email and userType
    await withRetry(() =>
      prisma.verificationCode.deleteMany({
        where: { email, userType: normalizedRole, used: false },
      })
    );

    const code = generateRandomSixDigit();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Save code WITH userType
    await withRetry(() =>
      prisma.verificationCode.create({
        data: {
          email,
          code,
          userType: normalizedRole,
          expiresAt,
        },
      })
    );

    const testEmail = process.env.TEST_EMAIL?.trim();
    const resendTest = process.env.RESEND_TEST?.trim() === "true";
    const mainEmail = resendTest && testEmail ? testEmail : email;

    // Sequential check to avoid hitting connection limits
    const admin = await withRetry(() =>
      prisma.admin.findUnique({
        where: { email },
        select: { id: true },
      })
    );
    const teacher = !admin
      ? await withRetry(() =>
          prisma.teacher.findUnique({
            where: { email },
            select: { id: true },
          })
        )
      : null;
    const student =
      !admin && !teacher
        ? await withRetry(() =>
            prisma.student.findUnique({
              where: { email },
              select: { id: true },
            })
          )
        : null;
    const parent =
      !admin && !teacher && !student
        ? await withRetry(() =>
            prisma.parent.findUnique({
              where: { email },
              select: { id: true },
            })
          )
        : null;

    const userExists = Boolean(admin || teacher || student || parent);
    let actualRole: UserRole | null = null;
    if (admin) actualRole = UserRole.ADMIN;
    else if (teacher) actualRole = UserRole.TEACHER;
    else if (student) actualRole = UserRole.STUDENT;
    else if (parent) actualRole = UserRole.PARENT;

    // GUARD: If user exists, they MUST request a code for their registered role
    if (userExists && actualRole !== normalizedRole) {
      return {
        status: 403,
        data: {
          success: false,
          message: `Email already registered as a ${actualRole}. Cannot request code for ${normalizedRole}.`,
        },
      };
    }

    let emailType: "welcome" | "confirmation" | "device-verification" = userExists
      ? "confirmation"
      : "welcome";
    let deviceInfo: any = undefined;

    if (isDeviceVerification && userExists) {
      emailType = "device-verification";

      const UAParserClass = UAParser as any;
      const parser = new UAParserClass(userAgent || "");
      const result = parser.getResult();

      let deviceModel = deviceModelHeader;
      if (!deviceModel) {
        if (result.device.model) {
          deviceModel = result.device.model;
        } else if (result.os.name === "iOS") {
          deviceModel = "iPhone";
        } else if (result.os.name === "Android") {
          deviceModel = "Android Device";
        } else if (result.os.name === "Windows") {
          deviceModel = "Windows PC";
        } else if (result.os.name === "Mac OS") {
          deviceModel = "Mac";
        } else {
          deviceModel = result.browser.name || "Unknown Device";
        }
      }

      const clientIp = ipAddress || "Unknown IP";
      let location = "Unknown Location";
      if (clientIp !== "Unknown IP") {
        try {
          const geoip = require("geoip-lite");
          const geo = geoip.lookup(clientIp);
          if (geo) {
            const cityPart = geo.city || geo.region;
            if (cityPart && geo.country) {
              location = `${cityPart}, ${geo.country}`;
            } else if (geo.country) {
              location = geo.country;
            } else if (cityPart) {
              location = cityPart;
            }
          }
        } catch (e) {
          console.error("GeoIP lookup failed", e);
        }
      }

      deviceInfo = {
        deviceModel,
        location,
        time: new Date().toLocaleString(),
      };
    }

    const result = await sendVerificationEmail(mainEmail, code, emailType, deviceInfo);
    if (result.error) {
      console.log("RESEND ERROR:", result.error);
      return {
        status: 500,
        data: {
          success: false,
          message: "Failed to send verification email. Please try again later.",
        },
      };
    }

    return {
      status: 200,
      data: {
        success: true,
        message: "Verification code sent to email",
      },
    };
  }
}
