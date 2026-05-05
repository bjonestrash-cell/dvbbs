"use client";

import { useEffect, useState } from "react";
import { greeting as greetingPhrase } from "@/lib/format";

/**
 * Time-of-day greeting using the viewer's local clock. Runs server-side
 * with a generic placeholder, then hydrates on the client and re-renders
 * with the correct phrase. Avoids the server/client time-zone mismatch
 * where Netlify (UTC) computes "Good evening" while the user sees 10am.
 */
export function TourGreeting({
  name,
  attentionCount,
}: {
  name: string;
  attentionCount: number;
}) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    // Refresh every 5 minutes so the greeting tracks across day boundaries.
    const id = setInterval(() => setNow(new Date()), 5 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Pre-hydration: just say "Welcome" so the SSR pass doesn't lock in
  // the wrong time of day. After mount, swap to the local phrase.
  const phrase = now ? greetingPhrase(now) : "Welcome";
  const titleCaseName =
    name.length > 0 ? name[0].toUpperCase() + name.slice(1) : name;

  return (
    <div>
      <div
        className="display-title text-fg lowercase"
        style={{ fontSize: "clamp(22px, 3.5vw, 28px)", fontWeight: 400 }}
      >
        {phrase},{" "}
        <span style={{ fontWeight: 700 }}>{titleCaseName}</span>.
      </div>
      <div className="mt-1 font-sans text-fg-dim text-[14px]">
        {attentionCount === 0
          ? "Nothing on your plate right now."
          : `${attentionCount} ${attentionCount === 1 ? "thing wants" : "things want"} your attention.`}
      </div>
    </div>
  );
}
