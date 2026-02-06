# Undo System

**Purpose:** Client-side undo system using React context and command pattern for recording and undoing user actions across the application.

## Core Components

### React Hooks & Provider
- **`use-undo.tsx`** — Client-side undo system using React context and command pattern
  - Provides UndoProvider, hooks, and keyboard handling
  - Manages undo command history via CommandHistory
  - Exposes record and undo operations through context
  - Tracks last command for toast/feedback
  - Handles CMD/Ctrl+Z keyboard shortcut
  - History stored in ref to avoid unnecessary re-renders
  - Keyboard handler ignores inputs and editable fields

### Command History
- **`command-history.ts`** — In-memory command history for undo functionality
  - Maintains bounded stack of undoable commands
  - Exposes helpers for pushing, popping, and inspecting history
  - Stores undoable commands in order
  - Enforces maximum history size (default: 10 commands)
  - Provides stack-like accessors
  - Oldest commands are dropped when exceeding max size
  - Pure in-memory utility (no persistence)

### Types
- **`types.ts`** — Type definitions for the Undo system
  - Defines undoable command structures, action types, and payload shapes
  - Defines undo action type union
  - Defines base UndoCommand interface
  - Defines strongly-typed payloads for specific undo scenarios
  - Defines Undo context contract
  - Commands encapsulate both metadata and undo behavior
  - Payload types exist for type-safe handler implementations

### Public API
- **`index.ts`** — Public API for the Undo system
  - Re-exports undo-related types, command history utilities, and React hooks
  - Exposes undo domain types, command history implementation, and undo provider/hooks

## Supported Undo Actions

The system supports undoing the following actions:

- **Task Operations:**
  - Task completion toggle
  - Task deletion
  - Task unassignment from blocks

- **Block Operations:**
  - Block status changes (planned/completed)
  - Block deletion
  - Block creation

- **Day Operations:**
  - Mark entire day complete (batch operation)

## Design Principles

- **Command Pattern:** Commands encapsulate both metadata and undo behavior
- **Bounded History:** Maximum history size prevents unbounded memory growth
- **Type Safety:** Strongly-typed payloads for type-safe handler implementations
- **In-Memory Only:** No persistence; history is lost on page refresh
- **Keyboard Integration:** CMD/Ctrl+Z keyboard shortcut support
- **Context-Aware:** Keyboard handler ignores inputs and editable fields
- **Performance:** History stored in ref to avoid unnecessary re-renders

## Usage Pattern

1. **Provider Setup:** Wrap application with `UndoProvider`
2. **Record Commands:** Use `useUndo` or `useUndoOptional` hook to record commands
3. **Undo Operations:** Call `undo()` function from hook
4. **Keyboard Shortcut:** CMD/Ctrl+Z automatically triggers undo
5. **Feedback:** Last command tracked for toast/feedback display

## Key Features

- **Command History:** Bounded stack of undoable commands (max 10)
- **React Context:** Global undo state accessible throughout app
- **Keyboard Shortcuts:** CMD/Ctrl+Z for quick undo
- **Type Safety:** Strongly-typed command payloads
- **Multiple Action Types:** Supports tasks, blocks, and day operations
- **Batch Operations:** Supports undoing multiple related operations together
- **Optional Usage:** `useUndoOptional` allows graceful degradation when provider not present

**Total Files:** 4 (1 React hook/provider, 1 command history utility, 1 types file, 1 public API)
