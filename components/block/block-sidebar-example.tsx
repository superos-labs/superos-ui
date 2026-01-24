"use client";

import * as React from "react";
import { useCallback, useState } from "react";
import {
  BlockSidebar,
  type BlockSidebarData,
  type BlockSidebarTask,
  type BlockSidebarGoal,
} from "./block-sidebar";
import {
  KnobsProvider,
  KnobsPanel,
  KnobBoolean,
  KnobSelect,
} from "@/components/knobs";
import type { BlockColor } from "./block";
import { RiRocketLine } from "@remixicon/react";

const SAMPLE_GOAL: BlockSidebarGoal = {
  id: "goal-1",
  label: "Launch MVP",
  icon: RiRocketLine,
  color: "text-indigo-500",
};

const SAMPLE_TASKS: BlockSidebarTask[] = [
  { id: "task-1", label: "Review project requirements", completed: true },
  { id: "task-2", label: "Update design mockups", completed: true },
  { id: "task-3", label: "Write unit tests", completed: false },
  { id: "task-4", label: "Document API changes", completed: false },
];

const SAMPLE_BLOCK: BlockSidebarData = {
  id: "block-1",
  title: "Deep Work: Product Development",
  date: "2026-01-20",
  startTime: "09:00",
  endTime: "11:30",
  notes:
    "Focus on the core feature implementation. Review the latest feedback from the design team and incorporate changes. Prepare for the afternoon sync meeting.",
  tasks: SAMPLE_TASKS,
  color: "indigo",
  goal: SAMPLE_GOAL,
};

const COLOR_OPTIONS: { value: BlockColor; label: string }[] = [
  { value: "violet", label: "Violet" },
  { value: "indigo", label: "Indigo" },
  { value: "blue", label: "Blue" },
  { value: "sky", label: "Sky" },
  { value: "cyan", label: "Cyan" },
  { value: "teal", label: "Teal" },
  { value: "emerald", label: "Emerald" },
  { value: "green", label: "Green" },
  { value: "lime", label: "Lime" },
  { value: "yellow", label: "Yellow" },
  { value: "amber", label: "Amber" },
  { value: "orange", label: "Orange" },
  { value: "red", label: "Red" },
  { value: "rose", label: "Rose" },
  { value: "pink", label: "Pink" },
  { value: "fuchsia", label: "Fuchsia" },
  { value: "slate", label: "Slate" },
];

export function BlockSidebarExample() {
  const [showCloseButton, setShowCloseButton] = useState(true);
  const [editable, setEditable] = useState(true);
  const [color, setColor] = useState<BlockColor>("indigo");
  const [tasks, setTasks] = useState(SAMPLE_TASKS);
  const [title, setTitle] = useState(SAMPLE_BLOCK.title);
  const [date, setDate] = useState(SAMPLE_BLOCK.date);
  const [startTime, setStartTime] = useState(SAMPLE_BLOCK.startTime);
  const [endTime, setEndTime] = useState(SAMPLE_BLOCK.endTime);
  const [notes, setNotes] = useState(SAMPLE_BLOCK.notes || "");

  const handleToggleTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  }, []);

  const handleClose = useCallback(() => {
    // In a real app, this would close the sidebar
    console.log("Close sidebar");
  }, []);

  const block: BlockSidebarData = {
    ...SAMPLE_BLOCK,
    title,
    date,
    startTime,
    endTime,
    color,
    tasks,
    notes,
  };

  return (
    <KnobsProvider>
      <BlockSidebar
        block={block}
        onToggleTask={handleToggleTask}
        onClose={showCloseButton ? handleClose : undefined}
        onTitleChange={editable ? setTitle : undefined}
        onDateChange={editable ? setDate : undefined}
        onStartTimeChange={editable ? setStartTime : undefined}
        onEndTimeChange={editable ? setEndTime : undefined}
        onNotesChange={editable ? setNotes : undefined}
      />
      <KnobsPanel>
        <KnobBoolean
          label="Show Close Button"
          value={showCloseButton}
          onChange={setShowCloseButton}
        />
        <KnobBoolean label="Editable" value={editable} onChange={setEditable} />
        <KnobSelect
          label="Color"
          value={color}
          options={COLOR_OPTIONS}
          onChange={setColor}
        />
      </KnobsPanel>
    </KnobsProvider>
  );
}
