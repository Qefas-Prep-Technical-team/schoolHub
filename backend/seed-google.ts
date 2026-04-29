import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    await prisma.platformFeature.upsert({
        where: { featureKey: 'googleLogin' },
        update: {},
        create: {
            featureKey: 'googleLogin',
            name: 'Google Authentication',
            label: 'Google Login',
            description: 'Enable users to log in securely using their Google accounts.'
        }
    });
    console.log('Google login feature upserted successfully.');
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
