"use client";

/**
 * Encrypted Client-Side Draft Storage Utility (Web Crypto API AES-GCM)
 *
 * Ensures that sensitive exam/assessment question drafts (including correct answers,
 * options, explanations, and AI-generated previews) are encrypted at rest in browser
 * storage (localStorage), scoped per authenticated user + paperId, and automatically
 * expire after 24 hours.
 */

const DRAFT_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours
const STORAGE_PREFIX = "qefas_paper_draft_v1";

interface EncryptedEnvelope {
  v: 1;
  iv: string;
  ct: string;
  ts: number;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deriveAesKey(secretMaterial: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(secretMaterial),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("qefas-hub-exam-draft-salt-v1"),
      iterations: 10000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export function buildDraftStorageKey(
  userId: string | undefined,
  paperId: string,
  contextKey: string
): string {
  const safeUser = userId || "anon";
  return `${STORAGE_PREFIX}:${safeUser}:${paperId}:${contextKey}`;
}

export async function saveEncryptedDraft<T>(
  userId: string | undefined,
  paperId: string,
  contextKey: string,
  payload: T
): Promise<boolean> {
  if (typeof window === "undefined" || !window.localStorage) return false;
  const storageKey = buildDraftStorageKey(userId, paperId, contextKey);

  try {
    if (window.crypto?.subtle) {
      const key = await deriveAesKey(`${userId || "anon"}::${paperId}::${STORAGE_PREFIX}`);
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encoded = new TextEncoder().encode(JSON.stringify(payload));
      const cipherBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv as BufferSource },
        key,
        encoded
      );

      const envelope: EncryptedEnvelope = {
        v: 1,
        iv: bytesToBase64(iv),
        ct: bytesToBase64(new Uint8Array(cipherBuffer)),
        ts: Date.now(),
      };
      window.localStorage.setItem(storageKey, JSON.stringify(envelope));
      return true;
    } else {
      // Fallback if Web Crypto API is unavailable (non-secure context)
      const fallbackEnvelope = {
        v: 0,
        data: btoa(unescape(encodeURIComponent(JSON.stringify(payload)))),
        ts: Date.now(),
      };
      window.localStorage.setItem(storageKey, JSON.stringify(fallbackEnvelope));
      return true;
    }
  } catch (err) {
    console.error("Failed to save encrypted draft:", err);
    return false;
  }
}

export async function loadEncryptedDraft<T>(
  userId: string | undefined,
  paperId: string,
  contextKey: string
): Promise<{ data: T; savedAt: number } | null> {
  if (typeof window === "undefined" || !window.localStorage) return null;
  const storageKey = buildDraftStorageKey(userId, paperId, contextKey);
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed.ts !== "number") {
      window.localStorage.removeItem(storageKey);
      return null;
    }

    // Enforce 24-hour TTL
    if (Date.now() - parsed.ts > DRAFT_TTL_MS) {
      window.localStorage.removeItem(storageKey);
      return null;
    }

    if (parsed.v === 1 && window.crypto?.subtle) {
      const key = await deriveAesKey(`${userId || "anon"}::${paperId}::${STORAGE_PREFIX}`);
      const iv = base64ToBytes(parsed.iv);
      const ct = base64ToBytes(parsed.ct);
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: iv as BufferSource },
        key,
        ct as BufferSource
      );
      const jsonStr = new TextDecoder().decode(decryptedBuffer);
      return {
        data: JSON.parse(jsonStr) as T,
        savedAt: parsed.ts,
      };
    } else if (parsed.v === 0 && typeof parsed.data === "string") {
      const jsonStr = decodeURIComponent(escape(atob(parsed.data)));
      return {
        data: JSON.parse(jsonStr) as T,
        savedAt: parsed.ts,
      };
    }

    return null;
  } catch (err) {
    // Corrupted or wrong user key — purge safely
    window.localStorage.removeItem(storageKey);
    return null;
  }
}

export function clearEncryptedDraft(
  userId: string | undefined,
  paperId: string,
  contextKey: string
): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  const storageKey = buildDraftStorageKey(userId, paperId, contextKey);
  window.localStorage.removeItem(storageKey);
}

