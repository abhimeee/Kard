import { decodeProfile, MAX_ENCODED_CHARS } from "@/lib/codec";

type Entry = { encoded: string; exp: number };

const TTL_MS = 90 * 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 5000;

const g = globalThis as unknown as {
  __kardShortLinks?: Map<string, Entry>;
};

function store(): Map<string, Entry> {
  if (!g.__kardShortLinks) g.__kardShortLinks = new Map();
  return g.__kardShortLinks;
}

function pruneExpired(map: Map<string, Entry>, now: number) {
  for (const [id, row] of map) {
    if (row.exp < now) map.delete(id);
  }
}

function randomId(): string {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]!);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Register a valid encoded profile; returns the short id (path segment). */
export function registerShortLink(encoded: string): string | null {
  const trimmed = encoded.trim();
  if (!trimmed || trimmed.length > MAX_ENCODED_CHARS) return null;
  if (!decodeProfile(trimmed)) return null;

  const map = store();
  const now = Date.now();
  pruneExpired(map, now);

  while (map.size >= MAX_ENTRIES) {
    const first = map.keys().next().value;
    if (!first) break;
    map.delete(first);
  }

  for (let attempt = 0; attempt < 8; attempt++) {
    const id = randomId();
    if (map.has(id)) continue;
    map.set(id, { encoded: trimmed, exp: now + TTL_MS });
    return id;
  }
  return null;
}

export function lookupShortLink(id: string): string | null {
  const raw = id.trim();
  if (!raw || raw.length > 128) return null;
  const map = store();
  const row = map.get(raw);
  const now = Date.now();
  if (!row) return null;
  if (row.exp < now) {
    map.delete(raw);
    return null;
  }
  return row.encoded;
}
