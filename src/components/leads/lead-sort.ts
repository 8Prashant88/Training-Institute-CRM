import type { Lead } from "@/types/lead";

export type SortKey = "fullName" | "status" | "source" | "createdAt";
export type SortDirection = "asc" | "desc";

export function sortLeads(
  leads: Lead[],
  sortKey: SortKey,
  sortDirection: SortDirection,
) {
  const sorted = [...leads].sort((a, b) => {
    if (sortKey === "createdAt") {
      return (
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    }

    return a[sortKey].localeCompare(b[sortKey]);
  });

  return sortDirection === "asc" ? sorted : sorted.reverse();
}
