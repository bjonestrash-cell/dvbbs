"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import {
  RELEASE_STATUS_LABEL,
  RELEASE_STATUS_ORDER,
} from "@/lib/data/release-shared";
import { FilterBracket } from "@/components/ui/status-bracket";
import type { Release, ReleaseStatus } from "@/lib/supabase/types";
import { cn } from "@/lib/utils/cn";
import { setReleaseStatus } from "../_actions/board";

const TYPE_LABEL: Record<Release["type"], string> = {
  single: "Single",
  ep: "EP",
  album: "Album",
  remix: "Remix",
  edit: "Edit",
  bootleg: "Bootleg",
};

/** Subtle background tint per status, layered over surface. Picks up the
 *  same status palette used by the StatusBracket dots so a glance at the
 *  board reads chromatically without being noisy. */
const STATUS_TINT: Record<ReleaseStatus, string> = {
  idea: "color-mix(in srgb, var(--color-lead) 8%, var(--color-surface))",
  in_production:
    "color-mix(in srgb, var(--color-holding) 10%, var(--color-surface))",
  mixing: "color-mix(in srgb, var(--color-offered) 10%, var(--color-surface))",
  mastered:
    "color-mix(in srgb, var(--color-holding) 16%, var(--color-surface))",
  delivered:
    "color-mix(in srgb, var(--color-approved) 14%, var(--color-surface))",
  scheduled:
    "color-mix(in srgb, var(--color-accent) 14%, var(--color-surface))",
  released:
    "color-mix(in srgb, var(--color-accent) 24%, var(--color-surface))",
  archived:
    "color-mix(in srgb, var(--color-completed) 14%, var(--color-surface))",
};

const STATUS_EDGE: Record<ReleaseStatus, string> = {
  idea: "var(--color-lead)",
  in_production: "var(--color-holding)",
  mixing: "var(--color-offered)",
  mastered: "var(--color-holding)",
  delivered: "var(--color-approved)",
  scheduled: "var(--color-accent)",
  released: "var(--color-accent)",
  archived: "var(--color-completed)",
};

const COLUMN_PREFIX = "col:";
function isColumnId(id: string): boolean {
  return id.startsWith(COLUMN_PREFIX);
}
function columnIdToStatus(id: string): ReleaseStatus {
  return id.slice(COLUMN_PREFIX.length) as ReleaseStatus;
}
function statusToColumnId(status: ReleaseStatus): string {
  return `${COLUMN_PREFIX}${status}`;
}

type Columns = Record<ReleaseStatus, Release[]>;

function buildInitial(releases: Release[]): Columns {
  const out = {} as Columns;
  for (const status of RELEASE_STATUS_ORDER) out[status] = [];
  for (const r of releases) {
    out[r.status].push(r);
  }
  return out;
}

function applyStoredOrder(cols: Columns): Columns {
  if (typeof window === "undefined") return cols;
  const next = { ...cols };
  for (const status of RELEASE_STATUS_ORDER) {
    try {
      const raw = localStorage.getItem(`dvbbs.releases.order.${status}`);
      if (!raw) continue;
      const ids = JSON.parse(raw) as string[];
      const byId = new Map(next[status].map((r) => [r.id, r]));
      const ordered = ids
        .map((id) => byId.get(id))
        .filter((r): r is Release => Boolean(r));
      const remaining = next[status].filter((r) => !ids.includes(r.id));
      next[status] = [...ordered, ...remaining];
    } catch {
      // ignore
    }
  }
  return next;
}

function persistOrder(status: ReleaseStatus, releases: Release[]) {
  try {
    localStorage.setItem(
      `dvbbs.releases.order.${status}`,
      JSON.stringify(releases.map((r) => r.id)),
    );
  } catch {
    // ignore
  }
}

