"use client";

import { Download, Plus, RotateCcw } from "lucide-react";

import Button from "@/components/ui/Button";

import {
  Select,
} from "@/components/ui/Input";

import SearchInput from "@/components/ui/SearchInput";

import { cn } from "@/lib/cn";

import {
  leadStatusLabels,
  leadStatuses,
  type LeadStatus,
} from "@/types/lead";

import type {
  LeadListSortBy,
  LeadListSortDirection,
  LeadListSource,
} from "@/lib/lead-list-query";

export type StatusFilter =
  "ALL" | LeadStatus;

type CourseFilterOption = {
  id: string;
  title: string;

  status:
    | "ACTIVE"
    | "INACTIVE";
};

type CounselorFilterOption = {
  id: string;
  fullName: string;
  email: string;
  isActive: boolean;
};

type LeadFiltersBarProps = {
  search: string;

  status?: LeadStatus;

  source?: LeadListSource;

  courseId?: string;

  counselor?: string;

  sortBy: LeadListSortBy;

  sortDirection:
    LeadListSortDirection;

  statusCounts:
    Record<
      StatusFilter,
      number
    >;

  courses:
    CourseFilterOption[];

  counselors:
    CounselorFilterOption[];

  canManageAssignments:
    boolean;

  disabled?: boolean;

  onSearchChange:
    (value: string) => void;

  onStatusChange:
    (value?: LeadStatus) => void;

  onSourceChange:
    (value?: LeadListSource) => void;

  onCourseChange:
    (value?: string) => void;

  onCounselorChange:
    (value?: string) => void;

  onSortChange: (
    sortBy: LeadListSortBy,
    direction:
      LeadListSortDirection,
  ) => void;

  onClearFilters: () => void;

  onAddLead: () => void;

  /** Points at /api/leads/export with the current filters applied. */
  exportHref: string;
};

const sourceOptions: Array<{
  value: LeadListSource;
  label: string;
}> = [
  {
    value: "WEBSITE",
    label: "Website",
  },
  {
    value: "REFERRAL",
    label: "Referral",
  },
  {
    value: "WALK_IN",
    label: "Walk-in",
  },
  {
    value: "SOCIAL_MEDIA",
    label: "Social Media",
  },
  {
    value: "PHONE_INQUIRY",
    label: "Phone Inquiry",
  },
  {
    value: "EVENT",
    label: "Event",
  },
];

