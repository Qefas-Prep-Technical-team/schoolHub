const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixStoragePolicy() {
  try {
    console.log("Connected to database using Prisma.");

    // Create bucket if it doesn't exist
    await prisma.$executeRawUnsafe(`
      INSERT INTO storage.buckets (id, name, public) 
      VALUES ('school-assets', 'school-assets', true)
      ON CONFLICT (id) DO UPDATE SET public = true;
    `);
    console.log("Bucket 'school-assets' ensured and set to public.");

    // Create policy for public insert/select/update
    await prisma.$executeRawUnsafe(`
      DROP POLICY IF EXISTS "Public Access" ON storage.objects;
    `);
    await prisma.$executeRawUnsafe(`
      CREATE POLICY "Public Access" 
      ON storage.objects FOR ALL 
      USING ( bucket_id = 'school-assets' )
      WITH CHECK ( bucket_id = 'school-assets' );
    `);
    console.log("Created public ALL policy for 'school-assets' bucket.");

  } catch (err) {
    console.error("Error executing SQL:", err);
  } finally {
    await prisma.$disconnect();
  }
}

fixStoragePolicy();
