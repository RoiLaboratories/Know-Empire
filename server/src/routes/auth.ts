import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// Create Supabase client with service role key
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true
    }
  }
);

router.post('/farcaster', async (req, res) => {
  try {
    const { untrustedData } = req.body;
    const { fid, username, displayName, pfp } = untrustedData;

    // Create or update user in Supabase using service role client
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        farcaster_id: fid.toString(),
        farcaster_username: username,
        display_name: displayName,
        avatar_url: pfp.url,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating/updating user:', userError);
      return res.status(500).json({ error: 'Failed to create/update user' });
    }

    res.json({ user: userData });
  } catch (error) {
    console.error('Error in Farcaster sign-in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
