import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
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
      subtitle: "Your Onchain Marketplace",
      description: "A marketplace for physical goods powered by Farcaster",
      iconUrl: "https://knowempire.xyz/icon.png",
      splashImageUrl: "https://knowempire.xyz/splash.png",
      splashBackgroundColor: "#b400f7",
      homeUrl: process.env.NEXT_PUBLIC_URL || "https://knowempire.xyz",
      webhookUrl: `${process.env.NEXT_PUBLIC_URL || "https://knowempire.xyz"}/api/webhook`,
      primaryCategory: "utility",
      heroImageUrl: "https://knowempire.xyz/hero.png",
      tagline: "Trade Freely, Earn Fully",
      ogTitle: "KnowEmpire",
      ogDescription: "Your Onchain Marketplace powered by Farcaster",
      ogImageUrl: "https://knowempire.xyz/hero.png",
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
