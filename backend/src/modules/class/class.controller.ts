import { Request, Response } from "express";
import { ClassScope, UserRole } from "@prisma/client";
import prisma from "../../config/database";
import { createNotification } from "../notification/notification.service";
import { canManageClass } from "./class.permissions";
import { getSchoolUsageService, getUserUsageService } from "../subscription/quota.service";
import {
  addStudentToClassService,
  approveClassService,
  attachSubjectsToClassService,
  createClassService,
  getClassesService,
  getSingleClassService,
  getClassStatsService,
  previewClassByCodeService,
  previewClassByIdService,
  rejectClassService,
  removeStudentFromClassService,
  requestToJoinClassService,
  updateClassService,
  changeClassStatusService,
  archiveClassService,
  replaceClassSubjectsService,
  removeSubjectFromClassService,
} from "./class.service";

export const createClass = async (req: Request, res: Response) => {
  try {
    const { name, section, scope, schoolId, subjectIds, departmentIds, studentIds } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (![UserRole.ADMIN, UserRole.TEACHER].includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to create classes",
      });
    }

    if (!name || !scope) {
      return res.status(400).json({
        success: false,
        message: "name and scope are required",
      });
    }

    if (!Object.values(ClassScope).includes(scope as ClassScope)) {
      return res.status(400).json({
        success: false,
        message: "Invalid class scope",
      });
    }

    // --- Subscription Quota Check ---
    try {
      if (schoolId) {
        // A. Check School-wide subscription limits if schoolId is provided and enforcement is enabled
        const schoolSetting = await prisma.platformSettings.findUnique({
          where: { key: "sub_enforced_schools" }
        });
        const isSchoolEnforced = schoolSetting?.value !== "false";

        if (isSchoolEnforced) {
          const usageData = await getSchoolUsageService(schoolId);
          if (!usageData) {
            return res.status(500).json({
              success: false,
              message: "Error verifying subscription. Failed to create class.",
            });
          }

          const { usage, limits } = usageData;
          if (usage.classes >= limits.classes) {
            return res.status(403).json({
              success: false,
              message: `Class limit exceeded for your current school plan (${limits.classes} classes max). Please upgrade to create more classes.`,
            });
          }
        }
      } else if (req.user.userType === UserRole.TEACHER) {
        // B. Check Teacher's Individual subscription limits for personal classes if enforcement is enabled
        const teacherSetting = await prisma.platformSettings.findUnique({
          where: { key: "sub_enforced_teachers" }
        });
        const isTeacherEnforced = teacherSetting?.value !== "false";

        if (isTeacherEnforced) {
          const usageData = await getUserUsageService(req.user.id, "TEACHER");
          if (!usageData) {
            return res.status(500).json({
              success: false,
              message: "Error verifying subscription. Failed to create class.",
            });
          }

          const { usage, limits } = usageData;
          if (usage.classes >= limits.classes) {
            return res.status(403).json({
              success: false,
              message: `Class limit exceeded for your current teacher plan (${limits.classes} classes max). Please upgrade to manage more classes.`,
            });
          }
        }
      }
    } catch (quotaError: any) {
      console.error("Quota check failed during class creation:", quotaError);
      return res.status(500).json({
        success: false,
        message: "Error verifying subscription. Failed to create class.",
      });
    }
    // --------------------------------

    const newClass = await createClassService({
      currentUserId: req.user.id,
      currentUserType: req.user.userType,
      name,
      section,
      scope,
      schoolId,
      subjectIds,
      departmentIds,
      studentIds,
    });

    return res.status(201).json({
      success: true,
      message:
        newClass.status === "PENDING"
          ? "Class created and waiting for admin approval"
          : "Class created successfully",
      data: newClass,
    });
  } catch (error: any) {
    console.error("createClass error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create class",
    });
  }
};

export const approveClass = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.userType !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only admins can approve classes",
      });
    }

    const updatedClass = await approveClassService(
      req.params.id as string,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Class approved successfully",
      data: updatedClass,
    });
  } catch (error: any) {
    console.error("approveClass error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to approve class",
    });
  }
};

