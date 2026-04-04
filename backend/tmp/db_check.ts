
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  try {
    console.log("Checking Admin...");
    await prisma.admin.findFirst({ select: { id: true, profileImage: true } });
    console.log("Admin OK");
  } catch (e) {
    console.log("Admin FAIL:", e.message);
  }

  try {
    console.log("Checking Teacher...");
    await prisma.teacher.findFirst({ select: { id: true, profileImage: true } });
    console.log("Teacher OK");
  } catch (e) {
    console.log("Teacher FAIL:", e.message);
  }

  try {
    console.log("Checking Parent...");
    await prisma.parent.findFirst({ select: { id: true, profileImage: true } });
    console.log("Parent OK");
  } catch (e) {
    console.log("Parent FAIL:", e.message);
  }

  await prisma.$disconnect();
}

check();
