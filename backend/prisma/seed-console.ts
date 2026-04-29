import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding initial console logins...");
  
  const hashedPassword = await bcrypt.hash("Admin123!", 10);
  
  // 1. Platform Staff (Super Admin / Owner)
  await prisma.platformStaff.upsert({
    where: { email: "owner@console.com" },
    update: { password: hashedPassword },
    create: {
      fullName: "Super Owner",
      email: "owner@console.com",
      password: hashedPassword,
      role: "OWNER",
      isActive: true,
    }
  });

  // 2. Default School Admin
  await prisma.admin.upsert({
    where: { email: "admin@school.com" },
    update: { password: hashedPassword },
    create: {
      name: "Global School Admin",
      email: "admin@school.com",
      password: hashedPassword,
      role: "ADMIN",
      adminCode: "ADM-" + Date.now().toString().slice(-4),
      authProvider: "EMAIL",
      verified: true,
      status: "ACTIVE",
    }
  });

  console.log("=========================================");
  console.log("Platform Console Login:");
  console.log("Email:    owner@console.com");
  console.log("Password: Admin123!");
  console.log("=========================================");
  console.log("School Admin Console Login:");
  console.log("Email:    admin@school.com");
  console.log("Password: Admin123!");
  console.log("=========================================");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
