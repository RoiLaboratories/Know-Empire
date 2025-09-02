import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const URL = process.env.NEXT_PUBLIC_URL || "https://knowempire.xyz";
  
  const data = {
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE
    },
    baseBuilder: {
      allowedAddresses: ["0xEd01DA1FB9203Ef937BcC4F3055505fFf78F1D93"]
    },
    frame: {
      version: "1",
      name: "KnowEmpire",
      subtitle: process.env.NEXT_PUBLIC_APP_SUBTITLE || "Your Onchain Marketplace",
      description: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "A marketplace for physical goods powered by Farcaster",
      iconUrl: process.env.NEXT_PUBLIC_APP_ICON || `${URL}/icon.png`,
      splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE || `${URL}/splash.png`,
      splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR || "#b400f7",
      homeUrl: URL,
      webhookUrl: `${URL}/api/webhook`,
      primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY || "utility",
      heroImageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE || `${URL}/hero.png`,
      tagline: process.env.NEXT_PUBLIC_APP_TAGLINE || "Trade Freely, Earn Fully",
      ogTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE || "KnowEmpire",
      ogDescription: process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION || "Your Onchain Marketplace powered by Farcaster",
      ogImageUrl: process.env.NEXT_PUBLIC_APP_OG_IMAGE || `${URL}/hero.png`,
      noindex: false
    }
  };

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': '*'
    }
  });
}