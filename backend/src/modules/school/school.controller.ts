import { Request, Response } from "express";
import {
  getSchoolTeachersService,
  getSchoolStudentsService,
} from "./school.service";

/**
 * Handle fetching school teachers
 */
export const getSchoolTeachers = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required in parameters",
      });
    }
    console.log("Fetching teachers for schoolId:", schoolId);

    const data = await getSchoolTeachersService(schoolId as string);

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch school teachers",
    });
  }
};

/**
 * Handle fetching school students
 */
export const getSchoolStudents = async (req: Request, res: Response) => {
  try {
    const { schoolId } = req.params;
    const { classId, gender, status, search } = req.query;

    if (!schoolId) {
      return res.status(400).json({
        success: false,
        message: "schoolId is required in parameters",
      });
    }

    const filters: any = {};
    if (classId) filters.classId = classId as string;
    if (gender) filters.gender = gender as string;
    if (status) {
      filters.verified = status === "Verified";
    }
    if (search) filters.search = search as string;

    const data = await getSchoolStudentsService(schoolId as string, filters);

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message || "Failed to fetch school students",
    });
  }
};
