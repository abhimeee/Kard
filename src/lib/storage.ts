import { emptyProfile, type ContactProfile } from "./profile";

const STORAGE_KEY = "kard-profile-v1";
/** Older keys — read once and migrate to {@link STORAGE_KEY}. */
const LEGACY_KEYS = ["card-profile-v1", "tapcard-profile-v1"] as const;

function readProfileRaw(): string | null {
  if (typeof window === "undefined") return null;
  const next = localStorage.getItem(STORAGE_KEY);
  if (next) return next;
  for (const key of LEGACY_KEYS) {
    const legacy = localStorage.getItem(key);
    if (!legacy) continue;
    try {
      localStorage.setItem(STORAGE_KEY, legacy);
      for (const k of LEGACY_KEYS) {
        localStorage.removeItem(k);
      }
    } catch {
      return legacy;
    }
    return legacy;
  }
  return null;
}

function isProfileStorageKey(key: string | null): boolean {
  if (!key) return false;
  if (key === STORAGE_KEY) return true;
  return (LEGACY_KEYS as readonly string[]).includes(key);
}

/** Stable empty profile for SSR and no-window paths. useSyncExternalStore requires getServerSnapshot to return the same reference across calls. */
const serverProfileSnapshot = emptyProfile();

/** Client snapshot cache — getSnapshot must return the same object reference until localStorage content changes. */
let cachedClientRaw: string | null = null;
let cachedClientProfile: ContactProfile | null = null;

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

/** Subscribe to profile changes (same tab + other tabs via storage event). */
export function subscribeProfile(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (isProfileStorageKey(e.key)) onChange();
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

export function getProfileSnapshot(): ContactProfile {
  if (typeof window === "undefined") return serverProfileSnapshot;
  try {
    const raw = readProfileRaw();
    if (!raw) {
      cachedClientRaw = null;
      cachedClientProfile = null;
      return serverProfileSnapshot;
    }
    if (raw === cachedClientRaw && cachedClientProfile) {
      return cachedClientProfile;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      cachedClientRaw = raw;
      cachedClientProfile = serverProfileSnapshot;
      return serverProfileSnapshot;
    }
    const p = parsed as ContactProfile;
    const profile: ContactProfile = {
      v: 1,
      name: typeof p.name === "string" ? p.name : "",
      headline: typeof p.headline === "string" ? p.headline : "",
      links: Array.isArray(p.links) ? p.links : [],
    };
    cachedClientRaw = raw;
    cachedClientProfile = profile;
    return profile;
  } catch {
    cachedClientRaw = null;
    cachedClientProfile = null;
    return serverProfileSnapshot;
  }
}

export function getServerProfileSnapshot(): ContactProfile {
  return serverProfileSnapshot;
}

export function loadDraft(): ContactProfile {
  return getProfileSnapshot();
}

export function saveDraft(p: ContactProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    for (const k of LEGACY_KEYS) {
      try {
        localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    }
  } catch {
    /* ignore */
  }
  emit();
}
