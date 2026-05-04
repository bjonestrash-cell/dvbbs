import { cn } from "@/lib/utils/cn";
import type { Release } from "@/lib/supabase/types";

const ITEMS: { key: keyof Release; label: string; name: string }[] = [
  { key: "spotify_url", label: "S", name: "Spotify" },
  { key: "apple_url", label: "A", name: "Apple Music" },
  { key: "soundcloud_url", label: "SC", name: "SoundCloud" },
  { key: "youtube_url", label: "YT", name: "YouTube" },
  { key: "beatport_url", label: "B", name: "Beatport" },
];

export function StreamingIcons({ release }: { release: Release }) {
  return (
    <div className="flex items-center gap-1">
      {ITEMS.map((item) => {
        const url = release[item.key] as string | null;
        const active = !!url;
        const cls = cn(
          "size-7 grid place-items-center border font-mono uppercase text-[10px] tracking-[0.06em] [transition-duration:80ms]",
          active
            ? "border-line text-fg hover:border-fg hover:bg-fg hover:text-page"
            : "border-line text-fg-faint opacity-50",
        );
        if (active) {
          return (
            <a
              key={item.key}
              href={url ?? undefined}
              target="_blank"
              rel="noreferrer noopener"
              title={item.name}
              className={cls}
            >
              {item.label}
            </a>
          );
        }
        return (
          <span key={item.key} title={item.name} className={cls}>
            {item.label}
          </span>
        );
      })}
    </div>
  );
}
