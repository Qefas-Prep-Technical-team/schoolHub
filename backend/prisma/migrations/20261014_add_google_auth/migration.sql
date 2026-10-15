-- Migration: Add Google Auth support and ensure password is nullable for Google accounts

-- 1. School Admin table
ALTER TABLE "Admin" ALTER COLUMN "password" DROP NOT NULL;
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Admin' AND column_name = 'googleId'
    ) THEN
        ALTER TABLE "Admin" ADD COLUMN "googleId" TEXT;
        CREATE UNIQUE INDEX IF NOT EXISTS "Admin_googleId_key" ON "Admin"("googleId");
    END IF;
END $$;

-- 2. Teacher table
ALTER TABLE "Teacher" ALTER COLUMN "password" DROP NOT NULL;
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Teacher' AND column_name = 'googleId'
    ) THEN
        ALTER TABLE "Teacher" ADD COLUMN "googleId" TEXT;
        CREATE UNIQUE INDEX IF NOT EXISTS "Teacher_googleId_key" ON "Teacher"("googleId");
    END IF;
END $$;

-- 3. Student table
ALTER TABLE "Student" ALTER COLUMN "password" DROP NOT NULL;
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Student' AND column_name = 'googleId'
    ) THEN
        ALTER TABLE "Student" ADD COLUMN "googleId" TEXT;
        CREATE UNIQUE INDEX IF NOT EXISTS "Student_googleId_key" ON "Student"("googleId");
    END IF;
END $$;

-- 4. Parent table
ALTER TABLE "parents" ALTER COLUMN "password" DROP NOT NULL;
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'parents' AND column_name = 'googleId'
    ) THEN
        ALTER TABLE "parents" ADD COLUMN "googleId" TEXT;
        CREATE UNIQUE INDEX IF NOT EXISTS "parents_googleId_key" ON "parents"("googleId");
    END IF;
END $$;
