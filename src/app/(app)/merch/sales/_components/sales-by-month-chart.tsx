"use client";

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

export function SalesByMonthChart({
  data,
  metric,
}: {
  data: Point[];
  metric: "gross" | "units";
}) {
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
            stroke="rgba(26,22,18,0.06)"
            strokeDasharray="2 4"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            stroke="rgba(26,22,18,0.35)"
            tick={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: 10,
              fill: "rgba(26,22,18,0.55)",
              letterSpacing: "0.04em",
            }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="rgba(26,22,18,0.35)"
            tick={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: 10,
              fill: "rgba(26,22,18,0.55)",
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
            cursor={{ stroke: "rgba(26,22,18,0.18)", strokeDasharray: "2 2" }}
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
            stroke="#8b6f4e"
            strokeWidth={1.25}
            dot={{ r: 2, fill: "#8b6f4e", stroke: "#8b6f4e" }}
            activeDot={{ r: 4, fill: "#8b6f4e", stroke: "#fff" }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
