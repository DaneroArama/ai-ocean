import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility function for conditionally joining classNames together
 * and intelligently merging Tailwind CSS classes.
 * 
 * This function combines clsx for conditional className handling
 * with tailwind-merge to resolve conflicting Tailwind classes.
 * 
 * @param inputs - Class values to be merged
 * @returns Merged className string
 * 
 * @example
 * cn("px-4 py-2", "bg-blue-500", { "text-white": true })
 * // => "px-4 py-2 bg-blue-500 text-white"
 * 
 * @example
 * // Handles Tailwind conflicts - last class wins
 * cn("px-4 py-2", "px-8")
 * // => "py-2 px-8"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
