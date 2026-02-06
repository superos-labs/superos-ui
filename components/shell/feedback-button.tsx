/**
 * =============================================================================
 * File: feedback-button.tsx
 * =============================================================================
 *
 * Floating shell control that provides quick access to:
 * - Calendar zoom controls
 * - Help, feedback, and community resources
 *
 * Renders as a compact cluster in the bottom-right of the shell.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Display current calendar zoom level.
 * - Invoke zoom in / zoom out handlers.
 * - Surface links to feedback form, onboarding video, and Slack community.
 * - Provide subtle motion and hover affordances.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Managing zoom state.
 * - Persisting user preferences.
 * - Owning any shell layout decisions.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Uses dropdown menus to minimize visual footprint.
 * - Motion is purely decorative and not state-bearing.
 * - Buttons are visually consistent with other shell floating controls.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - FeedbackButton
 * - FeedbackButtonProps
 */

"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  RiZoomInLine,
  RiSubtractLine,
  RiAddLine,
  RiQuestionLine,
  RiPlayCircleLine,
  RiLifebuoyLine,
  RiSlackLine,
} from "@remixicon/react";
import { MIN_CALENDAR_ZOOM, MAX_CALENDAR_ZOOM } from "@/lib/preferences";

// =============================================================================
// Constants
// =============================================================================

const FEEDBACK_FORM_URL =
  "https://super-os.notion.site/2f1dc01c453d80e3a60edfa768c067bc";
const ONBOARDING_VIDEO_URL =
  "https://www.loom.com/share/e3d7b59cb4ac4642b34eb35df5e88db4";
const SLACK_COMMUNITY_URL = "https://superoscommunity.slack.com";

// =============================================================================
// Types
// =============================================================================

export interface FeedbackButtonProps {
  calendarZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

// =============================================================================
// Component
// =============================================================================

export function FeedbackButton({
  calendarZoom,
  onZoomIn,
  onZoomOut,
}: FeedbackButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2">
      {/* Zoom controls button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            className="flex size-10 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-sm ring-1 ring-border/50 backdrop-blur-sm transition-colors hover:bg-background hover:text-foreground hover:shadow-md data-[state=open]:bg-background data-[state=open]:text-foreground data-[state=open]:shadow-md"
            aria-label="Zoom controls"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <RiZoomInLine className="size-5" />
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-36">
          <div className="flex items-center justify-between gap-2 px-2 py-1.5">
            <button
              onClick={onZoomOut}
              disabled={calendarZoom <= MIN_CALENDAR_ZOOM}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
              title="Zoom out"
            >
              <RiSubtractLine className="size-4" />
            </button>
            <span className="text-sm font-medium tabular-nums text-foreground">
              {calendarZoom}%
            </span>
            <button
              onClick={onZoomIn}
              disabled={calendarZoom >= MAX_CALENDAR_ZOOM}
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
              title="Zoom in"
            >
              <RiAddLine className="size-4" />
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Help and feedback button */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex size-10 items-center justify-center rounded-full bg-background/80 text-muted-foreground shadow-sm ring-1 ring-border/50 backdrop-blur-sm transition-colors hover:bg-background hover:text-foreground hover:shadow-md data-[state=open]:bg-background data-[state=open]:text-foreground data-[state=open]:shadow-md"
            aria-label="Help and feedback"
          >
            <motion.div
              animate={{ rotate: isHovered ? 15 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <RiLifebuoyLine className="size-5" />
            </motion.div>
          </motion.button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-48">
          <DropdownMenuItem
            onClick={() =>
              window.open(FEEDBACK_FORM_URL, "_blank", "noopener,noreferrer")
            }
          >
            <RiQuestionLine className="size-4" />
            Share feedback
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              window.open(ONBOARDING_VIDEO_URL, "_blank", "noopener,noreferrer")
            }
          >
            <RiPlayCircleLine className="size-4" />
            Watch Ali&apos;s onboarding
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              window.open(SLACK_COMMUNITY_URL, "_blank", "noopener,noreferrer")
            }
          >
            <RiSlackLine className="size-4" />
            Slack community
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
