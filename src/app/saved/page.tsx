import type { Metadata } from "next";
import { SavedClient } from "./saved-client";

export const metadata: Metadata = {
  title: "Saved Kards · Kard",
  description: "Kards you saved in this browser, with notes.",
};

export default function SavedPage() {
  return <SavedClient />;
}
