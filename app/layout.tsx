import { CartProvider } from "../providers/cart";
import "../styles/global.css";
import AuthProvider from "../components/auth/AuthProvider";
import { MiniKitContextProvider } from "../providers/MiniKitProvider";
import { FarcasterAuthProvider } from "../context/FarcasterAuthContext";
import { OrdersProvider } from "../providers/orders";
import { Metadata } from "next";

// Ensure all providers are client-side only
import dynamic from 'next/dynamic';

const DynamicOrdersProvider = dynamic(
  () => import('../providers/orders').then(mod => mod.OrdersProvider),
  { ssr: false }
);

export async function generateMetadata(): Promise<Metadata> {
  const URL = process.env.NEXT_PUBLIC_URL as string;
  return {
    title: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
    description: "A marketplace for physical goods powered by Farcaster`",
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
        button: {
          title: `Launch ${process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME}`,
          action: {
            type: "launch_frame",
            name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
            url: URL,
            splashImageUrl: process.env.NEXT_PUBLIC_SPLASH_IMAGE,
            splashBackgroundColor:
              process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
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
        <CartProvider>
          <MiniKitContextProvider>
            <AuthProvider>
              <FarcasterAuthProvider>
                <DynamicOrdersProvider>
                  {children}
                </DynamicOrdersProvider>
              </FarcasterAuthProvider>
            </AuthProvider>
          </MiniKitContextProvider>
        </CartProvider>
      </body>
    </html>
  );
}
