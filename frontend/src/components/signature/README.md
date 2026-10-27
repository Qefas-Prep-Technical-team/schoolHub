# Digital Signature Capture System (Draw, Upload, Type)

## Overview
A full-stack, enterprise-grade signature capture feature for Qefas Hub. It enables administrators and authorized signatories to capture their official digital signature via **canvas drawing**, **white-paper photo upload**, or **script calligraphy typing**. All three methods pass through a shared processing engine that exports a **trimmed, high-resolution transparent PNG** and generates a **SHA-256 cryptographic fingerprint**.

---

## Architecture & Deliverables

1. **SQL Migration (`supabase/migrations/20261025000000_signatures.sql`)**:
   - `signatures` table with `user_id`, `storage_path`, `method`, `vector_data`, `sha256`, `is_active`, `ip_address`, `user_agent`, and `created_at`.
   - Partial unique index on `(user_id)` where `is_active = true` (enforces exactly one active signature per user).
   - Private Supabase Storage bucket `signatures` with Row Level Security (RLS) policies allowing users to read and write only inside their own `{user_id}/*` folder.

2. **Shared Processing Engine (`frontend/src/lib/signature/process.ts`)**:
   - `processSignaturePhoto(file: Blob, opts)`:
     - Handles EXIF orientation via `createImageBitmap(file, { imageOrientation: "from-image" })`.
     - Downscales input to max 1600px wide to prevent mobile memory spikes.
     - **Uneven Lighting Fix**: Generates an illumination map via a 25px blur with a canvas downscale/upscale fallback for older iOS/Safari browsers, normalizing uneven shadows.
     - Maps luminance to soft alpha edges and recolors ink pixels to solid ink (`[17, 17, 17]`), eliminating camera tint.
     - Blocks washed-out or blank photos with actionable guidance.
   - `trimTransparentPng(canvas: HTMLCanvasElement, pad: number = 12, maxWidth: number = 800)`:
     - Computes ink bounding box (`alpha > 0.15`), applies 12px padding, and scales down to max 800px.
   - `computeSha256(blob: Blob)`: Generates cryptographic hex hash.

3. **Components (`frontend/src/components/signature/`)**:
   - `SignatureModal.tsx`: Tabbed modal with Draw | Upload | Type, live document preview card, transparency toggle, and saving state.
   - `DrawSignature.tsx`: Powered by `signature_pad` with `devicePixelRatio` scaling, responsive resize preservation (`toData()`/`fromData()`), pen color picker, baseline and 'X' guides.
   - `UploadSignature.tsx`: Camera capture, `react-easy-crop` tight cropper, clean-up strength slider with debounced live preview.
   - `TypeSignature.tsx`: Dynamic script typography (Caveat, Dancing Script, Pacifico, Great Vibes) exported through the canvas pipeline.
   - `SignaturePreview.tsx`: Live paper card with document context and white vs transparent background toggle.

4. **API Route Handler (`frontend/src/app/api/signatures/route.ts`)**:
   - Server-side validation: MIME type check (`image/png`), file size limit (≤ 2MB), and PNG magic byte inspection (`89 50 4E 47 0D 0A 1A 0A`).
   - Serves images via short-lived signed URLs (1-hour expiry).
   - Fallback to `school-assets` bucket if `signatures` bucket is unmigrated in development.

5. **Client Service & React Query Hooks**:
   - `frontend/src/lib/api/services/signatureService.ts`
   - `frontend/src/lib/api/hooks/useSignature.ts` (`useActiveSignature`, `useSaveSignatureMutation`)

---

## How to Use the Component

```tsx
import React, { useState } from "react";
import SignatureModal from "@/components/signature/SignatureModal";
import { useActiveSignature } from "@/lib/api/hooks/useSignature";

export function MyEndorsementComponent({ userId, userName, userRole }: { userId: string; userName: string; userRole: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { data: signature, refetch } = useActiveSignature(userId);

  return (
    <div>
      {signature ? (
        <div>
          <img src={signature.signedUrl} alt="Active Signature" className="max-h-24" />
          <p className="font-mono text-xs">SHA-256: {signature.sha256}</p>
          <button onClick={() => setIsOpen(true)}>Update Signature</button>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)}>Add Signature</button>
      )}

      <SignatureModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        userId={userId}
        userName={userName}
        userRole={userRole}
        onSaveSuccess={() => refetch()}
      />
    </div>
  );
}
```

---

## How to Get Active Signature for PDF Generation (jsPDF / @react-pdf)

```ts
import { signatureService } from "@/lib/api/services/signatureService";

export async function addSignatureToTranscriptPDF(doc: any, adminUserId: string) {
  const signature = await signatureService.getActiveSignature(adminUserId);

  if (signature?.signedUrl) {
    // Add transparent PNG seal to PDF document
    doc.addImage(signature.signedUrl, "PNG", 140, 240, 50, 20);
    doc.text(`Authorized Signatory: ${signature.sha256.substring(0, 16)}...`, 140, 265);
  }
}
```

---

## Required Environment Variables
Ensure the following variables are present in `.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
