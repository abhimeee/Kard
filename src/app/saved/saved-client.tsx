"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  buildExportJson,
  exportFilename,
  listSavedKards,
  removeSavedKard,
  subscribeSavedKards,
  updateSavedKardNote,
} from "@/lib/saved-kards";

function downloadExport() {
  const json = buildExportJson();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = exportFilename();
  a.click();
  URL.revokeObjectURL(url);
}

export function SavedClient() {
  const items = useSyncExternalStore(
    subscribeSavedKards,
    listSavedKards,
    () => [],
  );

  const onNoteBlur = useCallback((encoded: string, note: string) => {
    updateSavedKardNote(encoded, note);
  }, []);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16">
      <p className="text-xs font-medium uppercase tracking-[0.35em] text-accent">
        Kard
      </p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        Saved Kards
      </h1>
      <p className="mt-3 text-muted-foreground">
        Only on this browser.{" "}
        <button
          type="button"
          onClick={downloadExport}
          disabled={items.length === 0}
          className="font-medium text-accent underline-offset-4 hover:text-accent-hover hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
        >
          Export JSON
        </button>{" "}
        for a backup.
      </p>

      <div className="mt-10 space-y-4">
        {items.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card px-6 py-10 text-center text-muted-foreground">
            No Kards saved yet. Scan someone&apos;s QR and tap{" "}
            <span className="font-medium text-foreground">Save Kard</span> on
            their page.
          </p>
        ) : (
          items.map((entry) => (
            <article
              key={entry.encoded}
              className="rounded-2xl border border-border bg-card p-5 shadow-[0_1px_3px_rgba(28,25,23,0.04)] sm:p-6"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
                    {entry.profile.name.trim() || "Unnamed"}
                  </p>
                  {entry.profile.headline?.trim() ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {entry.profile.headline.trim()}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Saved{" "}
                    {new Date(entry.savedAt).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`/c#${entry.encoded}`}
                    className="inline-flex rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:border-accent/40"
                  >
                    Open Kard
                  </a>
                  <button
                    type="button"
                    onClick={() => removeSavedKard(entry.encoded)}
                    className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-medium text-[var(--destructive-foreground)] transition hover:border-[var(--destructive-border)]"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Note
                </span>
                <textarea
                  key={entry.encoded}
                  defaultValue={entry.note}
                  onBlur={(e) =>
                    onNoteBlur(entry.encoded, e.target.value)
                  }
                  placeholder="Your note…"
                  rows={2}
                  className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
                />
              </label>
            </article>
          ))
        )}
      </div>

      <p className="mt-12 text-center text-sm text-muted-foreground">
        <Link
          href="/"
          className="text-accent underline-offset-4 hover:text-accent-hover hover:underline"
        >
          ← Back to editor
        </Link>
      </p>
    </div>
  );
}
