"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  tilt = true,
}: {
  profile: ContactProfile;
  className?: string;
  /** `share` = scanned card; `edit` = builder preview */
  variant?: "edit" | "share";
  /** Entrance motion for builder preview */
  animate?: boolean;
  /** Subtle 3D tilt on pointer devices when motion is allowed */
  tilt?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tiltStyle, setTiltStyle] = useState("");
  const [tiltOk, setTiltOk] = useState(false);

  useEffect(() => {
    if (!tilt) return;
    const mq = window.matchMedia(
      "(pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const sync = () => setTiltOk(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [tilt]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!tiltOk) return;
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      const rotateX = (-y * 9).toFixed(2);
      const rotateY = (x * 11).toFixed(2);
      setTiltStyle(
        `perspective(920px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.012, 1.012, 1)`,
      );
    },
    [tiltOk],
  );

  const onPointerLeave = useCallback(() => {
    setTiltStyle("");
  }, []);

  const links = profile.links.filter((l) => l.url.trim());

  return (
    <div
      ref={wrapRef}
      onPointerMove={tiltOk ? onPointerMove : undefined}
      onPointerLeave={tiltOk ? onPointerLeave : undefined}
      style={{
        transform: tiltStyle || undefined,
        transition: tiltStyle
          ? "transform 0.08s ease-out"
          : "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      className={`relative overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-[0_20px_60px_-12px_rgba(28,25,23,0.1)] dark:shadow-[0_20px_60px_-12px_rgba(0,0,0,0.45)] will-change-transform ${animate ? "kard-card-animate" : ""} ${className}`}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(13,148,136,0.12),transparent_65%)] motion-safe:animate-[pulse_6s_ease-in-out_infinite]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[radial-gradient(circle_at_center,rgba(120,113,108,0.08),transparent_70%)] motion-safe:animate-[pulse_7s_ease-in-out_infinite_0.5s]"
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
                  className="group flex items-center justify-between gap-4 rounded-xl border border-border bg-muted px-4 py-3 text-foreground shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-input hover:shadow-[0_8px_24px_-8px_rgba(13,148,136,0.2)] active:translate-y-0 active:scale-[0.99] dark:hover:shadow-[0_8px_28px_-10px_rgba(45,212,191,0.18)]"
                >
                  <span className="text-sm font-medium tracking-wide text-accent transition group-hover:translate-x-0.5">
                    {l.label}
                  </span>
                  <span className="truncate text-right text-sm text-muted-foreground transition group-hover:text-foreground">
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
