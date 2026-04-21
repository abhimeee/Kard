"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import {
  clearEventMode,
  getEventMode,
  getServerEventMode,
  setEventMode,
  subscribeEventMode,
} from "@/lib/event-mode";

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return `${days} d ago`;
}

export function EventModeBanner({
  variant = "default",
}: {
  variant?: "default" | "compact";
}) {
  const event = useSyncExternalStore(
    subscribeEventMode,
    getEventMode,
    getServerEventMode,
  );
  const [editing, setEditing] = useState<{ initial: string } | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const startEditing = (initial: string) => {
    setEditing({ initial });
  };

  const save = () => {
    const v = (inputRef.current?.value ?? "").trim();
    if (!v) {
      clearEventMode();
    } else {
      setEventMode(v);
    }
    setEditing(null);
  };

  const active = !!event;
  const compact = variant === "compact";

  if (!active && editing === null) {
    return (
      <div
        className={`flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-border bg-card/50 px-4 py-3 text-sm text-muted-foreground ${
          compact ? "" : "mb-6"
        }`}
      >
        <span aria-hidden>📍</span>
        <span className="flex-1 min-w-0">
          At a networking event?{" "}
          <span className="text-muted-foreground/80">
            Turn on Event Mode to tag every Kard you save.
          </span>
        </span>
        <button
          type="button"
          onClick={() => startEditing("")}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-accent/40 hover:text-accent"
        >
          Turn on
        </button>
      </div>
    );
  }

  if (editing !== null) {
    return (
      <div
        className={`rounded-2xl border border-accent/30 bg-accent/5 p-4 ${
          compact ? "" : "mb-6"
        }`}
      >
        <label className="block text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Event name
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            key={editing.initial}
            ref={inputRef}
            autoFocus
            defaultValue={editing.initial}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                save();
              } else if (e.key === "Escape") {
                e.preventDefault();
                setEditing(null);
              }
            }}
            placeholder="e.g. SF AI Meetup · Nov 2026"
            className="min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={save}
              className="flex-1 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover sm:flex-none"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="rounded-full border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-2xl border border-accent/30 bg-accent/5 px-4 py-3 text-sm text-foreground ${
        compact ? "" : "mb-6"
      }`}
    >
      <span
        className="inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-accent"
        aria-label="Event Mode on"
      >
        <span
          className="h-1.5 w-1.5 rounded-full bg-accent"
          aria-hidden
        />
        Event Mode
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{event!.name}</p>
        <p className="text-xs text-muted-foreground">
          Started {relativeTime(event!.startedAt)} · New saves will be tagged
          with this event.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => startEditing(event!.name)}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-accent/40"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => clearEventMode()}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-destructive"
        >
          Turn off
        </button>
      </div>
    </div>
  );
}
