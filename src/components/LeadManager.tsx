"use client";

import { useState } from "react";
import DashboardStat from "@/components/DashboardStat";
import InquiryForm from "@/components/InquiryForm";
import LeadList from "@/components/LeadList";
import type { Lead } from "@/types/lead";


type StatusFilter = "ALL" | Lead["status"];

type LeadManagerProps = {
  initialLeads: Lead[];
};

export default function LeadManager({
  initialLeads,
}: LeadManagerProps) {
  const [leads, setLeads] =
    useState<Lead[]>(initialLeads);

  const [selectedStatus, setSelectedStatus] =
    useState<StatusFilter>("ALL");

  const filteredLeads =
    selectedStatus === "ALL"
      ? leads
      : leads.filter(
          (lead) => lead.status === selectedStatus,
        );

  const newLeadCount = leads.filter(
    (lead) => lead.status === "NEW",
  ).length;

  const enrolledLeadCount = leads.filter(
    (lead) => lead.status === "ENROLLED",
  ).length;

  function handleCreateLead(newLead: Lead) {
    setLeads((currentLeads) => [
      newLead,
      ...currentLeads,
    ]);
  }

  function getFilterButtonClass(
    status: StatusFilter,
  ) {
    const baseClasses =
      "rounded-lg border px-3 py-2 text-sm font-medium transition";

    if (selectedStatus === status) {
      return `${baseClasses} border-slate-900 bg-slate-900 text-white`;
    }

    return `${baseClasses} border-slate-300 bg-white text-slate-700 hover:bg-slate-100`;
  }

  return ( 
   
    <>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <DashboardStat
          label="Total Leads"
          value={leads.length}
        />

        <DashboardStat
          label="New Leads"
          value={newLeadCount}
        />

        <DashboardStat
          label="Enrolled Students"
          value={enrolledLeadCount}
        />
      </div>

      <InquiryForm
        onCreateLead={handleCreateLead}
      />

      <section className="mt-8">
        <p className="mb-3 text-sm font-medium text-slate-700">
          Selected status: {selectedStatus}
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setSelectedStatus("ALL")
            }
            className={getFilterButtonClass("ALL")}
          >
            All
          </button>

          <button
            type="button"
            onClick={() =>
              setSelectedStatus("NEW")
            }
            className={getFilterButtonClass("NEW")}
          >
            New
          </button>

          <button
            type="button"
            onClick={() =>
              setSelectedStatus("CONTACTED")
            }
            className={getFilterButtonClass(
              "CONTACTED",
            )}
          >
            Contacted
          </button>

          <button
            type="button"
            onClick={() =>
              setSelectedStatus("ENROLLED")
            }
            className={getFilterButtonClass(
              "ENROLLED",
            )}
          >
            Enrolled
          </button>
        </div>

        <div className="mt-8">
          <LeadList leads={filteredLeads} />
        </div>
      </section>
    </>
  );
}