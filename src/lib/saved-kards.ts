import { normalizeProfile, type ContactProfile } from "./profile";

const STORAGE_KEY = "kard-saved-list-v1";

export const SAVED_EXPORT_VERSION = 1 as const;

export type SavedKardEntry = {
  /** Raw hash/query payload — stable identity for a Kard */
  encoded: string;
  profile: ContactProfile;
  note: string;
  savedAt: string;
};

export type SavedKardExport = {
  exportVersion: typeof SAVED_EXPORT_VERSION;
  exportedAt: string;
  items: SavedKardEntry[];
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function isSavedStorageKey(key: string | null): boolean {
  return key === STORAGE_KEY;
}

export function subscribeSavedKards(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (isSavedStorageKey(e.key)) onChange();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
  }
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

function parseList(raw: string | null): SavedKardEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: SavedKardEntry[] = [];
    for (const row of parsed) {
      if (!row || typeof row !== "object") continue;
      const r = row as Record<string, unknown>;
      if (typeof r.encoded !== "string") continue;
      if (typeof r.note !== "string") continue;
      if (typeof r.savedAt !== "string") continue;
      const profile = normalizeProfile(r.profile);
      if (!profile) continue;
      out.push({
        encoded: r.encoded.trim(),
        profile,
        note: r.note,
        savedAt: r.savedAt,
      });
    }
    return out;
  } catch {
    return [];
  }
}

export function listSavedKards(): SavedKardEntry[] {
  if (typeof window === "undefined") return [];
  return parseList(localStorage.getItem(STORAGE_KEY));
}

function writeList(items: SavedKardEntry[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* quota or private mode */
  }
  emit();
}

export function isKardSaved(encoded: string): boolean {
  const e = encoded.trim();
  if (!e) return false;
  return listSavedKards().some((x) => x.encoded === e);
}

export function getSavedKardNote(encoded: string): string {
  const e = encoded.trim();
  const found = listSavedKards().find((x) => x.encoded === e);
  return found?.note ?? "";
}

export function upsertSavedKard(
  encoded: string,
  profile: ContactProfile,
  note: string,
): void {
  const e = encoded.trim();
  if (!e) return;
  const items = listSavedKards();
  const idx = items.findIndex((x) => x.encoded === e);
  const now = new Date().toISOString();
  if (idx >= 0) {
    items[idx] = {
      encoded: e,
      profile,
      note: note.trim(),
      savedAt: items[idx]!.savedAt,
    };
  } else {
    items.unshift({
      encoded: e,
      profile,
      note: note.trim(),
      savedAt: now,
    });
  }
  writeList(items);
}

export function updateSavedKardNote(encoded: string, note: string): void {
  const e = encoded.trim();
  const items = listSavedKards();
  const idx = items.findIndex((x) => x.encoded === e);
  if (idx < 0) return;
  items[idx] = { ...items[idx]!, note: note.trim() };
  writeList(items);
}

export function removeSavedKard(encoded: string): void {
  const e = encoded.trim();
  writeList(listSavedKards().filter((x) => x.encoded !== e));
}

export function buildExportJson(): string {
  const payload: SavedKardExport = {
    exportVersion: SAVED_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    items: listSavedKards(),
  };
  return JSON.stringify(payload, null, 2);
}

export function exportFilename(): string {
  return `kard-saved-${new Date().toISOString().slice(0, 10)}.json`;
}
