import Link from "next/link";
import { Disc3 } from "lucide-react";
import {
  RELEASE_STATUS_LABEL,
  RELEASE_STATUS_ORDER,
} from "@/lib/data/releases";
import type { Release } from "@/lib/supabase/types";
import { formatDateCompact, formatYear } from "@/lib/format";

const TYPE_LABEL: Record<Release["type"], string> = {
  single: "SINGLE",
  ep: "EP",
  album: "ALBUM",
  remix: "REMIX",
  edit: "EDIT",
  bootleg: "BOOTLEG",
};

export function ReleaseBoard({
  groups,
}: {
  groups: Map<Release["status"], Release[]>;
}) {
  return (
    <div className="overflow-x-auto px-4 md:px-6 py-4">
      <div className="flex min-w-max divide-x divide-line border border-line">
        {RELEASE_STATUS_ORDER.map((status) => {
          const items = groups.get(status) ?? [];
          return (
            <section
              key={status}
              className="w-72 shrink-0 bg-page flex flex-col"
            >
              <header className="flex items-center justify-between border-b border-line px-3 py-2.5">
                <span className="bracket-text font-mono text-fg">
                  <span className="opacity-60">[ </span>
                  {RELEASE_STATUS_LABEL[status].toUpperCase()}
                  <span className="opacity-60"> ]</span>
                </span>
                <span className="num text-[11px] text-fg-faint">
                  {items.length.toString().padStart(2, "0")}
                </span>
              </header>
              <ul className="flex flex-col gap-px bg-line">
                {items.map((r) => (
                  <li key={r.id} className="bg-page">
                    <Link
                      href={`/releases/${r.slug}`}
                      className="block p-3 hover:bg-surface [transition-duration:80ms]"
                    >
                      <CoverArt url={r.cover_art_url} title={r.title} />
                      <div className="mt-3">
                        <h3
                          className="font-display uppercase text-fg leading-[0.95] tracking-[-0.02em] line-clamp-2"
                          style={{ fontSize: 18 }}
                        >
                          {r.title}
                        </h3>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="bracket-text font-mono text-fg-dim">
                            <span className="opacity-60">[</span>
                            {TYPE_LABEL[r.type]}
                            <span className="opacity-60">]</span>
                          </span>
                          <span className="text-fg-faint">·</span>
                          <span className="num text-[11px] text-fg-dim">
                            {r.release_date
                              ? r.status === "released"
                                ? formatYear(r.release_date)
                                : formatDateCompact(r.release_date)
                              : "TBD"}
                          </span>
                        </div>
                        {r.collaborators?.length ? (
                          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.06em] text-fg-faint truncate">
                            WITH {r.collaborators.join(", ")}
                          </div>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                ))}
                {items.length === 0 ? (
                  <li className="bg-page py-6 text-center font-mono uppercase tracking-[0.12em] text-[10px] text-fg-faint opacity-60">
                    {"// EMPTY"}
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
      <div className="aspect-square grid place-items-center bg-surface-2 border border-line">
        <Disc3 className="size-8 text-fg-faint" aria-hidden />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={url}
      alt={`${title} cover art`}
      className="aspect-square w-full object-cover border border-line"
    />
  );
}
