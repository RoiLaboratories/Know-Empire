"use client";

import { ICON } from "../../utils/icon-export";
import GenericPopup from "./generic-popup";

interface ErrorPopupProps {
  message: string;
  onCloseModal?: () => void;
}

export default function ErrorPopup({ message, onCloseModal }: ErrorPopupProps) {
  return (
    <GenericPopup
      text={message}
      icon={ICON.CANCEL}
      iconStyle="text-red-500"
      onCloseModal={onCloseModal}
    />
  );
}
