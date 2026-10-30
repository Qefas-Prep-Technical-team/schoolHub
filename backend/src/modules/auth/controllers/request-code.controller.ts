import { Request, Response } from "express";
import { RequestCodeService } from "../services/request-code.service";
import { handleError } from "../../../utils/error-handler";

/**
 * Handles requesting email verification code for new accounts or new device logins.
 */
export const requestVerificationCode = async (req: Request, res: Response) => {
  try {
    const { userType, email, isDeviceVerification } = req.body;
    const userAgent = req.headers["user-agent"] || "";
    const deviceModelHeader = req.headers["x-device-model"] as string | undefined;
    const ipAddress = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "")
      .toString()
      .split(",")[0]
      .trim();

    const result = await RequestCodeService.requestCode({
      email,
      userType,
      isDeviceVerification: isDeviceVerification === true,
      userAgent,
      ipAddress,
      deviceModelHeader,
    });

    return res.status(result.status).json(result.data);
  } catch (error) {
    return handleError(res, error, "auth.requestVerificationCode");
  }
};
