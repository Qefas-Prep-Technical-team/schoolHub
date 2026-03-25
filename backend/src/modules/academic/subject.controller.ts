import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import {
  createSubjectService,
  getSubjectsService,
  getSingleSubjectService,
  updateSubjectService,
  archiveSubjectService,
} from "./subject.service";
import { canManageSubject } from "./academic.permissions";

export const createSubject = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { name, code, description, schoolId, scope } = req.body;

    const subject = await createSubjectService({
      currentUserId: req.user.id,
      currentUserType: req.user.userType as UserRole,
      name,
      code,
      description,
      schoolId,
      scope,
    });

    return res.status(201).json({
      success: true,
      data: subject,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getSubjects = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const schoolId = req.query.schoolId as string | undefined;

    const subjects = await getSubjectsService({
      currentUserId: req.user.id,
      currentUserType: req.user.userType as UserRole,
      schoolId,
    });

    return res.status(200).json({
      success: true,
      data: subjects,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getSingleSubject = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const subjectId = req.params.id as string;
    const subject = await getSingleSubjectService(subjectId);

    return res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateSubject = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const subjectId = req.params.id;
    const { name, code, description } = req.body;

    const hasPermission = await canManageSubject({
      userId: req.user.id,
      userType: req.user.userType as UserRole,
      subjectId: subjectId as string,
    });

    if (!hasPermission) {
      return res.status(403).json({ success: false, message: "Permission denied" });
    }

    const subject = await updateSubjectService({
        subjectId: subjectId as string,
        name,
        code,
        description
    });

    return res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const archiveSubject = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const subjectId = req.params.id;

    const hasPermission = await canManageSubject({
      userId: req.user.id,
      userType: req.user.userType as UserRole,
      subjectId: subjectId as string,
    });

    if (!hasPermission) {
      return res.status(403).json({ success: false, message: "Permission denied" });
    }

    const subject = await archiveSubjectService(subjectId as string);

    return res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
