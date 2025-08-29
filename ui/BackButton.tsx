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
    <button 
      onClick={(e) => {
        e.preventDefault();
        router.back();
      }}
      className="cursor-pointer"
    >
      <Icon
        icon={ICON.ARROW_BACK}
        width={25}
        height={25}
        className={className}
      />
    </button>
  );
}

export default BackButton;
