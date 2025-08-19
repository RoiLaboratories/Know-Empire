import { supabase } from './supabase';

interface FarcasterFrameData {
  untrustedData: {
    fid: number;
    username: string;
    displayName: string;
    pfp: {
      url: string;
    };
  };
}

export const signInWithFarcaster = async (frameData: FarcasterFrameData) => {
  try {
    // Call our Next.js API route to handle user creation/update
    const userResponse = await fetch('/api/auth/farcaster', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(frameData),
    });

    if (!userResponse.ok) {
      const error = await userResponse.json();
      throw new Error(error.message || 'Failed to sign in');
    }

    const { user } = await userResponse.json();

    // Get the session after successful authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    return { user, session };
  } catch (error: any) {
    console.error('Error signing in with Farcaster:', error);
    // Add more context to the error
    if (error?.code === '42501') {
      throw new Error('Permission denied: Unable to create user profile. Please try again.');
    }
    throw new Error(error?.message || 'Failed to sign in with Farcaster');
  }
}
