// src/modules/link/link.controller.ts
import { Request, Response } from "express";
import { LinkEntityType, LinkType, UserRole } from "@prisma/client";
import prisma from "../../config/database";
import { createLinkRequestService } from "./link.service";
import { createNotification } from "../notification/notification.service";
import { respondToLinkRequestService } from "./link.respond.service";
import {
  getActiveLinksService,
  getIncomingPendingLinkRequestsService,
  getOutgoingLinkRequestsService,
  getAllLinkRequestsService,
} from "./link.query.service";
import {
  batchRespondToRequestsService,
  batchRevokeActiveLinksService,
} from "./link.batch.service";
import {
  getSingleLinkRequestService,
  cancelLinkRequestService,
  revokeActiveLinkService,
} from "./link.manage.service";
import { getIO } from "../../socket";

const isClassLinkType = (type: string) =>
  ["TEACHER_CLASS", "STUDENT_CLASS"].includes(type);

const userRoleToEntityType = (role: UserRole): LinkEntityType | null => {
  switch (role) {
    case UserRole.ADMIN:
      return LinkEntityType.ADMIN;
    case UserRole.TEACHER:
      return LinkEntityType.TEACHER;
    case UserRole.STUDENT:
      return LinkEntityType.STUDENT;
    case UserRole.PARENT:
      return LinkEntityType.PARENT;
    default:
      return null;
  }
};

export const createLinkRequest = async (req: Request, res: Response) => {
  try {
    const { targetCode, linkType, note, schoolId, classId } = req.body;
    console.log("createLinkRequest called with:", {
      targetCode,
      linkType,
      note,
      schoolId,
      classId,
    });

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!targetCode || !linkType) {
      return res.status(400).json({
        success: false,
        message: "targetCode and linkType are required",
      });
    }

    if (!Object.values(LinkType).includes(linkType as LinkType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid linkType",
      });
    }

    const requesterType = userRoleToEntityType(req.user.userType);

    if (!requesterType) {
      return res.status(400).json({
        success: false,
        message: "Unsupported requester type",
      });
    }

    const result = await createLinkRequestService({
      requesterType,
      requesterId: req.user.id,
      targetCode: String(targetCode).trim(),
      linkType: linkType as LinkType,
      note,
      schoolId,
      classId,
    });

    console.log(`[Link Request] Success: Created request ${result.request.id} of type ${linkType}`);

    const notificationPromises: Promise<any>[] = [];

    if (result.request.targetId) {
      const io = getIO();
      // Notify the target user immediately for the "Live" feel
      io.to(`user:${result.request.targetId}`).emit("link:updated", {
        type: "LINK_REQUEST_RECEIVED",
        requestId: result.request.id,
        message: "You have a new link request",
      });

      notificationPromises.push(
        createNotification({
          recipientType: result.request.targetType as any,
          recipientId: result.request.targetId,
          senderType: result.request.requesterType as any,
          senderId: result.request.requesterId,
          type: "LINK_REQUEST",
          title: "New Link Request",
          message: `${result.request.requesterType} sent you a link request`,
          linkRequestId: result.request.id,
          meta: {
            linkType: result.request.linkType,
            requesterCode: result.request.requesterCode,
            targetCode: result.request.targetCode,
          },
        }).catch(err => console.error(`Failed to notify target ${result.request.targetId}:`, err))
      );
    }

    // Always notify the requester themselves
    notificationPromises.push(
      createNotification({
        recipientType: result.request.requesterType as any,
        recipientId: result.request.requesterId,
        type: "GENERAL",
        title: "Link Request Sent",
        message: `Your link request to join as ${result.request.linkType} has been sent successfully.`,
        linkRequestId: result.request.id,
      }).catch(err => console.error(`Failed to notify requester ${result.request.requesterId}:`, err))
    );

    // Notify School if it's a teacher initiating an action
    if (schoolId && requesterType === LinkEntityType.TEACHER) {
      notificationPromises.push(
        createNotification({
          recipientType: "SCHOOL",
          recipientId: schoolId,
          type: "GENERAL",
          title: "Teacher Relationship Action",
          message: `A teacher has initiated a new relationship link (${linkType}).`,
        }).catch(err => console.error("Failed to notify school of link request:", err))
      );
    }

    await Promise.all(notificationPromises);

    return res.status(201).json({
      success: true,
      message: "Link request sent successfully",
      data: result.request,
    });
  } catch (error: any) {
    console.error("createLinkRequest error:", error);
    return res.status(error.status || 400).json({
      success: false,
      message: error.message || "Failed to create link request",
    });
  }
};

