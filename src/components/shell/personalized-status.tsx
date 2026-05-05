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
  "America/Los_Angeles": "Laguna Beach",
  "America/New_York": "New York",
  "America/Chicago": "Chicago",
  "America/Denver": "Denver",
  "America/Toronto": "Toronto",
  "America/Vancouver": "Vancouver",
  "America/Mexico_City": "Mexico City",
  "Europe/London": "London",
  "Europe/Berlin": "Berlin",
  "Europe/Amsterdam": "Amsterdam",
  "Europe/Madrid": "Ibiza",
  "Europe/Paris": "Paris",
  "Europe/Brussels": "Brussels",
  "Europe/Rome": "Rome",
  "Europe/Vienna": "Vienna",
  "Asia/Tokyo": "Tokyo",
  "Asia/Singapore": "Singapore",
  "Asia/Dubai": "Dubai",
  "Australia/Sydney": "Sydney",
};

function tzToCity(tz: string): string {
  if (TZ_CITY[tz]) return TZ_CITY[tz];
  const tail = tz.split("/").pop();
  if (!tail) return "Roaming";
  return tail
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function toName(name: string): string {
  if (!name) return "alex";
  return name.toLowerCase();
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
      setCity("Roaming");
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
  const labelDisplay = toName(name);
  const venueDisplay = nextShow ? toName(nextShow.label) : null;
  const shortCountdown = countdown
    ? countdown.split(" ").slice(0, 2).join(" ")
    : null;

  return (
    <div className="text-right min-w-0 leading-tight">
      <div className="font-display lowercase text-[12px] sm:text-[13px] text-fg leading-[1.1] truncate tracking-[-0.01em]">
        {labelDisplay}
      </div>
      <div className="mt-0.5 font-mono uppercase tracking-[0.14em] text-[10px] text-fg-dim truncate">
        <span className="num">{time}</span>
        <span className="opacity-50 mx-1.5">·</span>
        <span>{city}</span>
      </div>
      <div className="hidden sm:block mt-1 font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint truncate">
        On the road,{" "}
        <span className="num text-fg-dim">{onTheRoadDays}d</span>
        <span className="opacity-50 mx-1.5">·</span>
        Next,{" "}
        {nextShow && shortCountdown ? (
          <>
            <span className="text-fg-dim">{venueDisplay}</span>
            <span className="opacity-50 mx-1">/</span>
            <span className="num text-fg-dim">{shortCountdown}</span>
          </>
        ) : (
          <span>None</span>
        )}
      </div>
    </div>
  );
}
