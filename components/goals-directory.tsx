"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  RiAddLine,
  RiCheckLine,
  RiCloseLine,
  RiSparklingLine,
} from "@remixicon/react";

// Color mapping from Tailwind classes to hex values
const COLOR_MAP: Record<string, string> = {
  "text-rose-500": "#f43f5e",
  "text-pink-500": "#ec4899",
  "text-fuchsia-500": "#d946ef",
  "text-purple-500": "#a855f7",
  "text-violet-500": "#8b5cf6",
  "text-indigo-500": "#6366f1",
  "text-blue-500": "#3b82f6",
  "text-sky-500": "#0ea5e9",
  "text-cyan-500": "#06b6d4",
  "text-teal-500": "#14b8a6",
  "text-emerald-500": "#10b981",
  "text-green-500": "#22c55e",
  "text-lime-500": "#84cc16",
  "text-yellow-500": "#eab308",
  "text-amber-500": "#f59e0b",
  "text-orange-500": "#f97316",
  "text-red-500": "#ef4444",
  "text-slate-500": "#64748b",
};

// Types
interface Goal {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description?: string;
}

interface LifeArea {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  goals: Goal[];
}

interface PopularGoal extends Goal {
  areaId: string;
}

interface GoalsDirectoryProps {
  lifeAreas: LifeArea[];
  popularGoals: PopularGoal[];
  selectedTab?: string;
  selectedGoalIds?: Set<string>;
  onSelectTab?: (tabId: string) => void;
  onToggleGoal?: (areaId: string, goalId: string) => void;
  onAddGoal?: (areaId: string) => void;
}

// Tab Button Component
interface TabButtonProps {
  icon?: React.ComponentType<{ className?: string }>;
  color?: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({
  icon: Icon,
  color,
  label,
  isActive,
  onClick,
}: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-muted text-foreground"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
      )}
    >
      {Icon && (
        <Icon
          className={cn("size-4", isActive ? color : "text-muted-foreground")}
        />
      )}
      {label}
    </button>
  );
}

// Goal Row Component
interface GoalRowProps {
  goal: Goal;
  isSelected: boolean;
  onToggle: () => void;
}

function GoalRow({ goal, isSelected, onToggle }: GoalRowProps) {
  const IconComponent = goal.icon;

  return (
    <button
      onClick={onToggle}
      className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/50"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted transition-colors group-hover:bg-background">
        <IconComponent className={cn("size-4", goal.color)} />
      </div>
      <div className="min-w-0 flex-1">
        <span
          className={cn(
            "text-sm",
            isSelected ? "font-medium text-foreground" : "text-foreground",
          )}
        >
          {goal.label}
        </span>
        {goal.description && (
          <p className="truncate text-[12px] text-muted-foreground">
            {goal.description}
          </p>
        )}
      </div>
      <div
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
          isSelected
            ? "border-foreground bg-foreground"
            : "border-border group-hover:border-foreground/30",
        )}
      >
        {isSelected && <RiCheckLine className="size-3 text-background" />}
      </div>
    </button>
  );
}

// Goals List Component
interface GoalsListProps {
  goals: Goal[];
  selectedGoalIds: Set<string>;
  onToggleGoal: (goalId: string) => void;
  onAddGoal?: () => void;
  areaId: string;
  getAreaIdForGoal?: (goalId: string) => string;
}

function GoalsList({
  goals,
  selectedGoalIds,
  onToggleGoal,
  onAddGoal,
  areaId,
  getAreaIdForGoal,
}: GoalsListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-2">
      {onAddGoal && (
        <button
          onClick={onAddGoal}
          className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-dashed border-border transition-colors group-hover:border-foreground/20">
            <RiAddLine className="size-4" />
          </div>
          <span className="text-sm">Add a goal</span>
        </button>
      )}
      {goals.map((goal) => (
        <GoalRow
          key={goal.id}
          goal={goal}
          isSelected={selectedGoalIds.has(goal.id)}
          onToggle={() => onToggleGoal(goal.id)}
        />
      ))}
    </div>
  );
}

// Goals Distribution Chart Component
interface GoalsDistributionChartProps {
  data: { area: LifeArea; count: number }[];
}

