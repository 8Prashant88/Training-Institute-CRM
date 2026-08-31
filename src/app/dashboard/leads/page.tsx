import type {
  Metadata,
} from "next";

import {
  redirect,
} from "next/navigation";

import LeadFollowUpsView from "@/components/leads/LeadFollowUpsView";
import LeadPipelineBoard from "@/components/leads/LeadPipelineBoard";
import LeadsViewSwitcher, {
  type LeadsViewMode,
} from "@/components/leads/LeadsViewSwitcher";
import LeadsWorkspace from "@/components/leads/LeadsWorkspace";

import {
  CardEyebrow,
} from "@/components/ui/Card";

import {
  isAdmin,
} from "@/lib/authorization";

import {
  createLeadListSearchParams,
  parseLeadListQuery,
  type LeadListQuery,
  type RawLeadSearchParams,
} from "@/lib/lead-list-query";

import {
  listActiveCourses,
  listCoursesForLeadFilters,
} from "@/services/course-service";

import {
  listLeadPage,
} from "@/services/lead-list-service";

import {
  listTags,
} from "@/services/tag-service";

import {
  listSavedViews,
} from "@/services/saved-view-service";

import {
  listLeadPipeline,
} from "@/services/lead-pipeline-service";

import {
  listLeadFollowUps,
} from "@/services/lead-followups-service";

import {
  getCurrentAuthenticatedUser,
  listActiveCounselors,
  listCounselorsForLeadFilters,
} from "@/services/user-service";

export const metadata: Metadata = {
  title: "Leads",
};

type LeadsPageProps = {
  searchParams:
    Promise<RawLeadSearchParams>;
};

const LEAD_QUERY_KEYS = [
  "q",
  "status",
  "source",
  "counselor",
  "course",
  "priority",
  "tag",
  "sg",
  "fu",
  "fav",
  "createdFrom",
  "createdTo",
  "followUpFrom",
  "followUpTo",
  "sort",
  "dir",
  "page",
  "pageSize",
] as const;

const LEADS_VIEW_VALUES = [
  "table",
  "board",
  "followups",
] as const;

/*
 * "view" picks which of the three rendered views is shown. It is not
 * part of LeadListQuery on purpose — it is UI state, not a data filter
 * — so it is handled here rather than inside lib/lead-list-query.ts,
 * but it still has to be explicitly allowed through
 * shouldCanonicalizeSearchParams below, or it would be stripped as an
 * unrecognized parameter on every request.
 */
function parseLeadsView(
  raw: RawLeadSearchParams,
): LeadsViewMode {
  const rawValue = raw.view;
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

  return (LEADS_VIEW_VALUES as readonly string[]).includes(value ?? "")
    ? (value as LeadsViewMode)
    : "table";
}

function shouldCanonicalizeSearchParams(
  raw: RawLeadSearchParams,
  canonical: URLSearchParams,
): boolean {
  const allowedKeys =
    new Set<string>(
      [...LEAD_QUERY_KEYS, "view"],
    );

  /*
   * Remove unknown parameters.
   *
   * Example:
   * ?status=NEW&random=hacked
   */
  for (
    const key of
    Object.keys(raw)
  ) {
    if (
      !allowedKeys.has(key)
    ) {
      return true;
    }
  }

  for (
    const key of
    LEAD_QUERY_KEYS
  ) {
    const rawValue =
      raw[key];

    /*
     * Example:
     * ?status=NEW&status=LOST
     *
     * We accept the first value during
     * parsing, then redirect to one
     * canonical value.
     */
    if (
      Array.isArray(
        rawValue,
      )
    ) {
      return true;
    }

    const canonicalValue =
      canonical.get(key) ??
      undefined;

    if (
      rawValue !==
      canonicalValue
    ) {
      return true;
    }
  }

  return false;
}

function createLeadsUrl(
  query: LeadListQuery,
): string {
  const params =
    createLeadListSearchParams(
      query,
    );

  const search =
    params.toString();

  return search
    ? `/dashboard/leads?${search}`
    : "/dashboard/leads";
}

