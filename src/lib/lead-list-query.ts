import * as z from "zod";

export const LEAD_PAGE_SIZE = 8;

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

  sortBy: LeadListSortBy;
  sortDirection: LeadListSortDirection;

  page: number;
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

    sortBy: parsed.sort,

    sortDirection:
      parsed.dir,

    page: parsed.page,
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

  return params;
}