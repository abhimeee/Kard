export const PROFILE_VERSION = 1 as const;

export type ContactLink = {
  label: string;
  url: string;
};

export type ContactProfile = {
  v: typeof PROFILE_VERSION;
  name: string;
  /** Short line under the name — role, company, one-liner */
  headline?: string;
  links: ContactLink[];
};

export const LINK_PRESETS: {
  label: string;
  hint: string;
  placeholder: string;
}[] = [
  {
    label: "X",
    hint: "Your handle — no need to paste a link.",
    placeholder: "yourname",
  },
  {
    label: "LinkedIn",
    hint: "The part after linkedin.com/in/",
    placeholder: "yourname",
  },
  {
    label: "WhatsApp",
    hint: "Your number with country code (spaces ok).",
    placeholder: "1 555 123 4567",
  },
  {
    label: "Email",
    hint: "Your email address.",
    placeholder: "you@example.com",
  },
  {
    label: "GitHub",
    hint: "Username only.",
    placeholder: "yourname",
  },
  {
    label: "Website",
    hint: "Domain or site path.",
    placeholder: "yoursite.com",
  },
];

export function emptyProfile(): ContactProfile {
  return {
    v: PROFILE_VERSION,
    name: "",
    headline: "",
    links: [],
  };
}

export function normalizeProfile(input: unknown): ContactProfile | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  if (o.v !== PROFILE_VERSION) return null;
  if (typeof o.name !== "string") return null;
  if (!Array.isArray(o.links)) return null;
  const links: ContactLink[] = [];
  for (const row of o.links) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    if (typeof r.label !== "string" || typeof r.url !== "string") continue;
    links.push({ label: r.label.trim(), url: r.url.trim() });
  }
  return {
    v: PROFILE_VERSION,
    name: o.name.trim(),
    headline: typeof o.headline === "string" ? o.headline.trim() : undefined,
    links,
  };
}
