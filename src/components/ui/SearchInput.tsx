import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  containerClassName?: string;
};

export default function SearchInput({
  containerClassName,
  className,
  ...props
}: SearchInputProps) {
  return (
    <div className={cn("relative", containerClassName)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
      />

      <input
        type="search"
        className={cn(
          "h-10 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-primary-900 focus:outline-none focus:ring-2 focus:ring-accent-600/40",
          className,
        )}
        {...props}
      />
    </div>
  );
}
