"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface LineChartProps {
  data: Record<string, unknown>[];
  lines: Array<{
    dataKey: string;
    color: string;
    name: string;
  }>;
  xKey: string;
  xLabel?: string;
  yLabel?: string;
  height?: number;
  formatXAxis?: (value: string | number) => string;
  formatYAxis?: (value: string | number) => string;
  formatTooltip?: (value: string | number) => string;
  xTicks?: Array<string | number>;
  yDomain?: [number | string, number | string];
  yTicks?: Array<number | string>;
  gridColor?: string;
  gridColorDark?: string;
}

export function LineChart({
  data,
  lines,
  xKey,
  xLabel,
  yLabel,
  height = 300,
  formatXAxis,
  formatYAxis,
  formatTooltip,
  xTicks,
  yDomain,
  yTicks,
  gridColor = "#e5e7eb",
  gridColorDark = "rgba(255,255,255,0.08)",
}: LineChartProps) {
  const isDark =
    typeof window !== "undefined" &&
    document.documentElement.classList.contains("dark");
  const gridStroke = isDark ? gridColorDark : gridColor;
  const tooltipStyle = isDark
    ? {
        backgroundColor: "#0f0f1a",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: "8px",
        color: "#f9fafb",
      }
    : {
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        color: "#111827",
      };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
        <XAxis
          dataKey={xKey}
          label={
            xLabel
              ? { value: xLabel, position: "insideBottom", offset: -5 }
              : undefined
          }
          tickFormatter={formatXAxis}
          stroke="#6b7280"
          ticks={xTicks}
        />
        <YAxis
          label={
            yLabel
              ? { value: yLabel, angle: -90, position: "insideLeft" }
              : undefined
          }
          tickFormatter={formatYAxis}
          stroke="#6b7280"
          domain={yDomain}
          ticks={yTicks}
        />
        <Tooltip formatter={formatTooltip} contentStyle={tooltipStyle} />
        <Legend />
        {lines.map((line) => (
          <Line
            key={line.dataKey}
            type="monotone"
            dataKey={line.dataKey}
            stroke={line.color}
            strokeWidth={2}
            name={line.name}
            dot={{ fill: line.color, r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
