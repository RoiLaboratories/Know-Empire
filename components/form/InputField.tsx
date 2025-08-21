"use client";
import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useState } from "react";
import { ICON } from "../../utils/icon-export";
import { InputProps } from "../../types/input";

export default function InputField({
  config,
  error,
  errorMessage,
  label,
}: InputProps<React.InputHTMLAttributes<HTMLInputElement>>) {
  const [showPassword, setShowPassword] = useState<boolean>(false);

  if (config?.type === "password") {
    return (
      <div className="flex flex-col gap-2 w-full text-sm">
        <div className="flex items-center font-extrabold justify-between">
          <label
            className={`font-medium text-xs ${
              config?.disabled ? "text-gray-400" : "text-gray"
            }`}
            htmlFor={config?.name}
          >
            {label}
          </label>
        </div>
        <div
          className={`ring-1 p-4  flex items-center justify-between  disabled:cursor-not-allowed  placeholder:text-[#888888] rounded-md  ease-in transition-all duration-200 bg-white outline-0 ${
            error ? "ring-red-500" : "ring-[#D1D1D1]  focus-within:ring-primary"
          }`}
        >
          <input
            {...config}
            type={showPassword ? "text" : "password"}
            className="outline-0 w-full self-stretch"
          />
          <Icon
            icon={showPassword ? ICON.EYE : ICON.EYE_OFF}
            className="shrink-0 cursor-pointer"
            fontSize={16}
            onClick={() => setShowPassword(!showPassword)}
          />
        </div>
        {error && (
          <p className="text-red-500 text-xs font-medium">{errorMessage}</p>
        )}
      </div>
    );
  }

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
      <input
        {...config}
        className={`ring-1 px-2.5 py-[6px] disabled:cursor-not-allowed placeholder:text-[#888888] rounded-[5px] ease-in transition-all duration-200 bg-white outline-0 ${
          error ? "ring-red-500" : "ring-[#989898]  focus:ring-primary"
        }`}
      />

      {/* {error && ( */}
      <div className="text-red-500 text-xs h-2 text-right">{errorMessage}</div>
      {/* )} */}
    </div>
  );
}
