import { sdk } from '@farcaster/miniapp-sdk';

// Configure Farcaster SDK with RPC URL if needed
if (typeof window !== 'undefined') {
  const rpcUrl = `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
  (window as any).ethereum = {
    ...((window as any).ethereum || {}),
    rpcUrl
  };
}

// Export the sdk for use in components
export { sdk };

// Helper function to generate nonce
export function generateNonce(): string {
  return crypto.randomUUID();
}
