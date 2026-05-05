"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { month: string; gross: number; units: number };

function useChartColors() {
  const [tick, setTick] = useState({
    grid: "rgba(26,22,18,0.06)",
    axis: "rgba(26,22,18,0.35)",
    tickFill: "rgba(26,22,18,0.55)",
    cursor: "rgba(26,22,18,0.18)",
    accent: "#8b6f4e",
    surface: "#ffffff",
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
        cursor: dark ? "rgba(245,241,234,0.20)" : "rgba(26,22,18,0.18)",
        accent: cs.getPropertyValue("--color-accent").trim() || "#8b6f4e",
        surface: cs.getPropertyValue("--color-surface").trim() || "#ffffff",
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

export function SalesByMonthChart({
  data,
  metric,
}: {
  data: Point[];
  metric: "gross" | "units";
}) {
  const c = useChartColors();
  if (data.length === 0) {
    return (
      <p className="font-sans text-[13px] text-fg-faint py-12 text-center">
        No sales recorded.
      </p>
    );
  }
  return (
    <div className="h-[220px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
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
            tickFormatter={(v) =>
              metric === "gross"
                ? `$${(v as number).toLocaleString()}`
                : (v as number).toLocaleString()
            }
          />
          <Tooltip
            cursor={{ stroke: c.cursor, strokeDasharray: "2 2" }}
            content={({ active, payload }) => {
              if (!active || !payload || payload.length === 0) return null;
              const p = payload[0].payload as Point;
              return (
                <div className="border border-line bg-surface px-3 py-2 shadow-[0_4px_12px_rgba(26,22,18,0.06)]">
                  <div className="num font-mono text-[10px] uppercase tracking-[0.14em] text-fg-faint">
                    {p.month}
                  </div>
                  <div className="num font-mono text-[12px] text-fg mt-1">
                    {metric === "gross"
                      ? `USD ${p.gross.toLocaleString()}`
                      : `${p.units.toLocaleString()} units`}
                  </div>
                </div>
              );
            }}
          />
          <Line
            type="monotone"
            dataKey={metric}
            stroke={c.accent}
            strokeWidth={1.25}
            dot={{ r: 2, fill: c.accent, stroke: c.accent }}
            activeDot={{ r: 4, fill: c.accent, stroke: c.surface }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
