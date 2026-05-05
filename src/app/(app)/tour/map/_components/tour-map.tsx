"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import type { Show, ShowStatus } from "@/lib/supabase/types";
import { coordFor } from "@/lib/data/city-coords";

type Pin = {
  show: Show;
  lng: number;
  lat: number;
};

const STATUS_COLOR: Record<ShowStatus, string> = {
  lead: "#a8a39c",
  offered: "#8fa1b4",
  holding: "#c9a66b",
  confirmed: "#7a8471",
  contracted: "#7a8471",
  completed: "#c4bcb0",
  cancelled: "#b5614d",
};

const STATUS_LABEL: Record<ShowStatus, string> = {
  lead: "Lead",
  offered: "Offered",
  holding: "Holding",
  confirmed: "Confirmed",
  contracted: "Contracted",
  completed: "Completed",
  cancelled: "Cancelled",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function titleCase(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .toLowerCase()
    .replace(/(^|\s|-)([a-z])/g, (_, sep, ch) => `${sep}${ch.toUpperCase()}`);
}

export function TourMap({
  shows,
  token,
}: {
  shows: Show[];
  token: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Resolve pins outside of render cycle.
  const pins: Pin[] = shows
    .map((s): Pin | null => {
      const c = coordFor(s.city, s.country);
      if (!c) return null;
      return { show: s, lng: c[0], lat: c[1] };
    })
    .filter((p): p is Pin => Boolean(p));

  // Token sanity check. Mapbox public tokens always start with `pk.`. If the
  // user pasted a secret/`sk.` token by accident the map will silently 401.
  useEffect(() => {
    if (!token) {
      setError("No Mapbox token provided.");
      return;
    }
    if (!token.startsWith("pk.")) {
      setError(
        `Token must be a public token starting with "pk." (got "${token.slice(0, 4)}...").`,
      );
      return;
    }
    setError(null);
  }, [token]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    if (!token || !token.startsWith("pk.")) return;

    let map: mapboxgl.Map;
    try {
      mapboxgl.accessToken = token;
      map = new mapboxgl.Map({
        container: containerRef.current,
        // Light, low-contrast basemap that lives well with cream surfaces.
        style: "mapbox://styles/mapbox/light-v11",
        center: [0, 25],
        zoom: 1.4,
        attributionControl: true,
        cooperativeGestures: false,
        projection: "mercator",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Map init failed: ${msg}`);
      return;
    }

    map.addControl(
      new mapboxgl.NavigationControl({
        showCompass: false,
        visualizePitch: false,
      }),
      "top-right",
    );

    map.on("error", (e) => {
      const msg = e?.error?.message ?? "Unknown map error";
      // Tile loading errors are common when zoomed out and not a real problem;
      // surface only auth / style errors.
      if (
        /access token|unauthorized|forbidden|style/i.test(msg) ||
        /401|403/.test(msg)
      ) {
        setError(msg);
      }
    });

    map.on("load", () => setReady(true));

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    const markers: mapboxgl.Marker[] = [];

    for (const p of pins) {
      const el = document.createElement("div");
      el.style.width = "14px";
      el.style.height = "14px";
      el.style.borderRadius = "9999px";
      el.style.background = STATUS_COLOR[p.show.status];
      el.style.border = "2px solid #ffffff";
      el.style.boxShadow = "0 1px 3px rgba(26,22,18,0.25)";
      el.style.cursor = "pointer";

      const date = p.show.show_date
        ? new Date(p.show.show_date).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "2-digit",
          })
        : "TBD";

      const popupHtml = `
        <div style="font-family: var(--font-inter), system-ui, sans-serif; padding: 4px 2px;">
          <div style="font-family: var(--font-geist-mono), monospace; font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; color: #a8a39c; margin-bottom: 4px;">
            ${escapeHtml(date)}
            ${p.show.country ? `&nbsp;·&nbsp;${escapeHtml(p.show.country.toUpperCase())}` : ""}
          </div>
          <div style="font-family: var(--font-geist), system-ui, sans-serif; font-size: 15px; font-weight: 500; color: #1a1612; line-height: 1.2;">
            ${escapeHtml(titleCase(p.show.city) || "TBD")}
          </div>
          ${p.show.venue_name ? `<div style="font-size: 12px; color: #6b6863; margin-top: 2px;">${escapeHtml(titleCase(p.show.venue_name))}</div>` : ""}
          <div style="display: inline-flex; align-items: center; gap: 6px; margin-top: 8px;">
            <span style="display:inline-block; width: 6px; height: 6px; border-radius: 9999px; background: ${STATUS_COLOR[p.show.status]};"></span>
            <span style="font-family: var(--font-geist-mono), monospace; font-size: 11px; color: #6b6863;">${escapeHtml(STATUS_LABEL[p.show.status])}</span>
          </div>
          <div style="margin-top: 10px;">
            <a href="/tour/${p.show.id}" style="font-family: var(--font-geist-mono), monospace; font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase; color: #8b6f4e; text-decoration: none;">
              Open show →
            </a>
          </div>
        </div>
      `.trim();

      const popup = new mapboxgl.Popup({
        offset: 14,
        closeButton: false,
        maxWidth: "260px",
      }).setHTML(popupHtml);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([p.lng, p.lat])
        .setPopup(popup)
        .addTo(map);

      markers.push(marker);
    }

    // Frame the bounds around current pins on initial paint.
    if (pins.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      for (const p of pins) bounds.extend([p.lng, p.lat]);
      map.fitBounds(bounds, {
        padding: { top: 60, right: 40, bottom: 60, left: 40 },
        maxZoom: 5,
        duration: 0,
      });
    } else if (pins.length === 1) {
      map.flyTo({
        center: [pins[0].lng, pins[0].lat],
        zoom: 4,
        duration: 0,
      });
    }

    return () => {
      markers.forEach((m) => m.remove());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shows, ready]);

  return (
    <div className="relative w-full h-[460px] md:h-[560px] bg-surface border border-line">
      <div ref={containerRef} className="absolute inset-0" />

      {error ? (
        <div className="absolute inset-0 grid place-items-center pointer-events-none">
          <div className="bg-surface/95 backdrop-blur border border-cancelled/40 px-4 py-3 max-w-[360px] text-center pointer-events-auto">
            <div className="font-mono uppercase tracking-[0.14em] text-[10px] text-cancelled">
              Map error
            </div>
            <p className="mt-1 font-sans text-[13px] text-fg-dim leading-[1.5]">
              {error}
            </p>
            <p className="mt-2 font-mono uppercase tracking-[0.06em] text-[10px] text-fg-faint">
              Check NEXT_PUBLIC_MAPBOX_TOKEN in .env.local + Netlify, restart
              the dev server, hard-refresh the browser.
            </p>
          </div>
        </div>
      ) : null}

      {!error && pins.length === 0 ? (
        <div className="absolute inset-x-0 top-0 grid place-items-center pointer-events-none">
          <div className="mt-4 bg-surface/95 backdrop-blur border border-line px-4 py-3 max-w-[300px] text-center pointer-events-auto">
            <div className="font-mono uppercase tracking-[0.14em] text-[10px] text-fg-faint">
              No pins
            </div>
            <p className="mt-1 font-sans text-[13px] text-fg-dim">
              No upcoming shows have a city we recognize. Add coordinates in
              <code className="mx-1 font-mono text-[11px]">city-coords.ts</code>
              or check the spelling.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
