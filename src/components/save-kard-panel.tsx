"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { ContactProfile } from "@/lib/profile";
import {
  getSavedKardNote,
  isKardSaved,
  subscribeSavedKards,
  upsertSavedKard,
} from "@/lib/saved-kards";

export function SaveKardPanel({
  encoded,
  profile,
}: {
  encoded: string;
  profile: ContactProfile;
}) {
  const [note, setNote] = useState("");
  const [justSaved, setJustSaved] = useState(false);

  const saved = useSyncExternalStore(
    subscribeSavedKards,
    () => isKardSaved(encoded),
    () => false,
  );

  useEffect(() => {
    setNote(getSavedKardNote(encoded));
    setJustSaved(false);
  }, [encoded]);

  const save = () => {
    upsertSavedKard(encoded, profile, note);
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="kard-animate-in kard-delay-2 mt-8 rounded-2xl border border-border bg-card/80 p-5 shadow-[0_1px_3px_rgba(28,25,23,0.04)] backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_16px_48px_-20px_rgba(13,148,136,0.15)] dark:hover:shadow-[0_16px_48px_-20px_rgba(45,212,191,0.12)] sm:p-6">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
        Save on this device
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        Stored only in your browser — not on our servers. Add a note so you
        remember where you met.
      </p>
      <label className="mt-4 block">
        <span className="sr-only">Note</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. Met at SF meetup, follow up about design…"
          rows={3}
          className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
        />
      </label>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={save}
          className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition duration-200 hover:scale-[1.02] hover:bg-accent-hover active:scale-[0.98]"
        >
          {saved ? "Update saved Kard" : "Save Kard"}
        </button>
        <Link
          href="/saved"
          className="text-center text-sm font-medium text-accent underline-offset-4 hover:text-accent-hover hover:underline sm:text-left"
        >
          View all saved →
        </Link>
      </div>
      {justSaved ? (
        <p className="mt-3 text-sm text-muted-foreground">Saved.</p>
      ) : null}
    </div>
  );
}
