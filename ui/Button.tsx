import { cva, VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes } from "react";
import cn from "../utils/cn";
import Link from "next/link";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  to?: string;
}

const buttonVariants = cva(
  " transition-all duration-300 ease-in-out flex justify-center gap-x-1 md:gap-x-2 items-center whitespace-nowrap btn w-full hover:opacity-80 disabled:opacity-50 ",
  {
    variants: {
      variant: {
        primary:
          "border-[1.5px] border-primary focus:ring ring-offset-1 focus:ring-primary bg-primary text-white",
        primary_gradient:
          "border-[1.5px] border-primary focus:ring ring-offset-1 focus:ring-primary text-white font-semibold bg-linear-to-r from-[#b400f7] to-[#6a0091] ",
        primary_outline:
          " hover:bg-linear-to-r from-[#b400f7] to-[#6a0091]  focus:ring ring-offset-1 focus:ring-[#b400f7] hover:text-white border-[#b400f7] border-[1.5px] text-[#b400f7]",
        secondary:
          "border-[1.5px] border-[#570DF8] focus:ring ring-offset-1 focus:ring-[#570DF8] bg-[#570DF8] text-white",
        success:
          "border-[1.5px] border-green-600 focus:ring ring-offset-1 focus:ring-green-600 bg-green-600 text-white",
        tertiary:
          "border-[1.5px] border-[#a66b15] focus:ring ring-offset-1 focus:ring-[#fef08a] bg-[#fefce8] text-[#a66b15]",
        warning:
          "border-[1.5px] border-[#eb580c] focus:ring ring-offset-1 focus:ring-[#eb580c] hover:bg-[#eb580c] text-[#eb580c] hover:text-white",
        warning_gradient:
          "border-[1.5px] border-[#f86d1c] focus:ring ring-offset-1 focus:ring-[#f86d1c] text-white font-semibold bg-linear-to-r from-[#f86d1c] to-[#f04940] ",
        danger: "border border-red-500 bg-red-500 text-white",
        danger_outline:
          "hover:bg-red-400 focus:ring ring-offset-1 focus:ring-red-500 bg-red-50 hover:text-white border-red-500 border text-red-500",
        back: "border-[1.5px] border-[#989898] focus:ring ring-offset-1 focus:ring-[#989898] hover:bg-[#f3f3f3] text-[#989898]",
        //   outline: "",
      },
      size: {
        // xs: "text-[11px] px-2.5 py-1 rounded-md",
        xs: "text-[10px] md:text-xs py-2 px-1 md:px-4 rounded-md",
        sm: "text-sm px-3 py-2 rounded-lg",
        md: "text-base px-3 py-1",
        lg: "text-lg px-4 py-2",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "sm",
    },
  }
);

const Button = ({
  children,
  className,
  variant,
  size,
  to,
  ...props
}: ButtonProps) => {
  if (to) {
    return (
      <Link
        className={cn(buttonVariants({ variant, size, className }))}
        href={to as string}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
