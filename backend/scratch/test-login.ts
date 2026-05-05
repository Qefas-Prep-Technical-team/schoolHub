import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as authService from '../src/services/authService';

const prisma = new PrismaClient();

async function testLogin() {
  const email = "testadmin4@gmail.com"; // Change to an existing email
  const password = "Password123!"; // Change to the correct password

  console.log("Searching for user...");
  const user = await prisma.admin.findUnique({
    where: { email },
    include: { schoolAdmins: { include: { school: true } } }
  });

  if (!user) {
    console.log("User not found");
    return;
  }

  console.log("Comparing password...");
  console.log("Mocking match as true...");
  const match = true;
  console.log("Match:", match);

  if (match) {
    console.log("Generating tokens...");
    const accessToken = authService.generateAccessToken(user.id, UserRole.ADMIN);
    console.log("Access Token:", accessToken);
    
    const refreshToken = await authService.generateRefreshToken(user.id, UserRole.ADMIN);
    console.log("Refresh Token:", refreshToken);
  }
}

testLogin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
