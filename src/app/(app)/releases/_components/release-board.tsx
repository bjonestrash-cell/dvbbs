import Link from "next/link";
import { Disc3 } from "lucide-react";
import {
  RELEASE_STATUS_LABEL,
  RELEASE_STATUS_ORDER,
} from "@/lib/data/releases";
import type { Release } from "@/lib/supabase/types";
import { formatYear, formatDateShort } from "@/lib/format";

const TYPE_LABEL: Record<Release["type"], string> = {
  single: "single",
  ep: "EP",
  album: "album",
  remix: "remix",
  edit: "edit",
  bootleg: "bootleg",
};

export function ReleaseBoard({
  groups,
}: {
  groups: Map<Release["status"], Release[]>;
}) {
  return (
    <div className="overflow-x-auto px-4 md:px-6 py-4">
      <div className="flex gap-2 min-w-max">
        {RELEASE_STATUS_ORDER.map((status) => {
          const items = groups.get(status) ?? [];
          return (
            <section
              key={status}
              className="w-72 shrink-0 rounded-md border border-line bg-bg-surface flex flex-col"
            >
              <header className="flex items-center justify-between border-b border-line px-3 py-2">
                <span className="marker">{RELEASE_STATUS_LABEL[status]}</span>
                <span className="text-fg-dim text-xs num">
                  {items.length}
                </span>
              </header>
              <ul className="flex flex-col gap-1.5 p-2 min-h-32">
                {items.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/releases/${r.slug}`}
                      className="block rounded-md border border-line bg-bg-input p-2.5 transition-colors hover:border-line-strong"
                    >
                      <div className="flex items-start gap-2.5">
                        <CoverArt url={r.cover_art_url} title={r.title} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm text-fg truncate">
                            {r.title}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-fg-muted">
                            <span className="marker">{TYPE_LABEL[r.type]}</span>
                            {r.release_date ? (
                              <span className="num">
                                {r.status === "released"
                                  ? formatYear(r.release_date)
                                  : formatDateShort(r.release_date)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
                {items.length === 0 ? (
                  <li className="px-2 py-3 text-xs text-fg-dim text-center">
                    Empty
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
      <div className="size-10 shrink-0 grid place-items-center rounded-sm bg-bg-elev border border-line">
        <Disc3 className="size-4 text-fg-dim" aria-hidden />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={url}
      alt={`${title} cover art`}
      className="size-10 shrink-0 rounded-sm border border-line object-cover"
    />
  );
}
