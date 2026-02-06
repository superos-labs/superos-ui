# Focus Mode Library

**Purpose:** Client-side hooks and types for managing Focus Mode sessions, tracking elapsed time, handling pause/resume segments, and sending browser notifications when focus sessions complete.

## Core Components

### Focus Session Hook
- **`use-focus-session.ts`** — Client-side hook for managing Focus Mode sessions
  - Provides start, pause, resume, and end controls
  - Tracks elapsed time and pause/resume segments
  - Emits completed session summary when session finishes
  - Creates and manages active focus session
  - Tracks pause/resume segments and elapsed time
  - Emits completed session object on end
  - Time tracked in milliseconds
  - Elapsed time updates once per second while running
  - Uses GoalColor as semantic color type for focused blocks

### Focus Notifications Hook
- **`use-focus-notifications.ts`** — Client-side hook for Focus Mode browser notifications
  - Sends notification when currently focused block reaches its scheduled end time
  - Based on associated calendar event
  - Requests and tracks browser notification permission
  - Determines end timestamp of focused calendar block
  - Schedules and fires notification when block ends
  - No notification sent if block is already in the past
  - Only one notification sent per focus session
  - Gracefully no-ops if Notification API is unsupported

### Types
- **`types.ts`** — Type definitions for Focus Mode
  - Models shape of focus sessions, pause/resume segments, and public contract for focus session hook
  - Defines active and completed focus session structures
  - Defines focus segment (pause/resume slice) structure
  - Defines hook option and return types
  - Uses GoalColor as semantic color type for focused blocks
  - Time values represented as timestamps or milliseconds

### Public API
- **`index.ts`** — Public API for Focus Mode
  - Re-exports hooks and types required to manage focus sessions, segments, and focus-related notifications
  - Exposes focus session state and control hook
  - Exposes focus notification hook
  - Re-exports all related public types

## Key Features

- **Session Management:** Start, pause, resume, and end focus sessions
- **Time Tracking:** Tracks elapsed time with 1-second updates
- **Pause/Resume:** Supports pause/resume segments within a session
- **Session Completion:** Emits completed session summary with total elapsed time
- **Browser Notifications:** Sends notification when focused block ends
- **Permission Handling:** Manages browser notification permission requests
- **Event Integration:** Determines block end time from calendar events
- **Color Support:** Uses goal colors for focused blocks

## Design Principles

- **Millisecond Precision:** Time tracked in milliseconds for accuracy
- **Segment-Based:** Tracks pause/resume segments for accurate elapsed time
- **Event-Driven:** Notifications based on calendar event end times
- **Permission-Aware:** Handles notification permission gracefully
- **Single Notification:** Only one notification per focus session
- **Past Block Handling:** No notification for blocks already in the past
- **API Compatibility:** Gracefully handles unsupported Notification API

## Usage Patterns

1. **Start Focus:** Call `startFocus` with event ID and block color
2. **Track Time:** Elapsed time automatically updates every second
3. **Pause/Resume:** Use `pauseFocus` and `resumeFocus` to pause/resume sessions
4. **End Session:** Call `endFocus` to complete session and get summary
5. **Notifications:** Hook automatically sends notification when block ends
6. **Session State:** Access `session` to get current active session or null
7. **Completed Sessions:** Handle `onSessionComplete` callback for completed sessions

## Integration Points

- **Calendar Events:** Uses calendar events to determine block end times
- **Focus Components:** Provides state and controls for focus UI components
- **Shell:** Focus session state integrated into shell focus handlers
- **Block Sidebar:** Focus timer components use focus session hook
- **Notifications:** Browser Notification API for end-of-block alerts

**Total Files:** 4 (2 React hooks, 1 types file, 1 public API)
