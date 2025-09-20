import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Step1 from "./steps/step1";
import Step2 from "./steps/step2";
import Step3 from "./steps/step3";
import Button from "../../ui/Button";
import Modal from "../../context/ModalContext";
import { motion, easeOut, stagger } from "motion/react";
// import { sdk } from '@/utils/farcaster';
import { Icon } from "@iconify/react";
import { ICON } from "../../utils/icon-export";
import Image from "next/image";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      delayChildren: stagger(0.3),
    },
  },
};

const item = {
  hidden: { opacity: 0, transform: "translateY(100px)" },
  show: { opacity: 1, transform: "translateY(0px)" },
};

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
  const isLastStep = step === stepsContent - 1;

  // Called when user clicks next on non-final steps
  const handleNext = () => {
    if (!isLastStep) {
      next();
    }
  };


  // Handle the Enter Marketplace button click
  const handleMarketplaceEnter = () => {
    localStorage.removeItem("onboardingStep"); // Clear onboarding state
    window.location.href = "https://farcaster.xyz/miniapps/Q1p_pb-tbyYB/knowempire";
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {step === 0 && <Step1 handleNext={handleNext} />}
      {step === 1 && <Step2 handleNext={handleNext} />}
      {step === 2 && <Step3 handleNext={handleNext} />}
      {step === 3 && (
        <div className="w-9/10 max-w-lg flex flex-col justify-between">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <motion.div variants={item}>
              <Image
                loading="lazy"
                width={40}
                height={24.36}
                sizes="100vw"
                alt="Know Empire Logo"
                src="/group-dark.svg"
              />
            </motion.div>

            <motion.div variants={item} className="space-y-2">
              <p className="text-4xl sm:text-5xl font-bold">
                Trade,
                <span className="font-medium">&nbsp;Earn,</span>
              </p>
              <p className="text-4xl sm:text-5xl text-primary font-bold">Repeat</p>
              <p className="text-gray">
                Earn Know Points as you trade and refer others. Top sellers and top
                referrers get weekly rewards. Let the Empire reward your hustle.
              </p>
            </motion.div>

            <motion.button
              onClick={handleMarketplaceEnter}
              variants={item}
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-white rounded bg-primary flex justify-center gap-x-1 items-center text-xs font-bold py-2 px-5 drop-shadow-dark btn pulse-on-hover"
            >
              Enter marketplace
              <Icon icon={ICON.ARROW_CIRCLE_RIGHT} className="" />
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, ease: easeOut }}
            className="h-72"
          >
            <Icon
              icon={ICON.TRANSFORM}
              className="w-full h-full mx-auto text-primary/10"
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default Onboarding;
