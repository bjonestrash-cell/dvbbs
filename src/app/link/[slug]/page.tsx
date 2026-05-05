import { notFound } from "next/navigation";
import { Geist, Inter, Geist_Mono } from "next/font/google";
import { ArrowRight, Disc3 } from "lucide-react";
import { getSmartLink, PLATFORM_LABEL } from "@/lib/data/smart-links";
import { Logo } from "@/components/brand/logo";
import { formatDateCompact } from "@/lib/format";
import { getReleaseBySlug } from "@/lib/data/releases";
import "../../globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});
const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const link = await getSmartLink(slug);
  if (!link) {
    return {
      title: "DVBBS",
      description: "Pick where to listen.",
    };
  }
  return {
    title: link.title ? `${link.title}. DVBBS` : "DVBBS",
    description: "Pick where to listen.",
    openGraph: {
      title: link.title ?? "DVBBS",
      description: "Pick where to listen.",
    },
  };
}

const ORDER: (keyof typeof PLATFORM_LABEL)[] = [
  "spotify",
  "apple",
  "soundcloud",
  "youtube",
  "beatport",
];

export default async function PublicSmartLinkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const link = await getSmartLink(slug);
  if (!link) notFound();

  const release = link.release_id
    ? await getReleaseBySlug(
        // we have id, not slug; resolve via separate path. Skip if no id->slug path.
        await resolveReleaseSlugFromId(link.release_id),
      )
    : null;

  const dests = link.destinations as Record<string, string>;
  const platforms = ORDER.filter((p) => dests[p]);
  const title = link.title ?? release?.title ?? slug;

  return (
    <html
      lang="en"
      className={`${geist.variable} ${inter.variable} ${mono.variable} h-full`}
    >
      <body className="min-h-dvh bg-page text-fg flex">
        <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col items-center justify-center px-6 py-12 sm:py-16 text-center">
          <Logo size="md" />

          <div className="mt-10 sm:mt-14 mb-7">
            <Cover title={title} url={release?.cover_art_url ?? null} />
          </div>

          <h1
            className="display-title text-fg"
            style={{
              fontSize: "clamp(28px, 6vw, 36px)",
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: "-0.025em",
            }}
          >
            {title}
          </h1>
          {release?.release_date ? (
            <p className="mt-3 font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint">
              Released {formatDateCompact(release.release_date)}
            </p>
          ) : null}

          <ul className="mt-10 sm:mt-12 flex w-full flex-col gap-2">
            {platforms.map((p) => (
              <li key={p}>
                <a
                  href={`/link/${slug}/go?p=${encodeURIComponent(p)}`}
                  className="group flex h-14 items-center justify-between bg-surface border border-line px-5 hover:border-inverted hover:bg-inverted hover:text-fg-inverted [transition-duration:80ms]"
                >
                  <span className="font-sans text-[15px] font-medium">
                    {PLATFORM_LABEL[p]}
                  </span>
                  <ArrowRight
                    className="size-4 text-fg-faint group-hover:text-fg-inverted [transition-duration:80ms]"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </a>
              </li>
            ))}
          </ul>

          <p className="mt-12 sm:mt-14 font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint">
            DVBBS
            <span className="opacity-50 mx-1.5">·</span>
            dvbbs.com
          </p>
        </main>
      </body>
    </html>
  );
}

function Cover({
  url,
  title,
}: {
  url: string | null;
  title: string;
}) {
  if (!url) {
    return (
      <div className="size-[260px] sm:size-[300px] grid place-items-center bg-surface border border-line">
        <Disc3 className="size-12 text-fg-faint" strokeWidth={1.5} aria-hidden />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={url}
      alt={`${title} cover art`}
      className="size-[260px] sm:size-[300px] object-cover border border-line"
    />
  );
}

/** Look up release.slug by release.id by reading the smart_link join, server-only. */
async function resolveReleaseSlugFromId(id: string): Promise<string> {
  const { createClient } = await import("@/lib/supabase/server");
  const supabase = await createClient();
  const { data } = await supabase
    .from("releases")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  return (data as { slug: string } | null)?.slug ?? "";
}
