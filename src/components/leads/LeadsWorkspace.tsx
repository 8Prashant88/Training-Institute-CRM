"use client";

import { useCallback, useEffect, useState, useTransition } from "react";

import {
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  UserPlus,
  Users,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { bulkChangeLeadStatus } from "@/actions/bulk-update-lead-status";

import InquiryForm from "@/components/InquiryForm";
import LeadList from "@/components/LeadList";

import LeadBulkActionsBar from "@/components/leads/LeadBulkActionsBar";
import LeadFiltersBar from "@/components/leads/LeadFiltersBar";
import LeadTable from "@/components/leads/LeadTable";

import Button from "@/components/ui/Button";
import Dialog from "@/components/ui/Dialog";
import StatCard from "@/components/ui/StatCard";

import { useToast } from "@/components/ui/Toast";

import type {
  LeadListQuery,
  LeadListSortBy,
  LeadListSortDirection,
  LeadListSource,
} from "@/lib/lead-list-query";

import type { Lead, LeadStatus } from "@/types/lead";

import type { CounselorOption, CourseOption } from "@/types/lead-options";

type CourseFilterOption = {
  id: string;
  title: string;

  status: "ACTIVE" | "INACTIVE";
};

type CounselorFilterOption = {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
};

type StatusCounts = Record<"ALL" | LeadStatus, number>;

type Pagination = {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;

  hasPreviousPage: boolean;

  hasNextPage: boolean;
};

type LeadsWorkspaceProps = {
  initialLeads: Lead[];

  query: LeadListQuery;

  statusCounts: StatusCounts;

  pagination: Pagination;

  courses: CourseOption[];

  courseFilterOptions: CourseFilterOption[];

  counselors: CounselorOption[];

  counselorFilterOptions: CounselorFilterOption[];

  canManageAssignments: boolean;
};

const MAX_SEARCH_LENGTH = 100;
const SEARCH_DEBOUNCE_MS = 350;

function normalizeSearch(value: string) {
  return value.trim().slice(0, MAX_SEARCH_LENGTH);
}

function createLeadsHref(query: LeadListQuery) {
  const params = new URLSearchParams();

  if (query.search) {
    params.set("q", query.search);
  }

  if (query.status) {
    params.set("status", query.status);
  }

  if (query.source) {
    params.set("source", query.source);
  }

  if (query.courseId) {
    params.set("course", query.courseId);
  }

  if (query.counselor) {
    params.set(
      "counselor",

      query.counselor === "UNASSIGNED" ? "unassigned" : query.counselor,
    );
  }

  if (query.sortBy !== "createdAt") {
    params.set("sort", query.sortBy);
  }

  if (query.sortDirection !== "desc") {
    params.set("dir", query.sortDirection);
  }

  if (query.page > 1) {
    params.set("page", String(query.page));
  }

  const search = params.toString();

  return search ? `/dashboard/leads?${search}` : "/dashboard/leads";
}

export default function LeadsWorkspace({
  initialLeads,
  query,
  statusCounts,
  pagination,
  courses,
  courseFilterOptions,
  counselors,
  counselorFilterOptions,
  canManageAssignments,
}: LeadsWorkspaceProps) {
  const router = useRouter();

  const { toast } = useToast();

  const [isNavigating, startNavigation] = useTransition();

  const [searchValue, setSearchValue] = useState(query.search);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  /*
   * Browser Back / Forward navigation
   * changes the Server Component query.
   * Keep the text field synchronized.
   *
   * Adjusted during render (not in an
   * effect) to avoid a cascading render:
   * https://react.dev/learn/you-might-not-need-an-effect
   */
  const [prevQuerySearch, setPrevQuerySearch] = useState(query.search);
  if (query.search !== prevQuerySearch) {
    setPrevQuerySearch(query.search);
    setSearchValue(query.search);
  }

  /*
   * Never keep selections from an old
   * server result page. Adjusted during
   * render for the same reason as above.
   */
  const selectionResetKey = [
    query.search,
    query.status,
    query.source,
    query.courseId,
    query.counselor,
    query.sortBy,
    query.sortDirection,
    query.page,
  ].join("|");
  const [prevSelectionResetKey, setPrevSelectionResetKey] =
    useState(selectionResetKey);
  if (selectionResetKey !== prevSelectionResetKey) {
    setPrevSelectionResetKey(selectionResetKey);
    setSelectedIds(new Set());
  }

  const navigate = useCallback(
    (
      next: LeadListQuery,

      mode: "push" | "replace" = "push",
    ) => {
      const href = createLeadsHref(next);

      startNavigation(() => {
        if (mode === "replace") {
          router.replace(href, {
            scroll: false,
          });

          return;
        }

        router.push(href, {
          scroll: false,
        });
      });
    },
    [router, startNavigation],
  );

  /*
   * Any deliberate filter change resets
   * pagination back to page 1.
   *
   * We include the current search text
   * even when its debounce has not fired
   * yet, preventing filters from dropping
   * recently typed text.
   */
  const changeQuery = useCallback(
    (changes: Partial<LeadListQuery>) => {
      navigate({
        ...query,

        search: normalizeSearch(searchValue),

        ...changes,

        page: changes.page ?? 1,
      });
    },
    [navigate, query, searchValue],
  );

  /*
   * Debounced database search.
   *
   * replace() avoids one browser-history
   * entry for every typed character.
   */
  useEffect(() => {
    const normalized = normalizeSearch(searchValue);

    if (normalized === query.search) {
      return;
    }

    const timeout = window.setTimeout(
      () => {
        navigate(
          {
            ...query,

            search: normalized,

            page: 1,
          },

          "replace",
        );
      },

      SEARCH_DEBOUNCE_MS,
    );

    return () => window.clearTimeout(timeout);
  }, [navigate, query, searchValue]);

  const controlsDisabled = isNavigating || isBulkUpdating;

  const matchingLeadCount = pagination.totalCount;

  /*
   * Status counts intentionally ignore the
   * currently selected status while keeping
   * all other filters.
   *
   * This is the correct denominator for
   * pipeline-level statistics.
   */
  const pipelineLeadCount = statusCounts.ALL;

  const enrolledCount = statusCounts.ENROLLED;

  const followUpCount = statusCounts.FOLLOW_UP;

  const conversionRate =
    pipelineLeadCount > 0
      ? Math.round((enrolledCount / pipelineLeadCount) * 100)
      : 0;

  function toggleSelectOne(id: string) {
    if (controlsDisabled) {
      return;
    }

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
    if (controlsDisabled) {
      return;
    }

    setSelectedIds((current) => {
      const pageIds = initialLeads.map((lead) => lead.id);

      const allSelected =
        pageIds.length > 0 && pageIds.every((id) => current.has(id));

      const next = new Set(current);

      if (allSelected) {
        for (const id of pageIds) {
          next.delete(id);
        }
      } else {
        for (const id of pageIds) {
          next.add(id);
        }
      }

      return next;
    });
  }

  async function handleBulkStatusChange(status: LeadStatus) {
    if (selectedIds.size === 0 || isBulkUpdating) {
      return;
    }

    const leadIds = [...selectedIds];

    setIsBulkUpdating(true);

    try {
      const result = await bulkChangeLeadStatus({
        leadIds,
        status,
      });

      if (!result.success) {
        toast({
          variant: "error",

          title: "Status not updated",

          description: result.message,
        });

        return;
      }

      setSelectedIds(new Set());

      toast({
        variant: "success",

        title: "Status updated",

        description: `${result.data.updatedCount} lead${
          result.data.updatedCount === 1 ? "" : "s"
        } moved successfully.`,
      });

      /*
       * Database is the source of truth.
       *
       * Re-fetch the current page instead
       * of manually mutating React data.
       */
      router.refresh();
    } catch (error) {
      console.error("Bulk lead status update failed", error);

      toast({
        variant: "error",

        title: "Status not updated",

        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsBulkUpdating(false);
    }
  }

  function handleLeadCreated() {
    setIsAddDialogOpen(false);

    setSelectedIds(new Set());

    /*
     * submitLead already persists and
     * revalidates server data.
     */
    router.refresh();
  }

  function handleStatusChange(status?: LeadStatus) {
    changeQuery({
      status,
    });
  }

  function handleSourceChange(source?: LeadListSource) {
    changeQuery({
      source,
    });
  }

  function handleCourseChange(courseId?: string) {
    changeQuery({
      courseId,
    });
  }

  function handleCounselorChange(counselor?: string) {
    if (!canManageAssignments) {
      return;
    }

    changeQuery({
      counselor,
    });
  }

  function handleSortChange(
    sortBy: LeadListSortBy,

    sortDirection: LeadListSortDirection,
  ) {
    changeQuery({
      sortBy,
      sortDirection,
    });
  }

  function handleClearFilters() {
    setSearchValue("");

    navigate({
      search: "",
      status: undefined,
      source: undefined,
      courseId: undefined,
      counselor: undefined,
      sortBy: "createdAt",
      sortDirection: "desc",
      page: 1,
    });
  }

  function changePage(page: number) {
    navigate({
      ...query,

      search: normalizeSearch(searchValue),

      page,
    });
  }

  const firstResult =
    pagination.totalCount === 0
      ? 0
      : (pagination.page - 1) * pagination.pageSize + 1;

  const lastResult =
    pagination.totalCount === 0
      ? 0
      : Math.min(
          firstResult + initialLeads.length - 1,

          pagination.totalCount,
        );

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Matching leads"
          value={matchingLeadCount}
          icon={Users}
        />

        <StatCard
          label="New leads"
          value={statusCounts.NEW}
          icon={UserPlus}
          description="Within current filters"
        />

        <StatCard
          label="Follow-ups"
          value={followUpCount}
          icon={Clock}
          description="Within current filters"
        />

        <StatCard
          label="Enrolled"
          value={enrolledCount}
          icon={GraduationCap}
          description={`${conversionRate}% conversion`}
        />
      </div>

      <LeadFiltersBar
        search={searchValue}
        status={query.status}
        source={query.source}
        courseId={query.courseId}
        counselor={query.counselor}
        sortBy={query.sortBy}
        sortDirection={query.sortDirection}
        statusCounts={statusCounts}
        courses={courseFilterOptions}
        counselors={counselorFilterOptions}
        canManageAssignments={canManageAssignments}
        disabled={controlsDisabled}
        onSearchChange={setSearchValue}
        onStatusChange={handleStatusChange}
        onSourceChange={handleSourceChange}
        onCourseChange={handleCourseChange}
        onCounselorChange={handleCounselorChange}
        onSortChange={handleSortChange}
        onClearFilters={handleClearFilters}
        onAddLead={() => setIsAddDialogOpen(true)}
      />

      {selectedIds.size > 0 && (
        <LeadBulkActionsBar
          selectedCount={selectedIds.size}
          isUpdating={isBulkUpdating}
          onClearSelection={() => setSelectedIds(new Set())}
          onChangeStatus={handleBulkStatusChange}
        />
      )}

      {initialLeads.length > 0 ? (
        <>
          <div className="hidden lg:block">
            <LeadTable
              leads={initialLeads}
              selectedIds={selectedIds}
              onToggleOne={toggleSelectOne}
              onToggleAll={toggleSelectAllOnPage}
              disabled={controlsDisabled}
            />
          </div>

          <div className="lg:hidden">
            <LeadList
              leads={initialLeads}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelectOne}
            />
          </div>
        </>
      ) : (
        <LeadList leads={[]} />
      )}

      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-medium text-slate-700">
            {firstResult}
            {pagination.totalCount > 0 ? "–" : ""}
            {pagination.totalCount > 0 ? lastResult : ""}
          </span>{" "}
          of{" "}
          <span className="font-medium text-slate-700">
            {pagination.totalCount}
          </span>{" "}
          leads
        </p>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasPreviousPage || controlsDisabled}
            onClick={() => changePage(pagination.page - 1)}
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
            Previous
          </Button>

          <span className="px-2 text-sm text-slate-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasNextPage || controlsDisabled}
            onClick={() => changePage(pagination.page + 1)}
          >
            Next
            <ChevronRight aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </div>

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
            courses={courses}
            counselors={counselors}
            canManageAssignments={canManageAssignments}
            onCreateLead={handleLeadCreated}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </div>
      </Dialog>
    </div>
  );
}
