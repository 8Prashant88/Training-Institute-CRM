import * as z from "zod";

/**
 * A table dense enough to browse a few hundred leads without paging
 * constantly, without letting someone request an unbounded page via a
 * hand-edited URL.
 */
export const LEAD_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export type LeadListPageSize = (typeof LEAD_PAGE_SIZE_OPTIONS)[number];

export const DEFAULT_LEAD_PAGE_SIZE: LeadListPageSize = 25;

const MAX_SEARCH_LENGTH = 100;
const MAX_PAGE_NUMBER = 10_000;

export const leadListStatusValues = [
  "NEW",
  "CONTACTED",
  "INTERESTED",
  "FOLLOW_UP",
  "ENROLLED",
  "LOST",
] as const;

export const leadListSourceValues = [
  "WEBSITE",
  "REFERRAL",
  "WALK_IN",
  "SOCIAL_MEDIA",
  "PHONE_INQUIRY",
  "EVENT",
] as const;

export const leadListPriorityValues = [
  "HOT",
  "WARM",
  "COLD",
] as const;

/**
 * "Hasn't reached meaningful engagement yet" — a lead still sitting at
 * NEW or CONTACTED needs outreach. A single-purpose enum rather than
 * turning `status` into a multi-select, which would ripple into the
 * status tablist, its groupBy counts, saved views, and CSV export.
 */
export const leadListStatusGroupValues = [
  "TO_CALL",
] as const;

export const leadListFollowUpStateValues = [
  "OVERDUE",
] as const;

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const leadListSortValues = [
  "createdAt",
  "nextFollowUpAt",
] as const;

export const leadListSortDirectionValues = [
  "asc",
  "desc",
] as const;

export type LeadListStatus =
  (typeof leadListStatusValues)[number];

export type LeadListSource =
  (typeof leadListSourceValues)[number];

export type LeadListPriority =
  (typeof leadListPriorityValues)[number];

export type LeadListStatusGroup =
  (typeof leadListStatusGroupValues)[number];

export type LeadListFollowUpState =
  (typeof leadListFollowUpStateValues)[number];

export type LeadListSortBy =
  (typeof leadListSortValues)[number];

export type LeadListSortDirection =
  (typeof leadListSortDirectionValues)[number];

export type LeadCounselorFilter =
  | string
  | "UNASSIGNED";

export type LeadListQuery = {
  search: string;
  status?: LeadListStatus;
  source?: LeadListSource;
  counselor?: LeadCounselorFilter;
  courseId?: string;
  priority?: LeadListPriority;
  tagId?: string;

  statusGroup?: LeadListStatusGroup;
  followUpState?: LeadListFollowUpState;
  favoritesOnly?: boolean;

  /** ISO `YYYY-MM-DD`, inclusive on both ends. */
  createdFrom?: string;
  createdTo?: string;
  followUpFrom?: string;
  followUpTo?: string;

  sortBy: LeadListSortBy;
  sortDirection: LeadListSortDirection;

  page: number;
  pageSize: LeadListPageSize;
};

export type RawLeadSearchParams = Record<
  string,
  string | string[] | undefined
>;

function firstValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function optionalValue(value: unknown): unknown {
  const normalized = firstValue(value);

  if (
    normalized === "" ||
    normalized === undefined ||
    normalized === null
  ) {
    return undefined;
  }

  return normalized;
}

function normalizeSearch(value: unknown): string {
  const normalized = firstValue(value);

  if (typeof normalized !== "string") {
    return "";
  }

  return normalized
    .trim()
    .slice(0, MAX_SEARCH_LENGTH);
}

function normalizePage(value: unknown): number {
  const normalized = firstValue(value);

  const page = Number(normalized);

  if (
    !Number.isInteger(page) ||
    page < 1
  ) {
    return 1;
  }

  return Math.min(
    page,
    MAX_PAGE_NUMBER,
  );
}

function normalizeDate(value: unknown): string | undefined {
  const normalized = optionalValue(value);

  if (
    typeof normalized !== "string" ||
    !ISO_DATE_PATTERN.test(normalized)
  ) {
    return undefined;
  }

  return normalized;
}

function normalizeBoolean(value: unknown): boolean {
  const normalized = optionalValue(value);

  return normalized === "1";
}

function normalizePageSize(
  value: unknown,
): LeadListPageSize {
  const normalized = firstValue(value);

  const size = Number(normalized);

  return (
    LEAD_PAGE_SIZE_OPTIONS as readonly number[]
  ).includes(size)
    ? (size as LeadListPageSize)
    : DEFAULT_LEAD_PAGE_SIZE;
}

