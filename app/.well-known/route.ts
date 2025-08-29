import { NextRequest } from 'next/server';

function withValidProperties(properties: Record<string, undefined | string | string[]>) {
  return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) => (Array.isArray(value) ? value.length > 0 : !!value))
  );
}

export async function GET(request: NextRequest) {
  const URL = process.env.NEXT_PUBLIC_URL as string;
  
  // Set the correct content type
  return new Response(
    JSON.stringify({
      accountAssociation: {
        header: process.env.FARCASTER_HEADER,
        payload: process.env.FARCASTER_PAYLOAD,
        signature: process.env.FARCASTER_SIGNATURE,
      },
      frame: withValidProperties({
        version: '1',
        name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
        subtitle: process.env.NEXT_PUBLIC_APP_SUBTITLE,
        description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
        screenshotUrls: [],
        iconUrl: `${URL}${process.env.NEXT_PUBLIC_APP_ICON}`,
        splashImageUrl: `${URL}${process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE}`,
        splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
        homeUrl: URL,
        webhookUrl: `${URL}/api/webhook`,
        primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY,
        tags: [],
        heroImageUrl: `${URL}${process.env.NEXT_PUBLIC_APP_HERO_IMAGE}`,
        tagline: process.env.NEXT_PUBLIC_APP_TAGLINE,
        ogTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE,
        ogDescription: process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION,
        ogImageUrl: `${URL}${process.env.NEXT_PUBLIC_APP_OG_IMAGE}`,
        noindex: 'false',
      }),
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': '*',
      },
    }
  );
}
