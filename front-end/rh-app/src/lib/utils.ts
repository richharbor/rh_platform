import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFilenameFromUrl(fileUrl: string): string {
  try {
    // Create a URL object to easily access the pathname
    const { pathname } = new URL(fileUrl);
    // Split on "/" and take the last segment
    return pathname.split("/").pop() || "";
  } catch {
    // Return empty string if the URL is invalid
    return "";
  }
}