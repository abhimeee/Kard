import { ThemeToggle } from "@/components/theme-toggle";

export default function CardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-full flex-1 flex flex-col">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,var(--glow-accent),transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_50%,var(--glow-neutral),transparent_50%),var(--background)]"
        aria-hidden
      />
      <div className="pointer-events-none fixed right-4 top-4 z-30 sm:right-6 sm:top-6">
        <div className="pointer-events-auto">
          <ThemeToggle />
        </div>
      </div>
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
