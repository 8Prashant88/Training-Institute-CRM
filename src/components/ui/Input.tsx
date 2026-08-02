import type {
  InputHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/cn";

const baseFieldClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-primary-900 focus:outline-none focus:ring-2 focus:ring-accent-500/40 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

const invalidClasses =
  "border-red-500 focus:border-red-600 focus:ring-red-500/25";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

export function Input({
  invalid = false,
  className,
  ...props
}: InputProps) {
  return (
    <input
      aria-invalid={invalid}
      className={cn(baseFieldClasses, invalid && invalidClasses, className)}
      {...props}
    />
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export function Textarea({
  invalid = false,
  className,
  ...props
}: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid}
      className={cn(
        baseFieldClasses,
        "resize-y",
        invalid && invalidClasses,
        className,
      )}
      {...props}
    />
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
};

export function Select({
  invalid = false,
  className,
  children,
  ...props
}: SelectProps) {
  return (
    <select
      aria-invalid={invalid}
      className={cn(
        baseFieldClasses,
        "cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 20 20%22 fill=%22%2364748b%22><path fill-rule=%22evenodd%22 d=%22M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.08 1.04l-4.25 4.65a.75.75 0 01-1.08 0l-4.25-4.65a.75.75 0 01.02-1.06z%22 clip-rule=%22evenodd%22/></svg>')] bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9",
        invalid && invalidClasses,
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
