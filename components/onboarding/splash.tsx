import { useEffect } from "react";
import type { NextPage } from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useFarcasterAuth } from "../../hooks/useFarcasterAuth";

const Splash: NextPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useFarcasterAuth();

  useEffect(() => {
    // If authenticated, user has already completed onboarding
    // so we can directly route to marketplace
    if (isAuthenticated) {
      router.push('/marketplace');
    } else {
      // If not authenticated, they need to go through onboarding
      // where they'll authenticate at step 4
      router.push('/onboarding');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="relative bg-[#b400f7] w-full h-screen overflow-hidden flex flex-col items-center justify-center leading-[normal] tracking-[normal] text-left text-[15px] text-[#fff] font-[Poppins]">
      <div className="w-[101px] flex flex-col items-center justify-start gap-2 animate-[fadeIn_1s_ease-in]">
        <Image
          className="w-20 relative max-h-full animate-[scaleIn_0.8s_ease-out] [animation-fill-mode:forwards] hover:animate-pulse"
          loading="lazy"
          width={80}
          height={50.7}
          sizes="100vw"
          alt="Know Empire Logo"
          src="/group.svg"
          style={{ animation: 'scaleIn 0.8s ease-out forwards, pulse 2s ease-in-out 0.8s infinite' }}
        />
        <b className="self-stretch relative text-center animate-[fadeIn_1.2s_ease-in]">KnowEmpire</b>
      </div>
    </div>
  );
};

export default Splash;
