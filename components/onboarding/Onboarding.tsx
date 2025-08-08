import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Step1 from "./steps/step1";
import Step2 from "./steps/step2";
import Step3 from "./steps/step3";
import Step4 from "./steps/step4";

function Onboarding() {
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState(0);
  const router = useRouter();

  const stepsContent = 4;

  useEffect(() => {
    const stored = localStorage.getItem("onboardingStep");
    if (stored) setStep(+stored);

    setIsLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem("onboardingStep", step.toString());
  }, [step]);

  const next = () => setStep((prev) => Math.min(prev + 1, stepsContent - 1));
  //   const back = () => setStep((prev) => Math.max(prev - 1, 0));

  const isLastStep = step === stepsContent - 1;

  const handleNext = () => {
    if (isLastStep) {
      router.push("/marketplace");
      //   setStep(0);
    } else {
      next();
    }
  };

  if (isLoading) {
    return null;
  }

  switch (step) {
    case 0:
      return <Step1 handleNext={handleNext} />;
    case 1:
      return <Step2 handleNext={handleNext} />;
    case 2:
      return <Step3 handleNext={handleNext} />;
    case 3:
      return <Step4 handleNext={handleNext} />;
    default:
      return null;
  }
}

export default Onboarding;
