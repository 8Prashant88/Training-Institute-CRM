"use client";

import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ArrowUpDown, Mail, Phone } from "lucide-react";

import Avatar from "@/components/ui/Avatar";
import { TableContainer, Table, THead, TBody, TR, TH, TD } from "@/components/ui/Table";
import LeadStatusBadge from "@/components/LeadStatusBadge";
import { formatRelativeDate } from "@/lib/format";
import type { Lead } from "@/types/lead";
import type { SortDirection, SortKey } from "@/components/leads/lead-sort";

type LeadTableProps = {
  leads: Lead[];
  selectedIds: Set<string>;
  onToggleOne: (id: string) => void;
  onToggleAll: () => void;
  sortKey: SortKey;
  sortDirection: SortDirection;
  onSort: (key: SortKey) => void;
};

const sortableColumns: { key: SortKey; label: string }[] = [
  { key: "fullName", label: "Lead" },
  { key: "status", label: "Status" },
  { key: "source", label: "Source" },
  { key: "createdAt", label: "Created" },
];

export default function LeadTable({
  leads,
  selectedIds,
  onToggleOne,
  onToggleAll,
  sortKey,
  sortDirection,
  onSort,
}: LeadTableProps) {
  const router = useRouter();
  const allSelected = leads.length > 0 && selectedIds.size === leads.length;

  function renderSortIcon(key: SortKey) {
    if (sortKey !== key) {
      return (
        <ArrowUpDown
          aria-hidden="true"
          className="size-3.5 text-slate-300 group-hover:text-slate-400"
        />
      );
    }

    return sortDirection === "asc" ? (
      <ArrowUp aria-hidden="true" className="size-3.5 text-primary-900" />
    ) : (
      <ArrowDown aria-hidden="true" className="size-3.5 text-primary-900" />
    );
  }

  return (
    <TableContainer>
      <Table>
        <THead>
          <TR>
            <TH className="w-10">
              <input
                type="checkbox"
                aria-label="Select all leads on this page"
                checked={allSelected}
                onChange={onToggleAll}
                className="size-4 rounded border-slate-300 text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              />
            </TH>

            {sortableColumns.map((column) => (
              <TH key={column.key}>
                <button
                  type="button"
                  onClick={() => onSort(column.key)}
                  className="group inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                >
                  {column.label}
                  {renderSortIcon(column.key)}
                </button>
              </TH>
            ))}

            <TH>Course</TH>
            <TH>Assigned to</TH>
            <TH className="text-right">Contact</TH>
          </TR>
        </THead>

        <TBody>
          {leads.map((lead) => (
            <TR
              key={lead.id}
              onClick={() => router.push(`/dashboard/leads/${lead.id}`)}
              className="cursor-pointer hover:bg-slate-50"
            >
              <TD onClick={(event) => event.stopPropagation()}>
                <input
                  type="checkbox"
                  aria-label={`Select ${lead.fullName}`}
                  checked={selectedIds.has(lead.id)}
                  onChange={() => onToggleOne(lead.id)}
                  className="size-4 rounded border-slate-300 text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                />
              </TD>

              <TD>
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={lead.fullName} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">
                      {lead.fullName}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {lead.email}
                    </p>
                  </div>
                </div>
              </TD>

              <TD>
                <LeadStatusBadge status={lead.status} />
              </TD>

              <TD className="whitespace-nowrap text-slate-600">
                {lead.source}
              </TD>

              <TD
                className="whitespace-nowrap text-slate-600"
                title={new Date(lead.createdAt).toLocaleString()}
              >
                <span suppressHydrationWarning>
                  {formatRelativeDate(lead.createdAt)}
                </span>
              </TD>

              <TD className="whitespace-nowrap text-slate-600">
                {lead.interestedCourse}
              </TD>

              <TD className="whitespace-nowrap text-slate-600">
                {lead.assignedTo}
              </TD>

              <TD
                className="text-right"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="flex justify-end gap-1">
                  <a
                    href={`mailto:${lead.email}`}
                    aria-label={`Email ${lead.fullName}`}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  >
                    <Mail aria-hidden="true" className="size-4" />
                  </a>
                  <a
                    href={`tel:${lead.phone}`}
                    aria-label={`Call ${lead.fullName}`}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                  >
                    <Phone aria-hidden="true" className="size-4" />
                  </a>
                </div>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </TableContainer>
  );
}
