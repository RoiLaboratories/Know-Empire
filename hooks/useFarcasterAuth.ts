import { useCallback, useEffect, useState } from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { supabase } from '@/utils/supabase';

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

  const { address, isConnected } = useAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();

  const signIn = useCallback(async (): Promise<boolean> => {
    try {
      if (!isConnected && connectors[0]) {
        await connectAsync({ connector: connectors[0] });
      }
      
      if (isConnected && address) {
        // Create basic user data
        const userData: FarcasterUser = {
          fid: Date.now(), // Temporary FID until we get the real one
          username: `user_${address.slice(2, 8)}`,
          displayName: `Farcaster User`,
          pfp: '/assets/images/user.png',
          isAuthenticated: true
        };

        try {
          const { data: dbUser, error } = await supabase
            .from('users')
            .upsert({
              address,
              username: userData.username,
              display_name: userData.displayName,
              avatar_url: userData.pfp
            })
            .select()
            .single();

          if (error) throw error;
          
          userData.id = dbUser.id;
          setUser(userData);
          localStorage.setItem(`farcaster_user_${address}`, JSON.stringify(userData));
          return true;
        } catch (error) {
          console.error('Error storing user data in Supabase:', error);
          setUser(userData);
          localStorage.setItem(`farcaster_user_${address}`, JSON.stringify(userData));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Farcaster authentication error:', error);
      return false;
    }
  }, [connectAsync]);

  const signOut = useCallback(async () => {
    try {
      await disconnectAsync();
      setUser(null);
      if (address) {
        localStorage.removeItem(`farcaster_user_${address}`);
      }
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  }, [address, disconnectAsync]);

  useEffect(() => {
    if (isConnected && address) {
      const savedUser = localStorage.getItem(`farcaster_user_${address}`);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem(`farcaster_user_${address}`);
        }
      }
    }
    setLoading(false);
  }, [isConnected, address]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    signIn,
    signOut
  };
}
