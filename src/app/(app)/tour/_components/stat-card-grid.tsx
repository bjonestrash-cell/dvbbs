"use client";

import { useEffect, useMemo, useState } from "react";
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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type StatCardItem = {
  id: string;
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  tone?: "default" | "live";
};

const STORAGE_KEY = "dvbbs.tour.statCardOrder";

export function StatCardGrid({ cards }: { cards: StatCardItem[] }) {
  const defaultOrder = useMemo(() => cards.map((c) => c.id), [cards]);
  const [order, setOrder] = useState<string[]>(defaultOrder);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          Array.isArray(parsed) &&
          parsed.every((id) => defaultOrder.includes(id)) &&
          parsed.length === defaultOrder.length
        ) {
          setOrder(parsed);
          return;
        }
      }
    } catch {
      // ignore
    }
    setOrder(defaultOrder);
  }, [defaultOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ordered = useMemo(
    () =>
      order
        .map((id) => cards.find((c) => c.id === id))
        .filter((c): c is StatCardItem => Boolean(c)),
    [order, cards],
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = order.indexOf(String(active.id));
    const newIdx = order.indexOf(String(over.id));
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(order, oldIdx, newIdx);
    setOrder(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={ordered.map((c) => c.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-line border-y md:border border-line md:mx-6">
          {ordered.map((card, i) => (
            <SortableStatCard key={card.id} card={card} index={i + 1} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableStatCard({
  card,
  index,
}: {
  card: StatCardItem;
  index: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: card.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(
      transform
        ? { ...transform, y: (transform.y ?? 0) - (isDragging ? 4 : 0) }
        : null,
    ),
    transition,
    opacity: isDragging ? 0.9 : 1,
    zIndex: isDragging ? 20 : 1,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative bg-page p-4 sm:p-5 group",
        "select-none touch-none",
      )}
    >
      <div className="flex items-start justify-between">
        <span className="label">
          {index.toString().padStart(2, "0")}
          <span className="opacity-50"> /</span>
        </span>
        <div className="flex items-center gap-1 text-fg-faint">
          <button
            {...attributes}
            {...listeners}
            type="button"
            aria-label="Reorder card"
            className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [transition-duration:80ms] hover:text-fg cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="size-3" aria-hidden />
          </button>
          <ChevronTick />
        </div>
      </div>
      <div className="mt-4 marker">{card.label}</div>
      <div className="mt-2 display-stat text-fg" style={{ fontSize: "clamp(36px, 6vw, 56px)" }}>
        {card.value}
      </div>
      {card.hint ? (
        <div className="mt-2 font-mono text-[11px] text-fg-dim uppercase tracking-[0.06em] line-clamp-2">
          {card.hint}
        </div>
      ) : null}
      {card.tone === "live" ? (
        <span
          aria-hidden
          className="absolute bottom-0 left-0 right-0 h-px bg-accent"
        />
      ) : null}
    </article>
  );
}

function ChevronTick() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden
      className="text-fg-faint"
    >
      <path
        d="M1 3 L5 7 L9 3"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  );
}
