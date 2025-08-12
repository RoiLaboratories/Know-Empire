"use client";
import { Icon } from "@iconify/react";
import { ICON } from "../utils/icon-export";
import { useRouter } from "next/navigation";

function BackButton() {
  const router = useRouter();

  return (
    <button>
      <Icon
        icon={ICON.ARROW_BACK}
        width={25}
        height={25}
        className="text-gray cursor-pointer"
        onClick={() => router.back()}
      />
    </button>
  );
}

export default BackButton;
