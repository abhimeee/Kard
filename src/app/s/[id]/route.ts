import type { NextRequest } from "next/server";
import { lookupShortLink } from "@/lib/short-links";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const encoded = lookupShortLink(id);
  if (!encoded) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="robots" content="noindex"/>
<title>Kard</title>
</head>
<body style="font-family:system-ui,sans-serif;padding:2rem;text-align:center;color:#444">
<p>This short link has expired or does not exist.</p>
</body>
</html>`;
    return new Response(html, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const target = `/c#${encoded}`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="robots" content="noindex"/>
<title>Kard</title>
</head>
<body style="font-family:system-ui,sans-serif;padding:2rem;text-align:center;color:#444">
<p>Opening your Kard…</p>
<p><a href="${escapeHtmlAttr(target)}">Continue</a></p>
<script>location.replace(${JSON.stringify(target)});</script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

function escapeHtmlAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}
