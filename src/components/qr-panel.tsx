"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import type { ContactProfile } from "@/lib/profile";
import {
  MAX_ENCODED_CHARS,
  buildCardUrl,
  encodeProfile,
} from "@/lib/codec";

type Build =
  | {
      ok: true;
      error: null;
      encoded: string;
      fullUrl: string;
    }
  | {
      ok: false;
      error: string | null;
      encoded: string;
      fullUrl: string;
    };

export function QrPanel({ profile }: { profile: ContactProfile }) {
  const [qr, setQr] = useState<{ encoded: string; dataUrl: string } | null>(
    null,
  );
  const [copied, setCopied] = useState(false);
  const [canNativeShare] = useState(
    () => typeof navigator !== "undefined" && !!navigator.share,
  );

  const build: Build = useMemo(() => {
    const nameOk = profile.name.trim().length > 0;
    const linksOk = profile.links.some((l) => l.url.trim());
    if (!nameOk || !linksOk) {
      return {
        ok: false,
        error: null,
        encoded: "",
        fullUrl: "",
      };
    }
    let encoded: string;
    try {
      encoded = encodeProfile(profile);
    } catch {
      return {
        ok: false,
        error: "Could not encode profile.",
        encoded: "",
        fullUrl: "",
      };
    }
    if (encoded.length > MAX_ENCODED_CHARS) {
      return {
        ok: false,
        error:
          "Profile is too large for a reliable QR code. Remove a link or shorten text.",
        encoded: "",
        fullUrl: "",
      };
    }
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const fullUrl = buildCardUrl(origin, encoded);
    return { ok: true, error: null, encoded, fullUrl };
  }, [profile]);

  const encoded = build.ok ? build.encoded : "";
  const cardUrl = build.ok ? build.fullUrl : "";

  useEffect(() => {
    if (!encoded || !cardUrl) return;

    let cancelled = false;

    QRCode.toDataURL(cardUrl, {
      width: 520,
      margin: 2,
      errorCorrectionLevel: "M",
      color: { dark: "#1c1917", light: "#ffffff" },
    }).then((dataUrl) => {
      if (!cancelled) setQr({ encoded, dataUrl });
    });

    return () => {
      cancelled = true;
    };
  }, [encoded, cardUrl]);

  const displayUrl =
    build.ok && qr?.encoded === build.encoded ? qr.dataUrl : null;
  const fullUrl = build.ok ? build.fullUrl : "";
  const error = build.error;

  const copyLink = async () => {
    if (!fullUrl) return;
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const shareLink = async () => {
    if (!fullUrl || !canNativeShare) return;
    const title = profile.name.trim()
      ? `${profile.name.trim()}'s Kard`
      : "My Kard";
    try {
      await navigator.share({
        title,
        text: "Here’s my contact card — open the link.",
        url: fullUrl,
      });
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "AbortError") return;
      await copyLink();
    }
  };

  const downloadPng = () => {
    if (!displayUrl) return;
    const a = document.createElement("a");
    a.href = displayUrl;
    a.download = "kard-qr.png";
    a.click();
  };

  const showPlaceholder =
    !profile.name.trim() || !profile.links.some((l) => l.url.trim());

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[0_1px_3px_rgba(28,25,23,0.04)] sm:p-8">
      <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
        Your QR
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Save the image to your camera roll and set it as your lock-screen wallpaper
        — one scan, no typing.
      </p>

      {error ? (
        <p className="mt-4 rounded-xl border border-[var(--destructive-border)] bg-[var(--destructive-bg)] px-4 py-3 text-sm text-[var(--destructive-foreground)]">
          {error}
        </p>
      ) : null}

      <div className="mt-6 flex flex-col items-center gap-6">
        <div className="rounded-2xl bg-white p-4 shadow-inner ring-1 ring-border">
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL from qrcode
            <img
              src={displayUrl}
              alt="QR code linking to your Kard"
              width={260}
              height={260}
              className="h-[260px] w-[260px]"
            />
          ) : (
            <div className="flex h-[260px] w-[260px] items-center justify-center bg-muted p-6 text-center text-sm text-muted-foreground">
              {showPlaceholder
                ? "Add your name and at least one link."
                : build.ok
                  ? "Generating…"
                  : "—"}
            </div>
          )}
        </div>

        <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:flex-wrap">
          {canNativeShare ? (
            <button
              type="button"
              onClick={shareLink}
              disabled={!fullUrl}
              className="flex-1 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[140px]"
            >
              Share…
            </button>
          ) : null}
          <button
            type="button"
            onClick={copyLink}
            disabled={!fullUrl}
            className={`flex-1 rounded-full px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[140px] ${
              canNativeShare
                ? "border border-border bg-card font-medium text-foreground hover:border-accent/40"
                : "bg-accent text-accent-foreground hover:bg-accent-hover"
            }`}
          >
            {copied ? "Copied" : "Copy link"}
          </button>
          <button
            type="button"
            onClick={downloadPng}
            disabled={!displayUrl}
            className="flex-1 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition hover:border-accent/40 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-[140px]"
          >
            Download PNG
          </button>
        </div>
      </div>
    </div>
  );
}
