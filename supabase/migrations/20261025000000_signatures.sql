-- ==============================================================================
-- Migration: Signature Capture System (Table, Indexes, RLS, Storage Policies)
-- Description: Stores digital signatures with audit trails and vector data
-- ==============================================================================

-- 1. Create signatures table
CREATE TABLE IF NOT EXISTS public.signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    method TEXT NOT NULL CHECK (method IN ('drawn', 'uploaded', 'typed')),
    vector_data JSONB,
    sha256 TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Partial unique index to enforce exactly one active signature per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_signatures_user_active 
ON public.signatures (user_id) 
WHERE is_active = true;

-- Additional query indexes
CREATE INDEX IF NOT EXISTS idx_signatures_user_id ON public.signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_signatures_created_at ON public.signatures(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.signatures ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies: Users can only view, insert, and update their own signatures
DROP POLICY IF EXISTS "Users can view their own signatures" ON public.signatures;
CREATE POLICY "Users can view their own signatures"
ON public.signatures FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own signatures" ON public.signatures;
CREATE POLICY "Users can insert their own signatures"
ON public.signatures FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own signatures" ON public.signatures;
CREATE POLICY "Users can update their own signatures"
ON public.signatures FOR UPDATE
USING (auth.uid() = user_id);

-- 5. Storage Bucket Configuration for Private Signatures
-- Creates private storage bucket if not present
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'signatures',
    'signatures',
    false,
    2097152, -- 2MB max
    ARRAY['image/png']
)
ON CONFLICT (id) DO UPDATE SET 
    public = false,
    file_size_limit = 2097152,
    allowed_mime_types = ARRAY['image/png'];

-- 6. Storage Security Policies: Users can only read and upload inside their own folder {user_id}/*
DROP POLICY IF EXISTS "Allow users to view own signature image" ON storage.objects;
CREATE POLICY "Allow users to view own signature image"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'signatures' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Allow users to upload own signature image" ON storage.objects;
CREATE POLICY "Allow users to upload own signature image"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'signatures' 
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND (LOWER(storage.extension(name)) = 'png')
);

DROP POLICY IF EXISTS "Allow users to delete own signature image" ON storage.objects;
CREATE POLICY "Allow users to delete own signature image"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'signatures' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);
