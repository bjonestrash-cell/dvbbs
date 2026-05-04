import { notFound } from "next/navigation";
import { Inter, Geist, Geist_Mono } from "next/font/google";
import { Disc3 } from "lucide-react";
import { getSmartLink, PLATFORM_LABEL } from "@/lib/data/smart-links";
import "../../globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const link = await getSmartLink(slug);
  return {
    title: link?.title ? `${link.title}, DVBBS` : "DVBBS",
    description: "Pick where to listen.",
  };
}

const PLATFORM_ICONS: Record<string, string> = {
  spotify: "Spotify",
  apple: "Apple Music",
  soundcloud: "SoundCloud",
  youtube: "YouTube",
  beatport: "Beatport",
};

export default async function PublicSmartLinkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const link = await getSmartLink(slug);
  if (!link) notFound();

  const dests = link.destinations as Record<string, string>;
  const platforms = Object.keys(dests);

  return (
    <html
      lang="en"
      className={`${inter.variable} ${geist.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh bg-bg-base text-fg flex">
        <div className="grain min-h-dvh w-full">
          <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 py-12">
            <div className="flex items-center gap-2 mb-10">
              <ChevronMark className="size-6 text-accent" />
              <div className="font-display text-sm tracking-tight">
                <span className="font-semibold">DVBBS</span>
              </div>
            </div>

            <div className="size-32 grid place-items-center rounded-md border border-line bg-bg-surface mb-6">
              <Disc3 className="size-10 text-fg-muted" aria-hidden />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-center">
              {link.title ?? slug}
            </h1>
            <p className="text-sm text-fg-muted mb-8 mt-1">Pick where to listen</p>

            <ul className="flex flex-col gap-2 w-full">
              {platforms.map((p) => (
                <li key={p}>
                  <a
                    href={`/link/${slug}/go?p=${encodeURIComponent(p)}`}
                    className="flex h-12 items-center justify-between rounded-md border border-line bg-bg-surface px-4 transition-colors hover:border-line-strong hover:bg-bg-elev"
                  >
                    <span className="text-sm font-medium">
                      {PLATFORM_LABEL[p as keyof typeof PLATFORM_LABEL] ??
                        PLATFORM_ICONS[p] ??
                        p}
                    </span>
                    <span className="marker text-fg-dim">play</span>
                  </a>
                </li>
              ))}
            </ul>

            <p className="mt-10 text-[10px] text-fg-dim uppercase tracking-wide">
              powered by DVBBS HQ
            </p>
          </main>
        </div>
      </body>
    </html>
  );
}

function ChevronMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className}>
      <path d="M3 6L12 15L21 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" />
      <path d="M3 14L12 23L21 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="square" opacity="0.5" />
    </svg>
  );
}
