/**
 * =============================================================================
 * File: app/layout.tsx
 * =============================================================================
 *
 * Root application layout.
 *
 * Defines global document structure, loads and registers core fonts,
 * imports global styles, and configures base metadata for the app.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Import global CSS.
 * - Register Google fonts and expose them as CSS variables.
 * - Define default document metadata.
 * - Wrap all routes with the root HTML and BODY structure.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Fonts are exposed as CSS variables to integrate with the token system in
 *   `globals.css`.
 * - Keeps layout intentionally minimal to avoid coupling global concerns with
 *   view-level composition.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - metadata
 * - default: RootLayout
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono, Public_Sans } from "next/font/google";
import "./globals.css";

const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SuperOS",
  description: "SuperOS design prototype environment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={publicSans.variable}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
