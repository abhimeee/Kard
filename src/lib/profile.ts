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

export const LINK_PRESETS: { label: string; placeholder: string }[] = [
  { label: "X", placeholder: "https://x.com/yourhandle" },
  { label: "LinkedIn", placeholder: "https://linkedin.com/in/you" },
  { label: "WhatsApp", placeholder: "https://wa.me/15551234567" },
  { label: "Email", placeholder: "mailto:you@example.com" },
  { label: "GitHub", placeholder: "https://github.com/you" },
  { label: "Website", placeholder: "https://yoursite.com" },
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
