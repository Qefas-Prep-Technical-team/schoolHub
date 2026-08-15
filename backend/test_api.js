const axios = require('axios');

async function main() {
  try {
    // Generate an admin token for the school to test the endpoint
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Find our admin
    const adminUser = await prisma.admin.findUnique({
      where: { id: 'c92a95f9-db19-45f8-b3ba-2f8087948b8c' }
    });
    
    // Quick JWT generation
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: adminUser.id, role: adminUser.role }, process.env.JWT_SECRET || "qefashub_secret_key_2024_secure_@#");
    
    console.log("Token generated");
    
    const res = await axios.get('http://localhost:5000/api/admin/students', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        schoolId: 'a3d699e1-6385-485e-bc5d-85ce01cd3f2e',
        limit: 1000
      }
    });
    
    console.log("Response data length:", res.data.data.length);
    console.log("Response data:", JSON.stringify(res.data, null, 2));
    
    await prisma.$disconnect();
  } catch (error) {
    console.error("API Error:", error.response ? error.response.data : error.message);
  }
}

main();
