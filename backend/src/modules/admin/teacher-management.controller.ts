import prisma from "../../config/database";
import { Request, Response } from "express";
import { getTeacherTimetableService, upsertTimetablePeriodService } from "../class/timetable.service";
import { getSingleString } from "../../utils/request-utils";

/**
 * Get detailed teacher information by ID
 */
export const getTeacherById = async (req: Request, res: Response) => {
  try {
<<<<<<< HEAD
    const id = getSingleString(req.params.id as string | string[] | undefined);
=======
    const id = req.params.id as string;
>>>>>>> be22764e1e3563322c0acc4c834adbfe0d64c76e

    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [
          { id },
          { teacherCode: id }
        ]
      },
      include: {
        school: true,
        currentSchool: true,
        teacherSubjects: {
          include: {
            subject: true,
          },
        },
        classTeachers: {
          include: {
            class: true,
          },
        },
      },
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Format data for frontend
    const formattedData = {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      teacherCode: teacher.teacherCode,
      avatar: teacher.profileImage,
      status: teacher.verified ? 'active' : 'inactive',
      personalInfo: {
          fullName: teacher.name,
          gender: teacher.gender,
          email: teacher.email,
          phone: "Not provided",
          address: "Not provided",
          highestQualification: "Not provided",
          yearsOfExperience: "Not provided"
      },
      professionalInfo: {
          department: teacher.department || "General",
          subjects: teacher.teacherSubjects.map((ts: any) => ts.subject.name),
          assignedClasses: teacher.classTeachers.map((ct: any) => ct.class.name)
      },
      statistics: {
          classPerformance: '85%', // Placeholder
          attendanceRate: '95%',    // Placeholder
          upcomingClasses: teacher.classTeachers.length.toString(),
          studentsTaught: '0'       // Placeholder
      }
    };

    return res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error: any) {
    console.error("getTeacherById error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * Assign a teacher to a class
 */
export const assignTeacherToClass = async (req: Request, res: Response) => {
  try {
<<<<<<< HEAD
    const inputId = getSingleString(req.params.id as string | string[] | undefined);
=======
    const inputId = req.params.id as string;
>>>>>>> be22764e1e3563322c0acc4c834adbfe0d64c76e
    const { classId, isLead = false } = req.body;

    if (!classId) {
      return res.status(400).json({
        success: false,
        message: "classId is required",
      });
    }

    // Resolve real teacher ID if inputId is a teacherCode
    let teacherId = inputId;
    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [{ id: inputId }, { teacherCode: inputId }]
      },
      select: { id: true }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    teacherId = teacher.id;

    // Create the assignment
    const assignment = await prisma.classTeacher.upsert({
      where: {
        classId_teacherId: {
          classId,
          teacherId,
        }
      },
      update: { isLead },
      create: {
        classId,
        teacherId,
        isLead,
      }
    });

    return res.status(200).json({
      success: true,
      message: "Teacher assigned to class successfully",
      data: assignment,
    });
  } catch (error: any) {
    console.error("assignTeacherToClass error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * Update teacher information
 */
export const updateTeacher = async (req: Request, res: Response) => {
  try {
<<<<<<< HEAD
    const inputId = getSingleString(req.params.id as string | string[] | undefined);
=======
    const inputId = req.params.id as string;
>>>>>>> be22764e1e3563322c0acc4c834adbfe0d64c76e
    const { department, name, gender } = req.body;

    // Resolve real teacher ID if inputId is a teacherCode
    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [{ id: inputId }, { teacherCode: inputId }]
      },
      select: { id: true }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Update teacher record
    const updatedTeacher = await prisma.teacher.update({
      where: { id: teacher.id },
      data: {
        ...(department && { department }),
        ...(name && { name }),
        ...(gender && { gender }),
      }
    });

    return res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      data: updatedTeacher,
    });
  } catch (error: any) {
    console.error("updateTeacher error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * Get teacher timetable
 */
export const getTeacherTimetable = async (req: Request, res: Response) => {
  try {
<<<<<<< HEAD
    const inputId = getSingleString(req.params.id as string | string[] | undefined);
=======
    const inputId = req.params.id as string;
>>>>>>> be22764e1e3563322c0acc4c834adbfe0d64c76e

    // Resolve real teacher ID if inputId is a teacherCode
    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [{ id: inputId }, { teacherCode: inputId }]
      },
      select: { id: true }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    const timetable = await getTeacherTimetableService(teacher.id);

    return res.status(200).json({
      success: true,
      data: timetable,
    });
  } catch (error: any) {
    console.error("getTeacherTimetable error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/**
 * Create/Update a timetable period for a teacher
 */
export const createTimetablePeriod = async (req: Request, res: Response) => {
  try {
<<<<<<< HEAD
    const inputId = getSingleString(req.params.id as string | string[] | undefined);
=======
    const inputId = req.params.id as string;
>>>>>>> be22764e1e3563322c0acc4c834adbfe0d64c76e
    const { classId, day, startTime, endTime, subjectId, room } = req.body;

    // Resolve real teacher ID if inputId is a teacherCode
    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [{ id: inputId }, { teacherCode: inputId }]
      },
      select: { id: true }
    });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // Use existing upsert logic from class timetable
    const data = await upsertTimetablePeriodService({
      ...req.body,
      teacherId: teacher.id,
      classId // classId must be provided in body
    });

    return res.status(200).json({
      success: true,
      message: "Timetable period created successfully",
      data,
    });
  } catch (error: any) {
    console.error("createTimetablePeriod error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};