export const respondToLinkRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { action, rejectionReason } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Request id is required",
      });
    }

    if (!action || !["ACCEPT", "REJECT"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Action must be ACCEPT or REJECT",
      });
    }

    const currentUserType = userRoleToEntityType(req.user.userType);

    if (!currentUserType) {
      return res.status(400).json({
        success: false,
        message: "Unsupported responder type",
      });
    }

    const result = await respondToLinkRequestService({
      requestId: id as string,
      action,
      currentUserId: req.user.id,
      currentUserType,
      rejectionReason,
    });

    // Emit event to requester to trigger their UI update
    const io = getIO();
    io.to(`user:${result.request.requesterId}`).emit("link:updated", {
      type: action === "ACCEPT" ? "LINK_ACCEPTED" : "LINK_REJECTED",
      requestId: result.request.id,
      message: `Your link request was ${action.toLowerCase()}ed`,
    });

    // Notify School if it's a teacher-related link action taking place
    if (result.request.schoolId && 
       (result.request.requesterType === LinkEntityType.TEACHER || result.request.targetType === LinkEntityType.TEACHER)) {
      createNotification({
        recipientType: "SCHOOL",
        recipientId: result.request.schoolId,
        type: "GENERAL",
        title: "Teacher Link Request Update",
        message: `A teacher relationship link request was ${action.toLowerCase()}ed.`,
      }).catch(err => console.error("Failed to notify school of link request response:", err));
    }

    return res.status(200).json({
      success: true,
      message:
        action === "ACCEPT"
          ? "Link request accepted successfully"
          : "Link request rejected successfully",
      data: {
        requestId: result.request.id,
        status: result.request.status,
        respondedAt: result.request.respondedAt,
        relationshipLinkId: result.relationship?.id || null,
      },
    });
  } catch (error: any) {
    console.error("respondToLinkRequest error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to respond to link request",
    });
  }
};

export const getMySentLinkRequests = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const currentUserType = userRoleToEntityType(req.user.userType);
    if (!currentUserType) {
      return res
        .status(400)
        .json({ success: false, message: "Unsupported user type" });
    }

    const result = await getOutgoingLinkRequestsService(
      {
        currentUserId: req.user.id,
        currentUserType,
      },
      {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        status: req.query.status as string,
        linkType: req.query.linkType as string,
        category: req.query.category as any,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Sent requests fetched successfully",
      items: result.items,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("getMySentLinkRequests error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch sent requests",
    });
  }
};

export const getMyPendingLinkRequests = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const currentUserType = userRoleToEntityType(req.user.userType);
    if (!currentUserType) {
      return res
        .status(400)
        .json({ success: false, message: "Unsupported user type" });
    }

    const result = await getIncomingPendingLinkRequestsService(
      {
        currentUserId: req.user.id,
        currentUserType,
      },
      {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        linkType: req.query.linkType as string,
        category: req.query.category as any,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Pending requests fetched successfully",
      items: result.items,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("getMyPendingLinkRequests error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch pending requests",
    });
  }
};

export const getAllLinkRequests = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const currentUserType = userRoleToEntityType(req.user.userType);
    if (!currentUserType) {
      return res
        .status(400)
        .json({ success: false, message: "Unsupported user type" });
    }

    const result = await getAllLinkRequestsService(
      {
        currentUserId: req.user.id,
        currentUserType,
      },
      {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        status: req.query.status as string,
        linkType: req.query.linkType as string,
        category: req.query.category as any,
      },
    );

    return res.status(200).json({
      success: true,
      message: "All link requests fetched successfully",
      items: result.items,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("getAllLinkRequests error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch link requests",
    });
  }
};

export const getMyActiveLinks = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const currentUserType = userRoleToEntityType(req.user.userType);
    if (!currentUserType) {
      return res
        .status(400)
        .json({ success: false, message: "Unsupported user type" });
    }

    const result = await getActiveLinksService(
      {
        currentUserId: req.user.id,
        currentUserType,
      },
      {
        page: Number(req.query.page),
        limit: Number(req.query.limit),
        linkType: req.query.linkType as string,
        category: req.query.category as any,
      },
    );

    return res.status(200).json({
      success: true,
      message: "Active links fetched successfully",
      items: result.items,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("getMyActiveLinks error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch active links",
    });
  }
};

