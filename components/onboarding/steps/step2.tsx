"use client";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { ICON } from "../../../utils/icon-export";
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

function Step2({ handleNext }: { handleNext: () => void }) {
  return (
    <section className="w-9/10 max-w-lg flex flex-col justify-between ">
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
            Simple
            <span className="font-medium">&nbsp;P2P</span>
          </p>
          <p className="text-4xl sm:text-5xl text-primary font-bold">Selling</p>
          <p className="text-gray">
            List your product <br /> Set your price in crypto <br /> Chat and
            deal directly.
          </p>
        </motion.div>

        <motion.button
          variants={item}
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleNext}
          className="text-white rounded-full size-15 grid place-items-center drop-shadow-btn btn-onboard btn"
        >
          <Icon icon={ICON.ARROW_RIGHT} fontSize={30} />
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, ease: easeOut }}
        className="h-80 md:h-72"
      >
        <Icon
          icon={ICON.P2P}
          className="w-full h-full mx-auto text-primary/10"
        />
      </motion.div>
    </section>
  );
}

export default Step2;
