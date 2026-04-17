export default function CardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-full flex-1 flex flex-col">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(13,148,136,0.08),transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(120,113,108,0.06),transparent_50%),var(--background)]"
        aria-hidden
      />
      <div className="relative z-10 flex flex-1 flex-col">{children}</div>
    </div>
  );
}
