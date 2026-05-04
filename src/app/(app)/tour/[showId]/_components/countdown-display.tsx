"use client";

import { useEffect, useState } from "react";
import { formatCountdown, daysFromNow } from "@/lib/format";

export function CountdownDisplay({
  date,
  time,
  initial,
}: {
  date: string | null;
  time: string | null;
  initial: string;
}) {
  const [text, setText] = useState(initial);

  useEffect(() => {
    if (!date) return;
    const update = () => setText(formatCountdown(date, time, Date.now()));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [date, time]);

  if (!date) return null;
  const days = daysFromNow(date);
  const past = days !== null && days < 0;

  return (
    <div className="flex flex-col gap-1">
      <span className="marker">{past ? "Show ended" : "Time to stage"}</span>
      <span
        className="display-stat text-fg num"
        style={{ fontSize: "clamp(36px, 5vw, 56px)" }}
      >
        {text}
      </span>
    </div>
  );
}
