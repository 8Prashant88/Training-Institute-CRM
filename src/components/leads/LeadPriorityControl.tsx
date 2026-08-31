"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { updateLeadPriorityAction } from "@/actions/update-lead-priority";
import { Select } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { leadPriorityLabels, leadPriorities, type LeadPriority } from "@/types/lead";

type LeadPriorityControlProps = {
  leadId: string;
  priority: LeadPriority | null;
};

export default function LeadPriorityControl({
  leadId,
  priority,
}: LeadPriorityControlProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [value, setValue] = useState<LeadPriority | "">(priority ?? "");
  const [isPending, startTransition] = useTransition();

  function handleChange(next: LeadPriority | "") {
    const previous = value;
    setValue(next);

    startTransition(async () => {
      const result = await updateLeadPriorityAction({
        leadId,
        priority: next || null,
      });

      if (!result.success) {
        setValue(previous);

        toast({
          variant: "error",
          title: "Priority not updated",
          description: result.message,
        });

        return;
      }

      router.refresh();
    });
  }

  return (
    <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
      Priority
      <Select
        aria-label="Lead priority"
        value={value}
        disabled={isPending}
        className="h-8 w-32 bg-white text-xs"
        onChange={(event) =>
          handleChange(event.target.value as LeadPriority | "")
        }
      >
        <option value="">Unset</option>

        {leadPriorities.map((option) => (
          <option key={option} value={option}>
            {leadPriorityLabels[option]}
          </option>
        ))}
      </Select>
    </label>
  );
}
