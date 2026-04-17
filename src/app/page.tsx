import { HomeClient } from "./home-client";

export default function Home() {
  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      <div
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(13,148,136,0.09),transparent_55%),radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(120,113,108,0.07),transparent_50%),var(--background)]"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04] [background-image:url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')]"
        aria-hidden
      />
      <div className="relative z-10 flex flex-1 flex-col">
        <HomeClient />
      </div>
    </div>
  );
}
