"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  buildExportJson,
  exportFilename,
  listSavedKards,
  removeSavedKard,
  setSavedKardEvent,
  setSavedKardFollowUp,
  subscribeSavedKards,
  updateSavedKardNote,
  type SavedKardEntry,
} from "@/lib/saved-kards";
import { EventModeBanner } from "@/components/event-mode-banner";
import { downloadVcard } from "@/lib/vcard";

type SortMode = "recent" | "name" | "followups";

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

function matchesQuery(entry: SavedKardEntry, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  const haystacks = [
    entry.profile.name,
    entry.profile.headline ?? "",
    entry.note,
    entry.event ?? "",
  ];
  for (const link of entry.profile.links) {
    haystacks.push(link.label, link.url);
  }
  return haystacks.some((s) => s.toLowerCase().includes(needle));
}

function sortEntries(items: SavedKardEntry[], mode: SortMode): SavedKardEntry[] {
  const next = [...items];
  switch (mode) {
    case "name":
      next.sort((a, b) =>
        (a.profile.name || "").localeCompare(b.profile.name || ""),
      );
      break;
    case "followups":
      next.sort((a, b) => {
        const af = a.followUp ? 0 : 1;
        const bf = b.followUp ? 0 : 1;
        if (af !== bf) return af - bf;
        return (
          new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
        );
      });
      break;
    case "recent":
    default:
      next.sort(
        (a, b) =>
          new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
      );
      break;
  }
  return next;
}

export function SavedClient() {
  const items = useSyncExternalStore(
    subscribeSavedKards,
    listSavedKards,
    () => [],
  );

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("recent");
  const [onlyFollowUps, setOnlyFollowUps] = useState(false);

  const onNoteBlur = useCallback((encoded: string, note: string) => {
    updateSavedKardNote(encoded, note);
  }, []);

  const onEventBlur = useCallback((encoded: string, event: string) => {
    setSavedKardEvent(encoded, event);
  }, []);

  const visible = useMemo(() => {
    let next = items;
    if (onlyFollowUps) next = next.filter((x) => x.followUp === true);
    if (query.trim()) next = next.filter((x) => matchesQuery(x, query.trim()));
    return sortEntries(next, sort);
  }, [items, query, sort, onlyFollowUps]);

  const followUpCount = useMemo(
    () => items.filter((x) => x.followUp === true).length,
    [items],
  );

  const events = useMemo(() => {
    const set = new Set<string>();
    for (const x of items) if (x.event) set.add(x.event);
    return [...set].sort();
  }, [items]);

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

      <div className="mt-8">
        <EventModeBanner />
      </div>

      {items.length > 0 ? (
        <div className="mt-6 space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative flex-1">
              <span className="sr-only">Search saved Kards</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, note, event…"
                className="w-full rounded-full border border-border bg-background px-4 py-2.5 pl-10 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                ⌕
              </span>
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="sr-only sm:not-sr-only">Sort</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortMode)}
                className="rounded-full border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
              >
                <option value="recent">Most recent</option>
                <option value="name">Name A → Z</option>
                <option value="followups">Follow-ups first</option>
              </select>
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => setOnlyFollowUps((v) => !v)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                onlyFollowUps
                  ? "border-accent/40 bg-accent/10 text-accent"
                  : "border-border bg-background text-muted-foreground hover:border-accent/40 hover:text-foreground"
              }`}
              aria-pressed={onlyFollowUps}
            >
              Follow-ups only
              {followUpCount > 0 ? (
                <span className="ml-1 text-[10px] opacity-80">
                  ({followUpCount})
                </span>
              ) : null}
            </button>
            {events.slice(0, 6).map((ev) => (
              <button
                key={ev}
                type="button"
                onClick={() =>
                  setQuery((q) => (q.trim() === ev ? "" : ev))
                }
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  query.trim() === ev
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-border bg-background text-muted-foreground hover:border-accent/40 hover:text-foreground"
                }`}
                title={`Filter by event: ${ev}`}
              >
                📍 {ev}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-8 space-y-4">
        {items.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card px-6 py-10 text-center text-muted-foreground">
            No Kards saved yet. Scan someone&apos;s QR and tap{" "}
            <span className="font-medium text-foreground">Save Kard</span> on
            their page.
          </p>
        ) : visible.length === 0 ? (
          <p className="rounded-2xl border border-border bg-card px-6 py-10 text-center text-muted-foreground">
            No Kards match your filters.
          </p>
        ) : (
          visible.map((entry) => (
            <article
              key={entry.encoded}
              className={`rounded-2xl border bg-card p-5 shadow-[0_1px_3px_rgba(28,25,23,0.04)] sm:p-6 ${
                entry.followUp
                  ? "border-accent/30 ring-1 ring-accent/10"
                  : "border-border"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
                      {entry.profile.name.trim() || "Unnamed"}
                    </p>
                    {entry.followUp ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
                        Follow up
                      </span>
                    ) : null}
                  </div>
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
                    {entry.event ? (
                      <>
                        {" · "}
                        <span className="text-foreground/80">
                          📍 {entry.event}
                        </span>
                      </>
                    ) : null}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`/c#${entry.encoded}`}
                    className="inline-flex rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:border-accent/40"
                  >
                    Open
                  </a>
                  <button
                    type="button"
                    onClick={() => downloadVcard(entry.profile, entry.note)}
                    className="inline-flex rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:border-accent/40"
                    title="Download .vcf to add to phone contacts"
                  >
                    vCard
                  </button>
                  <button
                    type="button"
                    onClick={() => removeSavedKard(entry.encoded)}
                    className="inline-flex rounded-full border border-border px-4 py-2 text-sm font-medium text-[var(--destructive-foreground)] transition hover:border-[var(--destructive-border)]"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={entry.followUp === true}
                  onChange={(e) =>
                    setSavedKardFollowUp(entry.encoded, e.target.checked)
                  }
                  className="h-4 w-4 cursor-pointer accent-accent"
                />
                <span
                  className={
                    entry.followUp
                      ? "font-medium text-accent"
                      : "text-muted-foreground"
                  }
                >
                  {entry.followUp
                    ? "Follow-up needed"
                    : "Mark as needing follow-up"}
                </span>
              </label>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Event / context
                  </span>
                  <input
                    key={`${entry.encoded}-ev`}
                    defaultValue={entry.event ?? ""}
                    onBlur={(e) => onEventBlur(entry.encoded, e.target.value)}
                    placeholder="Where you met…"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Note
                  </span>
                  <textarea
                    key={`${entry.encoded}-note`}
                    defaultValue={entry.note}
                    onBlur={(e) => onNoteBlur(entry.encoded, e.target.value)}
                    placeholder="Your note…"
                    rows={2}
                    className="w-full resize-y rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
                  />
                </label>
              </div>
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