export const rejectClass = async (req: Request, res: Response) => {
  try {
    if (!req.user || req.user.userType !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: "Only admins can reject classes",
      });
    }

    const updatedClass = await rejectClassService(
      req.params.id as string,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Class rejected successfully",
      data: updatedClass,
    });
  } catch (error: any) {
    console.error("rejectClass error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to reject class",
    });
  }
};

export const getClasses = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const data = await getClassesService({
      currentUserId: req.user.id,
      currentUserType: req.user.userType,
      schoolId: req.query.schoolId as string | undefined,
    });

    return res.status(200).json({
      success: true,
      message: "Classes fetched successfully",
      count: data.length,
      data,
    });
  } catch (error: any) {
    console.error("getClasses error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch classes",
    });
  }
};

export const getSingleClass = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const foundClass = await getSingleClassService(req.params.id as string);

    if (req.user.userType === UserRole.ADMIN) {
      if (!foundClass.schoolId) {
        return res.status(403).json({
          success: false,
          message: "Admins cannot access personal classes",
        });
      }

      const schoolAdmin = await prisma.schoolAdmin.findFirst({
        where: {
          adminId: req.user.id,
          schoolId: foundClass.schoolId,
          active: true,
        },
      });

      if (!schoolAdmin) {
        return res.status(403).json({
          success: false,
          message: "You are not allowed to view this class",
        });
      }
    }

    if (
      req.user.userType === UserRole.TEACHER &&
      !foundClass.teachers.some((t: any) => t.teacherId === req.user?.id)
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this class",
      });
    }

    if (req.user.userType === UserRole.STUDENT) {
      const enrollment = await prisma.classEnrollment.findUnique({
        where: {
          classId_studentId: {
            classId: foundClass.id,
            studentId: req.user.id,
          },
        },
      });

      if (!enrollment) {
        return res.status(403).json({
          success: false,
          message: "You are not enrolled in this class",
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Class fetched successfully",
      data: foundClass,
    });
  } catch (error: any) {
    console.error("getSingleClass error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch class",
    });
  }
};

export const previewClassByCode = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const foundClass = await previewClassByCodeService(
      req.params.classCode as string
    );

    return res.status(200).json({
      success: true,
      message: "Class preview fetched successfully",
      data: {
        id: foundClass.id,
        name: foundClass.name,
        section: foundClass.section,
        classCode: foundClass.classCode,
        scope: foundClass.scope,
        status: foundClass.status,
        school: foundClass.school
          ? {
            id: foundClass.school.id,
            name: foundClass.school.name,
            schoolCode: foundClass.school.schoolCode,
          }
          : null,
        teacher: foundClass.teachers[0]?.teacher
          ? {
            id: foundClass.teachers[0].teacher.id,
            name: foundClass.teachers[0].teacher.name,
            teacherCode: foundClass.teachers[0].teacher.teacherCode,
          }
          : null,
        subjects: foundClass.subjects.map((s: any) => ({
          id: s.subject.id,
          name: s.subject.name,
          code: s.subject.code,
        })),
        departments: foundClass.departments.map((d: any) => ({
          id: d.department.id,
          name: d.department.name,
        })),
        studentCount: foundClass.enrollments.length,
      },
    });
  } catch (error: any) {
    console.error("previewClassByCode error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to preview class",
    });
  }
};

