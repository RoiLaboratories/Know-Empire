import { Request, Response } from 'express';
import { handleFarcasterAuth, FarcasterUser } from '../services/auth.service';

// This endpoint will be called by our frame after successful Farcaster auth
export const verifyAuth = async (req: Request, res: Response) => {
  try {
    // These values will come from the Farcaster frame context
    const { 
      interactor: { 
        fid,
        username,
        displayName,
        pfp
      }
    } = req.body;

    if (!fid || !username) {
      return res.status(400).json({ 
        error: 'Missing required Farcaster user data' 
      });
    }

    const farcasterUser: FarcasterUser = {
      fid,
      username,
      displayName: displayName || username,
      pfp: pfp || ''
    };

    const user = await handleFarcasterAuth(farcasterUser);

    res.json({ 
      success: true, 
      user 
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ 
      error: 'Authentication failed' 
    });
  }
};
