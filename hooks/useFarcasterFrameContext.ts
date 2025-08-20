import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfp: string;
}

export function useFarcasterFrameContext() {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const res = await sdk.quickAuth.fetch(`${process.env.NEXT_PUBLIC_APP_URL}/me`);
        if (res.ok) {
          const userData = await res.json();
          setUser({
            fid: userData.fid,
            username: userData.username || '',
            displayName: userData.displayName || '',
            pfp: userData.pfp || ''
          });
          sdk.actions.ready();
        }
      } catch (error) {
        console.error('Error loading Farcaster user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  return { user, loading };
}
