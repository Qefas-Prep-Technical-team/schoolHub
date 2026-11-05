import { randomUUID } from "crypto";
import { UserRole } from "@prisma/client";
import prisma, { withRetry } from "../../../config/database";

export interface StudentAuditCaller {
  id: string;
  userType: string;
  schoolId?: string;
}

export async function getStudentDownloadAuditService(
  studentId: string,
  caller: StudentAuditCaller,
) {
  const student = await withRetry(
    () =>
      prisma.student.findUnique({
        where: { id: studentId },
        include: {
          school: { select: { id: true, name: true, logo: true } },
          parentLinks: {
            include: {
              parent: {
                select: {
                  id: true,
                  fullName: true,
                  email: true,
                  phone: true,
                  profileImage: true,
                },
              },
            },
          },
        },
      }),
    "student.getStudentDownloadAudit.findStudent",
  );

  if (!student) {
    return { status: "NOT_FOUND" as const };
  }

  if (caller.userType === UserRole.STUDENT && caller.id !== studentId) {
    return { status: "FORBIDDEN" as const, message: "Access denied" };
  }
  if (caller.userType === UserRole.PARENT) {
    const isLinked = student.parentLinks.some((l) => l.parentId === caller.id);
    if (!isLinked) {
      return {
        status: "FORBIDDEN" as const,
        message: "Access denied: Not linked to this student",
      };
    }
  }
  if (
    caller.userType === UserRole.ADMIN &&
    caller.schoolId &&
    student.schoolId !== caller.schoolId
  ) {
    return {
      status: "FORBIDDEN" as const,
      message: "Access denied: Student belongs to another school",
    };
  }

  const [fileMetrics, payments] = await Promise.all([
    withRetry(
      () =>
        prisma.fileMetric.findMany({
          where: {
            studentId,
            fileType: {
              in: ["RESULT_DOWNLOAD", "TRANSCRIPT_DOWNLOAD", "REPORT_CARD"],
            },
          },
          orderBy: { createdAt: "desc" },
        }),
      "student.getStudentDownloadAudit.fileMetrics",
    ),
    withRetry(
      () =>
        prisma.payment.findMany({
          where: { studentId },
          include: {
            parent: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
            transactionHistory: true,
          },
          orderBy: { createdAt: "desc" },
        }),
      "student.getStudentDownloadAudit.payments",
    ),
  ]);

  let studentDownloads = 0;
  let parentDownloads = 0;
  const recentDownloads: Array<{
    id: string;
    fileName: string;
    fileType?: string;
    downloadedBy: "STUDENT" | "PARENT" | "STAFF";
    performerName: string;
    date: string;
  }> = [];

  fileMetrics.forEach((m) => {
    const isParent = Boolean(m.parentId);
    if (isParent) {
      parentDownloads++;
      const parentObj = student.parentLinks.find(
        (pl) => pl.parentId === m.parentId,
      )?.parent;
      recentDownloads.push({
        id: m.id,
        fileName: m.fileName,
        fileType: m.fileType,
        downloadedBy: "PARENT",
        performerName: parentObj?.fullName || "Parent / Guardian",
        date: m.createdAt.toISOString(),
      });
    } else {
      studentDownloads++;
      recentDownloads.push({
        id: m.id,
        fileName: m.fileName,
        fileType: m.fileType,
        downloadedBy: "STUDENT",
        performerName: student.name,
        date: m.createdAt.toISOString(),
      });
    }
  });

  const totalPaid = payments
    .filter((p) => p.status === "SUCCESS" || p.status === "PAID")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalOutstanding = payments
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const formattedPayments = payments.map((p) => ({
    id: p.id,
    reference: p.paymentReference,
    amount: p.amount,
    term: p.term,
    session: p.session,
    paymentType: p.paymentType,
    status: p.status,
    paymentMethod: p.paymentMethod || "Electronic Gateway",
    paidAt: p.paidAt ? p.paidAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    paidBy: p.parent?.fullName || "Parent / Sponsor",
    parentEmail: p.parent?.email || null,
    parentPhone: p.parent?.phone || null,
  }));

  const linkedParents = student.parentLinks.map((pl) => ({
    id: pl.parent.id,
    fullName: pl.parent.fullName,
    email: pl.parent.email,
    phone: pl.parent.phone,
    profileImage: pl.parent.profileImage,
    relationship:
      (pl as { relationship?: string }).relationship || "Parent / Guardian",
    status: pl.status,
  }));

  return {
    status: "OK" as const,
    data: {
      studentId: student.id,
      studentName: student.name,
      studentCode: student.studentCode,
      downloadStats: {
        totalDownloads: studentDownloads + parentDownloads,
        studentDownloads,
        parentDownloads,
        recentDownloads: recentDownloads.slice(0, 10),
        lastDownloadedAt: recentDownloads[0]?.date || null,
      },
      paymentStats: {
        hasPaid: totalPaid > 0,
        totalPaid,
        totalOutstanding,
        currency: "NGN",
        currencySymbol: "₦",
        payments: formattedPayments,
      },
      linkedParents,
    },
  };
}

export async function recordResultDownloadService(
  studentId: string,
  caller: StudentAuditCaller,
  payload: {
    fileName?: string;
    fileType?: string;
    ipAddress?: string | null;
  },
) {
  const student = await withRetry(
    () =>
      prisma.student.findUnique({
        where: { id: studentId },
        include: {
          parentLinks: { select: { parentId: true } },
        },
      }),
    "student.recordResultDownload.findStudent",
  );

  if (!student) {
    return { status: "NOT_FOUND" as const };
  }

  if (caller.userType === UserRole.STUDENT && caller.id !== studentId) {
    return { status: "FORBIDDEN" as const, message: "Access denied" };
  }
  if (caller.userType === UserRole.PARENT) {
    const isLinked = student.parentLinks.some((l) => l.parentId === caller.id);
    if (!isLinked) {
      return {
        status: "FORBIDDEN" as const,
        message: "Access denied: Not linked to this student",
      };
    }
  }
  if (
    caller.userType === UserRole.ADMIN &&
    caller.schoolId &&
    student.schoolId !== caller.schoolId
  ) {
    return {
      status: "FORBIDDEN" as const,
      message: "Access denied: Student belongs to another school",
    };
  }

  const fileName = payload.fileName || "Official_Transcript.pdf";
  const fileType = payload.fileType || "TRANSCRIPT_DOWNLOAD";
  const metricId = randomUUID();
  const isParent = caller.userType === UserRole.PARENT;
  const isTeacher = caller.userType === UserRole.TEACHER;

  const fileMetric = await withRetry(
    () =>
      prisma.fileMetric.create({
        data: {
          id: metricId,
          fileName,
          fileSize: BigInt(128000),
          fileType,
          schoolId: student.schoolId,
          studentId: student.id,
          parentId: isParent ? caller.id : null,
          teacherId: isTeacher ? caller.id : null,
        },
      }),
    "student.recordResultDownload.createMetric",
  );

  await withRetry(
    () =>
      prisma.securityAuditLog.create({
        data: {
          userId: caller.id,
          userRole: String(caller.userType),
          action: `DOWNLOAD_${fileType}`,
          ipAddress: payload.ipAddress || null,
        },
      }),
    "student.recordResultDownload.auditLog",
  ).catch((e) => console.warn("Failed to create security audit log:", e));

  return {
    status: "OK" as const,
    data: {
      id: fileMetric.id,
      fileName: fileMetric.fileName,
      createdAt: fileMetric.createdAt,
    },
  };
}
