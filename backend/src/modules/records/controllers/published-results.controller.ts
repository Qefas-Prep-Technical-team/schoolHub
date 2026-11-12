import { Request, Response, NextFunction } from "express";
import { handleError } from "../../../utils/error-handler";
import { resolveAndFetchPublishedResultsService } from "../services/published-results.service";

export const getMyPublishedResults = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    const reqUser = req.user as
      | {
          id?: string;
          userType?: string;
          schoolId?: string;
          school?: { id?: string };
          tenantId?: string;
        }
      | undefined;

    const schoolIdFromToken =
      reqUser?.schoolId || reqUser?.school?.id || reqUser?.tenantId;
    const queryStudentId =
      typeof req.query.studentId === "string" ? req.query.studentId : undefined;

    const outcome = await resolveAndFetchPublishedResultsService({
      userId: reqUser?.id,
      userType: reqUser?.userType,
      schoolIdFromToken,
      queryStudentId,
    });

    return res.status(outcome.status).json(outcome.body);
  } catch (error) {
    handleError(
      res,
      error,
      "published-results.controller.ts -> getMyPublishedResults",
    );
  }
};