function sentenceCase(s: string): string {
  if (!s) return s;
  return s
    .toLowerCase()
    .replace(/(^|\s|\(|-)([a-z])/g, (_, sep, ch) => `${sep}${ch.toUpperCase()}`);
}

export function ReleaseBoard({ releases }: { releases: Release[] }) {
  const [columns, setColumns] = useState<Columns>(() =>
    buildInitial(releases),
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ReleaseStatus | "all">("all");

  const serverStatus = useMemo(() => {
    const m = new Map<string, ReleaseStatus>();
    for (const r of releases) m.set(r.id, r.status);
    return m;
  }, [releases]);

  useEffect(() => {
    setColumns(applyStoredOrder(buildInitial(releases)));
  }, [releases]);

  const allReleases = useMemo(() => {
    const map = new Map<string, Release>();
    for (const status of RELEASE_STATUS_ORDER) {
      for (const r of columns[status]) map.set(r.id, r);
    }
    return map;
  }, [columns]);

  const activeRelease = activeId ? allReleases.get(activeId) ?? null : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function findStatusByCardId(cardId: string): ReleaseStatus | null {
    for (const status of RELEASE_STATUS_ORDER) {
      if (columns[status].some((r) => r.id === cardId)) return status;
    }
    return null;
  }

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    if (activeIdStr === overIdStr) return;

    const fromStatus = findStatusByCardId(activeIdStr);
    if (!fromStatus) return;

    const toStatus = isColumnId(overIdStr)
      ? columnIdToStatus(overIdStr)
      : findStatusByCardId(overIdStr);
    if (!toStatus || toStatus === fromStatus) return;

    setColumns((prev) => {
      const fromList = prev[fromStatus];
      const toList = prev[toStatus];
      const fromIdx = fromList.findIndex((r) => r.id === activeIdStr);
      if (fromIdx < 0) return prev;
      const moving = fromList[fromIdx];

      let insertIdx = toList.length;
      if (!isColumnId(overIdStr)) {
        const overIdx = toList.findIndex((r) => r.id === overIdStr);
        if (overIdx >= 0) insertIdx = overIdx;
      }

      const nextFrom = [
        ...fromList.slice(0, fromIdx),
        ...fromList.slice(fromIdx + 1),
      ];
      const nextTo = [
        ...toList.slice(0, insertIdx),
        { ...moving, status: toStatus },
        ...toList.slice(insertIdx),
      ];

      return { ...prev, [fromStatus]: nextFrom, [toStatus]: nextTo };
    });
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
    const toStatus = findStatusByCardId(activeIdStr);
    if (!toStatus) return;

    const list = columns[toStatus];
    const fromIdx = list.findIndex((r) => r.id === activeIdStr);

    let nextList = list;
    if (!isColumnId(overIdStr) && activeIdStr !== overIdStr) {
      const overIdx = list.findIndex((r) => r.id === overIdStr);
      if (fromIdx >= 0 && overIdx >= 0 && fromIdx !== overIdx) {
        nextList = arrayMove(list, fromIdx, overIdx);
        setColumns((prev) => ({ ...prev, [toStatus]: nextList }));
      }
    }

    persistOrder(toStatus, nextList);

    const original = serverStatus.get(activeIdStr);
    if (original && original !== toStatus) {
      void setReleaseStatus(activeIdStr, toStatus);
    }
  }

  const visibleStatuses =
    filter === "all" ? RELEASE_STATUS_ORDER : [filter];
  const focused = filter !== "all";

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      {/* Filter chips. "All" shows the kanban; tap a status to focus a single
          column at full width with a multi-column tile grid inside. */}
      <div className="px-6 md:px-10 pt-2 pb-4 flex flex-nowrap sm:flex-wrap gap-2 -mx-2 sm:mx-0 px-8 sm:px-10 overflow-x-auto sm:overflow-visible [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <FilterBracket
          active={filter === "all"}
          count={releases.length}
          onClick={() => setFilter("all")}
        >
          All
        </FilterBracket>
        {RELEASE_STATUS_ORDER.map((s) => {
          const count = columns[s].length;
          if (count === 0 && filter !== s) return null;
          return (
            <FilterBracket
              key={s}
              active={filter === s}
              count={count}
              onClick={() => setFilter(s)}
            >
              {RELEASE_STATUS_LABEL[s]}
            </FilterBracket>
          );
        })}
      </div>

      {focused ? (
        // Focus mode: one status, multi-column grid of tiles. Drag still
        // works for reordering inside this column.
        <div className="px-6 md:px-10 pb-10">
          <FocusedColumn
            status={visibleStatuses[0]}
            releases={columns[visibleStatuses[0]]}
            activeId={activeId}
          />
        </div>
      ) : (
        <div
          className="overflow-x-auto px-4 md:px-10 pb-10 snap-x snap-mandatory md:snap-none"
          style={{ scrollPaddingInline: "16px" }}
        >
          <div className="flex min-w-max gap-px bg-line">
            {RELEASE_STATUS_ORDER.map((status) => (
              <Column
                key={status}
                status={status}
                releases={columns[status]}
                activeId={activeId}
              />
            ))}
          </div>
        </div>
      )}
      <DragOverlay dropAnimation={null}>
        {activeRelease ? <CardPresentation release={activeRelease} dragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

function Column({
  status,
  releases,
  activeId,
}: {
  status: ReleaseStatus;
  releases: Release[];
  activeId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: statusToColumnId(status) });

  return (
    <section className="w-[78vw] max-w-[260px] md:w-60 shrink-0 bg-page flex flex-col snap-start md:snap-align-none">
      <header className="px-2 pb-2.5">
        <div className="flex items-baseline gap-1.5">
          <span
            className="inline-block size-1.5 rounded-full"
            style={{ background: STATUS_EDGE[status] }}
            aria-hidden
          />
          <h2
            className="font-display text-[15px] text-fg"
            style={{ fontWeight: 600, letterSpacing: "-0.005em" }}
          >
            {RELEASE_STATUS_LABEL[status]}
          </h2>
          <span className="num font-mono text-[11px] tracking-[0.06em] text-fg-faint">
            {releases.length.toString().padStart(2, "0")}
          </span>
        </div>
      </header>
      <SortableContext
        items={releases.map((r) => r.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul
          ref={setNodeRef}
          className={cn(
            "flex flex-col gap-1.5 min-h-[80px] px-1 pb-2 [transition-duration:80ms]",
            isOver ? "bg-surface-2/40" : "",
          )}
        >
          {releases.map((r) => (
            <SortableCard key={r.id} release={r} ghost={activeId === r.id} />
          ))}
          {releases.length === 0 ? (
            <li className="px-1 py-8 text-center font-sans text-[12px] text-fg-faint">
              Nothing here
            </li>
          ) : null}
        </ul>
      </SortableContext>
    </section>
  );
}

function FocusedColumn({
  status,
  releases,
  activeId,
}: {
  status: ReleaseStatus;
  releases: Release[];
  activeId: string | null;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: statusToColumnId(status) });

  return (
    <SortableContext
      items={releases.map((r) => r.id)}
      strategy={rectSortingStrategy}
    >
      <ul
        ref={setNodeRef}
        className={cn(
          "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 min-h-[120px] [transition-duration:80ms]",
          isOver ? "bg-surface-2/40" : "",
        )}
      >
        {releases.map((r) => (
          <SortableCard key={r.id} release={r} ghost={activeId === r.id} />
        ))}
        {releases.length === 0 ? (
          <li className="col-span-full px-1 py-12 text-center font-sans text-[13px] text-fg-faint">
            No releases in {RELEASE_STATUS_LABEL[status].toLowerCase()}.
          </li>
        ) : null}
      </ul>
    </SortableContext>
  );
}

function SortableCard({
  release,
  ghost,
}: {
  release: Release;
  ghost: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: release.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: ghost ? 0.35 : 1,
    zIndex: isDragging ? 20 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className="relative group">
      <CardSurface release={release}>
        <button
          {...attributes}
          {...listeners}
          type="button"
          aria-label="Reorder release"
          className={cn(
            "absolute right-0.5 top-0.5 z-10 grid place-items-center text-fg-faint",
            "size-8 md:size-6",
            "opacity-50 md:opacity-25 group-hover:opacity-100 hover:text-fg-dim [transition-duration:80ms]",
            "cursor-grab active:cursor-grabbing touch-none",
          )}
        >
          <GripVertical className="size-3.5" strokeWidth={1.5} aria-hidden />
        </button>
        <Link
          href={`/releases/${release.slug}`}
          className="block px-3 py-2.5 pr-7"
        >
          <CardBody release={release} />
        </Link>
      </CardSurface>
    </li>
  );
}

function CardSurface({
  release,
  children,
}: {
  release: Release;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative border border-line",
        "hover:border-line-strong hover:shadow-[0_4px_12px_rgba(26,22,18,0.04)] [transition-duration:80ms]",
      )}
      style={{ background: STATUS_TINT[release.status] }}
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[2px]"
        style={{ background: STATUS_EDGE[release.status] }}
      />
      {children}
    </div>
  );
}

function CardPresentation({
  release,
  dragging,
}: {
  release: Release;
  dragging?: boolean;
}) {
  return (
    <div
      className={cn(
        "w-60 border border-line px-3 py-2.5 pr-7 relative",
        dragging
          ? "shadow-[0_8px_24px_rgba(26,22,18,0.10)] rotate-[0.3deg]"
          : "",
      )}
      style={{ background: STATUS_TINT[release.status] }}
    >
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[2px]"
        style={{ background: STATUS_EDGE[release.status] }}
      />
      <CardBody release={release} />
    </div>
  );
}

function CardBody({ release: r }: { release: Release }) {
  const collab = r.collaborators?.length ? r.collaborators[0] : null;
  return (
    <>
      <h3
        className="font-display text-[13px] text-fg leading-[1.25] line-clamp-2"
        style={{ fontWeight: 600, letterSpacing: "-0.005em" }}
      >
        {sentenceCase(r.title)}
      </h3>
      <div className="mt-1.5 flex items-center gap-2 min-w-0">
        <span className="font-mono uppercase tracking-[0.14em] text-[9px] text-fg-faint">
          {TYPE_LABEL[r.type]}
        </span>
        {collab ? (
          <>
            <span className="opacity-40 text-fg-faint">·</span>
            <span className="font-sans text-[11px] text-fg-dim truncate">
              {r.collaborators!.length === 1
                ? collab
                : `${collab} +${r.collaborators!.length - 1}`}
            </span>
          </>
        ) : null}
      </div>
    </>
  );
}
