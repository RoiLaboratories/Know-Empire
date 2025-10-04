import Button from "../../ui/Button";
import { Icon } from "@iconify/react";

interface GenericPopupProps {
  onCloseModal?: () => void;
  text: string;
  icon: string;
  iconStyle?: string;
  onClickFn?: () => void;
  showBg?: boolean;
}

function GenericPopup({
  onCloseModal,
  text,
  icon,
  iconStyle,
  onClickFn,
}: GenericPopupProps) {
  return (
    <div className="p-8 flex flex-col gap-4 justify-between bg-black text-white w-[300px] md:w-[355px] items-center rounded-2xl relative drop-shadow-[0_3px_3px_rgba(180,0,247,1)]">
      <Icon icon={icon} fontSize={44} className={`${iconStyle}`} />
      <p className="font-medium text-sm sm:text-lg md:text-xl text-center">
        {text}
      </p>

      <Button
        className="font-medium w-24 drop-shadow-[0_4px_4px_rgb(65,65,65)]"
        onClick={() => {
          onClickFn?.();
          onCloseModal?.();
        }}
      >
        OK
      </Button>
    </div>
  );
}

export default GenericPopup;
