import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type InputConfigType =
  | InputHTMLAttributes<HtmlInputElement>
  | TextareaHTMLAttributes<HTMLTextAreaElement>
  | SelectHTMLAttributes<HTMLSelectElement>;

declare interface InputProps<T extends InputConfigType> {
  config?: T;
  label: string;
  error?: boolean;
  errorMessage?: string;
}

// declare interface OptionsType {
//   value: string;
//   label: string;
//   icon?: string | StaticImageData;
//   iconStyle?: string;
//   price?: number;
// }
