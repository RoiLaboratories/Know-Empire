import { cva, VariantProps } from "class-variance-authority";
import { ButtonHTMLAttributes } from "react";
import cn from "../utils/cn";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
}

const buttonVariants = cva(
  " transition-all duration-300 ease-in-out flex justify-center gap-x-2 items-center whitespace-nowrap btn w-full hover:opacity-80 disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "border-[1.5px] border-primary focus:ring ring-offset-1 focus:ring-primary bg-primary text-white",
        primary_gradient:
          "border-[1.5px] border-primary focus:ring ring-offset-1 focus:ring-primary text-white bg-linear-to-r from-[#b400f7] to-[#6a0091]",
        secondary:
          "border-[1.5px] border-[#570DF8] focus:ring ring-offset-1 focus:ring-[#570DF8] bg-[#570DF8] text-white",
        success:
          "border-[1.5px] border-green-600 focus:ring ring-offset-1 focus:ring-green-600 bg-green-600 text-white",
        tertiary:
          "border-[1.5px] border-[#a66b15] focus:ring ring-offset-1 focus:ring-[#fef08a] bg-[#fefce8] text-[#a66b15]",
        warning:
          "border-[1.5px] border-[#eb580c] focus:ring ring-offset-1 focus:ring-[#eb580c] hover:bg-[#eb580c] text-[#eb580c] hover:text-white",
        danger: "border border-red-500 bg-red-500 text-white",
        danger_outline:
          "hover:bg-red-400 focus:ring ring-offset-1 focus:ring-red-500 bg-red-50 hover:text-white border-red-500 border text-red-500",
        //   outline: "",
      },
      size: {
        // xs: "text-[11px] px-2.5 py-1 rounded-md",
        xs: "text-xs px-4 py-2 rounded-md",
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
  ...props
}: ButtonProps) => {
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
