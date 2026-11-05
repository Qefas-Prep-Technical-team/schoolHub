import { v4 as uuidv4 } from "uuid";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import prisma from "../../../config/database";
import { enforceStorageLimit } from "../../subscription/quota.helpers";

const getS3Client = () => {
  return new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
  });
};

export const getS3PresignedUrlService = async (options: {
  schoolId: string;
  fileSize: number;
  fileName: string;
  fileType: string;
}) => {
  const { schoolId, fileSize, fileName, fileType } = options;

  await enforceStorageLimit(schoolId, fileSize);

  const s3 = getS3Client();
  const bucket = process.env.AWS_S3_BUCKET_NAME || "";

  const safeFileName = fileName
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9.\-_]/g, "");
  const key = `schools/${schoolId}/${uuidv4()}-${safeFileName}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: fileType,
    ContentLength: fileSize,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });
  const publicUrl = `https://${bucket}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${key}`;

  return { uploadUrl, publicUrl, key };
};

export const confirmS3UploadService = async (data: {
  schoolId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploaderId: string;
  uploaderType: string;
}) => {
  const result = await prisma.$transaction(async (tx) => {
    const record = await tx.fileRecord.create({
      data: {
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        uploaderId: data.uploaderId,
        uploaderType: data.uploaderType,
        schoolId: data.schoolId,
      },
    });

    await tx.school.update({
      where: { id: data.schoolId },
      data: {
        storageUsedBytes: {
          increment: data.fileSize,
        },
      },
    });

    return record;
  });

  return result;
};

export const deleteS3FileService = async (
  fileRecordId: string,
  schoolId: string,
) => {
  const fileRecord = await prisma.fileRecord.findUnique({
    where: { id: fileRecordId },
  });

  if (!fileRecord || fileRecord.schoolId !== schoolId) {
    throw new Error("File not found or unauthorized.");
  }

  const s3 = getS3Client();
  const bucket = process.env.AWS_S3_BUCKET_NAME || "";

  const keyMatch = fileRecord.fileUrl.match(
    new RegExp(`https://${bucket}.s3.[a-z0-9-]+.amazonaws.com/(.+)`),
  );
  if (keyMatch && keyMatch[1]) {
    const key = keyMatch[1];
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    try {
      await s3.send(command);
    } catch (e) {
      console.error("[S3 Delete] Failed to delete from S3:", e);
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.fileRecord.delete({ where: { id: fileRecordId } });

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

  return { success: true };
};

