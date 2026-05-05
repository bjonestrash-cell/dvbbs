"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { month: string; tour: number; merch: number };

/** Recharts evaluates color strings against the SVG, but for stroke/fill it
 *  expects a resolved value, not a `var(...)`. Read CSS vars from :root once
 *  per render via getComputedStyle so the chart re-themes when the user
 *  toggles dark mode. */
function useChartColors() {
  const [tick, setTick] = useState({
    grid: "rgba(26,22,18,0.06)",
    axis: "rgba(26,22,18,0.35)",
    tickFill: "rgba(26,22,18,0.55)",
    tooltipFill: "rgba(26,22,18,0.04)",
    fg: "#1a1612",
    accent: "#8b6f4e",
  });

  useEffect(() => {
    function read() {
      const cs = getComputedStyle(document.documentElement);
      const dark =
        document.documentElement.getAttribute("data-theme") === "dark";
      setTick({
        grid: dark ? "rgba(245,241,234,0.08)" : "rgba(26,22,18,0.06)",
        axis: dark ? "rgba(245,241,234,0.20)" : "rgba(26,22,18,0.35)",
        tickFill: dark ? "rgba(245,241,234,0.50)" : "rgba(26,22,18,0.55)",
        tooltipFill: dark ? "rgba(245,241,234,0.04)" : "rgba(26,22,18,0.04)",
        fg: cs.getPropertyValue("--color-fg").trim() || "#1a1612",
        accent: cs.getPropertyValue("--color-accent").trim() || "#8b6f4e",
      });
    }
    read();
    const obs = new MutationObserver(read);
    obs.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => obs.disconnect();
  }, []);

  return tick;
}

export function RevenueChart({ data }: { data: Point[] }) {
  const c = useChartColors();

  if (data.length === 0) {
    return (
      <p className="font-sans text-[13px] text-fg-faint py-12 text-center">
        No revenue recorded this year yet.
      </p>
    );
  }

  return (
    <div className="h-[220px] md:h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          barCategoryGap="30%"
        >
          <CartesianGrid
            stroke={c.grid}
            strokeDasharray="2 4"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            stroke={c.axis}
            tick={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: 10,
              fill: c.tickFill,
              letterSpacing: "0.04em",
            }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={28}
            tickFormatter={(v) => {
              const m = String(v ?? "");
              const parts = m.split("-");
              if (parts.length !== 2) return m;
              const [y, mm] = parts;
              const idx = Number(mm) - 1;
              const months = [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
              ];
              return `${months[idx] ?? mm} ${y.slice(2)}`;
            }}
          />
          <YAxis
            stroke={c.axis}
            tick={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: 10,
              fill: c.tickFill,
            }}
            tickLine={false}
            axisLine={false}
            width={48}
            tickFormatter={(v) => {
              const n = v as number;
              if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}m`;
              if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
              return `$${n}`;
            }}
          />
          <Tooltip
            cursor={{ fill: c.tooltipFill }}
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;
              const p = payload[0].payload as Point;
              return (
                <div className="border border-line bg-surface px-3 py-2 shadow-[0_4px_12px_rgba(26,22,18,0.06)]">
                  <div className="num font-mono text-[10px] uppercase tracking-[0.14em] text-fg-faint">
                    {p.month}
                  </div>
                  <div className="num font-mono text-[12px] text-fg mt-1">
                    Tour USD {p.tour.toLocaleString()}
                  </div>
                  <div className="num font-mono text-[12px] text-fg">
                    Merch USD {p.merch.toLocaleString()}
                  </div>
                </div>
              );
            }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            iconSize={8}
            wrapperStyle={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: c.tickFill,
              paddingBottom: 4,
            }}
          />
          <Bar
            dataKey="tour"
            stackId="a"
            fill={c.fg}
            isAnimationActive={false}
          />
          <Bar
            dataKey="merch"
            stackId="a"
            fill={c.accent}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
