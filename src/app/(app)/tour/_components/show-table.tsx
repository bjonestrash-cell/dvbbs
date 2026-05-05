"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { StatusBracket, STATUS_TONE } from "@/components/ui/status-bracket";
import {
  formatCapacity,
  formatDate,
  formatMoney,
} from "@/lib/format";
import type { Show, ShowStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils/cn";

const STATUS_LABEL: Record<ShowStatus, string> = {
  lead: "Lead",
  offered: "Offered",
  holding: "Holding",
  confirmed: "Confirmed",
  contracted: "Contracted",
  completed: "Completed",
  cancelled: "Cancelled",
};

function titleCase(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/(^|\s|-)([a-z])/g, (_, sep, ch) => `${sep}${ch.toUpperCase()}`)
    .replace(/\bTbd\b/g, "TBD");
}

export function ShowTable({
  groups,
  empty,
}: {
  groups: Map<ShowStatus, Show[]>;
  empty: React.ReactNode;
}) {
  const entries = Array.from(groups.entries()).filter(([, s]) => s.length > 0);
  if (entries.length === 0) return <>{empty}</>;

  return (
    <div className="px-6 md:px-10 pt-2 pb-10 flex flex-col gap-10">
      {entries.map(([status, shows]) => (
        <SortableGroup
          key={status}
          status={status}
          initialShows={shows}
        />
      ))}
    </div>
  );
}

function SortableGroup({
  status,
  initialShows,
}: {
  status: ShowStatus;
  initialShows: Show[];
}) {
  const [shows, setShows] = useState<Show[]>(initialShows);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`dvbbs.tour.showOrder.${status}`);
      if (raw) {
        const ids = JSON.parse(raw) as string[];
        const byId = new Map(initialShows.map((s) => [s.id, s]));
        const ordered = ids
          .map((id) => byId.get(id))
          .filter((s): s is Show => Boolean(s));
        const remaining = initialShows.filter((s) => !ids.includes(s.id));
        setShows([...ordered, ...remaining]);
        return;
      }
    } catch {
      // ignore
    }
    setShows(initialShows);
  }, [status, initialShows]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = shows.findIndex((s) => s.id === active.id);
    const newIdx = shows.findIndex((s) => s.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(shows, oldIdx, newIdx);
    setShows(next);
    try {
      localStorage.setItem(
        `dvbbs.tour.showOrder.${status}`,
        JSON.stringify(next.map((s) => s.id)),
      );
    } catch {
      // ignore
    }
  }

  return (
    <section>
      <header className="flex items-baseline gap-2 pb-4">
        <h2 className="font-display text-[18px] text-fg" style={{ fontWeight: 500 }}>
          {STATUS_LABEL[status]}
        </h2>
        <span className="opacity-50 font-mono text-[11px]">·</span>
        <span className="num font-mono text-[11px] tracking-[0.06em] text-fg-faint">
          {shows.length.toString().padStart(2, "0")}
        </span>
      </header>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={shows.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col gap-2">
            {shows.map((s) => (
              <SortableShowCard key={s.id} show={s} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </section>
  );
}

function SortableShowCard({ show }: { show: Show }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: show.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(
      transform
        ? { ...transform, y: (transform.y ?? 0) - (isDragging ? 4 : 0) }
        : null,
    ),
    transition,
    opacity: isDragging ? 0.95 : 1,
    zIndex: isDragging ? 20 : 1,
    boxShadow: isDragging
      ? "0 4px 12px rgba(26,22,18,0.06)"
      : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative bg-surface border border-line group",
        "hover:border-line-strong hover:shadow-[0_4px_12px_rgba(26,22,18,0.04)] [transition-duration:80ms]",
      )}
    >
      <button
        {...attributes}
        {...listeners}
        type="button"
        aria-label="Reorder show"
        className={cn(
          "absolute left-1 top-1/2 -translate-y-1/2 grid place-items-center text-fg-faint",
          "size-9 md:size-6",
          // Visible on touch (no hover support), fades in on hover for desktop.
          "opacity-60 md:opacity-30 group-hover:opacity-100 hover:text-fg-dim [transition-duration:80ms]",
          "cursor-grab active:cursor-grabbing touch-none",
        )}
      >
        <GripVertical className="size-4 md:size-3.5" strokeWidth={1.5} aria-hidden />
      </button>
      <Link
        href={`/tour/${show.id}`}
        className="grid grid-cols-[minmax(0,1fr)_auto] sm:grid-cols-[100px_minmax(0,3fr)_36px_minmax(0,1fr)_minmax(0,1.2fr)_auto] items-center gap-3 sm:gap-4 pl-11 pr-3 py-3 sm:pl-10 sm:pr-4 sm:py-4"
      >
        <span className="num font-mono text-[12px] text-fg-dim hidden sm:inline">
          {formatDate(show.show_date)}
        </span>
        <span className="min-w-0">
          <span className="num font-mono text-[11px] text-fg-faint sm:hidden block">
            {formatDate(show.show_date)}
            {show.country ? (
              <span className="ml-2 uppercase tracking-[0.1em] text-fg-faint">
                {show.country.toUpperCase()}
              </span>
            ) : null}
          </span>
          <span className="block truncate font-sans text-[15px] font-medium text-fg">
            {titleCase(show.city) || "TBD"}
          </span>
          <span className="block truncate font-sans text-[13px] text-fg-dim">
            {titleCase(show.venue_name) || "Venue TBD"}
          </span>
          <span className="sm:hidden mt-1 num font-mono text-[11px] text-fg-faint flex flex-wrap gap-x-3">
            {show.capacity ? <span>{formatCapacity(show.capacity)}</span> : null}
            {(() => {
              const money = formatMoney(
                show.fee_confirmed ?? show.fee_offered,
                show.currency,
              );
              return money ? <span>{money}</span> : null;
            })()}
          </span>
        </span>
        <span className="hidden sm:inline font-mono text-[11px] uppercase tracking-[0.1em] text-fg-faint">
          {(show.country ?? "").toUpperCase()}
        </span>
        <span className="hidden sm:inline num font-mono text-[12px] text-fg-dim text-right">
          {show.capacity ? formatCapacity(show.capacity) : ""}
        </span>
        <span className="hidden sm:inline num font-mono text-[12px] text-fg-dim text-right">
          {formatMoney(show.fee_confirmed ?? show.fee_offered, show.currency)}
        </span>
        <span className="flex items-center justify-end shrink-0 min-w-[80px] sm:min-w-[110px]">
          <StatusBracket tone={STATUS_TONE[show.status] ?? "default"}>
            <span className="hidden sm:inline">{STATUS_LABEL[show.status]}</span>
            <span className="sm:hidden">
              {STATUS_LABEL[show.status].slice(0, 4)}
            </span>
          </StatusBracket>
        </span>
      </Link>
    </li>
  );
}
