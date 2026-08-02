import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

type FieldProps = {
  id: string;
  label: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  className?: string;
  trailing?: ReactNode;
  children: ReactElement<{ "aria-describedby"?: string }>;
};

export default function Field({
  id,
  label,
  error,
  helpText,
  required = false,
  className,
  trailing,
  children,
}: FieldProps) {
  const helpId = helpText ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, helpId].filter(Boolean).join(" ") || undefined;

  const control = isValidElement(children)
    ? cloneElement(children, { "aria-describedby": describedBy })
    : children;

  return (
    <div className={className ?? "grid gap-2"}>
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className="text-sm font-medium text-slate-700"
        >
          {label}
          {required && (
            <span
              aria-hidden="true"
              className="ml-0.5 text-accent-600"
            >
              *
            </span>
          )}
        </label>

        {trailing}
      </div>

      {control}

      {error && (
        <p
          id={errorId}
          role="alert"
          className="text-sm text-red-600"
        >
          {error}
        </p>
      )}

      {helpText && (
        <p
          id={helpId}
          className="text-xs leading-5 text-slate-500"
        >
          {helpText}
        </p>
      )}
    </div>
  );
}
