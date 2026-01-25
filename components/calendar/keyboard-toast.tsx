"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";

interface KeyboardToastProps {
  /** Message to display, or null to hide */
  message: string | null;
}

/**
 * A subtle toast notification for keyboard shortcut feedback.
 * Displays a small black pill with white text at the bottom center of the screen.
 */
export function KeyboardToast({ message }: KeyboardToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
        >
          <div className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900">
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
