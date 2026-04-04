import prisma from "../../config/database";
import { BehaviourType } from "@prisma/client";

export const getClassBehaviourAlertsService = async (classId: string) => {
  return await prisma.behaviourAlert.findMany({
    where: { classId },
    include: {
      student: {
        select: {
          id: true,
          name: true,
        },
      },
      reporter: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};

export const createBehaviourAlertService = async (data: {
  type: BehaviourType;
  title: string;
  description?: string;
  studentId: string;
  reportedById: string;
  classId: string;
}) => {
  return await prisma.behaviourAlert.create({
    data,
    include: {
      student: {
        select: {
          id: true,
          name: true,
        },
      },
      reporter: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};
