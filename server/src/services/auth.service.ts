import { SupabaseClient, createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Verify environment variables are loaded
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Environment variables check:', {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
  });
  throw new Error('Missing required Supabase environment variables');
}

type Tables = {
  users: {
    Row: UserProfile;
    Insert: Omit<UserProfile, 'id' | 'created_at'>;
    Update: Partial<Omit<UserProfile, 'id'>>;
  };
};

type Database = {
  public: {
    Tables: Tables;
  };
};

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfp: string;
}

interface UserProfile {
  id: string;
  farcaster_id: string;
  farcaster_username: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

// Initialize Supabase client
const supabaseClient: SupabaseClient<Database> = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function handleFarcasterAuth(user: FarcasterUser): Promise<UserProfile> {
  try {
    const upsertData = {
      farcaster_id: user.fid.toString(),
      farcaster_username: user.username,
      display_name: user.displayName,
      avatar_url: user.pfp,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabaseClient
      .from('users')
      .upsert(upsertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Failed to save user data');
    }

    if (!data) {
      throw new Error('No user data returned');
    }

    return data as UserProfile;
  } catch (error) {
    console.error('Error handling Farcaster auth:', error instanceof Error ? error.message : String(error));
    throw error;
  }
}
