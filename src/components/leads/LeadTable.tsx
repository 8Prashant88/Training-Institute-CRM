"use client";

import {
  Mail,
  Phone,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import Avatar from "@/components/ui/Avatar";

import {
  Table,
  TableContainer,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@/components/ui/Table";

import LeadStatusBadge from "@/components/LeadStatusBadge";

import {
  formatRelativeDate,
} from "@/lib/format";

import type {
  Lead,
} from "@/types/lead";

type LeadTableProps = {
  leads: Lead[];

  selectable?: boolean;

  selectedIds?:
    Set<string>;

  onToggleOne?:
    (id: string) => void;

  onToggleAll?:
    () => void;

  disabled?: boolean;
};

export default function LeadTable({
  leads,
  selectable = true,
  selectedIds,
  onToggleOne,
  onToggleAll,
  disabled = false,
}: LeadTableProps) {
  const router =
    useRouter();

  const allSelected =
    selectable &&
    leads.length > 0 &&
    leads.every((lead) =>
      selectedIds?.has(
        lead.id,
      ),
    );

  return (
    <TableContainer>
      <Table>
        <THead>
          <TR>
            {selectable && (
              <TH className="w-10">
                <input
                  type="checkbox"
                  aria-label="Select all leads on this page"
                  checked={
                    allSelected
                  }
                  disabled={
                    disabled
                  }
                  onChange={
                    onToggleAll
                  }
                  className="size-4 rounded border-slate-300 text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </TH>
            )}

            <TH>Lead</TH>
            <TH>Status</TH>
            <TH>Source</TH>
            <TH>Course</TH>
            <TH>
              Assigned to
            </TH>
            <TH>Follow-up</TH>
            <TH>Created</TH>

            <TH className="text-right">
              Contact
            </TH>
          </TR>
        </THead>

        <TBody>
          {leads.map(
            (lead) => (
              <TR
                key={lead.id}
                onClick={() =>
                  router.push(
                    `/dashboard/leads/${lead.id}`,
                  )
                }
                className="cursor-pointer hover:bg-slate-50"
              >
                {selectable && (
                  <TD
                    onClick={(
                      event,
                    ) =>
                      event.stopPropagation()
                    }
                  >
                    <input
                      type="checkbox"
                      aria-label={`Select ${lead.fullName}`}
                      checked={Boolean(
                        selectedIds?.has(
                          lead.id,
                        ),
                      )}
                      disabled={
                        disabled
                      }
                      onChange={() =>
                        onToggleOne?.(
                          lead.id,
                        )
                      }
                      className="size-4 rounded border-slate-300 text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </TD>
                )}

                <TD>
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      name={
                        lead.fullName
                      }
                      size="sm"
                    />

                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">
                        {
                          lead.fullName
                        }
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {lead.email ||
                          "No email"}
                      </p>
                    </div>
                  </div>
                </TD>

                <TD>
                  <LeadStatusBadge
                    status={
                      lead.status
                    }
                  />
                </TD>

                <TD className="whitespace-nowrap text-slate-600">
                  {
                    lead.source
                  }
                </TD>

                <TD className="whitespace-nowrap text-slate-600">
                  {
                    lead.interestedCourse
                  }
                </TD>

                <TD className="whitespace-nowrap text-slate-600">
                  {
                    lead.assignedTo
                  }
                </TD>

                <TD
                  className="whitespace-nowrap text-slate-600"
                  title={
                    lead.nextFollowUpAt
                      ? new Date(
                          lead.nextFollowUpAt,
                        ).toLocaleString()
                      : undefined
                  }
                >
                  {lead.nextFollowUpAt ? (
                    <span suppressHydrationWarning>
                      {formatRelativeDate(
                        lead.nextFollowUpAt,
                      )}
                    </span>
                  ) : (
                    "—"
                  )}
                </TD>

                <TD
                  className="whitespace-nowrap text-slate-600"
                  title={new Date(
                    lead.createdAt,
                  ).toLocaleString()}
                >
                  <span suppressHydrationWarning>
                    {formatRelativeDate(
                      lead.createdAt,
                    )}
                  </span>
                </TD>

                <TD
                  className="text-right"
                  onClick={(
                    event,
                  ) =>
                    event.stopPropagation()
                  }
                >
                  <div className="flex justify-end gap-1">
                    {lead.email && (
                      <a
                        href={`mailto:${lead.email}`}
                        aria-label={`Email ${lead.fullName}`}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                      >
                        <Mail
                          aria-hidden="true"
                          className="size-4"
                        />
                      </a>
                    )}

                    <a
                      href={`tel:${lead.phone}`}
                      aria-label={`Call ${lead.fullName}`}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-primary-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
                    >
                      <Phone
                        aria-hidden="true"
                        className="size-4"
                      />
                    </a>
                  </div>
                </TD>
              </TR>
            ),
          )}
        </TBody>
      </Table>
    </TableContainer>
  );
}