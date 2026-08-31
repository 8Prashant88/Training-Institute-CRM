import * as z from "zod";

import {
  leadListFollowUpStateValues,
  leadListPriorityValues,
  leadListSortDirectionValues,
  leadListSortValues,
  leadListSourceValues,
  leadListStatusGroupValues,
  leadListStatusValues,
} from "@/lib/lead-list-query";

const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const savedViewNameSchema = z
  .string()
  .trim()
  .min(1, { error: "Enter a name for this view." })
  .max(60, { error: "View names cannot exceed 60 characters." });

/**
 * Mirrors LeadListQuery (lib/lead-list-query.ts) minus `page` — a
 * saved view is a filter combination, not a specific page number, so
 * applying one always starts back at page 1.
 */
export const savedViewQuerySchema = z.object({
  search: z.string().trim().max(100).default(""),
  status: z.enum(leadListStatusValues).optional(),
  source: z.enum(leadListSourceValues).optional(),
  counselor: z.union([z.literal("UNASSIGNED"), z.uuid()]).optional(),
  courseId: z.uuid().optional(),
  priority: z.enum(leadListPriorityValues).optional(),
  tagId: z.uuid().optional(),
  statusGroup: z.enum(leadListStatusGroupValues).optional(),
  followUpState: z.enum(leadListFollowUpStateValues).optional(),
  favoritesOnly: z.boolean().optional(),
  createdFrom: z.string().regex(ISO_DATE_REGEX).optional(),
  createdTo: z.string().regex(ISO_DATE_REGEX).optional(),
  followUpFrom: z.string().regex(ISO_DATE_REGEX).optional(),
  followUpTo: z.string().regex(ISO_DATE_REGEX).optional(),
  sortBy: z.enum(leadListSortValues).default("createdAt"),
  sortDirection: z.enum(leadListSortDirectionValues).default("desc"),
});

export const createSavedViewSchema = z.object({
  name: savedViewNameSchema,
  query: savedViewQuerySchema,
});

export type SavedViewQueryData = z.infer<typeof savedViewQuerySchema>;
