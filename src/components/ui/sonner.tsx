/**
 * ---------------------------------------------------------
 * File: sonner.tsx
 * Purpose:
 * React component for sonner.
 * ---------------------------------------------------------
 */

"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white group-[.toaster]:dark:bg-slate-900 group-[.toaster]:text-slate-950 group-[.toaster]:dark:text-slate-50 group-[.toaster]:border-slate-200 group-[.toaster]:dark:border-slate-800 group-[.toaster]:shadow-lg",
          description: "text-slate-500 dark:text-slate-400",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        }
      }}
      {...props}
    />
  );
};

export { Toaster };
