"use client";

import { ThemeSwitch } from "@/components/theme-switch";
import "@/styles/globals.css";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "next-themes";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class">
          <NextUIProvider>
            <div className="relative flex flex-col min-h-screen">
              <div className="m-4">
                <ThemeSwitch />
              </div>
              <main className="container mx-auto max-w-7xl flex-grow px-6 pt-16">{children}</main>
            </div>
          </NextUIProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