export const getSingleLinkRequest = async (req: Request, res: Response) => {
  try {
    console.log(req.params.id);
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const currentUserType = userRoleToEntityType(req.user.userType);
    if (!currentUserType) {
      return res
        .status(400)
        .json({ success: false, message: "Unsupported user type" });
    }

    const request = await getSingleLinkRequestService({
      requestId: req.params.id as string,
      currentUserId: req.user.id,
      currentUserType,
    });

    return res.status(200).json({
      success: true,
      message: "Request fetched successfully",
      data: request,
    });
  } catch (error: any) {
    console.error("getSingleLinkRequest error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch request",
    });
  }
};

export const cancelLinkRequest = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const currentUserType = userRoleToEntityType(req.user.userType);
    if (!currentUserType) {
      return res
        .status(400)
        .json({ success: false, message: "Unsupported user type" });
    }

    const cancelled = await cancelLinkRequestService({
      requestId: req.params.id as string,
      currentUserId: req.user.id,
      currentUserType,
    });

    // Notify target that request is gone
    if (cancelled.targetId) {
      getIO().to(`user:${cancelled.targetId}`).emit("link:updated", {
        type: "LINK_CANCELLED",
        requestId: cancelled.id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Request cancelled successfully",
      data: cancelled,
    });
  } catch (error: any) {
    console.error("cancelLinkRequest error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to cancel request",
    });
  }
};

export const revokeActiveLink = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const currentUserType = userRoleToEntityType(req.user.userType);
    if (!currentUserType) {
      return res
        .status(400)
        .json({ success: false, message: "Unsupported user type" });
    }

    const revoked = await revokeActiveLinkService({
      linkId: req.params.id as string,
      currentUserId: req.user.id,
      currentUserType,
    });

    // Notify both sides to sync UI
    const io = getIO();
    io.to(`user:${revoked.leftEntityId}`).emit("link:updated", {
      type: "LINK_REVOKED",
      linkId: revoked.id,
    });
    if (revoked.rightEntityId !== revoked.leftEntityId) {
      io.to(`user:${revoked.rightEntityId}`).emit("link:updated", {
        type: "LINK_REVOKED",
        linkId: revoked.id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Active link revoked successfully",
      data: revoked,
    });
  } catch (error: any) {
    console.error("revokeActiveLink error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to revoke active link",
    });
  }
};

export const batchRequestAction = async (req: Request, res: Response) => {
  try {
    const { ids, action, rejectionReason } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ids must be a non-empty array",
      });
    }

    if (!action || !["ACCEPT", "REJECT", "CANCEL"].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "action must be ACCEPT, REJECT, or CANCEL",
      });
    }

    const currentUserType = userRoleToEntityType(req.user.userType);

    if (!currentUserType) {
      return res.status(400).json({
        success: false,
        message: "Unsupported user type",
      });
    }

    const result = await batchRespondToRequestsService({
      ids,
      action,
      currentUserId: req.user.id,
      currentUserType,
      rejectionReason,
    });

    // Trigger universal link sync for all connected clients 
    // (Simpler than mapping all IDs in a batch)
    getIO().emit("link:updated", {
      type: `BATCH_${action}_COMPLETED`,
    });

    return res.status(200).json({
      success: true,
      message: `Batch ${action.toLowerCase()} completed`,
      data: result,
    });
  } catch (error: any) {
    console.error("batchRequestAction error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Batch request action failed",
    });
  }
};

