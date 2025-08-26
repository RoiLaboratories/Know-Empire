import { useCallback, useEffect, useState } from 'react';
import { useSignIn } from '@farcaster/auth-kit';
import { supabase } from '@/utils/supabase';
import { useAccount } from 'wagmi';

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfp: string;
  isAuthenticated: boolean;
  id?: string; // Supabase user ID
}

export function useFarcasterAuth() {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('farcaster_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setLoading(false);
      }
    }
  }, []);

  const { isConnected } = useAccount();
  const { signIn: initiateSignIn, isSuccess, data } = useSignIn({
    onSuccess: async (data) => {
      if (data.fid && data.username && data.displayName && data.pfpUrl) {
        const userData: FarcasterUser = {
          fid: data.fid,
          username: data.username,
          displayName: data.displayName,
          pfp: data.pfpUrl,
          isAuthenticated: true
        };

        // Upsert user data to Supabase
        try {
          const { data: dbUser, error } = await supabase
            .from('users')
            .upsert({
              fid: data.fid.toString(),
              username: data.username,
              display_name: data.displayName,
              avatar_url: data.pfpUrl
            })
            .select()
            .single();

          if (error) throw error;
          
          userData.id = dbUser.id;
          setUser(userData);
          localStorage.setItem('farcaster_user', JSON.stringify(userData));
        } catch (error) {
          console.error('Error storing user data in Supabase:', error);
          // Still set the user data even if Supabase storage fails
          setUser(userData);
          localStorage.setItem('farcaster_user', JSON.stringify(userData));
        }
      }
    },
    onError: (error) => {
      console.error('Farcaster authentication error:', error);
      setUser(null);
    }
  });

  const signIn = useCallback(async (): Promise<boolean> => {
    try {
      return new Promise<boolean>((resolve) => {
        initiateSignIn();
        // Resolve once we get successful auth
        const checkAuth = setInterval(() => {
          if (data && data.fid) {
            clearInterval(checkAuth);
            resolve(true);
          }
        }, 500); // Check every 500ms
        
        // Timeout after 30 seconds
        setTimeout(() => {
          clearInterval(checkAuth);
          resolve(false);
        }, 30000);
      });
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
    isAuthenticated: !!user,
    signIn,
    signOut
  };
}