export const previewClassById = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const foundClass = await previewClassByIdService(
      req.params.id as string
    );

    return res.status(200).json({
      success: true,
      message: "Class preview fetched successfully",
      data: {
        id: foundClass.id,
        name: foundClass.name,
        section: foundClass.section,
        classCode: foundClass.classCode,
        scope: foundClass.scope,
        status: foundClass.status,
        school: foundClass.school
          ? {
            id: foundClass.school.id,
            name: foundClass.school.name,
            schoolCode: foundClass.school.schoolCode,
          }
          : null,
        teacher: foundClass.teachers[0]?.teacher
          ? {
            id: foundClass.teachers[0].teacher.id,
            name: foundClass.teachers[0].teacher.name,
            teacherCode: foundClass.teachers[0].teacher.teacherCode,
          }
          : null,
        subjects: foundClass.subjects.map((s: any) => ({
          id: s.subject.id,
          name: s.subject.name,
          code: s.subject.code,
        })),
        departments: foundClass.departments.map((d: any) => ({
          id: d.department.id,
          name: d.department.name,
        })),
        studentCount: foundClass.enrollments.length,
      },
    });
  } catch (error: any) {
    console.error("previewClassById error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to preview class",
    });
  }
};

export const requestToJoinClass = async (req: Request, res: Response) => {
  try {
    const { classCode, note } = req.body;
    console.log(`[Join Request] Student ${req.user?.id} requesting to join class ${classCode}`);

    if (!req.user || req.user.userType !== UserRole.STUDENT) {
      return res.status(403).json({
        success: false,
        message: "Only students can request to join a class",
      });
    }

    if (!classCode) {
      return res.status(400).json({
        success: false,
        message: "classCode is required",
      });
    }

    const result = await requestToJoinClassService({
      studentId: req.user.id,
      classCode: String(classCode).trim(),
      note,
    });

    console.log(`[Join Request] Success: Created request ${result.request.id} for class ${result.class.id}`);

    // Collect all notification promises to run in parallel
    const notificationPromises: Promise<any>[] = [];

    // Notifications for Teachers
    for (const classTeacher of result.class.teachers) {
      notificationPromises.push(
        createNotification({
          recipientType: "TEACHER",
          recipientId: classTeacher.teacherId,
          senderType: "STUDENT",
          senderId: result.student.id,
          type: "LINK_REQUEST",
          title: "New Class Join Request",
          message: `${result.student.name} requested to join ${result.class.name}`,
          linkRequestId: result.request.id,
          meta: {
            classId: result.class.id,
            classCode: result.class.classCode,
            linkType: result.request.linkType,
            studentId: result.student.id,
            studentCode: result.student.studentCode,
          },
        }).catch(err => console.error(`Failed to notify teacher ${classTeacher.teacherId}:`, err))
      );
    }

    // Notifications for School Admins
    if (result.class.schoolId) {
      const schoolAdmins = await prisma.schoolAdmin.findMany({
        where: {
          schoolId: result.class.schoolId,
          active: true,
        },
      });

      for (const sa of schoolAdmins) {
        notificationPromises.push(
          createNotification({
            recipientType: "ADMIN",
            recipientId: sa.adminId,
            senderType: "STUDENT",
            senderId: result.student.id,
            type: "LINK_REQUEST",
            title: "New Class Join Request",
            message: `${result.student.name} requested to join ${result.class.name}`,
            linkRequestId: result.request.id,
            meta: {
              classId: result.class.id,
              classCode: result.class.classCode,
              linkType: result.request.linkType,
              studentId: result.student.id,
              studentCode: result.student.studentCode,
            },
          }).catch(err => console.error(`Failed to notify admin ${sa.adminId}:`, err))
        );
      }
    }

    // FIRE AND FORGET NOTIFICATIONS (or wait for them but don't let them hang the whole response if some fail)
    // Actually, it's better to wait for them to ensure they are sent, but we use Promise.all for speed.
    await Promise.all(notificationPromises);

    return res.status(201).json({
      success: true,
      message: "Class join request sent successfully",
      data: {
        requestId: result.request.id,
        status: result.request.status,
        class: {
          id: result.class.id,
          name: result.class.name,
          classCode: result.class.classCode,
          scope: result.class.scope,
        },
      },
    });
  } catch (error: any) {
    console.error("requestToJoinClass error:", error);
    return res.status(error.status || 400).json({
      success: false,
      message: error.message || "Failed to request to join class",
    });
  }
};

