/**
 * Mock data for calendar sync demo/prototype.
 * Provides sample calendars and events for each provider.
 */

import type {
  CalendarIntegrationState,
  ProviderCalendar,
  ExternalEvent,
} from "./types";

// =============================================================================
// Mock Calendars (populated on "connect")
// =============================================================================

export const MOCK_GOOGLE_CALENDARS: ProviderCalendar[] = [
  {
    id: "gc-work",
    provider: "google",
    name: "Work",
    color: "#4285f4",
    importEnabled: true,
    exportBlueprintEnabled: false,
  },
  {
    id: "gc-personal",
    provider: "google",
    name: "Personal",
    color: "#0f9d58",
    importEnabled: true,
    exportBlueprintEnabled: false,
  },
  {
    id: "gc-holidays",
    provider: "google",
    name: "Holidays in United States",
    color: "#db4437",
    importEnabled: false,
    exportBlueprintEnabled: false,
  },
  {
    id: "gc-birthdays",
    provider: "google",
    name: "Birthdays",
    color: "#f4b400",
    importEnabled: false,
    exportBlueprintEnabled: false,
  },
];

export const MOCK_APPLE_CALENDARS: ProviderCalendar[] = [
  {
    id: "ac-home",
    provider: "apple",
    name: "Home",
    color: "#30d158",
    importEnabled: true,
    exportBlueprintEnabled: false,
  },
  {
    id: "ac-work",
    provider: "apple",
    name: "Work",
    color: "#007aff",
    importEnabled: true,
    exportBlueprintEnabled: false,
  },
];

export const MOCK_OUTLOOK_CALENDARS: ProviderCalendar[] = [
  {
    id: "ol-calendar",
    provider: "outlook",
    name: "Calendar",
    color: "#0078d4",
    importEnabled: true,
    exportBlueprintEnabled: false,
  },
  {
    id: "ol-company",
    provider: "outlook",
    name: "Company Events",
    color: "#00bcf2",
    importEnabled: false,
    exportBlueprintEnabled: false,
  },
];

// =============================================================================
// Mock Events (returned when calendars are enabled)
// =============================================================================

export const MOCK_EXTERNAL_EVENTS: ExternalEvent[] = [
  // Google Work Calendar
  {
    id: "ext-gw-1",
    provider: "google",
    calendarId: "gc-work",
    calendarName: "Work",
    calendarColor: "#4285f4",
    title: "Team Standup",
    date: "2026-01-26", // Monday
    startMinutes: 540, // 9:00 AM
    durationMinutes: 30,
    isAllDay: false,
  },
  {
    id: "ext-gw-2",
    provider: "google",
    calendarId: "gc-work",
    calendarName: "Work",
    calendarColor: "#4285f4",
    title: "1:1 with Manager",
    date: "2026-01-27", // Tuesday
    startMinutes: 840, // 2:00 PM
    durationMinutes: 30,
    isAllDay: false,
  },
  {
    id: "ext-gw-3",
    provider: "google",
    calendarId: "gc-work",
    calendarName: "Work",
    calendarColor: "#4285f4",
    title: "Sprint Planning",
    date: "2026-01-28", // Wednesday
    startMinutes: 600, // 10:00 AM
    durationMinutes: 60,
    isAllDay: false,
  },
  // Google Personal Calendar
  {
    id: "ext-gp-1",
    provider: "google",
    calendarId: "gc-personal",
    calendarName: "Personal",
    calendarColor: "#0f9d58",
    title: "Dentist Appointment",
    date: "2026-01-28", // Wednesday
    startMinutes: 690, // 11:30 AM
    durationMinutes: 60,
    isAllDay: false,
  },
  {
    id: "ext-gp-2",
    provider: "google",
    calendarId: "gc-personal",
    calendarName: "Personal",
    calendarColor: "#0f9d58",
    title: "Flight to NYC",
    date: "2026-01-30", // Friday
    startMinutes: 0,
    durationMinutes: 0,
    isAllDay: true,
  },
  // Outlook Calendar
  {
    id: "ext-ol-1",
    provider: "outlook",
    calendarId: "ol-calendar",
    calendarName: "Calendar",
    calendarColor: "#0078d4",
    title: "Company All-Hands",
    date: "2026-01-29", // Thursday
    startMinutes: 0,
    durationMinutes: 0,
    isAllDay: true,
  },
];

// =============================================================================
// Initial Demo State (one provider connected)
// =============================================================================

export const DEMO_INITIAL_STATES: CalendarIntegrationState[] = [
  {
    provider: "google",
    status: "connected",
    accountEmail: "user@gmail.com",
    calendars: MOCK_GOOGLE_CALENDARS,
    lastSyncAt: new Date(),
  },
  {
    provider: "apple",
    status: "not_connected",
    accountEmail: null,
    calendars: [],
    lastSyncAt: null,
  },
  {
    provider: "outlook",
    status: "not_connected",
    accountEmail: null,
    calendars: [],
    lastSyncAt: null,
  },
];
