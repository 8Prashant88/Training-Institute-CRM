"use client";

import { useState, useTransition, type MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

import { setLeadFavoriteAction } from "@/actions/set-lead-favorite";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/ui/Toast";

type LeadFavoriteToggleProps = {
  leadId: string;
  leadName: string;
  isFavorited: boolean;
  className?: string;
};

export default function LeadFavoriteToggle({
  leadId,
  leadName,
  isFavorited,
  className,
}: LeadFavoriteToggleProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [optimistic, setOptimistic] = useState(isFavorited);
  const [isPending, startTransition] = useTransition();

  function toggle(event: MouseEvent) {
    event.stopPropagation();

    if (isPending) {
      return;
    }

    const next = !optimistic;

    setOptimistic(next);

    startTransition(async () => {
      const result = await setLeadFavoriteAction({
        leadId,
        isFavorited: next,
      });

      if (!result.success) {
        setOptimistic(!next);

        toast({
          variant: "error",
          title: "Favourite not updated",
          description: result.message,
        });

        return;
      }

      router.refresh();
    });
  }

  return (
    <button
      type="button"
      aria-pressed={optimistic}
      aria-label={
        optimistic
          ? `Remove ${leadName} from favourites`
          : `Add ${leadName} to favourites`
      }
      disabled={isPending}
      onClick={toggle}
      className={cn(
        "rounded-lg p-1.5 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
    >
      <Star
        aria-hidden="true"
        className={cn(
          "size-4",
          optimistic
            ? "fill-accent-500 text-accent-500"
            : "text-slate-300",
        )}
      />
    </button>
  );
}
