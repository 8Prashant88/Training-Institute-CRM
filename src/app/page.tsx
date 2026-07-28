"use client";

import { useState } from "react";
import DashboardStat from "@/components/DashboardStat";
import LeadList from "@/components/LeadList";
import LeadStatusBadge from "@/components/LeadStatusBadge";
import type { Lead } from "@/types/lead";
import InquiryForm from "@/components/InquiryForm";

type StatusFilter = "ALL" | Lead["status"];

const sampleLeads: Lead[] = [
  {
    id: "lead-001",
    fullName: "Prashant Sapkota",
    email: "prashant@example.com",
    phone: "9800000000",
    interestedCourse: "AI Engineering",
    status: "NEW",
  },
  {
    id: "lead-002",
    fullName: "Sita Sharma",
    email: "sita@example.com",
    phone: "9800000001",
    interestedCourse: "Data Science",
    status: "CONTACTED",
  },
  {
    id: "lead-003",
    fullName: "Rohan Thapa",
    email: "rohan@example.com",
    phone: "9800000002",
    interestedCourse: "Cybersecurity",
    status: "ENROLLED",
  },
];

export default function HomePage() {
  const [leads, setLeads] = useState<Lead[]>(sampleLeads);

  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("ALL");

  const filteredLeads =
    selectedStatus === "ALL"
      ? leads
      : leads.filter((lead) => lead.status === selectedStatus);

  function getFilterButtonClass(status: StatusFilter) {
    const baseClasses =
      "rounded-lg border px-3 py-2 text-sm font-medium transition";

    if (selectedStatus === status) {
      return `${baseClasses} border-slate-900 bg-slate-900 text-white`;
    }

    return `${baseClasses} border-slate-300 bg-white text-slate-700 hover:bg-slate-100`;
  }
  function handleCreateLead(newLead: Lead) {
    setLeads((currentLeads) => [newLead, ...currentLeads]);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-3xl rounded-2xl bg-white p-10 shadow-sm">
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
          Day 2
        </p>

        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Training Institute CRM
        </h1>

        <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
          A lead and enrollment management system for training institutes.
        </p>

        <DashboardStat label="Total Leads" value={leads.length} />

        <DashboardStat
          label="New Leads"
          value={leads.filter((lead) => lead.status === "NEW").length}
        />

        <DashboardStat
          label="Enrolled Students"
          value={leads.filter((lead) => lead.status === "ENROLLED").length}
        />
        <InquiryForm onCreateLead={handleCreateLead} />
        
        <div className="mt-6 flex flex-wrap gap-3">
          <LeadStatusBadge status="NEW" />
          <LeadStatusBadge status="CONTACTED" />
          <LeadStatusBadge status="ENROLLED" />
        </div>
        <div className="mt-8">
          <p className="mb-3 text-sm font-medium text-slate-700">
            Selected status: {selectedStatus}
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedStatus("ALL")}
              className={getFilterButtonClass("ALL")}
            >
              All
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus("NEW")}
              className={getFilterButtonClass("NEW")}
            >
              New
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus("CONTACTED")}
              className={getFilterButtonClass("CONTACTED")}
            >
              Contacted
            </button>

            <button
              type="button"
              onClick={() => setSelectedStatus("ENROLLED")}
              className={getFilterButtonClass("ENROLLED")}
            >
              Enrolled
            </button>
          </div>
        </div>
        <div className="mt-8">
          <LeadList leads={filteredLeads} />
        </div>
      </section>
    </main>
  );
}