export default function LeadFiltersBar({
  search,
  status,
  source,
  courseId,
  counselor,
  sortBy,
  sortDirection,
  statusCounts,
  courses,
  counselors,
  canManageAssignments,
  disabled = false,
  onSearchChange,
  onStatusChange,
  onSourceChange,
  onCourseChange,
  onCounselorChange,
  onSortChange,
  onClearFilters,
  onAddLead,
  exportHref,
}: LeadFiltersBarProps) {
  const statusPills:
    StatusFilter[] = [
      "ALL",
      ...leadStatuses,
    ];

  const sortValue =
    `${sortBy}:${sortDirection}`;

  const hasActiveFilters =
    Boolean(
      search ||
        status ||
        source ||
        courseId ||
        counselor ||
        sortBy !==
          "createdAt" ||
        sortDirection !==
          "desc",
    );

  function handleSortChange(
    value: string,
  ) {
    const [
      nextSort,
      nextDirection,
    ] = value.split(":");

    if (
      (
        nextSort ===
          "createdAt" ||
        nextSort ===
          "nextFollowUpAt"
      ) &&
      (
        nextDirection ===
          "asc" ||
        nextDirection ===
          "desc"
      )
    ) {
      onSortChange(
        nextSort,
        nextDirection,
      );
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <SearchInput
          value={search}
          disabled={disabled}
          onChange={(event) =>
            onSearchChange(
              event.target.value,
            )
          }
          placeholder={
            canManageAssignments
              ? "Search name, email, phone, course or counselor…"
              : "Search name, email, phone or course…"
          }
          containerClassName="w-full xl:max-w-sm"
          aria-label="Search leads"
        />

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <a
            href={exportHref}
            aria-disabled={disabled}
            onClick={(event) => {
              if (disabled) {
                event.preventDefault();
              }
            }}
          >
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className="whitespace-nowrap"
            >
              <Download
                aria-hidden="true"
                className="size-4"
              />

              Export CSV
            </Button>
          </a>

          <Button
            onClick={onAddLead}
            disabled={disabled}
            className="whitespace-nowrap"
          >
            <Plus
              aria-hidden="true"
              className="size-4"
            />

            Add lead
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Select
          value={source ?? ""}
          disabled={disabled}
          aria-label="Filter by source"
          onChange={(event) =>
            onSourceChange(
              event.target.value
                ? event.target
                    .value as LeadListSource
                : undefined,
            )
          }
        >
          <option value="">
            All sources
          </option>

          {sourceOptions.map(
            (option) => (
              <option
                key={
                  option.value
                }
                value={
                  option.value
                }
              >
                {option.label}
              </option>
            ),
          )}
        </Select>

        <Select
          value={
            courseId ?? ""
          }
          disabled={disabled}
          aria-label="Filter by course"
          onChange={(event) =>
            onCourseChange(
              event.target.value ||
                undefined,
            )
          }
        >
          <option value="">
            All courses
          </option>

          {courses.map(
            (course) => (
              <option
                key={course.id}
                value={course.id}
              >
                {course.title}
                {course.status ===
                "INACTIVE"
                  ? " (Inactive)"
                  : ""}
              </option>
            ),
          )}
        </Select>

        {canManageAssignments && (
          <Select
            value={
              counselor ?? ""
            }
            disabled={disabled}
            aria-label="Filter by counselor"
            onChange={(event) =>
              onCounselorChange(
                event.target
                  .value ||
                  undefined,
              )
            }
          >
            <option value="">
              All counselors
            </option>

            <option value="UNASSIGNED">
              Unassigned
            </option>

            {counselors.map(
              (person) => (
                <option
                  key={
                    person.id
                  }
                  value={
                    person.id
                  }
                >
                  {
                    person.fullName
                  }
                  {!person.isActive
                    ? " (Inactive)"
                    : ""}
                </option>
              ),
            )}
          </Select>
        )}

        <Select
          value={sortValue}
          disabled={disabled}
          aria-label="Sort leads"
          onChange={(event) =>
            handleSortChange(
              event.target.value,
            )
          }
        >
          <option value="createdAt:desc">
            Newest created
          </option>

          <option value="createdAt:asc">
            Oldest created
          </option>

          <option value="nextFollowUpAt:asc">
            Follow-up soonest
          </option>

          <option value="nextFollowUpAt:desc">
            Follow-up latest
          </option>
        </Select>
      </div>

      <div className="flex items-start justify-between gap-3">
        <div
          role="tablist"
          aria-label="Filter leads by status"
          className="flex min-w-0 gap-2 overflow-x-auto pb-1"
        >
          {statusPills.map(
            (value) => {
              const isActive =
                value === "ALL"
                  ? !status
                  : status ===
                    value;

              return (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  disabled={
                    disabled
                  }
                  aria-selected={
                    isActive
                  }
                  onClick={() =>
                    onStatusChange(
                      value ===
                        "ALL"
                        ? undefined
                        : value,
                    )
                  }
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-60",

                    isActive
                      ? "border-primary-900 bg-primary-900 text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                  )}
                >
                  {value ===
                  "ALL"
                    ? "All"
                    : leadStatusLabels[
                        value
                      ]}

                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-xs font-semibold",

                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {
                      statusCounts[
                        value
                      ]
                    }
                  </span>
                </button>
              );
            },
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            disabled={disabled}
            onClick={
              onClearFilters
            }
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw
              aria-hidden="true"
              className="size-3.5"
            />

            Reset
          </button>
        )}
      </div>
    </div>
  );
}