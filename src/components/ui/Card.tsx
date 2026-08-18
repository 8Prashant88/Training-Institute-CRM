import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-[var(--shadow-card)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 border-b border-slate-100 p-5 sm:p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardEyebrow({ className, children, ...props }: CardProps) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-wider text-accent-700",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardTitle({ className, children, ...props }: CardProps) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold tracking-tight text-primary-900",
        className,
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: CardProps) {
  return (
    <p
      className={cn(
        "text-sm leading-6 text-slate-600",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardContent({
  className,
  children,
  padded = true,
  ...props
}: CardProps & { padded?: boolean }) {
  return (
    <div
      className={cn(padded && "p-5 sm:p-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}
