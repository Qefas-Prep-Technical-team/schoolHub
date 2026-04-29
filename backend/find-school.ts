import prisma from "./src/config/database";
async function main() {
  const school = await prisma.school.findFirst();
  if (school) {
    console.log(school.id);
  } else {
    console.log("No school found");
  }
}
main().catch(console.error);
