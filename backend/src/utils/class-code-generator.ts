import prisma from "../config/database";

const randomPart = (length = 4) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const normalizePart = (value: string, max = 3) =>
  value
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, max)
    .padEnd(max, "X");

export const generateUniqueClassCode = async (className: string) => {
  while (true) {
    const code = `CLS-${normalizePart(className)}-${randomPart(4)}`;
    const existing = await prisma.class.findUnique({
      where: { classCode: code },
    });
    if (!existing) return code;
  }
};
