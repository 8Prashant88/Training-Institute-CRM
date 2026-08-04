"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, UserPlus, Users, GraduationCap, Clock } from "lucide-react";

import Button from "@/components/ui/Button";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import Dialog from "@/components/ui/Dialog";
import InquiryForm from "@/components/InquiryForm";
import LeadList from "@/components/LeadList";
import LeadTable from "@/components/leads/LeadTable";
import LeadFiltersBar, {
  type StatusFilter,
} from "@/components/leads/LeadFiltersBar";
import LeadBulkActionsBar from "@/components/leads/LeadBulkActionsBar";
import StatCard from "@/components/ui/StatCard";
import { useToast } from "@/components/ui/Toast";
import { sortLeads, type SortDirection, type SortKey } from "@/components/leads/lead-sort";
import type { Lead, LeadSource, LeadStatus } from "@/types/lead";
import type {
  CounselorOption,
  CourseOption,
} from "@/types/lead-options";

type LeadsWorkspaceProps = {
  initialLeads: Lead[];
  initialQuery?: string;
  courses: CourseOption[];
  counselors: CounselorOption[];
};

const PAGE_SIZE = 8;

export default function LeadsWorkspace({
  initialLeads,
  initialQuery = "",
  courses,
  counselors,
}: LeadsWorkspaceProps) {
  const { toast } = useToast();

  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [query, setQuery] = useState(initialQuery);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [sourceFilter, setSourceFilter] = useState<"ALL" | LeadSource>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

  const filteredLeads = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const matchesQuery = (lead: Lead) =>
      normalizedQuery.length === 0 ||
      [lead.fullName, lead.email, lead.phone, lead.interestedCourse, lead.assignedTo]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery);

    const matchesStatus = (lead: Lead) =>
      statusFilter === "ALL" || lead.status === statusFilter;

    const matchesSource = (lead: Lead) =>
      sourceFilter === "ALL" || lead.source === sourceFilter;

    return leads.filter(
      (lead) => matchesQuery(lead) && matchesStatus(lead) && matchesSource(lead),
    );
  }, [leads, query, statusFilter, sourceFilter]);

  const sortedLeads = useMemo(
    () => sortLeads(filteredLeads, sortKey, sortDirection),
    [filteredLeads, sortKey, sortDirection],
  );

  const pageCount = Math.max(1, Math.ceil(sortedLeads.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paginatedLeads = sortedLeads.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      ALL: leads.length,
      NEW: 0,
      CONTACTED: 0,
      INTERESTED: 0,
      FOLLOW_UP: 0,
      ENROLLED: 0,
      LOST: 0,
    };

    for (const lead of leads) {
      counts[lead.status] += 1;
    }

    return counts;
  }, [leads]);

  const enrolledCount = statusCounts.ENROLLED;
  const followUpCount = statusCounts.FOLLOW_UP;

  function updateFilters(update: () => void) {
    update();
    setPage(1);
  }

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("asc");
  }

  function toggleSelectOne(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAllOnPage() {
    setSelectedIds((current) => {
      const pageIds = paginatedLeads.map((lead) => lead.id);
      const allSelected = pageIds.every((id) => current.has(id));

      const next = new Set(current);
      if (allSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  function handleCreateLead(newLead: Lead) {
    setLeads((current) => [newLead, ...current]);
    setIsAddDialogOpen(false);
  }

  function handleBulkStatusChange(status: LeadStatus) {
    setLeads((current) =>
      current.map((lead) =>
        selectedIds.has(lead.id) ? { ...lead, status } : lead,
      ),
    );

    toast({
      variant: "success",
      title: "Status updated",
      description: `${selectedIds.size} lead${selectedIds.size === 1 ? "" : "s"} moved to a new status.`,
    });

    setSelectedIds(new Set());
  }

  function handleBulkDelete() {
    setLeads((current) =>
      current.filter((lead) => !selectedIds.has(lead.id)),
    );

    toast({
      variant: "info",
      title: "Leads removed",
      description: `${selectedIds.size} lead${selectedIds.size === 1 ? "" : "s"} removed from the pipeline.`,
    });

    setSelectedIds(new Set());
    setIsBulkDeleteDialogOpen(false);
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total leads" value={leads.length} icon={Users} />
        <StatCard
          label="New this session"
          value={statusCounts.NEW}
          icon={UserPlus}
          description="Awaiting first contact"
        />
        <StatCard
          label="Follow-ups due"
          value={followUpCount}
          icon={Clock}
          description="Needs counselor action"
        />
        <StatCard
          label="Enrolled"
          value={enrolledCount}
          icon={GraduationCap}
          description={`${leads.length > 0 ? Math.round((enrolledCount / leads.length) * 100) : 0}% conversion`}
        />
      </div>

      <LeadFiltersBar
        query={query}
        onQueryChange={(value) => updateFilters(() => setQuery(value))}
        statusFilter={statusFilter}
        onStatusChange={(value) =>
          updateFilters(() => setStatusFilter(value))
        }
        statusCounts={statusCounts}
        sourceFilter={sourceFilter}
        onSourceChange={(value) =>
          updateFilters(() => setSourceFilter(value))
        }
        onAddLead={() => setIsAddDialogOpen(true)}
      />

      {selectedIds.size > 0 && (
        <LeadBulkActionsBar
          selectedCount={selectedIds.size}
          onClearSelection={() => setSelectedIds(new Set())}
          onChangeStatus={handleBulkStatusChange}
          onDelete={() => setIsBulkDeleteDialogOpen(true)}
        />
      )}

      <div className="hidden lg:block">
        <LeadTable
          leads={paginatedLeads}
          selectedIds={selectedIds}
          onToggleOne={toggleSelectOne}
          onToggleAll={toggleSelectAllOnPage}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>

      <div className="lg:hidden">
        <LeadList
          leads={paginatedLeads}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelectOne}
        />
      </div>

      {sortedLeads.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-700">
              {(safePage - 1) * PAGE_SIZE + 1}–
              {Math.min(safePage * PAGE_SIZE, sortedLeads.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-700">
              {sortedLeads.length}
            </span>{" "}
            leads
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              <ChevronLeft aria-hidden="true" className="size-4" />
              Previous
            </Button>

            <span className="px-2 text-sm text-slate-500">
              Page {safePage} of {pageCount}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= pageCount}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
              <ChevronRight aria-hidden="true" className="size-4" />
            </Button>
          </div>
        </div>
      )}

      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        titleId="add-lead-title"
        size="lg"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-600">
              New inquiry
            </p>
            <h2 id="add-lead-title" className="mt-1 text-xl font-semibold text-primary-900">
              Add a new lead
            </h2>
          </div>
        </div>

        <div className="mt-6">
          <InquiryForm
  courses={courses}
  counselors={counselors}
  onCreateLead={handleCreateLead}
  onCancel={() => setIsAddDialogOpen(false)}
/>
        </div>
      </Dialog>

      <ConfirmationDialog
        open={isBulkDeleteDialogOpen}
        title={`Delete ${selectedIds.size} lead${selectedIds.size === 1 ? "" : "s"}?`}
        description="This will remove the selected leads from the current session. This action cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setIsBulkDeleteDialogOpen(false)}
        onConfirm={handleBulkDelete}
      />
    </div>
  );
}
