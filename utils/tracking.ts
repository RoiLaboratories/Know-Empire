/**
 * Generates a unique tracking ID with a prefix for Know Empire marketplace
 * Format: KE-YYYY-XXXX-XXXX
 * Where:
 * KE = Know Empire
 * YYYY = Current year
 * XXXX-XXXX = Random alphanumeric sequence
 */
export function generateTrackingId(): string {
  const year = new Date().getFullYear();
  const randomPart1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const randomPart2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `KE-${year}-${randomPart1}-${randomPart2}`;
}

/**
 * Validates if a tracking ID matches the expected format
 * @param trackingId - The tracking ID to validate
 * @returns boolean indicating if the tracking ID is valid
 */
export function isValidTrackingId(trackingId: string): boolean {
  // Check if the tracking ID matches the format KE-YYYY-XXXX-XXXX
  // where YYYY is a year and XXXX are alphanumeric characters
  const pattern = /^KE-\d{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return pattern.test(trackingId);
}

/**
 * Copies a tracking ID to the clipboard
 * @param trackingId - The tracking ID to copy
 * @returns Promise<boolean> indicating if the copy was successful
 */
export async function copyTrackingId(trackingId: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(trackingId);
    return true;
  } catch (error) {
    console.error('Failed to copy tracking ID:', error);
    return false;
  }
}