const rawLeadListQuerySchema = z.object({
  q: z.preprocess(
    normalizeSearch,
    z.string(),
  ),

  status: z.preprocess(
    optionalValue,
    z
      .enum(leadListStatusValues)
      .optional()
      .catch(undefined),
  ),

  source: z.preprocess(
    optionalValue,
    z
      .enum(leadListSourceValues)
      .optional()
      .catch(undefined),
  ),

  counselor: z.preprocess(
    (value) => {
      const normalized =
        optionalValue(value);

      if (
        typeof normalized !==
        "string"
      ) {
        return undefined;
      }

      if (
        normalized.toLowerCase() ===
        "unassigned"
      ) {
        return "unassigned";
      }

      return normalized;
    },

    z
      .union([
        z.literal("unassigned"),
        z.uuid(),
      ])
      .optional()
      .catch(undefined),
  ),

  course: z.preprocess(
    optionalValue,

    z
      .uuid()
      .optional()
      .catch(undefined),
  ),

  priority: z.preprocess(
    optionalValue,
    z
      .enum(leadListPriorityValues)
      .optional()
      .catch(undefined),
  ),

  tag: z.preprocess(
    optionalValue,

    z
      .uuid()
      .optional()
      .catch(undefined),
  ),

  sg: z.preprocess(
    optionalValue,
    z
      .enum(leadListStatusGroupValues)
      .optional()
      .catch(undefined),
  ),

  fu: z.preprocess(
    optionalValue,
    z
      .enum(leadListFollowUpStateValues)
      .optional()
      .catch(undefined),
  ),

  fav: z.preprocess(
    normalizeBoolean,
    z.boolean(),
  ),

  createdFrom: z.preprocess(
    normalizeDate,
    z.string().optional(),
  ),

  createdTo: z.preprocess(
    normalizeDate,
    z.string().optional(),
  ),

  followUpFrom: z.preprocess(
    normalizeDate,
    z.string().optional(),
  ),

  followUpTo: z.preprocess(
    normalizeDate,
    z.string().optional(),
  ),

  sort: z.preprocess(
    firstValue,

    z
      .enum(leadListSortValues)
      .catch("createdAt"),
  ),

  dir: z.preprocess(
    firstValue,

    z
      .enum(
        leadListSortDirectionValues,
      )
      .catch("desc"),
  ),

  page: z.preprocess(
    normalizePage,

    z
      .number()
      .int()
      .min(1)
      .max(MAX_PAGE_NUMBER),
  ),

  pageSize: z.preprocess(
    normalizePageSize,

    z.union(
      LEAD_PAGE_SIZE_OPTIONS.map((size) =>
        z.literal(size),
      ) as [
        z.ZodLiteral<LeadListPageSize>,
        ...z.ZodLiteral<LeadListPageSize>[],
      ],
    ),
  ),
});

export function parseLeadListQuery(
  input: RawLeadSearchParams,
): LeadListQuery {
  const parsed =
    rawLeadListQuerySchema.parse(
      input,
    );

  return {
    search: parsed.q,

    status: parsed.status,

    source: parsed.source,

    counselor:
      parsed.counselor ===
      "unassigned"
        ? "UNASSIGNED"
        : parsed.counselor,

    courseId: parsed.course,

    priority: parsed.priority,

    tagId: parsed.tag,

    statusGroup: parsed.sg,

    followUpState: parsed.fu,

    favoritesOnly: parsed.fav || undefined,

    createdFrom: parsed.createdFrom,
    createdTo: parsed.createdTo,
    followUpFrom: parsed.followUpFrom,
    followUpTo: parsed.followUpTo,

    sortBy: parsed.sort,

    sortDirection:
      parsed.dir,

    page: parsed.page,

    pageSize: parsed.pageSize,
  };
}

export function createLeadListSearchParams(
  query: LeadListQuery,
): URLSearchParams {
  const params =
    new URLSearchParams();

  if (query.search) {
    params.set(
      "q",
      query.search,
    );
  }

  if (query.status) {
    params.set(
      "status",
      query.status,
    );
  }

  if (query.source) {
    params.set(
      "source",
      query.source,
    );
  }

  if (query.counselor) {
    params.set(
      "counselor",

      query.counselor ===
        "UNASSIGNED"
        ? "unassigned"
        : query.counselor,
    );
  }

  if (query.courseId) {
    params.set(
      "course",
      query.courseId,
    );
  }

  if (query.priority) {
    params.set(
      "priority",
      query.priority,
    );
  }

  if (query.tagId) {
    params.set(
      "tag",
      query.tagId,
    );
  }

  if (query.statusGroup) {
    params.set(
      "sg",
      query.statusGroup,
    );
  }

  if (query.followUpState) {
    params.set(
      "fu",
      query.followUpState,
    );
  }

  if (query.favoritesOnly) {
    params.set("fav", "1");
  }

  if (query.createdFrom) {
    params.set(
      "createdFrom",
      query.createdFrom,
    );
  }

  if (query.createdTo) {
    params.set(
      "createdTo",
      query.createdTo,
    );
  }

  if (query.followUpFrom) {
    params.set(
      "followUpFrom",
      query.followUpFrom,
    );
  }

  if (query.followUpTo) {
    params.set(
      "followUpTo",
      query.followUpTo,
    );
  }

  if (
    query.sortBy !==
    "createdAt"
  ) {
    params.set(
      "sort",
      query.sortBy,
    );
  }

  if (
    query.sortDirection !==
    "desc"
  ) {
    params.set(
      "dir",
      query.sortDirection,
    );
  }

  if (query.page > 1) {
    params.set(
      "page",
      String(query.page),
    );
  }

  if (
    query.pageSize !==
    DEFAULT_LEAD_PAGE_SIZE
  ) {
    params.set(
      "pageSize",
      String(query.pageSize),
    );
  }

  return params;
}