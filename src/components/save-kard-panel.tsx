"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { ContactProfile } from "@/lib/profile";
import {
  getSavedKard,
  isKardSaved,
  subscribeSavedKards,
  upsertSavedKard,
} from "@/lib/saved-kards";
import {
  getEventMode,
  getServerEventMode,
  subscribeEventMode,
  type EventMode,
} from "@/lib/event-mode";
import { downloadVcard } from "@/lib/vcard";

/**
 * Inner form — receives initial values on mount and owns local state.
 * Remounts (via key on the outer component) whenever the source of initial
 * values changes (new Kard scanned, or active Event Mode toggled). This keeps
 * it effect-free.
 */
function SaveForm({
  encoded,
  profile,
  saved,
  initialNote,
  initialEvent,
  initialFollowUp,
  activeEvent,
}: {
  encoded: string;
  profile: ContactProfile;
  saved: boolean;
  initialNote: string;
  initialEvent: string;
  initialFollowUp: boolean;
  activeEvent: EventMode | null;
}) {
  const [note, setNote] = useState(initialNote);
  const [eventName, setEventName] = useState(initialEvent);
  const [followUp, setFollowUp] = useState(initialFollowUp);
  const [justSaved, setJustSaved] = useState(false);

  const save = () => {
    upsertSavedKard(encoded, profile, {
      note,
      event: eventName,
      followUp,
    });
    setJustSaved(true);
    window.setTimeout(() => setJustSaved(false), 2000);
  };

  const savePhoneContact = () => {
    downloadVcard(profile, note);
  };

  return (
    <>
      <div className="mt-4 space-y-3">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Note
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Interested in joining the design team, follow up Monday…"
            rows={3}
            className="w-full resize-y rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 flex items-center justify-between text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span>Event / context</span>
            {activeEvent && eventName !== activeEvent.name ? (
              <button
                type="button"
                onClick={() => setEventName(activeEvent.name)}
                className="rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal text-accent hover:border-accent/40"
              >
                Use current: {activeEvent.name}
              </button>
            ) : null}
          </span>
          <input
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder={activeEvent?.name ?? "e.g. SF AI Meetup · Nov 2026"}
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
          />
        </label>

        <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-border bg-background px-4 py-3 text-sm hover:border-accent/40">
          <input
            type="checkbox"
            checked={followUp}
            onChange={(e) => setFollowUp(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-accent"
          />
          <span className="flex-1">
            <span className="block font-medium text-foreground">
              Need to follow up
            </span>
            <span className="block text-xs text-muted-foreground">
              Flag this Kard so it&apos;s easy to find in your Saved list later.
            </span>
          </span>
        </label>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={save}
            className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition duration-200 hover:scale-[1.02] hover:bg-accent-hover active:scale-[0.98]"
          >
            {saved ? "Update saved Kard" : "Save Kard"}
          </button>
          <button
            type="button"
            onClick={savePhoneContact}
            className="rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition duration-200 hover:border-accent/40 hover:scale-[1.02] active:scale-[0.98]"
            title="Download a .vcf file you can open to add this contact to your phone"
          >
            Add to phone contacts
          </button>
        </div>
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
    </>
  );
}

export function SaveKardPanel({
  encoded,
  profile,
}: {
  encoded: string;
  profile: ContactProfile;
}) {
  const saved = useSyncExternalStore(
    subscribeSavedKards,
    () => isKardSaved(encoded),
    () => false,
  );

  const activeEvent = useSyncExternalStore(
    subscribeEventMode,
    getEventMode,
    getServerEventMode,
  );

  const existing = useSyncExternalStore(
    subscribeSavedKards,
    () => getSavedKard(encoded),
    () => undefined,
  );

  const initialNote = existing?.note ?? "";
  const initialEvent = existing?.event ?? activeEvent?.name ?? "";
  const initialFollowUp = existing?.followUp === true;

  return (
    <div className="kard-animate-in kard-delay-2 mt-8 rounded-2xl border border-border bg-card/80 p-5 shadow-[0_1px_3px_rgba(28,25,23,0.04)] backdrop-blur-sm transition-shadow duration-300 hover:shadow-[0_16px_48px_-20px_rgba(13,148,136,0.15)] dark:hover:shadow-[0_16px_48px_-20px_rgba(45,212,191,0.12)] sm:p-6">
      <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
        Save on this device
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        Stored only in your browser — not on our servers. Add a note and tag
        the event so you remember where you met.
      </p>
      <SaveForm
        key={`${encoded}|${activeEvent?.name ?? ""}`}
        encoded={encoded}
        profile={profile}
        saved={saved}
        initialNote={initialNote}
        initialEvent={initialEvent}
        initialFollowUp={initialFollowUp}
        activeEvent={activeEvent}
      />
    </div>
  );
}
