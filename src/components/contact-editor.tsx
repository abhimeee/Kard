"use client";

import { useCallback } from "react";
import {
  LINK_PRESETS,
  type ContactLink,
  type ContactProfile,
} from "@/lib/profile";

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

  const addBlank = () => {
    update({
      ...value,
      links: [...value.links, { label: "Link", url: "" }],
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Links
          </span>
          <button
            type="button"
            onClick={addBlank}
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-accent/40 hover:text-accent"
          >
            + Custom
          </button>
        </div>
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
        </div>

        <ul className="mt-4 space-y-3">
          {value.links.map((link, i) => {
            const preset = LINK_PRESETS.find((p) => p.label === link.label);
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
                  placeholder={preset?.placeholder ?? "https://"}
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
