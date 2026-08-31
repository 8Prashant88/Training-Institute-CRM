"use client";

import { useState, type ReactNode } from "react";

import {
  AlertTriangle,
  ChevronDown,
  Download,
  Flame,
  PhoneCall,
  Plus,
  RotateCcw,
  SlidersHorizontal,
  Star,
  User,
  type LucideIcon,
} from "lucide-react";

import Button from "@/components/ui/Button";

import {
  Input,
  Select,
} from "@/components/ui/Input";

import SearchInput from "@/components/ui/SearchInput";

import { cn } from "@/lib/cn";

import {
  leadPriorityLabels,
  leadStatusLabels,
  leadStatuses,
  type LeadStatus,
} from "@/types/lead";

import {
  LEAD_PAGE_SIZE_OPTIONS,
  leadListPriorityValues,
} from "@/lib/lead-list-query";

import type {
  LeadListFollowUpState,
  LeadListPageSize,
  LeadListPriority,
  LeadListQuery,
  LeadListSortBy,
  LeadListSortDirection,
  LeadListSource,
  LeadListStatusGroup,
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

type TagFilterOption = {
  id: string;
  name: string;
};

type LeadFiltersBarProps = {
  search: string;

  status?: LeadStatus;

  source?: LeadListSource;

  courseId?: string;

  counselor?: string;

  priority?: LeadListPriority;

  tagId?: string;

  statusGroup?: LeadListStatusGroup;

  followUpState?: LeadListFollowUpState;

  favoritesOnly?: boolean;

  currentUserId: string;

  createdFrom?: string;
  createdTo?: string;
  followUpFrom?: string;
  followUpTo?: string;

  sortBy: LeadListSortBy;

  sortDirection:
    LeadListSortDirection;

  pageSize: LeadListPageSize;

  statusCounts:
    Record<
      StatusFilter,
      number
    >;

  courses:
    CourseFilterOption[];

  counselors:
    CounselorFilterOption[];

  tags:
    TagFilterOption[];

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

  onPriorityChange:
    (value?: LeadListPriority) => void;

  onTagChange:
    (value?: string) => void;

  onStatusGroupChange:
    (value?: LeadListStatusGroup) => void;

  onFollowUpStateChange:
    (value?: LeadListFollowUpState) => void;

  onFavoritesOnlyChange:
    (value?: boolean) => void;

  onDateRangeChange: (
    changes: Pick<
      LeadListQuery,
      "createdFrom" | "createdTo" | "followUpFrom" | "followUpTo"
    >,
  ) => void;

  onSortChange: (
    sortBy: LeadListSortBy,
    direction:
      LeadListSortDirection,
  ) => void;

  onPageSizeChange: (
    pageSize: LeadListPageSize,
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

type SegmentPillProps = {
  label: string;
  icon?: LucideIcon;
  isActive: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
};

/**
 * Quick-segment toggles are a different dimension from the status
 * tablist below them: independent (Mine + Overdue can both be on at
 * once) rather than mutually exclusive, so these are plain toggle
 * buttons, not `role="tab"`.
 */
function SegmentPill({
  label,
  icon: Icon,
  isActive,
  disabled,
  onClick,
  children,
}: SegmentPillProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 disabled:cursor-not-allowed disabled:opacity-60",

        isActive
          ? "border-accent-600 bg-accent-50 text-accent-800"
          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
      )}
    >
      {Icon && (
        <Icon
          aria-hidden="true"
          className={cn(
            "size-3.5",
            isActive ? "text-accent-600" : "text-slate-400",
          )}
        />
      )}
      {children}
    </button>
  );
}

