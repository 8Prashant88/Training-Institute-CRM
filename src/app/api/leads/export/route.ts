import { toCsv } from "@/lib/csv";
import { isAdmin } from "@/lib/authorization";
import { parseLeadListQuery, type RawLeadSearchParams } from "@/lib/lead-list-query";
import { listLeadsForExport } from "@/services/lead-list-service";
import { getCurrentAuthenticatedUser } from "@/services/user-service";

const EXPORT_COLUMNS = [
  "Full name",
  "Email",
  "Phone",
  "Course",
  "Status",
  "Source",
  "Assigned counselor",
  "Created at",
  "Next follow-up",
] as const;

/*
 * A GET Route Handler, not a Server Action, because the result is a
 * downloadable file a browser navigates to (an <a href> or
 * window.location.href), not a form submission — see Day 10's
 * distinction between the two in daily-log.md.
 */
export async function GET(request: Request) {
  const currentUser = await getCurrentAuthenticatedUser();

  if (!currentUser) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);

  const rawSearchParams: RawLeadSearchParams = Object.fromEntries(
    url.searchParams.entries(),
  );

  const parsedQuery = parseLeadListQuery(rawSearchParams);

  /*
   * Same rule as the Leads page itself: a counselor filter only ever
   * applies for an admin. buildLeadListWhere() (used inside
   * listLeadsForExport) already ignores it for a counselor regardless,
   * but dropping it here too keeps the two request paths visibly
   * identical instead of relying on a filter deep inside the query
   * builder to be the only thing enforcing it.
   */
  const query = isAdmin(currentUser)
    ? parsedQuery
    : { ...parsedQuery, counselor: undefined };

  const leads = await listLeadsForExport(currentUser, query);

  const csv = toCsv(
    [...EXPORT_COLUMNS],
    leads.map((lead) => [
      lead.fullName,
      lead.email,
      lead.phone,
      lead.interestedCourse,
      lead.status,
      lead.source,
      lead.assignedTo,
      lead.createdAt,
      lead.nextFollowUpAt ?? "",
    ]),
  );

  const dateStamp = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-export-${dateStamp}.csv"`,
    },
  });
}
