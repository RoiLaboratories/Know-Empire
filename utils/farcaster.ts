import { createAppClient, viemConnector } from '@farcaster/auth-client';

// Create SDK instance with options
export const sdk = createAppClient({
  ethereum: viemConnector(),
  relay: 'https://relay.farcaster.xyz',
});
