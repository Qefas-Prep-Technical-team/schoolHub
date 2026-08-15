const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const assignmentId = '9bf8f095-71ca-4f71-8fed-5477b0d3964e';
  const newVideoUrl = 'https://pixabay.com/videos/download/video-270941_medium.mp4';

  const updated = await prisma.assignment.update({
    where: { id: assignmentId },
    data: { videoUrl: newVideoUrl },
  });

  console.log('Successfully updated assignment videoUrl to:', updated.videoUrl);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
