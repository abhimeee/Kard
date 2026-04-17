"use client";

import { useCallback } from "react";
import {
  LINK_PRESETS,
  type ContactLink,
  type ContactProfile,
} from "@/lib/profile";
import {
  OTHER_LABEL,
  buildUrlFromLabel,
  displayValueForLink,
  isHandleLinkRow,
} from "@/lib/link-handles";

export function ContactEditor({
  value,
  onChange,
}: {
  value: ContactProfile;
  onChange: (p: ContactProfile) => void;
}) {
  const update = useCallback(
    (next: ContactProfile) => {
      onChange(next);
    },
    [onChange],
  );

  const setName = (name: string) => update({ ...value, name });
  const setHeadline = (headline: string) => update({ ...value, headline });

  const setLink = (index: number, patch: Partial<ContactLink>) => {
    const links = value.links.map((l, i) =>
      i === index ? { ...l, ...patch } : l,
    );
    update({ ...value, links });
  };

  const addPreset = (label: string) => {
    update({
      ...value,
      links: [...value.links, { label, url: "" }],
    });
  };

  const addOther = () => {
    update({
      ...value,
      links: [...value.links, { label: OTHER_LABEL, url: "" }],
    });
  };

  const removeLink = (index: number) => {
    update({
      ...value,
      links: value.links.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-[0_1px_3px_rgba(28,25,23,0.04)] sm:p-8">
      <div>
        <label className="block text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Name
        </label>
        <input
          value={value.name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Alex Chen"
          className="mt-2 w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/70 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/15"
        />
      </div>
      <div>
        <label className="block text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Headline
        </label>
        <input
          value={value.headline ?? ""}
          onChange={(e) => setHeadline(e.target.value)}
          placeholder="Founder @ Startup · YC S26"
          className="mt-2 w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground/70 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/15"
        />
      </div>

      <div>
        <span className="block text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Add your profiles
        </span>
        <p className="mt-1 text-sm text-muted-foreground">
          Pick a platform and enter your handle or number — no links to copy.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {LINK_PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              onClick={() => addPreset(p.label)}
              className="rounded-full bg-muted px-3 py-1.5 text-xs text-accent ring-1 ring-border transition hover:ring-accent/30"
            >
              + {p.label}
            </button>
          ))}
          <button
            type="button"
            onClick={addOther}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-accent/40 hover:text-accent"
          >
            + Other
          </button>
        </div>

        <ul className="mt-4 space-y-4">
          {value.links.map((link, i) => {
            const preset = LINK_PRESETS.find((p) => p.label === link.label);
            const handleMode = isHandleLinkRow(link.label);

            if (handleMode) {
              const hint =
                preset?.hint ??
                (link.label === OTHER_LABEL
                  ? "Paste a full URL, email, or domain."
                  : "");

              return (
                <li
                  key={i}
                  className="rounded-xl border border-border bg-muted p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-accent">
                      {link.label}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeLink(i)}
                      className="shrink-0 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:text-destructive"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    value={displayValueForLink(link.label, link.url)}
                    onChange={(e) =>
                      setLink(i, {
                        url: buildUrlFromLabel(link.label, e.target.value),
                      })
                    }
                    placeholder={preset?.placeholder ?? "https://…"}
                    className="mt-2 w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/15"
                    aria-label={`${link.label} handle or number`}
                    autoComplete="off"
                  />
                  {hint ? (
                    <p className="mt-1.5 text-xs leading-snug text-muted-foreground">
                      {hint}
                    </p>
                  ) : null}
                </li>
              );
            }

            return (
              <li
                key={i}
                className="flex flex-col gap-2 rounded-xl border border-border bg-muted p-3 sm:flex-row sm:items-center"
              >
                <input
                  value={link.label}
                  onChange={(e) => setLink(i, { label: e.target.value })}
                  className="w-full shrink-0 rounded-lg border border-transparent bg-card px-3 py-2 text-sm text-foreground sm:max-w-[140px]"
                  aria-label="Link label"
                />
                <input
                  value={link.url}
                  onChange={(e) => setLink(i, { url: e.target.value })}
                  placeholder="https://"
                  className="min-w-0 flex-1 rounded-lg border border-transparent bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70"
                  aria-label="URL"
                />
                <button
                  type="button"
                  onClick={() => removeLink(i)}
                  className="shrink-0 rounded-lg px-2 py-2 text-xs text-muted-foreground hover:text-destructive"
                >
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
