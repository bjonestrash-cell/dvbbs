import Link from "next/link";
import { Disc3 } from "lucide-react";
import {
  RELEASE_STATUS_LABEL,
  RELEASE_STATUS_ORDER,
} from "@/lib/data/releases";
import { StatusBracket, STATUS_TONE } from "@/components/ui/status-bracket";
import type { Release } from "@/lib/supabase/types";
import { formatDateCompact, formatYear } from "@/lib/format";

const TYPE_LABEL: Record<Release["type"], string> = {
  single: "Single",
  ep: "EP",
  album: "Album",
  remix: "Remix",
  edit: "Edit",
  bootleg: "Bootleg",
};

export function ReleaseBoard({
  groups,
}: {
  groups: Map<Release["status"], Release[]>;
}) {
  return (
    <div className="overflow-x-auto px-6 md:px-10 py-8">
      <div className="flex min-w-max gap-px bg-line">
        {RELEASE_STATUS_ORDER.map((status) => {
          const items = groups.get(status) ?? [];
          return (
            <section
              key={status}
              className="w-72 shrink-0 bg-page flex flex-col"
            >
              <header className="px-2 pb-3 mb-1">
                <div className="flex items-baseline gap-1.5">
                  <h2 className="font-display text-[18px] text-fg">
                    {RELEASE_STATUS_LABEL[status]}
                  </h2>
                  <span className="opacity-50 font-mono text-[11px]">·</span>
                  <span className="num font-mono text-[11px] tracking-[0.06em] text-fg-faint">
                    {items.length.toString().padStart(2, "0")}
                  </span>
                </div>
              </header>
              <ul className="flex flex-col gap-2">
                {items.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/releases/${r.slug}`}
                      className="block bg-surface border-b border-line p-4 hover:shadow-[0_4px_12px_rgba(26,22,18,0.04)] [transition-duration:80ms]"
                    >
                      <CoverArt url={r.cover_art_url} title={r.title} />
                      <div className="mt-3">
                        <h3 className="font-display text-[16px] text-fg leading-[1.15] line-clamp-2">
                          {sentenceCase(r.title)}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-fg-dim">
                          <span className="font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint">
                            {TYPE_LABEL[r.type]}
                          </span>
                          <span className="opacity-50">·</span>
                          <StatusBracket
                            tone={STATUS_TONE[r.status] ?? "default"}
                          >
                            {RELEASE_STATUS_LABEL[r.status]}
                          </StatusBracket>
                        </div>
                        <div className="mt-1 num font-mono text-[11px] text-fg-dim">
                          {r.release_date
                            ? r.status === "released"
                              ? formatYear(r.release_date)
                              : formatDateCompact(r.release_date)
                            : "Date TBD"}
                        </div>
                        {r.collaborators?.length ? (
                          <div className="mt-1 font-sans text-[12px] text-fg-faint truncate">
                            with {r.collaborators.join(", ")}
                          </div>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                ))}
                {items.length === 0 ? (
                  <li className="bg-page py-12 text-center font-sans text-[13px] text-fg-faint">
                    Nothing scheduled
                  </li>
                ) : null}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function CoverArt({
  url,
  title,
}: {
  url: string | null;
  title: string;
}) {
  if (!url) {
    return (
      <div className="aspect-square grid place-items-center bg-surface-2">
        <Disc3
          className="size-8 text-fg-faint"
          strokeWidth={1.5}
          aria-hidden
        />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={url}
      alt={`${title} cover art`}
      className="aspect-square w-full object-cover"
    />
  );
}

function sentenceCase(s: string): string {
  if (!s) return s;
  return s
    .toLowerCase()
    .replace(/(^|\s|\(|-)([a-z])/g, (_, sep, ch) => `${sep}${ch.toUpperCase()}`);
}
