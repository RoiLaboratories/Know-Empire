import { FormHTMLAttributes, PropsWithChildren } from "react";

export default function FormInput({
  config,
  children,
  className,
}: {
  config?: FormHTMLAttributes<HTMLFormElement>;
  className?: string;
} & PropsWithChildren) {
  return (
    <form
      {...config}
      // onSubmit={(e) => {
      //   e.preventDefault();
      //   config?.onSubmit?.(e);
      // }}
      className={`flex flex-col gap-3 w-full items-center ${className}`}
    >
      {children}
    </form>
  );
}
