import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const admin = await prisma.admin.findUnique({
        where: { id: '583f89ae-bb14-433d-9638-d8fdfa16b6c5' },
        include: { schoolAdmins: { include: { school: true } } }
    });
    console.log("=== ADMIN ===");
    console.log(JSON.stringify(admin, null, 2));

    const history = await prisma.subscriptionHistory.findMany({
        where: { userId: '583f89ae-bb14-433d-9638-d8fdfa16b6c5' }
    });
    console.log("=== HISTORY ===");
    console.log(JSON.stringify(history, null, 2));
}
main().catch(console.error);
