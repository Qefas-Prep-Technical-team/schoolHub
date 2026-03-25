// src/modules/link/link.controller.ts
import { Request, Response } from "express";
import { LinkEntityType, LinkType, UserRole } from "@prisma/client";
import { createLinkRequestService } from "./link.service";
import { createNotification } from "../notification/notification.service";
import { respondToLinkRequestService } from "./link.respond.service";
import {
  getActiveLinksService,
  getIncomingPendingLinkRequestsService,
  getOutgoingLinkRequestsService,
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

    if (result.request.targetId) {
      await createNotification({
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
      });
    }

    return res.status(201).json({
      success: true,
      message: "Link request sent successfully",
      data: result.request,
    });
  } catch (error: any) {
    console.error("createLinkRequest error:", error);
    return res.status(400).json({
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
      return res.status(400).json({ success: false, message: "Unsupported user type" });
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
      }
    );

    return res.status(200).json({
      success: true,
      message: "Sent requests fetched successfully",
      ...result,
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
      return res.status(400).json({ success: false, message: "Unsupported user type" });
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
      }
    );

    return res.status(200).json({
      success: true,
      message: "Pending requests fetched successfully",
      ...result,
    });
  } catch (error: any) {
    console.error("getMyPendingLinkRequests error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch pending requests",
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
      return res.status(400).json({ success: false, message: "Unsupported user type" });
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
      }
    );

    return res.status(200).json({
      success: true,
      message: "Active links fetched successfully",
      ...result,
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
    console.log(req.params.id)
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const currentUserType = userRoleToEntityType(req.user.userType);
    if (!currentUserType) {
      return res.status(400).json({ success: false, message: "Unsupported user type" });
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
      return res.status(400).json({ success: false, message: "Unsupported user type" });
    }

    const cancelled = await cancelLinkRequestService({
      requestId: req.params.id as string,
      currentUserId: req.user.id,
      currentUserType,
    });

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
      return res.status(400).json({ success: false, message: "Unsupported user type" });
    }

    const revoked = await revokeActiveLinkService({
      linkId: req.params.id as string,
      currentUserId: req.user.id,
      currentUserType,
    });

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