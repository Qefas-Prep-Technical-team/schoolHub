// src/modules/link/link.batch.service.ts
import { LinkEntityType, UserRole } from "@prisma/client";
import {
  respondToLinkRequestService,
} from "./link.respond.service";
import {
  cancelLinkRequestService,
  revokeActiveLinkService,
} from "./link.manage.service";

type BatchRequestAction = "ACCEPT" | "REJECT" | "CANCEL";

type BatchRequestInput = {
  ids: string[];
  action: BatchRequestAction;
  currentUserId: string;
  currentUserType: LinkEntityType;
  rejectionReason?: string;
};

type BatchRevokeInput = {
  ids: string[];
  currentUserId: string;
  currentUserType: LinkEntityType;
};

export const batchRespondToRequestsService = async ({
  ids,
  action,
  currentUserId,
  currentUserType,
  rejectionReason,
}: BatchRequestInput) => {
  const results: Array<{
    id: string;
    success: boolean;
    message: string;
    data?: any;
  }> = [];

  for (const id of ids) {
    try {
      if (action === "CANCEL") {
        const cancelled = await cancelLinkRequestService({
          requestId: id,
          currentUserId,
          currentUserType,
        });

        results.push({
          id,
          success: true,
          message: "Request cancelled successfully",
          data: cancelled,
        });
        continue;
      }

      const result = await respondToLinkRequestService({
        requestId: id,
        action,
        currentUserId,
        currentUserType,
        rejectionReason,
      });

      results.push({
        id,
        success: true,
        message:
          action === "ACCEPT"
            ? "Request accepted successfully"
            : "Request rejected successfully",
        data: {
          requestId: result.request.id,
          status: result.request.status,
          respondedAt: result.request.respondedAt,
          relationshipLinkId: result.relationship?.id || null,
        },
      });
    } catch (error: any) {
      results.push({
        id,
        success: false,
        message: error.message || "Operation failed",
      });
    }
  }

  return {
    total: ids.length,
    successCount: results.filter((r) => r.success).length,
    failedCount: results.filter((r) => !r.success).length,
    results,
  };
};

export const batchRevokeActiveLinksService = async ({
  ids,
  currentUserId,
  currentUserType,
}: BatchRevokeInput) => {
  const results: Array<{
    id: string;
    success: boolean;
    message: string;
    data?: any;
  }> = [];

  for (const id of ids) {
    try {
      const revoked = await revokeActiveLinkService({
        linkId: id,
        currentUserId,
        currentUserType,
      });

      results.push({
        id,
        success: true,
        message: "Link revoked successfully",
        data: revoked,
      });
    } catch (error: any) {
      results.push({
        id,
        success: false,
        message: error.message || "Revoke failed",
      });
    }
  }

  return {
    total: ids.length,
    successCount: results.filter((r) => r.success).length,
    failedCount: results.filter((r) => !r.success).length,
    results,
  };
};