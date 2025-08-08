"use client";
import Onboarding from "../../components/onboarding/Onboarding";

function OnboardingLayout() {
  return (
    <div
      className="flex justify-center items-center h-screen bg-onboarding-gradient"
      // style={{
      //   background:
      //     "conic-gradient(from 180deg, #FAF6FF 0%, #B400F7 50%, #FFFFFF 75%, rgba(255, 255, 255, 0) 100%)",
      // }}
    >
      <Onboarding />
    </div>
  );
}

export default OnboardingLayout;
