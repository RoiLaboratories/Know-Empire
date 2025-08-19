"use client";
import { useRouter } from "next/navigation";
import Splash from "../components/onboarding/splash";
import { useEffect } from "react";
import { useMiniKit } from '@coinbase/onchainkit/minikit';

export default function Page() {
  const router = useRouter();
  const { setFrameReady } = useMiniKit();

  useEffect(() => {
    setFrameReady();
  }, [setFrameReady]);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/onboarding");
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return <Splash />;
}
