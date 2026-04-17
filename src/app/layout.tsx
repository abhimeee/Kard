import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";

const display = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kard — QR contact card",
  description:
    "One-scan contact sharing. Build your Kard, show a QR on your lock screen — no app install.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground">
        <div className="flex min-h-full flex-1 flex-col">{children}</div>
        <footer className="relative z-10 shrink-0 border-t border-border py-5 text-center text-xs text-muted-foreground">
          <p>
            Built by{" "}
            <a
              href="https://x.com/abhimeeofficial"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline-offset-2 transition-colors hover:text-accent-hover"
            >
              @abhimeeofficial&apos;s
            </a>{" "}
            · AI agent
          </p>
        </footer>
      </body>
    </html>
  );
}
