import { useCallback, useEffect, useState } from 'react';

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfp: string;
  isAuthenticated: boolean;
}

export function useFarcasterAuth() {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = useCallback(async () => {
    try {
      // Get frame data from window.frame
      const frameData = (window as any).frame?.untrustedData;
      
      if (!frameData?.fid) {
        throw new Error('No Farcaster frame data available');
      }

      const userData: FarcasterUser = {
        fid: frameData.fid,
        username: frameData.username,
        displayName: frameData.displayName,
        pfp: frameData.pfp?.url || '',
        isAuthenticated: true
      };

      setUser(userData);
      localStorage.setItem('farcaster_user', JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Farcaster authentication error:', error);
      return false;
    }
  }, []);

  const signOut = useCallback(() => {
    setUser(null);
    localStorage.removeItem('farcaster_user');
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('farcaster_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('farcaster_user');
      }
    }
    setLoading(false);
  }, []);

  return {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user
  };
}
