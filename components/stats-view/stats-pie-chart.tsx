/**
 * =============================================================================
 * File: stats-pie-chart.tsx
 * =============================================================================
 *
 * Donut-style pie chart for time distribution by goal or life area.
 *
 * Uses Recharts to render a proportional breakdown of completed hours,
 * with a center label showing the aggregate completed / planned total.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render a donut pie chart with colored segments per item.
 * - Show a center label with total completed and planned hours.
 * - Support hover interaction to highlight segments.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Hex colors are derived from GoalColor tokens via GOAL_COLOR_HEX.
 * - Items with zero completed hours are excluded from the chart.
 * - If no items have completed hours, renders an empty ring.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - StatsPieChart
 * - StatsPieChartProps
 */

"use client";

import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn, formatHoursWithUnit } from "@/lib/utils";

// =============================================================================
// Types
// =============================================================================

export interface PieChartItem {
  id: string;
  label: string;
  completedHours: number;
  hexColor: string;
}

export interface StatsPieChartProps {
  items: PieChartItem[];
  totalCompleted: number;
  totalPlanned: number;
  onHoverItem?: (id: string | null) => void;
  className?: string;
}

// =============================================================================
// Component
// =============================================================================

export function StatsPieChart({
  items,
  totalCompleted,
  totalPlanned,
  onHoverItem,
  className,
}: StatsPieChartProps) {
  const activeItems = items.filter((item) => item.completedHours > 0);

  // Fallback data for empty state (renders a grey ring)
  const chartData =
    activeItems.length > 0
      ? activeItems
      : [{ id: "__empty", label: "No data", completedHours: 1, hexColor: "hsl(var(--muted))" }];

  const isEmpty = activeItems.length === 0;

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="relative h-[180px] w-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="completedHours"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={activeItems.length > 1 ? 2 : 0}
              strokeWidth={0}
              onMouseEnter={(_, index) => {
                if (!isEmpty) onHoverItem?.(chartData[index].id);
              }}
              onMouseLeave={() => onHoverItem?.(null)}
            >
              {chartData.map((item) => (
                <Cell
                  key={item.id}
                  fill={item.hexColor}
                  className="transition-opacity duration-150"
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold tabular-nums text-foreground">
            {formatHoursWithUnit(totalCompleted)}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {totalPlanned > 0
              ? `of ${formatHoursWithUnit(totalPlanned)}`
              : "completed"}
          </span>
        </div>
      </div>
    </div>
  );
}
