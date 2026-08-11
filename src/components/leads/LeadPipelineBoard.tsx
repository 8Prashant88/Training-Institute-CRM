"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ChangeLeadStatusDialog from "@/components/leads/ChangeLeadStatusDialog";
import LeadPipelineCard from "@/components/leads/LeadPipelineCard";
import Badge, { type BadgeTone } from "@/components/ui/Badge";
import {
  leadStatusLabels,
  type LeadStatus,
} from "@/types/lead";
import type {
  LeadPipelineCardData,
  LeadPipelineColumn,
} from "@/services/lead-pipeline-service";

const columnTones: Record<LeadStatus, BadgeTone> = {
  NEW: "blue",
  CONTACTED: "violet",
  INTERESTED: "amber",
  FOLLOW_UP: "orange",
  ENROLLED: "green",
  LOST: "red",
};

type SelectedTarget = {
  leadId: string;
  leadName: string;
  currentStatus: LeadStatus;
  targetStatus: LeadStatus;
};

type LeadPipelineBoardProps = {
  columns: LeadPipelineColumn[];
};

export default function LeadPipelineBoard({
  columns,
}: LeadPipelineBoardProps) {
  const router = useRouter();

  const [selected, setSelected] = useState<SelectedTarget | null>(null);

  function handleRequestStatusChange(
    lead: LeadPipelineCardData,
    targetStatus: LeadStatus,
  ) {
    setSelected({
      leadId: lead.id,
      leadName: lead.fullName,
      currentStatus: lead.status,
      targetStatus,
    });
  }

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.map((column) => (
          <div
            key={column.status}
            className="flex w-72 shrink-0 flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3"
          >
            <div className="flex items-center justify-between px-1">
              <Badge tone={columnTones[column.status]} dot>
                {leadStatusLabels[column.status]}
              </Badge>

              <span className="text-xs font-medium text-slate-500">
                {column.totalCount}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {column.leads.length === 0 ? (
                <p className="px-1 py-4 text-center text-xs text-slate-400">
                  No leads
                </p>
              ) : (
                column.leads.map((lead) => (
                  <LeadPipelineCard
                    key={lead.id}
                    lead={lead}
                    onRequestStatusChange={handleRequestStatusChange}
                  />
                ))
              )}
            </div>

            {column.totalCount > column.leads.length && (
              <a
                href={`/dashboard/leads?status=${column.status}`}
                className="px-1 text-xs font-medium text-primary-800 hover:underline"
              >
                View all {column.totalCount} in list →
              </a>
            )}
          </div>
        ))}
      </div>

      <ChangeLeadStatusDialog
        key={
          selected
            ? `${selected.leadId}-${selected.targetStatus}`
            : "closed"
        }
        open={selected !== null}
        leadId={selected?.leadId ?? ""}
        leadName={selected?.leadName ?? ""}
        currentStatus={selected?.currentStatus ?? "NEW"}
        targetStatus={selected?.targetStatus ?? null}
        onClose={() => setSelected(null)}
        onSuccess={() => {
          setSelected(null);
          router.refresh();
        }}
      />
    </>
  );
}
