"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

import { cn } from "@/lib/cn";

type ToastVariant = "success" | "error" | "info";

type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastRecord = ToastInput & { id: number };

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const variantConfig: Record<
  ToastVariant,
  { icon: typeof CheckCircle2; classes: string; iconClasses: string }
> = {
  success: {
    icon: CheckCircle2,
    classes: "border-green-200 bg-white",
    iconClasses: "text-green-600",
  },
  error: {
    icon: TriangleAlert,
    classes: "border-red-200 bg-white",
    iconClasses: "text-red-600",
  },
  info: {
    icon: Info,
    classes: "border-primary-200 bg-white",
    iconClasses: "text-primary-700",
  },
};

const AUTO_DISMISS_MS = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = nextId.current++;

      setToasts((current) => [...current, { ...input, id }]);

      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        aria-live="polite"
        aria-label="Notifications"
        className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:right-4 sm:items-end"
      >
        {toasts.map((item) => {
          const variant = item.variant ?? "info";
          const config = variantConfig[variant];
          const Icon = config.icon;

          return (
            <div
              key={item.id}
              role="status"
              className={cn(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-[var(--shadow-popover)] animate-[var(--animate-toast-in)]",
                config.classes,
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn("mt-0.5 size-5 shrink-0", config.iconClasses)}
              />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  {item.title}
                </p>

                {item.description && (
                  <p className="mt-0.5 text-sm leading-5 text-slate-600">
                    {item.description}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Dismiss notification"
                className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider.");
  }

  return context;
}
