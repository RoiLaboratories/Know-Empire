'use client';

import { SignInButton, useSignIn } from '@farcaster/auth-kit';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FarcasterLogin() {
  const { signOut, isSuccess, data } = useSignIn({
    onSuccess: (data) => {
      // Verify with our backend
      fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signature: data.signature,
          message: data.message,
        }),
      })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          // Redirect to marketplace or dashboard
          router.push('/marketplace');
        }
      })
      .catch(console.error);
    },
  });
  const router = useRouter();

  return (
    <div className="flex flex-col items-center gap-4">
      {!isSuccess ? (
        <SignInButton />
      ) : (
        <button
          onClick={() => signOut()}
          className="bg-primary text-white px-4 py-2 rounded-lg"
        >
          Sign Out
        </button>
      )}
    </div>
  );
}
