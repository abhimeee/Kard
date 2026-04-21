"use client";

import { useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import { ContactEditor } from "@/components/contact-editor";
import { ContactCard } from "@/components/contact-card";
import { QrPanel } from "@/components/qr-panel";
import { EventModeBanner } from "@/components/event-mode-banner";
import {
  getProfileSnapshot,
  getServerProfileSnapshot,
  saveDraft,
  subscribeProfile,
} from "@/lib/storage";
import type { ContactProfile } from "@/lib/profile";

export function HomeClient() {
  const profile = useSyncExternalStore(
    subscribeProfile,
    getProfileSnapshot,
    getServerProfileSnapshot,
  );

  const setProfile = useCallback((p: ContactProfile) => {
    saveDraft(p);
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-12 sm:px-6 sm:pt-16">
      <header className="max-w-2xl">
        <p className="kard-animate-in kard-delay-1 text-xs font-medium uppercase tracking-[0.35em] text-accent">
          Kard
        </p>
        <h1 className="kard-animate-in kard-delay-2 mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
          Your contact,{" "}
          <span className="kard-shimmer-text">one scan</span> away.
        </h1>
        <p className="kard-animate-in kard-delay-3 mt-4 text-lg leading-relaxed text-muted-foreground">
          Fill in your links once, show a QR on your lock screen. They scan
          with the camera, no app, no typos. Anyone can make a Kard; nothing
          to install.
        </p>
        <p className="kard-animate-in kard-delay-4 mt-3 text-sm text-muted-foreground">
          <Link
            href="/saved"
            className="font-medium text-accent underline-offset-4 transition hover:text-accent-hover hover:underline"
          >
            Saved Kards
          </Link>
          <span className="text-muted-foreground/80">
            {" "}
            Kards you scanned on this device, with notes.
          </span>
        </p>
      </header>

      <div className="mt-10">
        <EventModeBanner />
      </div>

      <div className="mt-4 grid gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="kard-animate-in kard-delay-3 space-y-6">
          <ContactEditor value={profile} onChange={setProfile} />
        </div>
        <div className="space-y-8">
          <div className="kard-animate-in kard-delay-4">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
              Preview
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This is what people see after scanning.
            </p>
            <div className="mt-4">
              <ContactCard profile={profile} animate tilt />
            </div>
          </div>
          <QrPanel profile={profile} />
        </div>
      </div>
    </div>
  );
}
