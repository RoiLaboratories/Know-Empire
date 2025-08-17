import { useCallback, useEffect, useState } from 'react';
import { useSignIn } from '@farcaster/auth-kit';
import type { UseSignInData } from '@farcaster/auth-kit';

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

  const { signIn: initiateSignIn, data } = useSignIn({
    onSuccess: (data: UseSignInData) => {
      if (data.fid && data.username && data.displayName && data.pfpUrl) {
        const userData: FarcasterUser = {
          fid: data.fid,
          username: data.username,
          displayName: data.displayName,
          pfp: data.pfpUrl,
          isAuthenticated: true
        };
        setUser(userData);
        localStorage.setItem('farcaster_user', JSON.stringify(userData));
      }
    },
    onError: (error) => {
      console.error('Farcaster authentication error:', error);
      setUser(null);
    }
  });

  const signIn = useCallback(async () => {
    try {
      await initiateSignIn();
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
