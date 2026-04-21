import type { ContactProfile } from "./profile";

function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

type VcardLine = string;

function pushUrlLine(lines: VcardLine[], label: string, url: string): void {
  const u = url.trim();
  if (!u) return;
  lines.push(`URL;TYPE=${escapeText(label)}:${escapeText(u)}`);
}

/**
 * Build a vCard 3.0 document for the given profile.
 * Structured links are mapped to their native vCard types where possible
 * (email → EMAIL, WhatsApp → TEL, everything else → URL) so that importing
 * into a phone's Contacts app lights up the right buttons.
 */
export function buildVcard(profile: ContactProfile, note?: string): string {
  const lines: VcardLine[] = [];
  lines.push("BEGIN:VCARD");
  lines.push("VERSION:3.0");

  const name = profile.name.trim() || "Unnamed";
  lines.push(`FN:${escapeText(name)}`);

  const parts = name.split(/\s+/);
  const last = parts.length > 1 ? parts.slice(-1).join(" ") : "";
  const first = parts.length > 1 ? parts.slice(0, -1).join(" ") : name;
  lines.push(`N:${escapeText(last)};${escapeText(first)};;;`);

  const headline = profile.headline?.trim();
  if (headline) lines.push(`TITLE:${escapeText(headline)}`);

  for (const link of profile.links) {
    const url = link.url.trim();
    if (!url) continue;
    const label = link.label || "Link";

    if (label === "Email" || /^mailto:/i.test(url)) {
      const email = url.replace(/^mailto:/i, "");
      lines.push(`EMAIL;TYPE=INTERNET:${escapeText(email)}`);
      continue;
    }

    if (label === "WhatsApp") {
      const d = digitsOnly(url);
      if (d) lines.push(`TEL;TYPE=CELL,VOICE:+${escapeText(d)}`);
      continue;
    }

    if (/^tel:/i.test(url)) {
      lines.push(`TEL;TYPE=VOICE:${escapeText(url.replace(/^tel:/i, ""))}`);
      continue;
    }

    pushUrlLine(lines, label, url);
  }

  const trimmedNote = note?.trim();
  if (trimmedNote) lines.push(`NOTE:${escapeText(trimmedNote)}`);

  lines.push(`REV:${new Date().toISOString()}`);
  lines.push("END:VCARD");

  return lines.join("\r\n");
}

function safeFilenameSegment(value: string): string {
  return (
    value
      .trim()
      .replace(/[^a-z0-9\-_. ]+/gi, "")
      .replace(/\s+/g, "-")
      .slice(0, 60) || "kard"
  );
}

export function vcardFilename(profile: ContactProfile): string {
  return `${safeFilenameSegment(profile.name || "kard")}.vcf`;
}

export function downloadVcard(profile: ContactProfile, note?: string): void {
  if (typeof window === "undefined") return;
  const blob = new Blob([buildVcard(profile, note)], {
    type: "text/vcard;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = vcardFilename(profile);
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
