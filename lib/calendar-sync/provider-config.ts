/**
 * Static configuration for calendar providers.
 * Contains display metadata like icons, colors, and labels.
 */

import {
  RiGoogleFill,
  RiAppleFill,
  RiMicrosoftFill,
} from "@remixicon/react";
import type { IntegrationConfig, CalendarProvider } from "./types";

/** Configuration for each supported calendar provider */
export const CALENDAR_PROVIDERS: Record<CalendarProvider, IntegrationConfig> = {
  google: {
    id: "google-calendar",
    provider: "google",
    name: "Google Calendar",
    description: "Sync events from your Google Calendar",
    icon: RiGoogleFill,
    brandColor: "#4285f4",
  },
  apple: {
    id: "apple-calendar",
    provider: "apple",
    name: "Apple Calendar",
    description: "Sync events from your iCloud Calendar",
    icon: RiAppleFill,
    brandColor: "#000000",
  },
  outlook: {
    id: "outlook-calendar",
    provider: "outlook",
    name: "Outlook",
    description: "Sync events from Microsoft Outlook",
    icon: RiMicrosoftFill,
    brandColor: "#0078d4",
  },
};

/** Ordered list of providers for consistent display */
export const PROVIDER_ORDER: CalendarProvider[] = ["google", "apple", "outlook"];
