import { Request, Response } from "express";
import prisma from "../../config/database";

// Get student by code (for parent to verify before linking)
export const getStudentByCode = async (req: Request, res: Response) => {
  try {
    const { studentCode } = req.params;

    const student = await prisma.student.findFirst({
      where: { studentCode },
      select: {
        id: true,
        name: true,
        email: true,
        studentCode: true,
        createdAt: true,
      },
    });

    if (!student) {
        res.status(404).json({
            success: false,
            message: "Student not found with this code",
        });
        return 
    }

    return res.json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch student",
    });
  }
};

// Link child after registration
export const linkChildToParent = async (req: Request, res: Response) => {
  try {
    const { parentId, studentCode } = req.body;

    const student = await prisma.student.findFirst({
      where: { studentCode: studentCode.trim() },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Invalid student code",
      });
    }

    const existingLink = await prisma.parentChildLink.findFirst({
      where: {
        parentId,
        studentCode: studentCode.trim(),
      },
    });

    if (existingLink) {
      return res.status(400).json({
        success: false,
        message: "This student is already linked to your account",
      });
    }

    const link = await prisma.parentChildLink.create({
      data: {
        parentId,
        studentCode: studentCode.trim(),
        status: "linked",
      },
    });

    return res.json({
      success: true,
      message: "Successfully linked to your child's account!",
      data: {
        student: {
          name: student.name,
          email: student.email,
          studentCode: student.studentCode,
        },
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to link child",
    });
  }
};