function GoalsDistributionChart({ data }: GoalsDistributionChartProps) {
  const chartData = data.map(({ area, count }) => ({
    name: area.label,
    value: count,
    color: COLOR_MAP[area.color] || "#6366f1",
  }));

  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-4">
      <div className="size-16 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={20}
              outerRadius={32}
              paddingAngle={2}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {data.map(({ area, count }) => (
          <div key={area.id} className="flex items-center gap-1.5">
            <div
              className="size-2 rounded-full"
              style={{ backgroundColor: COLOR_MAP[area.color] || "#6366f1" }}
            />
            <span className="text-[11px] text-muted-foreground">
              {area.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Selected Goals Sidebar Component
interface SelectedGoalsSidebarProps {
  lifeAreas: LifeArea[];
  selectedGoalIds: Set<string>;
  onRemoveGoal: (areaId: string, goalId: string) => void;
}

function SelectedGoalsSidebar({
  lifeAreas,
  selectedGoalIds,
  onRemoveGoal,
}: SelectedGoalsSidebarProps) {
  const selectedByArea = React.useMemo(() => {
    return lifeAreas
      .map((area) => ({
        area,
        goals: area.goals.filter((g) => selectedGoalIds.has(g.id)),
      }))
      .filter((item) => item.goals.length > 0);
  }, [lifeAreas, selectedGoalIds]);

  const chartData = React.useMemo(() => {
    return selectedByArea.map(({ area, goals }) => ({
      area,
      count: goals.length,
    }));
  }, [selectedByArea]);

  return (
    <div className="flex h-full w-72 shrink-0 flex-col border-l border-border">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <h2 className="font-semibold text-foreground">Your goals</h2>
      </div>

      {/* Content */}
      <div className="scrollbar-hidden flex-1 overflow-y-auto">
        {selectedGoalIds.size === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-muted">
              <RiCheckLine className="size-5 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-foreground">
              No goals selected
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              Browse and select goals that resonate with you. You can edit the
              exact name later.
            </p>
          </div>
        ) : (
          <>
            {/* Distribution Chart */}
            <GoalsDistributionChart data={chartData} />

            {/* Goals List */}
            <div className="py-2">
              {selectedByArea.map(({ area, goals }) => (
                <div key={area.id} className="px-3 py-2">
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <area.icon className={cn("size-4", area.color)} />
                    <span className="text-[12px] font-medium text-foreground">
                      {area.label}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {goals.map((goal) => (
                      <div
                        key={goal.id}
                        className="group flex items-center gap-2 rounded-lg bg-muted/50 px-2.5 py-2"
                      >
                        <goal.icon
                          className={cn("size-4 shrink-0", goal.color)}
                        />
                        <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">
                          {goal.label}
                        </span>
                        <button
                          onClick={() => onRemoveGoal(area.id, goal.id)}
                          className="flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-background hover:text-foreground"
                        >
                          <RiCloseLine className="size-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Main Component
function GoalsDirectory({
  lifeAreas,
  popularGoals,
  selectedTab = "popular",
  selectedGoalIds = new Set(),
  onSelectTab,
  onToggleGoal,
  onAddGoal,
}: GoalsDirectoryProps) {
  const selectedArea = lifeAreas.find((area) => area.id === selectedTab);
  const isPopular = selectedTab === "popular";

  // Get the goals to display based on selected tab
  const displayedGoals = isPopular ? popularGoals : (selectedArea?.goals ?? []);

  // Get area ID for a goal (for popular tab, goals have areaId)
  const getAreaIdForGoal = React.useCallback(
    (goalId: string) => {
      if (isPopular) {
        const goal = popularGoals.find((g) => g.id === goalId) as
          | PopularGoal
          | undefined;
        return goal?.areaId ?? "";
      }
      return selectedTab;
    },
    [isPopular, popularGoals, selectedTab],
  );

  const handleToggleGoal = React.useCallback(
    (goalId: string) => {
      const areaId = getAreaIdForGoal(goalId);
      onToggleGoal?.(areaId, goalId);
    },
    [getAreaIdForGoal, onToggleGoal],
  );

  return (
    <div className="flex h-full w-full overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Tabs */}
        <div className="scrollbar-hidden flex items-center gap-1 overflow-x-auto border-b border-border px-4 py-2">
          <TabButton
            icon={RiSparklingLine}
            color="text-amber-500"
            label="Popular"
            isActive={isPopular}
            onClick={() => onSelectTab?.("popular")}
          />
          {lifeAreas.map((area) => (
            <TabButton
              key={area.id}
              icon={area.icon}
              color={area.color}
              label={area.label}
              isActive={selectedTab === area.id}
              onClick={() => onSelectTab?.(area.id)}
            />
          ))}
        </div>

        {/* Area Description (for non-popular tabs) */}
        {selectedArea && (
          <div className="border-b border-border px-4 py-3">
            <p className="text-[13px] text-muted-foreground">
              {selectedArea.description}
            </p>
          </div>
        )}

        {/* Goals List */}
        <GoalsList
          goals={displayedGoals}
          selectedGoalIds={selectedGoalIds}
          onToggleGoal={handleToggleGoal}
          onAddGoal={
            selectedArea && onAddGoal
              ? () => onAddGoal(selectedArea.id)
              : undefined
          }
          areaId={selectedTab}
          getAreaIdForGoal={getAreaIdForGoal}
        />
      </div>

      {/* Right: Selected Goals Sidebar */}
      <SelectedGoalsSidebar
        lifeAreas={lifeAreas}
        selectedGoalIds={selectedGoalIds}
        onRemoveGoal={(areaId, goalId) => onToggleGoal?.(areaId, goalId)}
      />
    </div>
  );
}

export { GoalsDirectory, TabButton, GoalRow, GoalsList, SelectedGoalsSidebar };
export type { GoalsDirectoryProps, LifeArea, Goal, PopularGoal };
