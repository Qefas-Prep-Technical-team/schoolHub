import prisma from "../../../config/database";
import { deleteBunnyFileService } from "./bunny-upload.service";
import { deleteS3FileService } from "./s3-upload.service";

export const getUploadHistoryService = async (
  schoolId: string,
  userId: string,
  page: number,
  limit: number,
) => {
  const skip = (page - 1) * limit;
  const records = await prisma.fileRecord.findMany({
    where: { schoolId, uploaderId: userId },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  const total = await prisma.fileRecord.count({
    where: { schoolId, uploaderId: userId },
  });

  return { records, total, page, limit };
};

export const deleteFileByUrlService = async (url: string, schoolId: string) => {
  const fileRecord = await prisma.fileRecord.findFirst({
    where: { fileUrl: url, schoolId },
  });

  if (!fileRecord) {
    throw new Error("File not found or unauthorized.");
  }

  if (
    fileRecord.fileUrl.includes("storage.bunnycdn.com") ||
    fileRecord.fileUrl.includes("b-cdn.net")
  ) {
    await deleteBunnyFileService(fileRecord.id, schoolId);
  } else if (fileRecord.fileUrl.includes("amazonaws.com")) {
    await deleteS3FileService(fileRecord.id, schoolId);
  } else {
    await prisma.$transaction(async (tx) => {
      await tx.fileRecord.delete({ where: { id: fileRecord.id } });
      const school = await tx.school.findUnique({ where: { id: schoolId } });
      const newStorage = Math.max(
        0,
        (school?.storageUsedBytes || 0) - fileRecord.fileSize,
      );
      await tx.school.update({
        where: { id: schoolId },
        data: { storageUsedBytes: newStorage },
      });
    });
  }

  return { success: true };
};

export const cleanupUnusedImagesService = async (
  schoolId: string,
  userId: string,
) => {
  const fileRecords = await prisma.fileRecord.findMany({
    where: { schoolId, uploaderId: userId },
  });

  if (!fileRecords.length) return { deletedCount: 0, deletedUrls: [] };

  const papers = await prisma.subjectExamPaper.findMany({
    where: { teacherId: userId },
    select: { images: true, questions: { select: { images: true } } },
  });

  const usedImages = new Set<string>();
  papers.forEach((paper) => {
    if (Array.isArray(paper.images)) {
      paper.images.forEach((img: string) => usedImages.add(img));
    }
    if (Array.isArray(paper.questions)) {
      paper.questions.forEach((q) => {
        if (Array.isArray(q.images)) {
          q.images.forEach((img: string) => usedImages.add(img));
        }
      });
    }
  });

  const deletedUrls: string[] = [];
  const deletedIds: string[] = [];

  for (const record of fileRecords) {
    if (!usedImages.has(record.fileUrl)) {
      deletedUrls.push(record.fileUrl);
      deletedIds.push(record.id);
    }
  }

  if (deletedIds.length > 0) {
    await prisma.$transaction(async (tx) => {
      await tx.fileRecord.deleteMany({
        where: { id: { in: deletedIds } },
      });
      const totalSize = fileRecords
        .filter((r) => deletedIds.includes(r.id))
        .reduce((acc, r) => acc + r.fileSize, 0);
      const school = await tx.school.findUnique({ where: { id: schoolId } });
      const newStorage = Math.max(
        0,
        (school?.storageUsedBytes || 0) - totalSize,
      );
      await tx.school.update({
        where: { id: schoolId },
        data: { storageUsedBytes: newStorage },
      });
    });
  }

  return { deletedCount: deletedIds.length, deletedUrls };
};

