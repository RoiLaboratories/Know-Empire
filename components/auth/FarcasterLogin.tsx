'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAppClient, viemConnector } from "@farcaster/auth-client";

const client = createAppClient({
  ethereum: viemConnector(),
  relay: "https://relay.farcaster.xyz",
});

export default function FarcasterLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check authentication status when component mounts
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setIsAuthenticated(true);
            setUserData(data.user);
          }
        }
      } catch (error) {
        console.error('Error checking auth:', error);
      }
    };

    checkAuth();
  }, []);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      
      // Create an auth channel and get the sign in URL
      const { data: channel } = await client.createChannel({
        siweUri: window.location.origin + '/api/auth/verify',
        domain: window.location.host,
      });
      
      // Start watching for the user's response
      const { data: authData } = await client.watchStatus({
        channelToken: channel.channelToken,
        timeout: 300_000, // 5 minutes
        onResponse: ({ data }) => {
          if (data.state === 'completed') {
            setIsLoading(false);
          }
        }
      });
      
      if (authData.state === 'completed' && authData.message && authData.signature) {
        // Verify the signature with our backend
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: authData.message,
            signature: authData.signature,
            fid: authData.fid,
          }),
        });

        const result = await response.json();
        
        if (result.success) {
          setIsAuthenticated(true);
          setUserData(result.user);
          // Redirect to marketplace
          router.push('/marketplace');
        } else {
          throw new Error(result.error || 'Failed to verify authentication');
        }
      } else {
        throw new Error('Authentication not completed');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // No need to call signOut on the client, just clear the local state
      setIsAuthenticated(false);
      setUserData(null);
      
      // Call backend to clear the session
      await fetch('/api/auth/signout', {
        method: 'POST',
      });
      
      router.push('/');
    } catch (error) {
      console.error('Sign out error:', error);
      alert('Failed to sign out. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {!isAuthenticated ? (
        <button
          onClick={handleSignIn}
          disabled={isLoading}
          className="bg-primary text-white px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {isLoading ? 'Signing in...' : 'Sign in with Farcaster'}
        </button>
      ) : (
        <div className="text-center">
          <p className="mb-2">Signed in successfully!</p>
          <button
            onClick={handleSignOut}
            className="bg-primary text-white px-4 py-2 rounded-lg"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
