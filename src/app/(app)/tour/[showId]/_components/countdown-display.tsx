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
    <div className="flex items-end gap-3">
      <span
        className="display-stat text-fg num"
        style={{ fontSize: "clamp(40px, 6vw, 64px)" }}
      >
        {text}
      </span>
      <span className="marker pb-2">
        {past ? "AGO" : "TO STAGE"}
      </span>
    </div>
  );
}
