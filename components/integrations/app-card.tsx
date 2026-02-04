"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  RiAppleFill,
  RiAndroidFill,
  RiArrowRightUpLine,
} from "@remixicon/react";

type AppType = "ios" | "android" | "chrome-extension";

interface AppConfig {
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }> | null;
  useCustomIcon?: boolean;
  iconColor: string;
  installUrl: string;
  installLabel: string;
}

const APP_CONFIGS: Record<AppType, AppConfig> = {
  ios: {
    name: "SuperOS for iOS",
    description: "Capture thoughts on the go",
    icon: RiAppleFill,
    iconColor: "#000000",
    installUrl: "#",
    installLabel: "Get app",
  },
  android: {
    name: "SuperOS for Android",
    description: "Capture thoughts on the go",
    icon: RiAndroidFill,
    iconColor: "#3DDC84",
    installUrl: "#",
    installLabel: "Get app",
  },
  "chrome-extension": {
    name: "Chrome Extension",
    description: "Block sites while in focus",
    icon: null,
    useCustomIcon: true,
    iconColor: "#4285F4",
    installUrl: "#",
    installLabel: "Install",
  },
};

const APP_ORDER: AppType[] = ["ios", "android", "chrome-extension"];

interface AppCardProps {
  appType: AppType;
}

/**
 * Chrome logo with official colors and gradients
 */
function ChromeIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 48 48"
      className={className}
    >
      <defs>
        <linearGradient
          id="chrome-gradient-a"
          x1="3.2173"
          y1="15"
          x2="44.7812"
          y2="15"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#d93025" />
          <stop offset="1" stopColor="#ea4335" />
        </linearGradient>
        <linearGradient
          id="chrome-gradient-b"
          x1="20.7219"
          y1="47.6791"
          x2="41.5039"
          y2="11.6837"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#fcc934" />
          <stop offset="1" stopColor="#fbbc04" />
        </linearGradient>
        <linearGradient
          id="chrome-gradient-c"
          x1="26.5981"
          y1="46.5015"
          x2="5.8161"
          y2="10.506"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor="#1e8e3e" />
          <stop offset="1" stopColor="#34a853" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="23.9947" r="12" fill="#fff" />
      <path
        d="M3.2154,36A24,24,0,1,0,12,3.2154,24,24,0,0,0,3.2154,36ZM34.3923,18A12,12,0,1,1,18,13.6077,12,12,0,0,1,34.3923,18Z"
        fill="none"
      />
      <path
        d="M24,12H44.7812a23.9939,23.9939,0,0,0-41.5639.0029L13.6079,30l.0093-.0024A11.9852,11.9852,0,0,1,24,12Z"
        fill="url(#chrome-gradient-a)"
      />
      <circle cx="24" cy="24" r="9.5" fill="#1a73e8" />
      <path
        d="M34.3913,30.0029,24.0007,48A23.994,23.994,0,0,0,44.78,12.0031H23.9989l-.0025.0093A11.985,11.985,0,0,1,34.3913,30.0029Z"
        fill="url(#chrome-gradient-b)"
      />
      <path
        d="M13.6086,30.0031,3.218,12.006A23.994,23.994,0,0,0,24.0025,48L34.3931,30.0029l-.0067-.0068a11.9852,11.9852,0,0,1-20.7778.007Z"
        fill="url(#chrome-gradient-c)"
      />
    </svg>
  );
}

/**
 * Card representing a native app (mobile or extension).
 * Modern design with subtle styling and refined interactions.
 */
function AppCard({ appType }: AppCardProps) {
  const config = APP_CONFIGS[appType];
  const Icon = config.icon;

  const handleInstallClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(config.installUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl p-3",
        "bg-gradient-to-r from-muted/30 to-transparent",
        "transition-all duration-200",
        "hover:from-muted/60 hover:to-muted/20"
      )}
    >
      {/* App Icon - Subtle container */}
      <div
        className={cn(
          "relative flex size-10 shrink-0 items-center justify-center rounded-xl",
          "bg-muted/50 shadow-sm",
          "transition-transform duration-200 group-hover:scale-105"
        )}
      >
        {config.useCustomIcon ? (
          <ChromeIcon className="size-7" />
        ) : Icon ? (
          <span style={{ color: config.iconColor }}>
            <Icon className="size-5" />
          </span>
        ) : null}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <span className="text-sm font-medium text-foreground">
          {config.name}
        </span>
        <p className="text-xs text-muted-foreground">
          {config.description}
        </p>
      </div>

      {/* Install Button - Modern pill style */}
      <button
        onClick={handleInstallClick}
        className={cn(
          "flex items-center gap-1 rounded-full px-3 py-1.5",
          "text-xs font-medium",
          "bg-foreground text-background",
          "transition-all duration-200",
          "hover:opacity-90 hover:shadow-md",
          "active:scale-95",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        )}
      >
        {config.installLabel}
        <RiArrowRightUpLine className="size-3.5" />
      </button>
    </div>
  );
}

export { AppCard, APP_ORDER };
export type { AppCardProps, AppType };
