import { Request, Response } from "express";
import { extractDeviceInfo } from "../auth.device";
import { VerifyCodeService } from "../services/verify-code.service";
import { handleError } from "../../../utils/error-handler";

/**
 * Verifies email verification code for registration/onboarding/device verification.
 */
export const verifyEmailCode = async (req: Request, res: Response) => {
  try {
    const { email, code, userType } = req.body;
    const deviceInfo = extractDeviceInfo(req);

    const result = await VerifyCodeService.verifyEmailCode({
      email,
      code,
      userType,
      deviceInfo,
    });

    if (result.cookies) {
      if (result.cookies.token) {
        res.cookie(
          "token",
          result.cookies.token.value,
          result.cookies.token.options as any
        );
      }
      if (result.cookies.refreshToken) {
        res.cookie(
          "refreshToken",
          result.cookies.refreshToken.value,
          result.cookies.refreshToken.options as any
        );
      }
      if (result.cookies.deviceVerified) {
        res.cookie(
          "deviceVerified",
          result.cookies.deviceVerified.value,
          result.cookies.deviceVerified.options as any
        );
      }
    }

    return res.status(result.status).json(result.data);
  } catch (error) {
    return handleError(res, error, "auth.verifyEmailCode");
  }
};
