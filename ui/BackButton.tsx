"use client";
import { Icon } from "@iconify/react";
import { ICON } from "../utils/icon-export";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  className?: string;
}

function BackButton({ className = "text-gray" }: BackButtonProps) {
  const router = useRouter();

  return (
    <button>
      <Icon
        icon={ICON.ARROW_BACK}
        width={25}
        height={25}
        className={`${className} cursor-pointer`}
        onClick={() => router.back()}
      />
    </button>
  );
}

export default BackButton;
