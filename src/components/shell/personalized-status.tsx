"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/format";

type NextShow = {
  city: string;
  venue: string;
  date: string;
  time: string | null;
  label: string;
};

const TZ_CITY: Record<string, string> = {
  "America/Los_Angeles": "LAGUNA BEACH",
  "America/New_York": "NEW YORK",
  "America/Chicago": "CHICAGO",
  "America/Denver": "DENVER",
  "America/Toronto": "TORONTO",
  "America/Vancouver": "VANCOUVER",
  "America/Mexico_City": "MEXICO CITY",
  "Europe/London": "LONDON",
  "Europe/Berlin": "BERLIN",
  "Europe/Amsterdam": "AMSTERDAM",
  "Europe/Madrid": "IBIZA",
  "Europe/Paris": "PARIS",
  "Europe/Brussels": "BRUSSELS",
  "Europe/Rome": "ROME",
  "Europe/Vienna": "VIENNA",
  "Asia/Tokyo": "TOKYO",
  "Asia/Singapore": "SINGAPORE",
  "Asia/Dubai": "DUBAI",
  "Australia/Sydney": "SYDNEY",
};

function tzToCity(tz: string): string {
  if (TZ_CITY[tz]) return TZ_CITY[tz];
  const tail = tz.split("/").pop();
  return tail ? tail.replace(/_/g, " ").toUpperCase() : "ROAMING";
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function PersonalizedStatus({
  name,
  nextShow,
  onTheRoadDays,
}: {
  name: string;
  nextShow: NextShow | null;
  onTheRoadDays: number;
}) {
  const [time, setTime] = useState("--:--");
  const [city, setCity] = useState<string>("...");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setCity(tzToCity(tz));
    } catch {
      setCity("ROAMING");
    }
    const tick = () => {
      const d = new Date();
      setTime(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
      setNow(Date.now());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const countdown = nextShow
    ? formatCountdown(nextShow.date, nextShow.time, now)
    : null;

  return (
    <div className="text-right font-mono text-[10px] uppercase tracking-[0.08em] leading-[1.5] text-fg-dim min-w-0">
      <div className="flex items-baseline justify-end gap-2 truncate">
        <span className="text-fg">{name}</span>
        <span className="opacity-50">·</span>
        <span className="num text-fg">{time}</span>
        <span className="hidden sm:inline">{city}</span>
      </div>
      <div className="hidden sm:flex items-baseline justify-end gap-2">
        <span>ON THE ROAD,</span>
        <span className="num text-fg">{onTheRoadDays}D</span>
        <span className="opacity-50">|</span>
        <span>NEXT,</span>
        {nextShow && countdown ? (
          <>
            <span className="text-fg truncate max-w-[120px] inline-block">
              {nextShow.label}
            </span>
            <span className="opacity-50">/</span>
            <span className="num text-fg">{countdown}</span>
          </>
        ) : (
          <span className="text-fg-faint">NO SHOW SCHEDULED</span>
        )}
      </div>
      {/* Mobile compact line */}
      <div className="sm:hidden truncate text-fg-dim">
        {nextShow && countdown ? (
          <>
            NEXT, <span className="text-fg truncate">{nextShow.label}</span>
            <span className="opacity-50"> / </span>
            <span className="num text-fg">{countdown}</span>
          </>
        ) : (
          <span className="text-fg-faint">NO SHOW SCHEDULED</span>
        )}
      </div>
    </div>
  );
}
