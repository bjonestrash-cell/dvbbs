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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-6 md:px-10">
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
    opacity: isDragging ? 0.95 : 1,
    zIndex: isDragging ? 20 : 1,
    boxShadow: isDragging ? "0 4px 12px rgba(26,22,18,0.04)" : "none",
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative bg-surface border border-line p-6 group",
        "select-none",
      )}
    >
      <div className="flex items-start justify-between">
        <span className="marker">
          {index.toString().padStart(2, "0")}
          <span className="opacity-60"> /</span>
        </span>
        <button
          {...attributes}
          {...listeners}
          type="button"
          aria-label="Reorder card"
          className={cn(
            "grid place-items-center text-fg-faint hover:text-fg-dim",
            "size-9 md:size-6 -m-1.5 md:m-0",
            // Visible on touch (no hover), fades in on hover for desktop.
            "opacity-60 md:opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [transition-duration:80ms]",
            "cursor-grab active:cursor-grabbing touch-none",
          )}
        >
          <GripVertical
            className="size-4 md:size-3.5"
            strokeWidth={1.5}
            aria-hidden
          />
        </button>
      </div>
      <div className="mt-5 marker">{card.label}</div>
      <div
        className="mt-3 display-stat text-fg tabular"
        style={{ fontSize: "clamp(36px, 5.5vw, 48px)", letterSpacing: "-0.02em" }}
      >
        {card.value}
      </div>
      {card.hint ? (
        <div className="mt-3 font-sans text-[13px] text-fg-dim line-clamp-2">
          {card.hint}
        </div>
      ) : null}
    </article>
  );
}
