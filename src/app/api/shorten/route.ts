import { NextRequest, NextResponse } from "next/server";
import { registerShortLink } from "@/lib/short-links";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const encoded =
    body &&
    typeof body === "object" &&
    typeof (body as { encoded?: unknown }).encoded === "string"
      ? (body as { encoded: string }).encoded
      : "";

  const id = registerShortLink(encoded);
  if (!id) {
    return NextResponse.json(
      { error: "Invalid or unsupported profile payload." },
      { status: 400 },
    );
  }

  const origin = new URL(req.url).origin;
  const shortUrl = `${origin}/s/${id}`;
  return NextResponse.json({ shortUrl });
}
