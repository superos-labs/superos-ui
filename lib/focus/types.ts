/**
 * Focus mode types for tracking deep work sessions.
 */

import type { BlockColor } from "@/components/block";

// =============================================================================
// Session Types
// =============================================================================

/**
 * A completed segment of focus time (between pause/resume).
 */
export interface FocusSegment {
  /** Timestamp when this segment started */
  startedAt: number;
  /** Timestamp when this segment ended */
  endedAt: number;
}

/**
 * An active focus session, associated with a specific block.
 */
export interface ActiveFocusSession {
  /** ID of the block being focused on */
  blockId: string;
  /** Title of the block (for display in toolbar indicator) */
  blockTitle: string;
  /** Color of the block (for display in toolbar indicator) */
  blockColor: BlockColor;
  /** Completed pause/resume segments */
  segments: FocusSegment[];
  /** Timestamp when current segment started (null if paused) */
  currentSegmentStart: number | null;
}

/**
 * A completed focus session with total time calculated.
 * Emitted when a session ends.
 */
export interface CompletedFocusSession {
  /** ID of the block that was focused on */
  blockId: string;
  /** Title of the block */
  blockTitle: string;
  /** Color of the block */
  blockColor: BlockColor;
  /** All completed segments */
  segments: FocusSegment[];
  /** Total focus time in milliseconds */
  totalMs: number;
  /** When the session started */
  startedAt: number;
  /** When the session ended */
  endedAt: number;
}

// =============================================================================
// Hook Types
// =============================================================================

export interface UseFocusSessionOptions {
  /** Called when a session ends with the completed session data */
  onSessionEnd?: (session: CompletedFocusSession) => void;
}

export interface UseFocusSessionReturn {
  /** Currently active focus session, or null if no session */
  session: ActiveFocusSession | null;
  /** Whether the timer is actively running (not paused) */
  isRunning: boolean;
  /** Elapsed time in milliseconds (updates every second when running) */
  elapsedMs: number;
  /** Start focus on a block */
  start: (blockId: string, blockTitle: string, blockColor: BlockColor) => void;
  /** Pause the current session */
  pause: () => void;
  /** Resume a paused session */
  resume: () => void;
  /** End the session and trigger onSessionEnd callback */
  end: () => void;
}
