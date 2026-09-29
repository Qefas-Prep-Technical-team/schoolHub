import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const schoolAdmin = await prisma.schoolAdmin.findFirst({ where: { adminId: '583f89ae-bb14-433d-9638-d8fdfa16b6c5' } });
    if (schoolAdmin) {
        const history = await prisma.subscriptionHistory.findMany({ where: { schoolId: schoolAdmin.schoolId } });
        console.log(JSON.stringify(history, null, 2));
    }
}
main().catch(console.error);
