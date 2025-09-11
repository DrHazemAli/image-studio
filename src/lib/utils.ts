/**
 * Utility function to combine class names
 * Simple implementation without external dependencies
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
