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
    <div className="flex items-center gap-1.5">
      {ITEMS.map((item) => {
        const url = release[item.key] as string | null;
        const active = !!url;
        const cls = cn(
          "size-9 grid place-items-center rounded-full border font-mono text-[10px] tracking-[0.06em] uppercase [transition-duration:80ms]",
          active
            ? "border-line bg-surface text-fg-dim hover:border-line-strong hover:text-fg"
            : "border-line text-fg-faint opacity-30",
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
