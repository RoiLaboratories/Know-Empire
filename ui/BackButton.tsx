"use client";
import { Icon } from "@iconify/react";
import { ICON } from "../utils/icon-export";
import { useRouter } from "next/navigation";

interface BackButtonProps {
  className?: string;
  onClick?: () => void;
}

function BackButton({ className = "text-gray", onClick }: BackButtonProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  return (
    <button 
      onClick={handleClick}
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
