import { Request, Response } from "express";
import { TutorialService } from "./tutorials.service";
import { TutorialItemSchema, SaveTutorialsSchema } from "./tutorials.schema";
import { createActivityLog } from "../logs/logs.controller";
import { handleError } from "../../../utils/error-handler";

/**
 * Public & Internal Console: Fetch all tutorials from DB
 * GET /api/platform/tutorials
 */
export const listTutorials = async (req: Request, res: Response) => {
  try {
    const tutorials = await TutorialService.getAllTutorials();
    return res.status(200).json({
      success: true,
      data: tutorials,
    });
  } catch (error) {
    return handleError(res, error, "tutorials.listTutorials");
  }
};

/**
 * Public: Get single tutorial by ID
 * GET /api/platform/tutorials/:id
 */
export const getTutorial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tutorial = await TutorialService.getTutorialById(id as string);
    if (!tutorial) {
      return res.status(404).json({ success: false, message: "Tutorial not found" });
    }
    return res.status(200).json({
      success: true,
      data: tutorial,
    });
  } catch (error) {
    return handleError(res, error, "tutorials.getTutorial");
  }
};

/**
 * Console: Save or batch update tutorials
 * POST /api/platform/tutorials
 */
export const saveTutorialsBatch = async (req: Request, res: Response) => {
  try {
    const parsed = SaveTutorialsSchema.parse(req.body);
    const updated = await TutorialService.saveTutorials(parsed.tutorials);

    const staff = (req as any).staff;
    if (staff) {
      await createActivityLog(
        staff.id,
        "SAVE_TUTORIALS_BATCH",
        "PlatformTutorials",
        undefined,
        { count: updated.length }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Tutorials successfully saved to database",
      data: updated,
    });
  } catch (error) {
    return handleError(res, error, "tutorials.saveTutorialsBatch");
  }
};

/**
 * Console: Create or update a single tutorial
 * POST /api/platform/tutorials/upsert
 */
export const upsertTutorial = async (req: Request, res: Response) => {
  try {
    const parsed = TutorialItemSchema.parse(req.body);
    const updatedList = await TutorialService.upsertSingleTutorial(parsed);

    const staff = (req as any).staff;
    if (staff) {
      await createActivityLog(
        staff.id,
        "UPSERT_TUTORIAL",
        "PlatformTutorials",
        parsed.id,
        { title: parsed.title, role: parsed.role }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Tutorial saved to database",
      data: updatedList,
    });
  } catch (error) {
    return handleError(res, error, "tutorials.upsertTutorial");
  }
};

/**
 * Console: Delete a tutorial by ID
 * DELETE /api/platform/tutorials/:id
 */
export const deleteTutorial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedList = await TutorialService.deleteTutorial(id as string);

    const staff = (req as any).staff;
    if (staff) {
      await createActivityLog(
        staff.id,
        "DELETE_TUTORIAL",
        "PlatformTutorials",
        id as string,
        {}
      );
    }

    return res.status(200).json({
      success: true,
      message: "Tutorial deleted from database",
      data: updatedList,
    });
  } catch (error) {
    return handleError(res, error, "tutorials.deleteTutorial");
  }
};

/**
 * Console: Reset database catalog to institutional defaults
 * POST /api/platform/tutorials/reset
 */
export const resetTutorials = async (req: Request, res: Response) => {
  try {
    const defaults = await TutorialService.resetToDefaults();

    const staff = (req as any).staff;
    if (staff) {
      await createActivityLog(
        staff.id,
        "RESET_TUTORIALS",
        "PlatformTutorials",
        undefined,
        { count: defaults.length }
      );
    }

    return res.status(200).json({
      success: true,
      message: "Tutorials reset to default institutional catalog in database",
      data: defaults,
    });
  } catch (error) {
    return handleError(res, error, "tutorials.resetTutorials");
  }
};

