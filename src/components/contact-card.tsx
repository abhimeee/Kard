import type { ContactProfile } from "@/lib/profile";
import { formatLinkLine } from "@/lib/link-handles";

function linkHref(url: string): string {
  const u = url.trim();
  if (!u) return "#";
  if (/^mailto:/i.test(u) || /^tel:/i.test(u) || /^sms:/i.test(u)) return u;
  if (/^https?:\/\//i.test(u)) return u;
  return `https://${u}`;
}

export function ContactCard({
  profile,
  className = "",
  variant = "edit",
  animate = false,
}: {
  profile: ContactProfile;
  className?: string;
  /** `share` = scanned card; `edit` = builder preview */
  variant?: "edit" | "share";
  /** Entrance motion for builder preview */
  animate?: boolean;
}) {
  const links = profile.links.filter((l) => l.url.trim());

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-[0_20px_60px_-12px_rgba(28,25,23,0.1)] dark:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.45)] ${animate ? "kard-card-animate" : ""} ${className}`}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(13,148,136,0.12),transparent_65%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,rgba(120,113,108,0.08),transparent_70%)]"
        aria-hidden
      />

      <div className="relative">
        <p className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {profile.name.trim() || "Your name"}
        </p>
        {profile.headline?.trim() ? (
          <p className="mt-2 max-w-md text-base leading-relaxed text-muted-foreground">
            {profile.headline.trim()}
          </p>
        ) : null}

        {links.length > 0 ? (
          <ul className="mt-8 flex flex-col gap-3">
            {links.map((l, i) => (
              <li
                key={`${l.label}-${i}`}
                className={animate ? "kard-link-animate" : undefined}
                style={
                  animate
                    ? { animationDelay: `${0.08 + i * 0.06}s` }
                    : undefined
                }
              >
                <a
                  href={linkHref(l.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-muted px-4 py-3 text-foreground transition hover:border-accent/35 hover:bg-input"
                >
                  <span className="text-sm font-medium tracking-wide text-accent">
                    {l.label}
                  </span>
                  <span className="truncate text-right text-sm text-muted-foreground group-hover:text-foreground">
                    {formatLinkLine(l.label, l.url)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 text-sm text-muted-foreground">
            {variant === "share"
              ? "No links on this Kard."
              : "Add links above — they appear here after someone scans your QR."}
          </p>
        )}
      </div>
    </div>
  );
}
