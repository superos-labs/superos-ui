"use client";

/**
 * InlineVideoTutorial - Dismissible video tutorial with play button overlay
 *
 * Shows a video thumbnail with an animated play button that opens the video
 * in a new tab when clicked. Can be dismissed by the user.
 */

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { RiCloseLine } from "@remixicon/react";
import Image from "next/image";

// Custom play icon with proper visual weight
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86Z" />
    </svg>
  );
}

export interface InlineVideoTutorialProps {
  /** URL to open when play button is clicked */
  videoUrl: string;
  /** Path to the thumbnail image */
  thumbnailSrc: string;
  /** Caption text to display below the video */
  caption: string;
  /** Alt text for the thumbnail image */
  thumbnailAlt?: string;
  /** Optional className for the container */
  className?: string;
}

export function InlineVideoTutorial({
  videoUrl,
  thumbnailSrc,
  caption,
  thumbnailAlt = "Video tutorial thumbnail",
  className,
}: InlineVideoTutorialProps) {
  const [isVisible, setIsVisible] = React.useState(true);
  const [isHovered, setIsHovered] = React.useState(false);

  const handlePlayClick = () => {
    window.open(videoUrl, "_blank", "noopener,noreferrer");
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 0.98,
            marginTop: 0,
            marginBottom: 0,
          }}
          transition={{ 
            duration: 0.25,
            ease: [0.4, 0, 0.2, 1]
          }}
          className={cn("relative flex flex-col gap-2", className)}
        >
          {/* Video Container with Play Button Overlay */}
          <div
            className="group relative cursor-pointer overflow-hidden rounded-lg"
            onClick={handlePlayClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Thumbnail */}
            <div className="relative aspect-video w-full bg-muted">
              <Image
                src={thumbnailSrc}
                alt={thumbnailAlt}
                fill
                className={cn(
                  "object-cover transition-transform duration-500 ease-out",
                  isHovered && "scale-[1.02]",
                )}
                sizes="(max-width: 768px) 100vw, 360px"
              />
            </div>

            {/* Gradient Overlay - more refined than flat color */}
            <div
              className={cn(
                "absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-black/5 transition-opacity duration-300",
                isHovered ? "opacity-80" : "opacity-100",
              )}
            />

            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className={cn(
                  "relative flex size-12 items-center justify-center rounded-full transition-all duration-300 ease-out",
                  // Frosted glass effect with subtle border
                  "bg-white/85 backdrop-blur-sm",
                  "shadow-[0_2px_8px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08)]",
                  "ring-1 ring-black/[0.04]",
                  // Subtle hover state
                  isHovered && "bg-white/95 shadow-[0_4px_12px_rgba(0,0,0,0.15),0_2px_4px_rgba(0,0,0,0.1)] scale-[1.04]",
                )}
              >
                {/* Play icon - optically centered */}
                <PlayIcon
                  className={cn(
                    "size-5 text-neutral-800 transition-colors duration-300",
                    isHovered && "text-neutral-900",
                  )}
                />
              </div>
            </div>
          </div>

          {/* Caption with Dismiss Button */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">{caption}</span>
            <button
              onClick={handleDismiss}
              className="flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Dismiss video"
            >
              <RiCloseLine className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
