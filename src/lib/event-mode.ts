const STORAGE_KEY = "kard-event-mode-v1";

export type EventMode = {
  name: string;
  startedAt: string;
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function isEventStorageKey(key: string | null): boolean {
  return key === STORAGE_KEY;
}

export function subscribeEventMode(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (isEventStorageKey(e.key)) onChange();
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

function parse(raw: string | null): EventMode | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as unknown;
    if (!p || typeof p !== "object") return null;
    const r = p as Record<string, unknown>;
    if (typeof r.name !== "string") return null;
    const name = r.name.trim();
    if (!name) return null;
    const startedAt =
      typeof r.startedAt === "string" && r.startedAt
        ? r.startedAt
        : new Date().toISOString();
    return { name, startedAt };
  } catch {
    return null;
  }
}

export function getEventMode(): EventMode | null {
  if (typeof window === "undefined") return null;
  return parse(localStorage.getItem(STORAGE_KEY));
}

export function getServerEventMode(): EventMode | null {
  return null;
}

export function setEventMode(name: string): void {
  if (typeof window === "undefined") return;
  const trimmed = name.trim();
  if (!trimmed) {
    clearEventMode();
    return;
  }
  const existing = getEventMode();
  const payload: EventMode = {
    name: trimmed,
    startedAt:
      existing && existing.name === trimmed
        ? existing.startedAt
        : new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota */
  }
  emit();
}

export function clearEventMode(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
  emit();
}
