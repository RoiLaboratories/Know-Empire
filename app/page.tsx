"use client";
import { useRouter } from "next/navigation";
import Splash from "../components/onboarding/splash";
import { useEffect } from "react";
import { useMiniKit } from '@coinbase/onchainkit/minikit';

export default function Page() {
  const router = useRouter();
  const { setFrameReady, context } = useMiniKit();
  
  useEffect(() => {
    setFrameReady();

    // If we have user context, store it
    if (context?.user) {
      const userData = {
        fid: context.user.fid,
        username: context.user.username,
        displayName: context.user.displayName,
        pfpUrl: context.user.pfpUrl
      };
      
      // Store user data in localStorage for use across the app
      localStorage.setItem('farcaster_user', JSON.stringify(userData));
      
      // Only redirect to marketplace if we're exactly on the root page
      const currentPath = window.location.pathname;
      if (currentPath === '/' || currentPath === '') {
        router.push("/marketplace");
      }
    } else {
      // If no user context, redirect to onboarding after splash
      const timer = setTimeout(() => {
        router.push("/onboarding");
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [setFrameReady, context, router]);

  return <Splash />;
}
