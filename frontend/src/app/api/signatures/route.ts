import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabaseClient";
import crypto from "crypto";

// Magic bytes for valid PNG format: 89 50 4E 47 0D 0A 1A 0A
const PNG_MAGIC_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | Blob | null;
    const method = (formData.get("method") as string) || "drawn";
    const vectorDataRaw = formData.get("vector_data") as string | null;
    const userId = (formData.get("user_id") as string) || "admin-system";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Signature file is required" },
        { status: 400 }
      );
    }

    // 1. Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File exceeds 2MB size limit" },
        { status: 400 }
      );
    }

    // 2. Validate MIME type
    if (file.type && file.type !== "image/png") {
      return NextResponse.json(
        { success: false, error: "Signature must be a PNG image" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Confirm file is a real PNG by inspecting magic header bytes
    if (buffer.length < 8 || !buffer.subarray(0, 8).equals(PNG_MAGIC_BYTES)) {
      return NextResponse.json(
        { success: false, error: "File corrupted or invalid PNG format" },
        { status: 400 }
      );
    }

    // 4. Compute SHA-256 hash for cryptographic audit integrity
    const sha256 = crypto.createHash("sha256").update(buffer).digest("hex");

    // 5. Capture audit trail metadata
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const signatureId = crypto.randomUUID();
    const storagePath = `${userId}/${signatureId}.png`;

    // 6. Upload to Supabase Storage
    const supabase = getSupabase();
    let bucketName = "signatures";

    // Attempt upload to private 'signatures' bucket, fallback to 'school-assets' if unconfigured
    let uploadResult = await supabase.storage
      .from(bucketName)
      .upload(storagePath, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (uploadResult.error) {
      console.warn(
        `Upload to '${bucketName}' bucket failed (${uploadResult.error.message}). Attempting fallback to 'school-assets'...`
      );
      bucketName = "school-assets";
      uploadResult = await supabase.storage
        .from(bucketName)
        .upload(`signatures/${storagePath}`, buffer, {
          contentType: "image/png",
          upsert: true,
        });

      if (uploadResult.error) {
        throw new Error(`Storage upload failed: ${uploadResult.error.message}`);
      }
    }

    // 7. Generate signed URL (expires in 1 hour)
    let signedUrl = "";
    const effectivePath = bucketName === "school-assets" ? `signatures/${storagePath}` : storagePath;
    const { data: signedData, error: signError } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(effectivePath, 3600);

    if (!signError && signedData?.signedUrl) {
      signedUrl = signedData.signedUrl;
    } else {
      // If signed URL fails on public bucket, fallback to publicUrl
      const { data: pubData } = supabase.storage.from(bucketName).getPublicUrl(effectivePath);
      signedUrl = pubData.publicUrl;
    }

    // Parse vector data if provided
    let parsedVectorData = null;
    if (vectorDataRaw) {
      try {
        parsedVectorData = JSON.parse(vectorDataRaw);
      } catch {
        parsedVectorData = vectorDataRaw;
      }
    }

    // 8. Deactivate previous signatures for this user in Supabase
    try {
      const { error: updateErr } = await supabase
        .from("signatures")
        .update({ is_active: false })
        .eq("user_id", userId);

      if (updateErr) {
        console.warn("Supabase update error (deactivating prior signatures):", updateErr);
      }

      const { error: insertErr } = await supabase.from("signatures").insert({
        id: signatureId,
        user_id: userId,
        storage_path: effectivePath,
        method,
        vector_data: parsedVectorData,
        sha256,
        is_active: true,
        ip_address: ipAddress,
        user_agent: userAgent,
        created_at: new Date().toISOString(),
      });

      if (insertErr) {
        console.error("Supabase signature insert error:", insertErr);
        throw new Error(`Failed to persist signature in database: ${insertErr.message}`);
      }
    } catch (dbErr: any) {
      console.error("Database audit insert failed:", dbErr);
      throw dbErr;
    }

    const signatureRecord = {
      id: signatureId,
      userId,
      storagePath: effectivePath,
      method,
      vectorData: parsedVectorData,
      sha256,
      isActive: true,
      signedUrl,
      ipAddress,
      userAgent,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: signatureRecord,
    });
  } catch (error: any) {
    console.error("Signature save route error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process signature" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const userIds = searchParams.get("userIds");

    if (!userId && !userIds) {
      return NextResponse.json(
        { success: false, error: "userId or userIds parameter is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    // ── Batch userIds mode ────────────────────────────────────────────────
    if (userIds) {
      const ids = userIds.split(",").map((s) => s.trim()).filter(Boolean);
      if (ids.length === 0) {
        return NextResponse.json({ success: true, data: [] });
      }

      const { data, error } = await supabase
        .from("signatures")
        .select("*")
        .in("user_id", ids)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        return NextResponse.json({ success: true, data: [] });
      }

      const results = await Promise.all(
        data.map(async (sig) => {
          const bucketName = sig.storage_path.startsWith("signatures/") ? "school-assets" : "signatures";
          const { data: signedData } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(sig.storage_path, 3600);

          const signedUrl =
            signedData?.signedUrl ||
            supabase.storage.from(bucketName).getPublicUrl(sig.storage_path).data.publicUrl;

          return {
            id: sig.id,
            userId: sig.user_id,
            storagePath: sig.storage_path,
            method: sig.method,
            vectorData: sig.vector_data,
            sha256: sig.sha256,
            isActive: sig.is_active,
            signedUrl,
            createdAt: sig.created_at,
          };
        })
      );

      return NextResponse.json({ success: true, data: results });
    }

    // Query active signature from database
    const { data, error } = await supabase
      .from("signatures")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    // Generate fresh signed URL
    const bucketName = data.storage_path.startsWith("signatures/") ? "school-assets" : "signatures";
    const { data: signedData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(data.storage_path, 3600);

    const signedUrl =
      signedData?.signedUrl ||
      supabase.storage.from(bucketName).getPublicUrl(data.storage_path).data.publicUrl;

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        userId: data.user_id,
        storagePath: data.storage_path,
        method: data.method,
        vectorData: data.vector_data,
        sha256: data.sha256,
        isActive: data.is_active,
        signedUrl,
        createdAt: data.created_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch signature" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId parameter is required" },
        { status: 400 }
      );
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from("signatures")
      .update({ is_active: false })
      .eq("user_id", userId);

    if (error) {
      console.error("Supabase signature deactivate error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Signature successfully deactivated",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to deactivate signature" },
      { status: 500 }
    );
  }
}

