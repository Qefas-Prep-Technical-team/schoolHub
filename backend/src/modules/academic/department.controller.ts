import { Request, Response } from "express";
import { UserRole } from "@prisma/client";
import {
  createDepartmentService,
  getDepartmentsService,
  getSingleDepartmentService,
  updateDepartmentService,
  archiveDepartmentService,
  attachSubjectsToDepartmentService,
  removeSubjectFromDepartmentService,
} from "./department.service";
import { canManageDepartment } from "./academic.permissions";

const serializeDepartment = (dept: any): any => {
  if (!dept) return dept;
  
  if (Array.isArray(dept)) {
    return dept.map(serializeDepartment);
  }
  
  return dept;
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { name, code, description, schoolId, scope } = req.body;

    const department = await createDepartmentService({
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
      data: serializeDepartment(department),
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getDepartments = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const schoolId = (req.query.schoolId as string) || req.user.schoolId;
    const departments = await getDepartmentsService({
      currentUserId: req.user.id,
      currentUserType: req.user.userType as UserRole,
      schoolId: schoolId as string,
    });

    return res.status(200).json({
      success: true,
      data: serializeDepartment(departments),
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const getSingleDepartment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const departmentId = req.params.id as string;
    const department = await getSingleDepartmentService(departmentId);

    return res.status(200).json({
      success: true,
      data: serializeDepartment(department),
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const departmentId = req.params.id;
    const { name, code, description } = req.body;

    const hasPermission = await canManageDepartment({
      userId: req.user.id,
      userType: req.user.userType as UserRole,
      departmentId: departmentId as string,
    });

    if (!hasPermission) {
      return res.status(403).json({ success: false, message: "Permission denied" });
    }

    const department = await updateDepartmentService({
      departmentId: departmentId as string,
      name,
      code,
      description,
    });

    return res.status(200).json({
      success: true,
      data: serializeDepartment(department),
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const archiveDepartment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const departmentId = req.params.id;

    const hasPermission = await canManageDepartment({
      userId: req.user.id,
      userType: req.user.userType as UserRole,
      departmentId: departmentId as string,
    });

    if (!hasPermission) {
      return res.status(403).json({ success: false, message: "Permission denied" });
    }

    const department = await archiveDepartmentService(departmentId as string);

    return res.status(200).json({
      success: true,
      data: serializeDepartment(department),
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const attachSubjectsToDepartment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { departmentId, subjectIds } = req.body;

    const hasPermission = await canManageDepartment({
      userId: req.user.id,
      userType: req.user.userType as UserRole,
      departmentId: departmentId as string,
    });

    if (!hasPermission) {
      return res.status(403).json({ success: false, message: "Permission denied" });
    }

    const department = await attachSubjectsToDepartmentService({
      departmentId,
      subjectIds,
      currentUserId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      data: serializeDepartment(department),
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const removeSubjectFromDepartment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const departmentId = req.params.id as string;
    const subjectId = req.params.subjectId as string;

    const hasPermission = await canManageDepartment({
      userId: req.user.id,
      userType: req.user.userType as UserRole,
      departmentId,
    });

    if (!hasPermission) {
      return res.status(403).json({ success: false, message: "Permission denied" });
    }

    await removeSubjectFromDepartmentService({
      departmentId,
      subjectId,
    });

    return res.status(200).json({
      success: true,
      message: "Subject removed from department successfully",
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