export default async function LeadsPage({
  searchParams,
}: LeadsPageProps) {
  const rawSearchParams =
    await searchParams;

  const currentUser =
    await getCurrentAuthenticatedUser();

  if (!currentUser) {
    redirect("/login");
  }

  const canManageAssignments =
    isAdmin(currentUser);

  const view = parseLeadsView(rawSearchParams);

  const parsedQuery =
    parseLeadListQuery(
      rawSearchParams,
    );

  /*
   * Counselor filtering only makes
   * sense for administrators.
   *
   * A counselor manually adding:
   *
   * ?counselor=<uuid>
   *
   * cannot influence their result set.
   */
  const query:
    LeadListQuery =
    canManageAssignments
      ? parsedQuery
      : {
          ...parsedQuery,
          counselor: undefined,
        };

  const [
    leadResult,
    activeCourses,
    courseFilterOptions,
    activeCounselors,
    counselorFilterOptions,
    tagFilterOptions,
    savedViews,
    pipelineColumns,
    followUps,
  ] = await Promise.all([
    listLeadPage(
      currentUser,
      query,
    ),

    /*
     * Used when creating leads.
     */
    listActiveCourses(),

    /*
     * Includes inactive courses so
     * historical leads remain
     * filterable.
     */
    listCoursesForLeadFilters(),

    /*
     * Only ADMIN receives counselor
     * assignment/filter datasets.
     */
    canManageAssignments
      ? listActiveCounselors()
      : Promise.resolve([]),

    canManageAssignments
      ? listCounselorsForLeadFilters()
      : Promise.resolve([]),

    /*
     * Every authenticated user can filter/attach tags, even though
     * only an admin can create one.
     */
    listTags(),

    listSavedViews(currentUser.id),

    /*
     * Board view. Scoped the same way as the table (counselor filter,
     * ADMIN-only), but does not apply search/status/source/course
     * filters yet — it always shows every status column at once.
     */
    listLeadPipeline(currentUser, {
      counselorId: canManageAssignments ? query.counselor : undefined,
    }),

    /*
     * Follow-ups view. Scoped the same way as the table and board
     * views by the same shared `counselor` filter.
     */
    listLeadFollowUps(currentUser, {
      counselorId: canManageAssignments ? query.counselor : undefined,
    }),
  ]);

  /*
   * Example:
   *
   * ?page=999
   *
   * listLeadPage() safely clamps that
   * to the last valid page.
   *
   * Redirect so the browser URL also
   * reflects the real page.
   */
  const canonicalQuery:
  LeadListQuery = {
  ...query,

  page:
    leadResult
      .pagination
      .page,
};

const canonicalParams =
  createLeadListSearchParams(
    canonicalQuery,
  );

if (
  shouldCanonicalizeSearchParams(
    rawSearchParams,
    canonicalParams,
  )
) {
  const canonicalUrl = createLeadsUrl(canonicalQuery);

  redirect(
    view !== "table"
      ? `${canonicalUrl}${canonicalUrl.includes("?") ? "&" : "?"}view=${view}`
      : canonicalUrl,
  );
}

  const courseOptions =
    activeCourses.map(
      (course) => ({
        id: course.id,
        title: course.title,
      }),
    );

  return (
    <div className="grid min-w-0 gap-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-8">
        <CardEyebrow>
          Lead management
        </CardEyebrow>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-primary-900 sm:text-3xl">
          {canManageAssignments
            ? "Manage leads"
            : "My leads"}
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          {canManageAssignments
            ? "Search, filter, assign, and manage inquiries across the CRM."
            : "Search, filter, and manage the leads currently assigned to you."}
        </p>
      </section>

      <LeadsViewSwitcher
        view={view}
        tableView={
          <LeadsWorkspace
            initialLeads={
              leadResult.items
            }

            query={query}

            statusCounts={
              leadResult.statusCounts
            }

            pagination={
              leadResult.pagination
            }

            courses={
              courseOptions
            }

            courseFilterOptions={
              courseFilterOptions
            }

            counselors={
              activeCounselors
            }

            counselorFilterOptions={
              counselorFilterOptions
            }

            tagFilterOptions={
              tagFilterOptions
            }

            savedViews={
              savedViews
            }

            currentUserId={
              currentUser.id
            }

            canManageAssignments={
              canManageAssignments
            }
          />
        }

        boardView={
          <LeadPipelineBoard columns={pipelineColumns} />
        }

        followUpsView={
          <LeadFollowUpsView followUps={followUps} />
        }
      />
    </div>
  );
}