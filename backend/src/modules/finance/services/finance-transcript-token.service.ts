import jwt from "jsonwebtoken";

export interface TranscriptPassResult {
  token: string;
  expiresAt: Date;
  accessUrl: string;
  sessionId: string;
  term: string;
}

export function generateTranscriptPassService(data: {
  studentId: string;
  schoolId: string;
  sessionId?: string;
  term?: string;
  paymentReference: string;
}): TranscriptPassResult {
  const secret = process.env.JWT_SECRET || "qefas_default_transcript_secret_key";
  const expiresInSeconds = 30 * 24 * 60 * 60;
  const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

  const payload = {
    type: "TRANSCRIPT_30_DAY_PASS",
    studentId: data.studentId,
    schoolId: data.schoolId,
    sessionId: data.sessionId || "ALL",
    term: data.term || "ALL",
    reference: data.paymentReference,
    expiresAt: expiresAt.toISOString(),
  };

  const token = jwt.sign(payload, secret, { expiresIn: "30d" });
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const accessUrl = `${frontendUrl}/dashboard/student/transcript?pass=${encodeURIComponent(token)}`;

  return { token, expiresAt, accessUrl, sessionId: payload.sessionId, term: payload.term };
}

export function verifyTranscriptPassService(token: string): {
  valid: boolean;
  studentId?: string;
  schoolId?: string;
  sessionId?: string;
  term?: string;
  reference?: string;
  expiresAt?: Date;
  error?: string;
} {
  try {
    const secret = process.env.JWT_SECRET || "qefas_default_transcript_secret_key";
    const decoded = jwt.verify(token, secret) as {
      type: string;
      studentId: string;
      schoolId: string;
      sessionId: string;
      term?: string;
      reference: string;
      expiresAt: string;
    };

    if (decoded.type !== "TRANSCRIPT_30_DAY_PASS") return { valid: false, error: "Invalid token type" };

    const expiresAt = new Date(decoded.expiresAt);
    if (Date.now() > expiresAt.getTime()) {
      return { valid: false, error: "Access pass has expired (valid for 30 days from clearance payment)" };
    }

    return {
      valid: true,
      studentId: decoded.studentId,
      schoolId: decoded.schoolId,
      sessionId: decoded.sessionId,
      term: decoded.term || "ALL",
      reference: decoded.reference,
      expiresAt,
    };
  } catch (err: unknown) {
    return { valid: false, error: (err as { message?: string })?.message || "Invalid or expired access token" };
  }
}

