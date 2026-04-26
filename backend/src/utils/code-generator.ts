import prisma from "../config/database";

type PrismaExecutor = typeof prisma;

type CodeEntity = "school" | "admin" | "teacher" | "student" | "parent";

const ENTITY_PREFIX: Record<CodeEntity, string> = {
  school: "sch",
  admin: "adm",
  teacher: "tch",
  student: "stu",
  parent: "par",
};

const normalizeNamePart = (value: string): string => {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  if (!cleaned) return "xxx";
  if (cleaned.length >= 3) return cleaned.slice(0, 3);

  return cleaned.padEnd(3, "x");
};

export const generateRandomSixDigit = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const buildCode = (entity: CodeEntity, name: string): string => {
  return `${ENTITY_PREFIX[entity]}-${normalizeNamePart(name)}-${generateRandomSixDigit()}`;
};

export const generateUniqueCode = async (
  db: PrismaExecutor,
  entity: CodeEntity,
  name: string,
): Promise<string> => {
  const maxAttempts = 20;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = buildCode(entity, name);

    let exists;

    switch (entity) {
      case "school":
        exists = await db.school.findUnique({
          where: { schoolCode: code },
          select: { id: true },
        });
        break;
      case "admin":
        exists = await db.admin.findUnique({
          where: { adminCode: code },
          select: { id: true },
        });
        break;
      case "teacher":
        exists = await db.teacher.findUnique({
          where: { teacherCode: code },
          select: { id: true },
        });
        break;
      case "student":
        exists = await db.student.findUnique({
          where: { studentCode: code },
          select: { id: true },
        });
        break;
      case "parent":
        exists = await db.parent.findUnique({
          where: { parentCode: code },
          select: { id: true },
        });
        break;
    }

    if (!exists) return code;
  }

  throw new Error(`Could not generate unique ${entity} code`);
};