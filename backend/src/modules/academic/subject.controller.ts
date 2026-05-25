import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import {
  createSubjectService,
  getSubjectsService,
  getSingleSubjectService,
  updateSubjectService,
  archiveSubjectService,
  attachSubjectToDepartmentsService,
  attachTeachersToSubjectService,
} from "./subject.service";
import { canManageSubject } from "./academic.permissions";
import { handleError } from "../../utils/error-handler";

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
    return handleError(res, error, "academic.createSubject");
  }
};

export const getSubjects = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const schoolId = (req.query.schoolId as string) || req.user.schoolId;
    const subjects = await getSubjectsService({
      currentUserId: req.user.id,
      currentUserType: req.user.userType as UserRole,
      schoolId: schoolId as string,
    });

    return res.status(200).json({
      success: true,
      data: subjects,
    });
  } catch (error: any) {
    return handleError(res, error, "academic.getSubjects");
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
    return handleError(res, error, "academic.getSingleSubject");
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
    return handleError(res, error, "academic.updateSubject");
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
    return handleError(res, error, "academic.archiveSubject");
  }
};

export const attachDepartmentsToSubject = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id: subjectId } = req.params;
    const { departmentIds } = req.body;

    const hasPermission = await canManageSubject({
      userId: req.user.id,
      userType: req.user.userType as UserRole,
      subjectId: subjectId as string,
    });

    if (!hasPermission) {
      return res.status(403).json({ success: false, message: "Permission denied" });
    }

    const subject = await attachSubjectToDepartmentsService({
      subjectId: subjectId as string,
      departmentIds,
    });

    return res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error: any) {
    return handleError(res, error, "academic.attachDepartmentsToSubject");
  }
};

export const attachTeachersToSubject = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id: subjectId } = req.params;
    const { teacherIds, schoolId } = req.body;

    const hasPermission = await canManageSubject({
      userId: req.user.id,
      userType: req.user.userType as UserRole,
      subjectId: subjectId as string,
    });

    if (!hasPermission) {
      return res.status(403).json({ success: false, message: "Permission denied" });
    }

    const subject = await attachTeachersToSubjectService({
      subjectId: subjectId as string,
      teacherIds,
      schoolId: schoolId || req.user.schoolId,
    });

    return res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error: any) {
    return handleError(res, error, "academic.attachTeachersToSubject");
  }
};
