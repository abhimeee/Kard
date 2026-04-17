import pako from "pako";
import {
  normalizeProfile,
  type ContactProfile,
  PROFILE_VERSION,
} from "./profile";

/** Max recommended length for QR payload (chars) — stays within common QR limits */
export const MAX_ENCODED_CHARS = 2800;

function bytesToBase64Url(buf: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < buf.length; i++) binary += String.fromCharCode(buf[i]!);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(s: string): Uint8Array {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const binary = atob(b64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}

export function encodeProfile(p: ContactProfile): string {
  const payload: ContactProfile = { ...p, v: PROFILE_VERSION };
  const json = JSON.stringify(payload);
  const compressed = pako.deflate(json, { level: 9 });
  return bytesToBase64Url(compressed);
}

export function decodeProfile(encoded: string): ContactProfile | null {
  const trimmed = encoded.trim();
  if (!trimmed) return null;
  try {
    const bytes = base64UrlToBytes(trimmed);
    const json = pako.inflate(bytes, { to: "string" });
    const parsed: unknown = JSON.parse(json);
    return normalizeProfile(parsed);
  } catch {
    return null;
  }
}

export function buildCardUrl(origin: string, encoded: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/c#${encoded}`;
}
