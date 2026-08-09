"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  UserPlus,
  Users,
} from "lucide-react";

import {
  bulkChangeLeadStatus,
} from "@/actions/bulk-update-lead-status";

import InquiryForm from "@/components/InquiryForm";
import LeadList from "@/components/LeadList";

import LeadBulkActionsBar from "@/components/leads/LeadBulkActionsBar";

import LeadFiltersBar, {
  type StatusFilter,
} from "@/components/leads/LeadFiltersBar";

import LeadTable from "@/components/leads/LeadTable";

import {
  sortLeads,
  type SortDirection,
  type SortKey,
} from "@/components/leads/lead-sort";

import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import StatCard from "@/components/ui/StatCard";

import {
  useToast,
} from "@/components/ui/Toast";

import type {
  Lead,
  LeadSource,
  LeadStatus,
} from "@/types/lead";

import type {
  CounselorOption,
  CourseOption,
} from "@/types/lead-options";

type LeadsWorkspaceProps = {
  initialLeads: Lead[];

  initialQuery?: string;

  courses: CourseOption[];

  counselors: CounselorOption[];

  canManageAssignments: boolean;
};

const PAGE_SIZE = 8;

export default function LeadsWorkspace({
  initialLeads,
  initialQuery = "",
  courses,
  counselors,
  canManageAssignments,
}: LeadsWorkspaceProps) {
  const { toast } = useToast();

  const [
    leads,
    setLeads,
  ] = useState<Lead[]>(
    initialLeads,
  );

  const [
    query,
    setQuery,
  ] = useState(
    initialQuery,
  );

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>(
      "ALL",
    );

  const [
    sourceFilter,
    setSourceFilter,
  ] =
    useState<
      "ALL" | LeadSource
    >("ALL");

  const [
    sortKey,
    setSortKey,
  ] =
    useState<SortKey>(
      "createdAt",
    );

  const [
    sortDirection,
    setSortDirection,
  ] =
    useState<SortDirection>(
      "desc",
    );

  const [
    selectedIds,
    setSelectedIds,
  ] = useState<
    Set<string>
  >(new Set());

  const [
    page,
    setPage,
  ] = useState(1);

  const [
    isAddDialogOpen,
    setIsAddDialogOpen,
  ] = useState(false);

  const [
    isBulkUpdating,
    setIsBulkUpdating,
  ] = useState(false);

  const filteredLeads =
    useMemo(() => {
      const normalizedQuery =
        query
          .trim()
          .toLowerCase();

      const matchesQuery = (
        lead: Lead,
      ) =>
        normalizedQuery.length ===
          0 ||
        [
          lead.fullName,
          lead.email,
          lead.phone,
          lead.interestedCourse,
          lead.assignedTo,
        ]
          .join(" ")
          .toLowerCase()
          .includes(
            normalizedQuery,
          );

      const matchesStatus = (
        lead: Lead,
      ) =>
        statusFilter ===
          "ALL" ||
        lead.status ===
          statusFilter;

      const matchesSource = (
        lead: Lead,
      ) =>
        sourceFilter ===
          "ALL" ||
        lead.source ===
          sourceFilter;

      return leads.filter(
        (lead) =>
          matchesQuery(lead) &&
          matchesStatus(lead) &&
          matchesSource(lead),
      );
    }, [
      leads,
      query,
      statusFilter,
      sourceFilter,
    ]);

  const sortedLeads =
    useMemo(
      () =>
        sortLeads(
          filteredLeads,
          sortKey,
          sortDirection,
        ),
      [
        filteredLeads,
        sortKey,
        sortDirection,
      ],
    );

  const pageCount =
    Math.max(
      1,
      Math.ceil(
        sortedLeads.length /
          PAGE_SIZE,
      ),
    );

  const safePage =
    Math.min(
      page,
      pageCount,
    );

  const paginatedLeads =
    sortedLeads.slice(
      (safePage - 1) *
        PAGE_SIZE,

      safePage * PAGE_SIZE,
    );

  const statusCounts =
    useMemo(() => {
      const counts: Record<
        StatusFilter,
        number
      > = {
        ALL: leads.length,
        NEW: 0,
        CONTACTED: 0,
        INTERESTED: 0,
        FOLLOW_UP: 0,
        ENROLLED: 0,
        LOST: 0,
      };

      for (const lead of leads) {
        counts[
          lead.status
        ] += 1;
      }

      return counts;
    }, [leads]);

  const enrolledCount =
    statusCounts.ENROLLED;

  const followUpCount =
    statusCounts.FOLLOW_UP;

  function updateFilters(
    update: () => void,
  ) {
    update();

    setPage(1);

    setSelectedIds(
      new Set(),
    );
  }

  function handleSort(
    key: SortKey,
  ) {
    if (key === sortKey) {
      setSortDirection(
        (current) =>
          current === "asc"
            ? "desc"
            : "asc",
      );

      return;
    }

    setSortKey(key);

    setSortDirection(
      "asc",
    );
  }

  function toggleSelectOne(
    id: string,
  ) {
    if (isBulkUpdating) {
      return;
    }

    setSelectedIds(
      (current) => {
        const next =
          new Set(current);

        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }

        return next;
      },
    );
  }

  function toggleSelectAllOnPage() {
    if (isBulkUpdating) {
      return;
    }

    setSelectedIds(
      (current) => {
        const pageIds =
          paginatedLeads.map(
            (lead) =>
              lead.id,
          );

        const allSelected =
          pageIds.every(
            (id) =>
              current.has(id),
          );

        const next =
          new Set(current);

        if (allSelected) {
          pageIds.forEach(
            (id) =>
              next.delete(id),
          );
        } else {
          pageIds.forEach(
            (id) =>
              next.add(id),
          );
        }

        return next;
      },
    );
  }

  function handleCreateLead(
    newLead: Lead,
  ) {
    setLeads(
      (current) => [
        newLead,
        ...current,
      ],
    );

    setPage(1);

    setIsAddDialogOpen(
      false,
    );
  }

  async function handleBulkStatusChange(
    status: LeadStatus,
  ) {
    if (
      selectedIds.size ===
        0 ||
      isBulkUpdating
    ) {
      return;
    }

    /*
     * Capture the selected IDs
     * before the async request.
     */
    const selectedLeadIds =
      new Set(selectedIds);

    const leadIds = [
      ...selectedLeadIds,
    ];

    setIsBulkUpdating(true);

    try {
      const result =
        await bulkChangeLeadStatus(
          {
            leadIds,
            status,
          },
        );

      if (!result.success) {
        toast({
          variant:
            "error",

          title:
            "Status not updated",

          description:
            result.message,
        });

        return;
      }

      /*
       * PostgreSQL succeeded.
       * Now update the local UI.
       */
      setLeads(
        (current) =>
          current.map(
            (lead) =>
              selectedLeadIds.has(
                lead.id,
              )
                ? {
                    ...lead,
                    status,
                  }
                : lead,
          ),
      );

      toast({
        variant:
          "success",

        title:
          "Status updated",

        description: `${
          result.data
            .updatedCount
        } lead${
          result.data
            .updatedCount === 1
            ? ""
            : "s"
        } moved successfully.`,
      });

      setSelectedIds(
        new Set(),
      );
    } catch (error) {
      console.error(
        "Bulk lead status update failed",
        error,
      );

      toast({
        variant:
          "error",

        title:
          "Status not updated",

        description:
          "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsBulkUpdating(
        false,
      );
    }
  }

  return (
    <div className="grid gap-6">
      {/* Statistics */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total leads"
          value={
            leads.length
          }
          icon={Users}
        />

        <StatCard
          label="New leads"
          value={
            statusCounts.NEW
          }
          icon={UserPlus}
          description="Awaiting first contact"
        />

        <StatCard
          label="Follow-ups due"
          value={
            followUpCount
          }
          icon={Clock}
          description="Needs counselor action"
        />

        <StatCard
          label="Enrolled"
          value={
            enrolledCount
          }
          icon={
            GraduationCap
          }
          description={`${
            leads.length > 0
              ? Math.round(
                  (enrolledCount /
                    leads.length) *
                    100,
                )
              : 0
          }% conversion`}
        />
      </div>

      {/* Filters */}

      <LeadFiltersBar
        query={query}
        onQueryChange={(
          value,
        ) =>
          updateFilters(() =>
            setQuery(value),
          )
        }
        statusFilter={
          statusFilter
        }
        onStatusChange={(
          value,
        ) =>
          updateFilters(() =>
            setStatusFilter(
              value,
            ),
          )
        }
        statusCounts={
          statusCounts
        }
        sourceFilter={
          sourceFilter
        }
        onSourceChange={(
          value,
        ) =>
          updateFilters(() =>
            setSourceFilter(
              value,
            ),
          )
        }
        onAddLead={() =>
          setIsAddDialogOpen(
            true,
          )
        }
      />

      {/* Bulk actions */}

      {selectedIds.size >
        0 && (
        <LeadBulkActionsBar
          selectedCount={
            selectedIds.size
          }
          isUpdating={
            isBulkUpdating
          }
          onClearSelection={() =>
            setSelectedIds(
              new Set(),
            )
          }
          onChangeStatus={
            handleBulkStatusChange
          }
        />
      )}

      {/* Desktop table */}

      <div className="hidden lg:block">
        <LeadTable
          leads={
            paginatedLeads
          }
          selectedIds={
            selectedIds
          }
          onToggleOne={
            toggleSelectOne
          }
          onToggleAll={
            toggleSelectAllOnPage
          }
          sortKey={sortKey}
          sortDirection={
            sortDirection
          }
          onSort={handleSort}
        />
      </div>

      {/* Mobile list */}

      <div className="lg:hidden">
        <LeadList
          leads={
            paginatedLeads
          }
          selectedIds={
            selectedIds
          }
          onToggleSelect={
            toggleSelectOne
          }
        />
      </div>

      {/* Pagination */}

      {sortedLeads.length >
        0 && (
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-700">
              {(safePage -
                1) *
                PAGE_SIZE +
                1}
              –
              {Math.min(
                safePage *
                  PAGE_SIZE,
                sortedLeads.length,
              )}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-700">
              {
                sortedLeads.length
              }
            </span>{" "}
            leads
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={
                safePage <=
                  1 ||
                isBulkUpdating
              }
              onClick={() =>
                setPage(
                  (current) =>
                    current -
                    1,
                )
              }
            >
              <ChevronLeft
                aria-hidden="true"
                className="size-4"
              />

              Previous
            </Button>

            <span className="px-2 text-sm text-slate-500">
              Page{" "}
              {safePage} of{" "}
              {pageCount}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={
                safePage >=
                  pageCount ||
                isBulkUpdating
              }
              onClick={() =>
                setPage(
                  (current) =>
                    current +
                    1,
                )
              }
            >
              Next

              <ChevronRight
                aria-hidden="true"
                className="size-4"
              />
            </Button>
          </div>
        </div>
      )}

      {/* Add lead dialog */}

      <Dialog
        open={
          isAddDialogOpen
        }
        onClose={() =>
          setIsAddDialogOpen(
            false,
          )
        }
        titleId="add-lead-title"
        size="lg"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-accent-600">
              New inquiry
            </p>

            <h2
              id="add-lead-title"
              className="mt-1 text-xl font-semibold text-primary-900"
            >
              Add a new lead
            </h2>
          </div>
        </div>

        <div className="mt-6">
          <InquiryForm
            courses={
              courses
            }
            counselors={
              counselors
            }
            canManageAssignments={
              canManageAssignments
            }
            onCreateLead={
              handleCreateLead
            }
            onCancel={() =>
              setIsAddDialogOpen(
                false,
              )
            }
          />
        </div>
      </Dialog>
    </div>
  );
}