import type { Metadata } from "next";
import { CardView } from "./card-view";

export const metadata: Metadata = {
  title: "Contact card · Kard",
  description: "Open links from a Kard QR — no app required.",
};

export default function CardPage() {
  return <CardView />;
}
