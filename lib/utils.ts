import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(prefix: string = "id"): string {
  return `${prefix}_${Math.random().toString(36).substr(2, 9)}`;
}

export function calculateConfidence(
  supportCount: number,
  totalSources: number
): number {
  if (totalSources === 0) return 0;
  const base = supportCount / totalSources;
  return Math.min(base + (supportCount > 1 ? 0.1 : 0), 1);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "Unknown source";
  }
}
