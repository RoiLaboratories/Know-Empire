"use client";
import React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Onboarding from "../../components/onboarding/Onboarding";
import { useFarcasterContext } from '../../context/FarcasterAuthContext';

function OnboardingLayout(): React.ReactElement {
  const { isAuthenticated } = useFarcasterContext();
  const router = useRouter();

  useEffect(() => {
    // If user is already authenticated, redirect to marketplace
    if (isAuthenticated) {
      router.push('/marketplace');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex justify-center items-center h-screen bg-onboarding-gradient">
      <Onboarding />
    </div>
  );
}

export default OnboardingLayout;
