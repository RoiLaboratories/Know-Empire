import { NextRequest } from 'next/server';

function withValidProperties(properties: Record<string, undefined | string | string[]>) {
  return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) => (Array.isArray(value) ? value.length > 0 : !!value))
  );
}

export async function GET(request: NextRequest) {
  const URL = process.env.NEXT_PUBLIC_URL || "https://knowempire.xyz";
  
  const data = {
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE
    },
    "baseBuilder": {
      "allowedAddresses": ["0xEd01DA1FB9203Ef937BcC4F3055505fFf78F1D93"]
    },
    frame: withValidProperties({
      version: "1",
      name: "KnowEmpire",
      subtitle: "Your Onchain Marketplace",
      description: "A marketplace for physical goods powered by Farcaster",
      iconUrl: `${URL}/icon.png`,
      splashImageUrl: `${URL}/splash.png`,
      splashBackgroundColor: "#b400f7",
      homeUrl: URL,
      webhookUrl: `${URL}/api/webhook`,
      primaryCategory: "utility",
      heroImageUrl: `${URL}/hero.png`,
      tagline: "Trade Freely, Earn Fully",
      ogTitle: "KnowEmpire",
      ogDescription: "Your Onchain Marketplace powered by Farcaster",
      ogImageUrl: `${URL}/hero.png`,
      noindex: "false" // Added back - set to false to allow indexing in Warpcast
    })
  };

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': '*'
    }
  });
}
