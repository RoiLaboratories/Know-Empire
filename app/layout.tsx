import "../styles/global.css";
import AuthProvider from "../components/auth/AuthProvider";
import { MiniKitContextProvider } from "../providers/MiniKitProvider";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL as string;
  return {
    title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
    description: 'A marketplace for physical goods powered by Farcaster`',
    other: {
      'fc:frame': JSON.stringify({
        version: 'next',
        imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
        button: {
          title: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME}`,
          action: {
            type: 'launch_frame',
            name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
            url: URL,
            splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE,
            splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
          },
        },
      }),
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`antialiased min-h-screen`}>
        <MiniKitContextProvider>
          <AuthProvider>{children}</AuthProvider>
        </MiniKitContextProvider>
      </body>
    </html>
  );
}
