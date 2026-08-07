/**
 * ---------------------------------------------------------
 * File: utils.ts
 * Purpose:
 * React component for utils.
 * ---------------------------------------------------------
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Reusable utils component.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
