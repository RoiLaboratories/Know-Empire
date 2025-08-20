"use client";
import React from "react";
import { InputProps } from "../../types/input";

export default function InputTextArea({
  config,
  error,
  errorMessage,
  label,
}: InputProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>>) {
  return (
    <div className="flex flex-col gap-1.5 w-full text-xs">
      <div className="flex items-center font-extrabold justify-between">
        <label
          className={`font-medium ${
            config?.disabled ? "text-gray-400" : "text-gray"
          }`}
          htmlFor={config?.name}
        >
          {label}
        </label>
      </div>
      <textarea
        {...config}
        className={`ring-1 resize-none min-h-20 px-2.5 py-[6px]  disabled:cursor-not-allowed placeholder:text-[#888888] rounded-[5px] ease-in transition-all duration-200 bg-white outline-0 ${
          error ? "ring-red-500" : "ring-[#D1D1D1]  focus:ring-primary"
        }`}
      />
      {/* {error && ( */}
      <div className="text-red-500 text-xs h-2 text-right">{errorMessage}</div>
      {/* )} */}
    </div>
  );
}
