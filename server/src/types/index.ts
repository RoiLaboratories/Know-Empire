export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfp: string;
}

export interface UserProfile {
  id: string;
  farcaster_id: string;
  farcaster_username: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at'>;
        Update: Partial<Omit<UserProfile, 'id'>>;
      }
    }
  }
}

export interface FarcasterAuthResponse {
  fid: string;
  username: string;
  displayName: string;
  pfp: string;
  accessToken: string;
}
