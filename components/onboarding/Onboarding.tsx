import { useRouter } from "next/navigation";
import { useEffect, useState, useContext } from "react";
import Step1 from "./steps/step1";
import Step2 from "./steps/step2";
import Step3 from "./steps/step3";
import Button from "../../ui/Button";
import Modal, { ModalContext } from "../../context/ModalContext";
import CongratsPopup from "../popups/congrats-popup";
import LoadingCard from "../popups/loading-card";
import { motion, easeOut, stagger } from "motion/react";
import { sdk } from '@/utils/farcaster';
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
  const modalContext = useContext(ModalContext);
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

  // Start Farcaster authentication process
  const startAuthentication = async () => {
    try {
      if (modalContext) {
        modalContext.open("loading-modal");
      }

      // Create an auth channel and get the sign in URL
      const { data: channel } = await sdk.createChannel({
        siweUri: window.location.origin + '/api/auth/verify',
        domain: window.location.host,
      });

      // Start watching for the user's response
      const { data: authData } = await sdk.watchStatus({
        channelToken: channel.channelToken,
        timeout: 300_000, // 5 minutes
        onResponse: ({ data }) => {
          if (data.state === 'completed') {
            if (modalContext) {
              modalContext.close("loading-modal");
              modalContext.open("congrats-modal");
            }
          }
        }
      });

      if (!authData || authData.state !== 'completed' || !authData.message || !authData.signature) {
        throw new Error('Authentication not completed');
      }

      const { message, signature, fid } = authData;
      
      // Send to backend for verification
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          signature,
          message,
          fid,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify signature');
      }

    } catch (error) {
      console.error('Auth error:', error);
      if (modalContext) {
        modalContext.close("loading-modal");
      }
      throw error;
    }
  };

  // Handle the Enter Marketplace button click
  const handleMarketplaceEnter = async () => {
    try {
      await startAuthentication();
    } catch (error) {
      console.error('Marketplace entry error:', error);
    }
  };

  // Handle final marketplace entry after congrats
  const handleFinalEntry = () => {
    if (modalContext) {
      modalContext.close("congrats-modal");
    }
    router.push("/marketplace");
  };

  if (isLoading) {
    return null;
  }

  return (
    <Modal>
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

      {/* Modal Windows */}
      <Modal.Window name="loading-modal" showBg={false}>
        <LoadingCard message="Signing you in..." />
      </Modal.Window>

      <Modal.Window name="congrats-modal" showBg={false}>
        <CongratsPopup onEnterMarketplace={handleFinalEntry} />
      </Modal.Window>
    </Modal>
  );
}

export default Onboarding;
