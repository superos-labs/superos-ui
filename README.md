# SuperOS UI

**A comprehensive React/Next.js UI component library and application prototype for SuperOS, a unified productivity and calendar management system.**

## Overview

SuperOS UI is a modern, type-safe React application built with Next.js that provides a unified interface for managing goals, tasks, calendar events, and recurring life activities. The application features a sophisticated calendar system, drag-and-drop interactions, focus mode, weekly planning, analytics, and calendar integrations.

## Tech Stack

### Core Framework
- **Next.js 16.1.4** - React framework with App Router
- **React 19.2.3** - UI library with React Compiler enabled
- **TypeScript 5** - Type-safe development

### UI & Styling
- **Tailwind CSS v4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Base UI** - Additional component primitives (Combobox)
- **Framer Motion** - Animation library
- **class-variance-authority** - Component variant management
- **Remix Icon** - Icon library

### Utilities & Tools
- **date-fns** - Date manipulation and formatting
- **recharts** - Data visualization
- **react-day-picker** - Date picker component
- **clsx** + **tailwind-merge** - Conditional class name utilities

### Development
- **ESLint** - Code linting
- **React Compiler** - Automatic React optimizations

## Project Structure

```
superos-ui/
├── app/                    # Next.js App Router directory
│   ├── layout.tsx         # Root layout (fonts, metadata, global styles)
│   ├── page.tsx           # Main application entry (shell composition)
│   ├── globals.css        # Global styles and design tokens
│   └── [slug]/            # Dynamic component preview routes
│
├── components/             # UI component library
│   ├── calendar/          # Calendar view system
│   ├── block/            # Calendar block components
│   ├── backlog/          # Goals and essentials backlog
│   ├── shell/            # Application shell and layout
│   ├── weekly-planning/  # Weekly planning flow
│   ├── focus/            # Focus mode components
│   ├── integrations/     # Calendar integration UI
│   ├── drag/             # Drag-and-drop system
│   ├── ui/               # Reusable UI primitives
│   └── index.ts          # Public component API
│
├── lib/                   # Core library code
│   ├── unified-schedule/ # Unified schedule domain logic
│   ├── calendar-sync/    # Calendar integration system
│   ├── blueprint/        # Blueprint template system
│   ├── weekly-planning/ # Weekly planning hooks
│   ├── essentials/       # Essentials configuration
│   ├── focus/            # Focus mode hooks
│   ├── undo/             # Undo system
│   ├── preferences/      # User preferences
│   ├── responsive/       # Responsive utilities
│   ├── adapters/         # Data transformation adapters
│   ├── fixtures/         # Fixture data for development
│   ├── colors.ts         # Color system
│   ├── time-utils.ts     # Time formatting utilities
│   ├── utils.ts          # General utilities
│   └── types.ts          # Shared types
│
├── hooks/                 # Public hooks API
│   └── index.ts          # Re-exports unified schedule hooks
│
└── public/                # Static assets
```

## Getting Started

### Prerequisites
- Node.js 20+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

The application will be available at `http://localhost:3000`.

## Key Features

### Calendar System
- **Week and Day Views** - Flexible calendar views with time-based scheduling
- **Drag-and-Drop** - Drag goals, tasks, and essentials onto the calendar
- **Block Management** - Visual calendar blocks with resizing and editing
- **Deadline Awareness** - Tray system for upcoming deadlines
- **External Calendar Sync** - Integration with Google Calendar and other providers

### Goal & Task Management
- **Goal Creation** - Create goals with icons, colors, and life area categorization
- **Task Tracking** - Manage tasks within goals with subtasks and deadlines
- **Backlog System** - Centralized view of goals and essentials
- **Goal Detail Views** - Comprehensive goal inspection and editing

### Weekly Planning
- **Two-Step Flow** - Prioritize goals, then schedule them
- **Blueprint System** - Template-based weekly planning
- **Planning Budget** - Visual time allocation tracking
- **Analytics** - Weekly progress and time distribution analytics

### Focus Mode
- **Focus Timer** - Pomodoro-style focus sessions
- **Notifications** - Browser notifications for focus sessions
- **Session Tracking** - Track focus time and completion

### Essentials
- **Recurring Activities** - Configure recurring life activities
- **Auto-Scheduling** - Automatic calendar event generation
- **Schedule Management** - Edit activity schedules with day/time configuration

### User Preferences
- **Customizable Settings** - Week start day, progress metrics, calendar zoom
- **Responsive Design** - Mobile, tablet, and desktop layouts
- **Dark Mode** - Light and dark theme support

## Architecture

### Design Principles
- **Component Composition** - Modular, reusable components
- **Separation of Concerns** - UI components separate from domain logic
- **Type Safety** - Strong TypeScript typing throughout
- **Single Source of Truth** - Centralized state management
- **Immutability** - Immutable state updates where applicable
- **Command Pattern** - Undo system using command pattern

### State Management
- **React Hooks** - Custom hooks for domain logic
- **Context Providers** - Global state (Preferences, Undo, Drag)
- **In-Memory State** - Client-side state management (prototype)
- **Session State** - Focus sessions and temporary UI state

### Component Architecture
- **Presentational Components** - UI-focused components
- **Container Components** - Logic and state management
- **Hooks** - Reusable domain logic
- **Adapters** - Data transformation layer
- **Utilities** - Pure utility functions

## Documentation

Each major directory contains its own `README.md` with detailed documentation:

- [`components/README.md`](./components/README.md) - Component library overview
- [`lib/README.md`](./lib/README.md) - Library code overview
- [`app/README.md`](./app/README.md) - Next.js app structure

See subdirectory READMEs for domain-specific documentation.

## Development Guidelines

### Code Organization
- **Domain-Driven Structure** - Code organized by feature domain
- **Barrel Exports** - Public APIs via `index.ts` files
- **File Headers** - Comprehensive file headers with responsibilities and design notes
- **Type Definitions** - Shared types in `lib/types.ts` and domain-specific type files

### Styling
- **Tailwind CSS** - Utility-first styling approach
- **Design Tokens** - CSS variables in `globals.css`
- **Component Variants** - CVA for component variants
- **Responsive Design** - Mobile-first responsive utilities

### Component Development
- **"use client"** - Client components explicitly marked
- **Server Components** - Default to server components where possible
- **Accessibility** - Radix UI primitives for accessibility
- **Performance** - React Compiler optimizations enabled

### Import Guidelines
- **Public APIs** - Import from `components/index.ts` and `lib/*/index.ts`
- **Path Aliases** - Use `@/*` for absolute imports
- **Avoid Direct Imports** - Prefer barrel file exports

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Configuration

### Next.js (`next.config.ts`)
- React Compiler enabled
- Optimized package imports for icons, charts, and animations

### TypeScript (`tsconfig.json`)
- Strict mode enabled
- Path aliases configured (`@/*`)
- React JSX transform
- Incremental compilation

### Tailwind CSS
- v4 with PostCSS
- Design tokens via CSS variables
- Custom theme configuration

## License

Private project - All rights reserved.
