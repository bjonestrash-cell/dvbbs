import { createClient } from "@/lib/supabase/server";
import { formatDistanceToNow, parseISO } from "date-fns";

type Row = {
  id: string;
  action: string;
  detail: Record<string, unknown> | null;
  created_at: string;
  team_members: { display_name: string | null; email: string } | null;
};

const LABELS: Record<string, string> = {
  "show.created": "Show created",
  "show.updated": "Edited show",
  "show.status_changed": "Changed status",
  "travel.added": "Travel leg added",
  "travel.updated": "Travel leg updated",
  "travel.removed": "Travel leg removed",
  "lodging.added": "Lodging added",
  "lodging.updated": "Lodging updated",
  "crew.added": "Crew member added",
  "crew.removed": "Crew member removed",
  "setlist.updated": "Setlist updated",
  "settlement.saved": "Settlement saved",
  "settlement.locked": "Settlement locked",
};

export async function ActivityFeed({ showId }: { showId: string }) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("show_activity")
    .select("id, action, detail, created_at, team_members(display_name, email)")
    .eq("show_id", showId)
    .order("created_at", { ascending: false })
    .limit(20);

  const rows = (data as Row[] | null) ?? [];

  if (rows.length === 0) {
    return (
      <p className="text-xs text-fg-dim">
        Nothing logged yet. Edits and status changes will appear here.
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-2">
      {rows.map((r) => {
        const who = r.team_members?.display_name ?? r.team_members?.email ?? "Someone";
        const label = LABELS[r.action] ?? r.action;
        let summary: string | null = null;
        if (r.action === "show.updated" && r.detail && "changes" in r.detail) {
          const keys = Object.keys(
            (r.detail.changes as Record<string, unknown>) ?? {},
          );
          if (keys.length > 0) summary = keys.join(", ");
        }
        if (r.action === "show.status_changed" && r.detail && "to" in r.detail) {
          summary = `to ${String(r.detail.to)}`;
        }

        return (
          <li
            key={r.id}
            className="flex items-baseline gap-2 text-sm border-l border-line pl-3"
          >
            <span className="num text-xs text-fg-dim min-w-[60px]">
              {formatDistanceToNow(parseISO(r.created_at), { addSuffix: true })}
            </span>
            <span className="text-fg">{who}</span>
            <span className="text-fg-muted">{label.toLowerCase()}</span>
            {summary ? (
              <span className="text-xs text-fg-muted truncate">. {summary}</span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