export const addStudentToClass = async (req: Request, res: Response) => {
  try {
    const { classId, studentId } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const allowed = await canManageClass({
      userId: req.user.id,
      userType: req.user.userType,
      classId,
    });

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to manage this class",
      });
    }

    const enrollment = await addStudentToClassService({ classId, studentId });

    return res.status(200).json({
      success: true,
      message: "Student added to class successfully",
      data: enrollment,
    });
  } catch (error: any) {
    console.error("addStudentToClass error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to add student to class",
    });
  }
};

export const removeStudentFromClass = async (req: Request, res: Response) => {
  try {
    const { id, studentId } = req.params;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const allowed = await canManageClass({
      userId: req.user.id,
      userType: req.user.userType,
      classId: id as string,
    });

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to manage this class",
      });
    }

    await removeStudentFromClassService({
      classId: id as string,
      studentId: studentId as string,
    });

    return res.status(200).json({
      success: true,
      message: "Student removed from class successfully",
    });
  } catch (error: any) {
    console.error("removeStudentFromClass error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to remove student from class",
    });
  }
};

export const attachSubjectsToClass = async (req: Request, res: Response) => {
  try {
    const { classId, subjectIds } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const allowed = await canManageClass({
      userId: req.user.id,
      userType: req.user.userType,
      classId,
    });

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to manage this class",
      });
    }

    const updated = await attachSubjectsToClassService({
      classId,
      subjectIds,
      currentUserId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Subjects attached to class successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("attachSubjectsToClass error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to attach subjects to class",
    });
  }
};

export const updateClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, section, teacherIds, departmentIds, studentIds } = req.body;
    console.log("Updating class with data:", { id, name, section, teacherIds, departmentIds, studentIds });

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const allowed = await canManageClass({
      userId: req.user.id,
      userType: req.user.userType,
      classId: id as string,
    });

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to update this class",
      });
    }

    const updated = await updateClassService({
      classId: id as string,
      name,
      section,
      teacherIds,
      departmentIds,
      studentIds,
    });

    return res.status(200).json({
      success: true,
      message: "Class updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("updateClass error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update class",
    });
  }
};

export const changeClassStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (req.user.userType !== UserRole.ADMIN) {
      return res.status(403).json({ success: false, message: "Only admins can change class status" });
    }

    const updated = await changeClassStatusService({
      classId: id as string,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Class status changed successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("changeClassStatus error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to change class status",
    });
  }
};

export const archiveClass = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const allowed = await canManageClass({
      userId: req.user.id,
      userType: req.user.userType,
      classId: id as string,
    });

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to archive this class",
      });
    }

    const archived = await archiveClassService(id as string);

    return res.status(200).json({
      success: true,
      message: "Class archived successfully",
      data: archived,
    });
  } catch (error: any) {
    console.error("archiveClass error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to archive class",
    });
  }
};

export const editClassSubjects = async (req: Request, res: Response) => {
  try {
    const { classId, subjectIds } = req.body;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const allowed = await canManageClass({
      userId: req.user.id,
      userType: req.user.userType,
      classId,
    });

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to manage this class",
      });
    }

    const updated = await replaceClassSubjectsService({
      classId,
      subjectIds,
      currentUserId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Class subjects updated successfully",
      data: updated,
    });
  } catch (error: any) {
    console.error("editClassSubjects error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to edit class subjects",
    });
  }
};

export const removeSubjectFromClass = async (req: Request, res: Response) => {
  try {
    const { id, subjectId } = req.params;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const allowed = await canManageClass({
      userId: req.user.id,
      userType: req.user.userType,
      classId: id as string,
    });

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to manage this class",
      });
    }

    await removeSubjectFromClassService({
      classId: id as string,
      subjectId: subjectId as string,
    });

    return res.status(200).json({
      success: true,
      message: "Subject removed from class successfully",
    });
  } catch (error: any) {
    console.error("removeSubjectFromClass error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to remove subject from class",
    });
  }
};

export const getClassStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const stats = await getClassStatsService(id as string);
    return res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("getClassStats error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch class stats",
    });
  }
};
