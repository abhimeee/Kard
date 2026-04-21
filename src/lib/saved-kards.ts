import { normalizeProfile, type ContactProfile } from "./profile";

const STORAGE_KEY = "kard-saved-list-v1";

export const SAVED_EXPORT_VERSION = 1 as const;

export type SavedKardEntry = {
  /** Raw hash/query payload — stable identity for a Kard */
  encoded: string;
  profile: ContactProfile;
  note: string;
  savedAt: string;
  /** Event / context where this person was met (from Event Mode or manual entry). */
  event?: string;
  /** User flagged this contact as needing a follow-up. */
  followUp?: boolean;
};

export type UpsertOptions = {
  note: string;
  event?: string;
  followUp?: boolean;
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
      const event =
        typeof r.event === "string" && r.event.trim()
          ? r.event.trim()
          : undefined;
      const followUp = r.followUp === true ? true : undefined;
      out.push({
        encoded: r.encoded.trim(),
        profile,
        note: r.note,
        savedAt: r.savedAt,
        ...(event ? { event } : {}),
        ...(followUp ? { followUp } : {}),
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
  opts: UpsertOptions,
): void {
  const e = encoded.trim();
  if (!e) return;
  const items = listSavedKards();
  const idx = items.findIndex((x) => x.encoded === e);
  const now = new Date().toISOString();
  const event = opts.event?.trim() || undefined;
  const followUp = opts.followUp === true ? true : undefined;
  if (idx >= 0) {
    items[idx] = {
      encoded: e,
      profile,
      note: opts.note.trim(),
      savedAt: items[idx]!.savedAt,
      ...(event ? { event } : {}),
      ...(followUp ? { followUp } : {}),
    };
  } else {
    items.unshift({
      encoded: e,
      profile,
      note: opts.note.trim(),
      savedAt: now,
      ...(event ? { event } : {}),
      ...(followUp ? { followUp } : {}),
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

export function setSavedKardFollowUp(
  encoded: string,
  followUp: boolean,
): void {
  const e = encoded.trim();
  const items = listSavedKards();
  const idx = items.findIndex((x) => x.encoded === e);
  if (idx < 0) return;
  const current = items[idx]!;
  const next: SavedKardEntry = { ...current };
  if (followUp) next.followUp = true;
  else delete next.followUp;
  items[idx] = next;
  writeList(items);
}

export function setSavedKardEvent(encoded: string, event: string): void {
  const e = encoded.trim();
  const items = listSavedKards();
  const idx = items.findIndex((x) => x.encoded === e);
  if (idx < 0) return;
  const current = items[idx]!;
  const trimmed = event.trim();
  const next: SavedKardEntry = { ...current };
  if (trimmed) next.event = trimmed;
  else delete next.event;
  items[idx] = next;
  writeList(items);
}

export function getSavedKard(encoded: string): SavedKardEntry | undefined {
  const e = encoded.trim();
  return listSavedKards().find((x) => x.encoded === e);
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
