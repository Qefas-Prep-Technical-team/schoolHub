const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const admin = await prisma.admin.findUnique({
            where: { email: 'qefas.lms@gmail.com' },
            include: { schoolAdmins: { include: { school: true } } }
        });
        console.log("Found admin:", admin ? admin.email : "null");
    } catch (err) {
        console.error("Prisma error:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
