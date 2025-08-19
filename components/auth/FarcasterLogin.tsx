'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sdk } from '@farcaster/miniapp-sdk';

export default function FarcasterLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      
      // Use the new quickAuth.getToken() method
      const { token } = await sdk.quickAuth.getToken();
      
      if (token) {
        // Verify the token with our backend
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ token })
        });

        const result = await response.json();
        
        if (result.success) {
          setIsAuthenticated(true);
          setUserData(result.user);
          // Redirect to marketplace
          router.push('/marketplace');
        } else {
          console.error('Verification failed:', result.error);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setUserData(null);
    // You can add additional cleanup here if needed
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
