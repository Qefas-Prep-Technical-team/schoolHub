const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'backend', 'src', 'modules', 'auth', 'auth.controller.ts');
let content = fs.readFileSync(targetPath, 'utf8');

// The file is currently very corrupted around login2FA.
// I will find the export const login2FA = async (req: Request, res: Response) => { ... } 
// and replace its entire body up to send2FAEmail.

const startMarker = 'export const login2FA = async (req: Request, res: Response) => {';
const endMarker = 'export const send2FAEmail = async (req: Request, res: Response) => {';

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find markers!");
  process.exit(1);
}

const correctLogin2FA = `export const login2FA = async (req: Request, res: Response) => {
  try {
    const { tempToken, code } = req.body;

    let payload: any;
    try {
      payload = jwt.verify(
        tempToken,
        process.env.JWT_SECRET || "default_secret",
      );
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }

    const { userId, userType } = payload;

    let user: any;
    if (userType === UserRole.ADMIN)
      user = await prisma.admin.findUnique({
        where: { id: userId },
        include: { schoolAdmins: { include: { school: true } } },
      });
    else if (userType === UserRole.TEACHER) {
      const t = await prisma.teacher.findUnique({
        where: { id: userId },
        include: { school: true, currentSchool: true, primarySchool: true },
      });
      if (t)
        (t as any).school =
          t.currentSchool || t.primarySchool || (t as any).school;
      user = t;
    } else if (userType === UserRole.STUDENT)
      user = await prisma.student.findUnique({
        where: { id: userId },
        include: { school: true },
      });
    else if (userType === UserRole.PARENT)
      user = await prisma.parent.findUnique({
        where: { id: userId },
        include: { children: { include: { student: true } } },
      });

    if (!user || (!user.twoFactorSecret && !user.email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user or 2FA not enabled" });
    }

    let verified = false;
    try {
      if (user.twoFactorSecret) {
        verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: "base32",
          token: code,
        });
      }
    } catch (e) {
      console.log("Speakeasy verify error:", e);
    }

    if (!verified) {
      // Fallback: Check email verification code
      const verificationRecord = await prisma.verificationCode.findFirst({
        where: {
          email: user.email,
          code: code.trim(),
          used: false,
        },
        orderBy: { createdAt: "desc" },
      });

      if (!verificationRecord) {
        return res
          .status(401)
          .json({ success: false, message: "Invalid 2FA code" });
      }

      if (verificationRecord.expiresAt < new Date()) {
        return res
          .status(401)
          .json({ success: false, message: "2FA code has expired" });
      }

      // Mark the code as used
      await prisma.verificationCode.update({
        where: { id: verificationRecord.id },
        data: { used: true },
      });
    }

    // Reuse login logic for tokens and response
    const accessToken = generateAccessToken(user.id, userType);

    // basic device info (dummy for this specific route since we don't recalculate it all)
    const deviceInfo = {
      deviceType: "desktop",
      deviceModel: "Unknown Browser",
      osVersion: "Unknown OS",
      ipAddress: "Unknown IP",
    };
    const refreshToken = await generateRefreshToken(
      user.id,
      userType,
      deviceInfo,
    );

    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ===== Build response data =====
    let responseData: any = {};
    let message = "2FA successful";

    if (userType === UserRole.ADMIN) {
      const schools =
        user.schoolAdmins?.map((sa: any) => ({
          schoolId: sa.school?.id,
          schoolName: sa.school?.name,
          schoolCode: sa.school?.schoolCode,
          adminRole: sa.role,
          approved:
            sa.role === AdminRole.SCHOOL_OWNER || user.status === "APPROVED",
        })) || [];
      const primarySchool = user.schoolAdmins?.[0]?.school || null;

      responseData = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          require2FA: user.isTwoFactorEnabled || false,
          adminCode: user.adminCode,
          schoolCode: primarySchool?.schoolCode || null,
          profileImage: user.profileImage,
          bannerImage: user.bannerImage,
          gender: user.gender,
          schools,
          plan: primarySchool?.plan || user.plan,
          trialUsed: primarySchool?.trialUsed ?? user.trialUsed,
        },
        userRole: user.role,
        accessToken,
        refreshToken,
      };
    } else if (userType === UserRole.TEACHER) {
      responseData = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          require2FA: user.isTwoFactorEnabled || false,
          teacherCode: user.teacherCode,
          profileImage: user.profileImage,
          bannerImage: user.bannerImage,
          gender: user.gender,
          school: user.school,
          plan: user.plan,
          trialUsed: user.trialUsed,
        },
        userRole: user.role,
        accessToken,
        refreshToken,
      };
    } else if (userType === UserRole.STUDENT) {
      responseData = {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          require2FA: user.isTwoFactorEnabled || false,
          studentCode: user.studentCode,
          profileImage: user.profileImage,
          bannerImage: user.bannerImage,
          gender: user.gender,
          school: user.school,
          plan: user.plan,
          trialUsed: user.trialUsed,
        },
        userRole: user.role,
        accessToken,
        refreshToken,
      };
    } else if (userType === UserRole.PARENT) {
      responseData = {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          require2FA: user.isTwoFactorEnabled || false,
          profileImage: user.profileImage,
          bannerImage: user.bannerImage,
          gender: user.gender,
          parentCode: user.parentCode,
          plan: user.plan,
          trialUsed: user.trialUsed,
        },
        children: user.children?.map((child: any) => ({
          studentId: child.student.id,
          studentName: child.student.name,
          studentCode: child.student.studentCode,
          studentImage: child.student.profileImage,
          linkStatus: child.status,
        })),
        userRole: user.role,
        accessToken,
        refreshToken,
      };
    }

    res.status(200).json({
      success: true,
      message,
      data: responseData,
    });
  } catch (error) {
    return handleError(res, error, "auth.login2FA");
  }
};

`;

const newContent = content.substring(0, startIndex) + correctLogin2FA + content.substring(endIndex);
fs.writeFileSync(targetPath, newContent);
console.log("Fixed!");