export default function LeadFiltersBar({
  search,
  status,
  source,
  courseId,
  counselor,
  priority,
  tagId,
  statusGroup,
  followUpState,
  favoritesOnly,
  currentUserId,
  createdFrom,
  createdTo,
  followUpFrom,
  followUpTo,
  sortBy,
  sortDirection,
  pageSize,
  statusCounts,
  courses,
  counselors,
  tags,
  canManageAssignments,
  disabled = false,
  onSearchChange,
  onStatusChange,
  onSourceChange,
  onCourseChange,
  onCounselorChange,
  onPriorityChange,
  onTagChange,
  onStatusGroupChange,
  onFollowUpStateChange,
  onFavoritesOnlyChange,
  onDateRangeChange,
  onSortChange,
  onPageSizeChange,
  onClearFilters,
  onAddLead,
  exportHref,
}: LeadFiltersBarProps) {
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  const statusPills:
    StatusFilter[] = [
      "ALL",
      ...leadStatuses,
    ];

  const sortValue =
    `${sortBy}:${sortDirection}`;

  const moreFiltersActiveCount = [
    tagId,
    createdFrom,
    createdTo,
    followUpFrom,
    followUpTo,
  ].filter(Boolean).length;

  const hasActiveFilters =
    Boolean(
      search ||
        status ||
        source ||
        courseId ||
        counselor ||
        priority ||
        tagId ||
        statusGroup ||
        followUpState ||
        favoritesOnly ||
        createdFrom ||
        createdTo ||
        followUpFrom ||
        followUpTo ||
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
          <label className="flex items-center gap-1.5 text-sm text-slate-500">
            Rows
            <span className="w-[4.5rem]">
              <Select
                value={String(pageSize)}
                disabled={disabled}
                aria-label="Rows per page"
                className="h-9"
                onChange={(event) =>
                  onPageSizeChange(
                    Number(
                      event.target.value,
                    ) as LeadListPageSize,
                  )
                }
              >
                {LEAD_PAGE_SIZE_OPTIONS.map(
                  (size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ),
                )}
              </Select>
            </span>
          </label>

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

      <div className="flex min-w-0 gap-2 overflow-x-auto pb-1">
        <SegmentPill
          label="All"
          isActive={
            !statusGroup &&
            !followUpState &&
            !favoritesOnly &&
            priority !== "HOT" &&
            (!canManageAssignments || counselor !== currentUserId)
          }
          disabled={disabled}
          onClick={() => {
            if (canManageAssignments && counselor === currentUserId) {
              onCounselorChange(undefined);
            }

            if (priority === "HOT") {
              onPriorityChange(undefined);
            }

            onStatusGroupChange(undefined);
            onFollowUpStateChange(undefined);
            onFavoritesOnlyChange(undefined);
          }}
        >
          All
        </SegmentPill>

        {canManageAssignments && (
          <SegmentPill
            label="Mine"
            icon={User}
            isActive={counselor === currentUserId}
            disabled={disabled}
            onClick={() =>
              onCounselorChange(
                counselor === currentUserId ? undefined : currentUserId,
              )
            }
          >
            Mine
          </SegmentPill>
        )}

        <SegmentPill
          label="Hot"
          icon={Flame}
          isActive={priority === "HOT"}
          disabled={disabled}
          onClick={() =>
            onPriorityChange(priority === "HOT" ? undefined : "HOT")
          }
        >
          Hot
        </SegmentPill>

        <SegmentPill
          label="To call"
          icon={PhoneCall}
          isActive={statusGroup === "TO_CALL"}
          disabled={disabled}
          onClick={() =>
            onStatusGroupChange(
              statusGroup === "TO_CALL" ? undefined : "TO_CALL",
            )
          }
        >
          To call
        </SegmentPill>

        <SegmentPill
          label="Overdue"
          icon={AlertTriangle}
          isActive={followUpState === "OVERDUE"}
          disabled={disabled}
          onClick={() =>
            onFollowUpStateChange(
              followUpState === "OVERDUE" ? undefined : "OVERDUE",
            )
          }
        >
          Overdue
        </SegmentPill>

        <SegmentPill
          label="Favourites"
          icon={Star}
          isActive={Boolean(favoritesOnly)}
          disabled={disabled}
          onClick={() =>
            onFavoritesOnlyChange(favoritesOnly ? undefined : true)
          }
        >
          Favourites
        </SegmentPill>
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

        <Select
          value={priority ?? ""}
          disabled={disabled}
          aria-label="Filter by priority"
          onChange={(event) =>
            onPriorityChange(
              event.target.value
                ? (event.target
                    .value as LeadListPriority)
                : undefined,
            )
          }
        >
          <option value="">All priorities</option>

          {leadListPriorityValues.map(
            (value) => (
              <option key={value} value={value}>
                {leadPriorityLabels[value]}
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

      <div>
        <button
          type="button"
          disabled={disabled}
          aria-expanded={moreFiltersOpen}
          onClick={() =>
            setMoreFiltersOpen((current) => !current)
          }
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <SlidersHorizontal
            aria-hidden="true"
            className="size-3.5"
          />

          More filters

          {moreFiltersActiveCount > 0 && (
            <span className="rounded-full bg-accent-100 px-1.5 py-0.5 text-xs font-semibold text-accent-800">
              {moreFiltersActiveCount}
            </span>
          )}

          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-3.5 transition-transform",
              moreFiltersOpen && "rotate-180",
            )}
          />
        </button>

        {moreFiltersOpen && (
          <div className="mt-3 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            {tags.length > 0 && (
              <div className="grid gap-1.5 sm:max-w-xs">
                <label className="text-xs font-medium text-slate-500">
                  Tag
                </label>

                <Select
                  value={tagId ?? ""}
                  disabled={disabled}
                  aria-label="Filter by tag"
                  onChange={(event) =>
                    onTagChange(
                      event.target.value || undefined,
                    )
                  }
                >
                  <option value="">All tags</option>

                  {tags.map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-slate-500">
                  Created between
                </label>

                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    aria-label="Created from"
                    value={createdFrom ?? ""}
                    disabled={disabled}
                    max={createdTo}
                    onChange={(event) =>
                      onDateRangeChange({
                        createdFrom:
                          event.target.value || undefined,
                      })
                    }
                  />

                  <span className="text-slate-400">–</span>

                  <Input
                    type="date"
                    aria-label="Created to"
                    value={createdTo ?? ""}
                    disabled={disabled}
                    min={createdFrom}
                    onChange={(event) =>
                      onDateRangeChange({
                        createdTo:
                          event.target.value || undefined,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid gap-1.5">
                <label className="text-xs font-medium text-slate-500">
                  Follow-up between
                </label>

                <div className="flex items-center gap-2">
                  <Input
                    type="date"
                    aria-label="Follow-up from"
                    value={followUpFrom ?? ""}
                    disabled={disabled}
                    max={followUpTo}
                    onChange={(event) =>
                      onDateRangeChange({
                        followUpFrom:
                          event.target.value || undefined,
                      })
                    }
                  />

                  <span className="text-slate-400">–</span>

                  <Input
                    type="date"
                    aria-label="Follow-up to"
                    value={followUpTo ?? ""}
                    disabled={disabled}
                    min={followUpFrom}
                    onChange={(event) =>
                      onDateRangeChange({
                        followUpTo:
                          event.target.value || undefined,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}
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
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 disabled:cursor-not-allowed disabled:opacity-60",

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