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
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Disc3, GripVertical } from "lucide-react";
import {
  RELEASE_STATUS_LABEL,
  RELEASE_STATUS_ORDER,
} from "@/lib/data/release-shared";
import { StatusBracket, STATUS_TONE } from "@/components/ui/status-bracket";
import type { Release, ReleaseStatus } from "@/lib/supabase/types";
import { formatDateCompact, formatYear } from "@/lib/format";
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

export function ReleaseBoard({ releases }: { releases: Release[] }) {
  const [columns, setColumns] = useState<Columns>(() =>
    buildInitial(releases),
  );
  const [activeId, setActiveId] = useState<string | null>(null);

  // Server-canonical status per release id, updated whenever props change.
  // Used to detect when a local drop moves a card to a new column so we can
  // fire setReleaseStatus.
  const serverStatus = useMemo(() => {
    const m = new Map<string, ReleaseStatus>();
    for (const r of releases) m.set(r.id, r.status);
    return m;
  }, [releases]);

  // Reseed from server props when they change (e.g. after revalidate).
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

    // If the card moved to a different column than its server-canonical
    // status, commit the new status to the database.
    const original = serverStatus.get(activeIdStr);
    if (original && original !== toStatus) {
      void setReleaseStatus(activeIdStr, toStatus);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="overflow-x-auto px-6 md:px-10 py-8">
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
      <DragOverlay dropAnimation={null}>
        {activeRelease ? (
          <CardPresentation release={activeRelease} dragging />
        ) : null}
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
    <section className="w-72 shrink-0 bg-page flex flex-col">
      <header className="px-2 pb-3 mb-1">
        <div className="flex items-baseline gap-1.5">
          <h2
            className="font-display text-[18px] text-fg"
            style={{ fontWeight: 500 }}
          >
            {RELEASE_STATUS_LABEL[status]}
          </h2>
          <span className="opacity-50 font-mono text-[11px]">·</span>
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
            "flex flex-col gap-2 min-h-[80px] px-1 pb-2 [transition-duration:80ms]",
            isOver ? "bg-surface-2/40" : "",
          )}
        >
          {releases.map((r) => (
            <SortableCard key={r.id} release={r} ghost={activeId === r.id} />
          ))}
          {releases.length === 0 ? (
            <li className="px-1 py-10 text-center font-sans text-[13px] text-fg-faint">
              Nothing here
            </li>
          ) : null}
        </ul>
      </SortableContext>
    </section>
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
      <div className="bg-surface border border-line hover:border-line-strong hover:shadow-[0_4px_12px_rgba(26,22,18,0.04)] [transition-duration:80ms]">
        <button
          {...attributes}
          {...listeners}
          type="button"
          aria-label="Reorder release"
          className={cn(
            "absolute right-2 top-2 z-10 size-6 grid place-items-center text-fg-faint",
            "opacity-30 group-hover:opacity-100 hover:text-fg-dim [transition-duration:80ms]",
            "cursor-grab active:cursor-grabbing touch-none",
          )}
        >
          <GripVertical className="size-3.5" strokeWidth={1.5} aria-hidden />
        </button>
        <Link href={`/releases/${release.slug}`} className="block p-4">
          <CardBody release={release} />
        </Link>
      </div>
    </li>
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
        "w-72 bg-surface border border-line p-4",
        dragging
          ? "shadow-[0_8px_24px_rgba(26,22,18,0.10)] rotate-[0.3deg]"
          : "",
      )}
    >
      <CardBody release={release} />
    </div>
  );
}

function CardBody({ release: r }: { release: Release }) {
  return (
    <>
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
          <StatusBracket tone={STATUS_TONE[r.status] ?? "default"}>
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
    </>
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
