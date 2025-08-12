"use client";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { ICON } from "../../../utils/icon-export";
import Button from "../../../ui/Button";
import { easeOut, motion, stagger } from "motion/react";

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

interface Step4Props {
  handleNext?: () => void;
  onClick?: () => void;
}

function Step4({ handleNext }: Step4Props) {
  const handleClick = () => {
    if (handleNext) handleNext();
  };

  return (
    <div className="w-9/10 max-w-lg flex flex-col justify-between ">
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

        {/* Button moved to Onboarding component with Modal.Open wrapper */}
        {/* <Button size="xs" className="font-bold drop-shadow-dark w-fit">
          Enter marketplace
          <Icon icon={ICON.ARROW_CIRCLE_RIGHT} className="" />
        </Button> */}
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
  );
}

export default Step4;
