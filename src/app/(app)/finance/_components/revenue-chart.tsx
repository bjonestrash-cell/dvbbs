"use client";

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

export function RevenueChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return (
      <p className="font-sans text-[13px] text-fg-faint py-12 text-center">
        No revenue recorded this year yet.
      </p>
    );
  }

  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
          barCategoryGap="30%"
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
            width={60}
            tickFormatter={(v) => `$${(v as number).toLocaleString()}`}
          />
          <Tooltip
            cursor={{ fill: "rgba(26,22,18,0.04)" }}
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
            wrapperStyle={{
              fontFamily: "var(--font-geist-mono)",
              fontSize: 10,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(26,22,18,0.55)",
            }}
          />
          <Bar
            dataKey="tour"
            stackId="a"
            fill="#1a1612"
            isAnimationActive={false}
          />
          <Bar
            dataKey="merch"
            stackId="a"
            fill="#8b6f4e"
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
