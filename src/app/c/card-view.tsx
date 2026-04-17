"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ContactCard } from "@/components/contact-card";
import { decodeProfile } from "@/lib/codec";
import type { ContactProfile } from "@/lib/profile";

function readPayload(): string {
  if (typeof window === "undefined") return "";
  const h = window.location.hash;
  if (h.startsWith("#") && h.length > 1) return h.slice(1);
  const q = new URLSearchParams(window.location.search).get("q");
  return (q ?? "").trim();
}

export function CardView() {
  const [profile, setProfile] = useState<ContactProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function apply() {
      const raw = readPayload();
      if (!raw) {
        setError(
          "Missing card data. Open a full Kard link from a QR or shared URL.",
        );
        setProfile(null);
        setLoading(false);
        return;
      }
      const decoded = decodeProfile(raw);
      if (!decoded) {
        setError(
          "This link is invalid or corrupted. Ask for a fresh QR or link.",
        );
        setProfile(null);
        setLoading(false);
        return;
      }
      setError(null);
      setProfile(decoded);
      setLoading(false);
    }

    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-muted" />
        <p className="mt-6 text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-lg leading-relaxed text-[var(--destructive-foreground)]">
          {error}
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover"
        >
          Create your Kard
        </Link>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:py-16">
      <ContactCard profile={profile} variant="share" />
      <p className="mt-10 text-center text-sm text-muted-foreground">
        Want your own?{" "}
        <Link
          href="/"
          className="text-accent underline-offset-4 hover:text-accent-hover hover:underline"
        >
          Make a Kard
        </Link>
      </p>
    </div>
  );
}
