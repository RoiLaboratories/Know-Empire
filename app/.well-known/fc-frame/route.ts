import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const URL = "https://know-empire.vercel.app";
  
  const data = {
    accountAssociation: {
      header: process.env.FARCASTER_HEADER,
      payload: process.env.FARCASTER_PAYLOAD,
      signature: process.env.FARCASTER_SIGNATURE 
    version: "1",
    name: "KnowEmpire",
    description: "A marketplace for physical goods powered by Farcaster",
    image: {
      src: `${URL}/hero.svg`,
      aspectRatio: "1.91:1"
    },
    buttons: [
      {
        label: "Visit Marketplace",
        action: "link",
        target: URL
      }
    ],
    postUrl: `${URL}/api/frame`,
    input: {
      text: "Search products..."
    },
    noindex: false  // Add this to make sure the frame is discoverable
  };

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': '*'
    }
  });
}
