import { sdk } from '@farcaster/miniapp-sdk';

// The Farcaster miniapp SDK automatically initializes itself
// and uses the current window location for the domain
export const farcasterClient = sdk;
