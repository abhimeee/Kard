"use client";

import {
  useCallback,
  useRef,
  useState,
  type DragEvent,
  type MutableRefObject,
} from "react";
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

function reorderLinks(
  links: ContactLink[],
  from: number,
  to: number,
): ContactLink[] {
  if (from === to) return links;
  const next = [...links];
  const [row] = next.splice(from, 1);
  next.splice(to, 0, row);
  return next;
}

function DragHandle({
  label,
  index,
  dragFromRef,
  onDragEnd,
}: {
  label: string;
  index: number;
  dragFromRef: MutableRefObject<number | null>;
  onDragEnd: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        dragFromRef.current = index;
        e.dataTransfer.effectAllowed = "move";
        try {
          e.dataTransfer.setData("text/plain", String(index));
        } catch {
          /* ignore */
        }
      }}
      onDragEnd={() => {
        dragFromRef.current = null;
        onDragEnd();
      }}
      className="mt-0.5 flex shrink-0 cursor-grab select-none flex-col items-center justify-center gap-0.5 rounded-lg border border-transparent px-1 py-2 text-muted-foreground hover:border-border hover:text-foreground active:cursor-grabbing"
      aria-label={`Reorder ${label}`}
      title="Drag to reorder"
    >
      <div className="flex gap-0.5" aria-hidden>
        <div className="flex flex-col gap-0.5">
          <span className="h-1 w-1 rounded-full bg-current" />
          <span className="h-1 w-1 rounded-full bg-current" />
          <span className="h-1 w-1 rounded-full bg-current" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="h-1 w-1 rounded-full bg-current" />
          <span className="h-1 w-1 rounded-full bg-current" />
          <span className="h-1 w-1 rounded-full bg-current" />
        </div>
      </div>
    </div>
  );
}

export function ContactEditor({
  value,
  onChange,
}: {
  value: ContactProfile;
  onChange: (p: ContactProfile) => void;
}) {
  const dragFrom = useRef<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);

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

  const onDragOverRow = (e: DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(index);
  };

  const onDropRow = (e: DragEvent, index: number) => {
    e.preventDefault();
    setDropTarget(null);
    const from = dragFrom.current;
    dragFrom.current = null;
    if (from === null || from === index) return;
    update({ ...value, links: reorderLinks(value.links, from, index) });
  };

  const clearDropTarget = () => setDropTarget(null);

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
          Drag the grip to reorder how links appear on your Kard.
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
                  className={`flex gap-3 rounded-xl border border-border bg-muted p-4 transition-shadow ${
                    dropTarget === i ? "ring-2 ring-accent/25" : ""
                  }`}
                  onDragOver={(e) => onDragOverRow(e, i)}
                  onDrop={(e) => onDropRow(e, i)}
                  onDragLeave={clearDropTarget}
                >
                  <DragHandle
                    label={link.label}
                    index={i}
                    dragFromRef={dragFrom}
                    onDragEnd={clearDropTarget}
                  />
                  <div className="min-w-0 flex-1">
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
                  </div>
                </li>
              );
            }

            return (
              <li
                key={i}
                className={`flex gap-2 rounded-xl border border-border bg-muted p-3 transition-shadow ${
                  dropTarget === i ? "ring-2 ring-accent/25" : ""
                }`}
                onDragOver={(e) => onDragOverRow(e, i)}
                onDrop={(e) => onDropRow(e, i)}
                onDragLeave={clearDropTarget}
              >
                <DragHandle
                  label={link.label || "link"}
                  index={i}
                  dragFromRef={dragFrom}
                  onDragEnd={clearDropTarget}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
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
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
