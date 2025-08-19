import { sdk } from '@farcaster/miniapp-sdk';

// Initialize SDK with proper configuration
const rpcUrl = `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;

// Configure rpc url globally for the SDK
if (typeof window !== 'undefined') {
  (window as any).ethereum = {
    ...((window as any).ethereum || {}),
    rpcUrl
  };
}

// Helper function to generate secure nonce
export function generateNonce(): string {
  return crypto.randomUUID();
}

export { sdk };