export const acceptAllRequestsByCategory = async (req: Request, res: Response) => {
  try {
    const { category } = req.body; // 'network' | 'classroom'

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const currentUserType = userRoleToEntityType(req.user.userType);
    if (!currentUserType) {
      return res.status(400).json({ success: false, message: "Unsupported user type" });
    }

    // 1. Get all pending requests for this user (including school-targeted ones)
    const schoolAdminLinks = await prisma.schoolAdmin.findMany({
      where: { adminId: req.user.id, active: true },
      select: { schoolId: true },
    });
    const schoolIds = schoolAdminLinks.map((s) => s.schoolId);

    const pendingRequests = await prisma.linkRequest.findMany({
      where: {
        status: "PENDING",
        OR: [
          { targetType: LinkEntityType.ADMIN, targetId: req.user.id },
          { targetSchoolId: { in: schoolIds } },
          { schoolId: { in: schoolIds } },
          {
            targetType: LinkEntityType.SCHOOL,
            targetSchool: {
              admins: { some: { adminId: req.user.id, active: true } },
            },
          },
        ],
      },
      select: { id: true, linkType: true }
    });

    if (pendingRequests.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No pending requests to accept",
        data: { total: 0, successCount: 0, failedCount: 0, results: [] }
      });
    }

    // 2. Filter by category
    let targetIds: string[] = [];
    if (category === 'classroom') {
      targetIds = pendingRequests
        .filter(r => isClassLinkType(r.linkType))
        .map(r => r.id);
    } else if (category === 'network') {
      targetIds = pendingRequests
        .filter(r => !isClassLinkType(r.linkType))
        .map(r => r.id);
    } else {
      // If no category specified, accept ALL
      targetIds = pendingRequests.map(r => r.id);
    }

    if (targetIds.length === 0) {
       return res.status(200).json({
        success: true,
        message: `No pending ${category} requests to accept`,
        data: { total: 0, successCount: 0, failedCount: 0, results: [] }
      });
    }

    // 3. Perform batch action
    const result = await batchRespondToRequestsService({
      ids: targetIds,
      action: "ACCEPT",
      currentUserId: req.user.id,
      currentUserType,
    });

    // Notify all affected to sync
    getIO().emit("link:updated", {
      type: "BATCH_ACCEPT_COMPLETED",
      category,
    });

    return res.status(200).json({
      success: true,
      message: `Batch accept for ${category || 'all'} completed`,
      data: result,
    });

  } catch (error: any) {
    console.error("acceptAllRequestsByCategory error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Batch accept failed",
    });
  }
};

export const batchRevokeActiveLinks = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ids must be a non-empty array",
      });
    }

    const currentUserType = userRoleToEntityType(req.user.userType);

    if (!currentUserType) {
      return res.status(400).json({
        success: false,
        message: "Unsupported user type",
      });
    }

    const result = await batchRevokeActiveLinksService({
      ids,
      currentUserId: req.user.id,
      currentUserType,
    });

    return res.status(200).json({
      success: true,
      message: "Batch revoke completed",
      data: result,
    });
  } catch (error: any) {
    console.error("batchRevokeActiveLinks error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Batch revoke failed",
    });
  }
};

export const getMyProfile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id, userType } = req.user;
    let profileData: any = null;

    switch (userType) {
      case UserRole.ADMIN:
        profileData = await prisma.admin.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            email: true,
            adminCode: true,
            role: true,
            // Temporarily disabled until migration
            // gender: true,
            // profileImage: true,
            // bannerImage: true,
            schoolAdmins: {
              where: { active: true },
              include: { school: { select: { schoolCode: true } } },
              take: 1,
            },
          },
        });
        break;
      case UserRole.TEACHER:
        profileData = await prisma.teacher.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            email: true,
            teacherCode: true,
            role: true,
            // Temporarily disabled until migration
            // gender: true,
            // profileImage: true,
            // bannerImage: true,
          },
        });
        break;
      case UserRole.STUDENT:
        profileData = await prisma.student.findUnique({
          where: { id },
          select: {
            id: true,
            name: true,
            email: true,
            studentCode: true,
            role: true,
            // Temporarily disabled until migration
            // gender: true,
            profileImage: true,
            bannerImage: true,
          },
        });
        break;
      case UserRole.PARENT:
        profileData = await prisma.parent.findUnique({
          where: { id },
          select: {
            id: true,
            fullName: true,
            email: true,
            parentCode: true,
            role: true,
            // Temporarily disabled until migration
            // gender: true,
            // profileImage: true,
            // bannerImage: true,
          },
        });
        break;
    }

    if (!profileData) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }

    // Standardize the code field name for frontend
    const linkingCode =
      profileData.adminCode ||
      profileData.teacherCode ||
      profileData.studentCode ||
      profileData.parentCode;
    const schoolCode = profileData.schoolAdmins?.[0]?.school?.schoolCode;

    return res.status(200).json({
      success: true,
      data: {
        ...profileData,
        linkingCode,
        schoolCode,
      },
    });
  } catch (error: any) {
    console.error("getMyProfile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch profile",
    });
  }
};
