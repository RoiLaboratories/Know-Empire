import { sdk } from '@farcaster/miniapp-sdk';

// Export the sdk for use in components
export { sdk };

// Helper function to generate nonce
export function generateNonce(): string {
  return crypto.randomUUID();
}
