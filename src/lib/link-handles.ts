import { LINK_PRESETS } from "./profile";

const OTHER_LABEL = "Other";

export function isHandleLinkRow(label: string): boolean {
  return LINK_PRESETS.some((p) => p.label === label) || label === OTHER_LABEL;
}

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

/** Turn what the user typed into a stored URL (mailto:, https://, …). */
export function buildUrlFromLabel(label: string, raw: string): string {
  const t = raw.trim();
  if (!t) return "";

  if (/^https?:\/\//i.test(t)) return t;
  if (/^mailto:/i.test(t)) return t;
  if (/^tel:/i.test(t) || /^sms:/i.test(t)) return t;

  switch (label) {
    case "X": {
      const h =
        t.replace(/^@/, "").replace(/\/+$/, "").split(/[/?#]/)[0] ?? "";
      if (!h) return "";
      return `https://x.com/${h}`;
    }
    case "LinkedIn": {
      let slug = t
        .replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "")
        .replace(/\/+$/, "")
        .split(/[/?#]/)[0] ?? "";
      slug = slug.replace(/^in\//i, "");
      if (!slug) return "";
      return `https://www.linkedin.com/in/${slug}`;
    }
    case "WhatsApp": {
      const d = digitsOnly(t);
      if (!d) return "";
      return `https://wa.me/${d}`;
    }
    case "Email": {
      return `mailto:${t}`;
    }
    case "GitHub": {
      const user = t
        .replace(/^@/, "")
        .replace(/^(https?:\/\/)?(www\.)?github\.com\//i, "")
        .split(/[/?#]/)[0] ?? "";
      if (!user) return "";
      return `https://github.com/${user}`;
    }
    case "Website": {
      const rest = t.replace(/^https?:\/\//i, "").trim();
      if (!rest) return "";
      return `https://${rest}`;
    }
    case OTHER_LABEL: {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return `mailto:${t}`;
      if (t.includes(".") && !/\s/.test(t)) {
        return /^https?:\/\//i.test(t) ? t : `https://${t}`;
      }
      return t;
    }
    default: {
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return `mailto:${t}`;
      if (t.includes(".") && !/\s/.test(t)) return `https://${t}`;
      return t;
    }
  }
}

/** Value to show in the handle input when editing (derived from stored URL). */
export function displayValueForLink(label: string, url: string): string {
  const u = url.trim();
  if (!u) return "";

  switch (label) {
    case "X": {
      const m = u.match(/(?:x|twitter)\.com\/([^/?#]+)/i);
      return m ? `@${m[1]}` : u;
    }
    case "LinkedIn": {
      const m = u.match(/linkedin\.com\/in\/([^/?#]+)/i);
      return m ? m[1] : u;
    }
    case "WhatsApp": {
      const m = u.match(/wa\.me\/(\d+)/i);
      return m ? m[1] : digitsOnly(u) || u;
    }
    case "Email":
      return u.replace(/^mailto:/i, "");
    case "GitHub": {
      const m = u.match(/github\.com\/([^/?#]+)/i);
      return m ? m[1] : u;
    }
    case "Website":
      return u.replace(/^https?:\/\//i, "").replace(/\/$/, "");
    case OTHER_LABEL:
      return u.replace(/^https?:\/\//i, "").replace(/^mailto:/i, "");
    default:
      return u.replace(/^https?:\/\//i, "").replace(/^mailto:/i, "");
  }
}

/** Short line for the public card next to each link label. */
export function formatLinkLine(label: string, url: string): string {
  const u = url.trim();
  if (!u) return "";
  if (isHandleLinkRow(label)) {
    return displayValueForLink(label, u);
  }
  return u.replace(/^https?:\/\//i, "").replace(/^mailto:/i, "");
}

export { OTHER_LABEL };
